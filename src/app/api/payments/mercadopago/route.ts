// API Route para procesar pagos con MercadoPago - FASE 5
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'unique-key'
  }
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    const { 
      orderId, 
      amount, 
      paymentMethodId, 
      token, 
      customerEmail,
      customerName,
      installments = 1
    } = await request.json()

    // Validar datos requeridos
    if (!orderId || !amount || !token || !customerEmail) {
      return NextResponse.json({
        success: false,
        error: 'Datos de pago incompletos'
      }, { status: 400 })
    }

    // Verificar que la orden existe y está pendiente
    const order = await prisma.Order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Orden no encontrada'
      }, { status: 404 })
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({
        success: false,
        error: 'La orden ya ha sido procesada'
      }, { status: 400 })
    }

    // Crear el pago en MercadoPago
    const paymentData = {
      transaction_amount: amount,
      token: token,
      description: `Pedido #${order.id} - Tienda Angélica`,
      installments: installments,
      payment_method_id: paymentMethodId,
      issuer_id: undefined,
      payer: {
        email: customerEmail,
        first_name: customerName?.split(' ')[0] || 'Cliente',
        last_name: customerName?.split(' ').slice(1).join(' ') || 'Angélico',
        identification: {
          type: 'RFC',
          number: '00000000000'
        }
      },
      external_reference: orderId,
      metadata: {
        order_id: orderId,
        order_number: order.id,
        source: 'tienda_angelical'
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      statement_descriptor: 'TIENDA ANGELICAL'
    }

    const mpPayment = await payment.create({ body: paymentData })

    // Procesar la respuesta según el estado
    switch (mpPayment.status) {
      case 'approved':
        // Pago aprobado - actualizar orden
        await prisma.Order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paymentStatus: 'SUCCESS',
            paymentId: mpPayment.id?.toString(),
            paymentProvider: 'MERCADOPAGO',
            updatedAt: new Date()
          }
        })

        // El pago se registra en los campos de la orden (no hay modelo Payment separado)

        // Reducir stock
        for (const item of order.orderItems) {
          if (item.productId) {
            await prisma.products.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            })
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Pago aprobado exitosamente',
          payment: {
            id: mpPayment.id,
            status: mpPayment.status,
            amount: mpPayment.transaction_amount,
            currency: 'MXN'
          },
          order: {
            id: order.id,
            orderNumber: order.id,
            status: 'PAID'
          }
        })

      case 'pending':
        // Pago pendiente - mantener orden pendiente
        await prisma.Order.update({
          where: { id: orderId },
          data: {
            paymentId: mpPayment.id?.toString(),
            paymentProvider: 'MERCADOPAGO',
            paymentStatus: 'PENDING'
          }
        })

        return NextResponse.json({
          success: true,
          pending: true,
          message: 'Pago pendiente de aprobación',
          payment: {
            id: mpPayment.id,
            status: mpPayment.status,
            status_detail: mpPayment.status_detail
          }
        })

      case 'in_process':
        // Pago en proceso
        await prisma.Order.update({
          where: { id: orderId },
          data: {
            paymentId: mpPayment.id?.toString(),
            paymentProvider: 'MERCADOPAGO',
            paymentStatus: 'PENDING'
          }
        })

        return NextResponse.json({
          success: true,
          processing: true,
          message: 'Pago en proceso de verificación',
          payment: {
            id: mpPayment.id,
            status: mpPayment.status,
            status_detail: mpPayment.status_detail
          }
        })

      case 'rejected':
        // Pago rechazado
        await prisma.Order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'FAILED',
            paymentId: mpPayment.id?.toString(),
            paymentProvider: 'MERCADOPAGO'
          }
        })

        return NextResponse.json({
          success: false,
          error: 'Pago rechazado',
          payment: {
            id: mpPayment.id,
            status: mpPayment.status,
            status_detail: mpPayment.status_detail
          }
        }, { status: 400 })

      default:
        return NextResponse.json({
          success: false,
          error: 'Estado de pago desconocido',
          payment: {
            id: mpPayment.id,
            status: mpPayment.status
          }
        }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Error processing MercadoPago payment:', error)
    
    // Actualizar la orden como fallida si existe
    const { orderId } = await request.json().catch(() => ({}))
    if (orderId) {
      await prisma.Order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED'
        }
      }).catch(console.error)
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 })
  }
}