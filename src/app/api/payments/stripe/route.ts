// API Route para procesar pagos con Stripe - FASE 5
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, currency = 'mxn', paymentMethodId, customerEmail } = await request.json()

    // Validar datos requeridos
    if (!orderId || !amount || !paymentMethodId || !customerEmail) {
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

    // Crear el PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe maneja centavos
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        orderId: orderId,
        orderNumber: order.id,
        customerEmail: customerEmail,
        source: 'tienda_angelical'
      },
      description: `Pedido #${order.id} - Tienda Angélica`,
      statement_descriptor: 'TIENDA ANGELICAL'
    })

    // Manejar el resultado del pago
    if (paymentIntent.status === 'succeeded') {
      await prisma.Order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'SUCCESS',
          paymentId: paymentIntent.id,
          paymentProvider: 'STRIPE',
          updatedAt: new Date()
        }
      })

      // El pago se registra en los campos de la orden
      // No hay tabla separada de payments en este schema

      // Reducir stock de productos
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
        message: 'Pago procesado exitosamente',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100
        },
        order: {
          id: order.id,
          orderNumber: order.id,
          status: 'PAID'
        }
      })
    } else if (paymentIntent.status === 'requires_action') {
      // Si el pago requiere autenticación adicional
      return NextResponse.json({
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        message: 'El pago requiere autenticación adicional'
      })
    } else {
      // Si el pago falló
      return NextResponse.json({
        success: false,
        error: 'El pago no pudo ser procesado',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status
        }
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Error processing Stripe payment:', error)
    
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