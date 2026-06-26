// Webhook para MercadoPago - FASE 5
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // MercadoPago envía diferentes tipos de notificaciones
    const { type, data } = body

    if (type === 'payment') {
      await handlePaymentNotification(data.id)
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error: any) {
    console.error('Error processing MercadoPago webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentNotification(paymentId: string) {
  try {
    // Obtener información del pago desde MercadoPago
    const mpPayment = await payment.get({ id: paymentId })

    if (!mpPayment.external_reference) {
      console.error('No external_reference found in payment')
      return
    }

    const orderId = mpPayment.external_reference

    // Buscar la orden en la base de datos
    const order = await prisma.order.findUnique({
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
      console.error(`Order not found: ${orderId}`)
      return
    }

    // Procesar según el estado del pago
    switch (mpPayment.status) {
      case 'approved':
        await handleApprovedPayment(order, mpPayment)
        break

      case 'rejected':
        await handleRejectedPayment(order, mpPayment)
        break

      case 'pending':
      case 'in_process':
        await handlePendingPayment(order, mpPayment)
        break

      case 'cancelled':
        await handleCancelledPayment(order, mpPayment)
        break

      case 'refunded':
        await handleRefundedPayment(order, mpPayment)
        break

      default:
        console.log(`Unhandled payment status: ${mpPayment.status}`)
    }

  } catch (error) {
    console.error('Error handling payment notification:', error)
  }
}

async function handleApprovedPayment(order: any, mpPayment: any) {
  try {
    // Actualizar la orden
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paymentStatus: 'SUCCESS',
        paymentId: mpPayment.id.toString(),
        paymentProvider: 'MERCADOPAGO',
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

    // Enviar email de confirmación (opcional)
    if (order.user?.email) {
      await sendOrderConfirmationEmail(order)
    }

    console.log(`MercadoPago payment approved for order ${order.id}`)

  } catch (error) {
    console.error('Error handling approved payment:', error)
  }
}

async function handleRejectedPayment(order: any, mpPayment: any) {
  try {
    // Actualizar la orden como fallida
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
        paymentId: mpPayment.id.toString(),
        paymentProvider: 'MERCADOPAGO',
        updatedAt: new Date()
      }
    })

    // El pago se registra en los campos de la orden
    // No hay tabla separada de payments en este schema

    console.log(`MercadoPago payment rejected for order ${order.id}`)

  } catch (error) {
    console.error('Error handling rejected payment:', error)
  }
}

async function handlePendingPayment(order: any, mpPayment: any) {
  try {
    // Mantener la orden en estado pendiente
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PENDING',
        paymentId: mpPayment.id.toString(),
        paymentProvider: 'MERCADOPAGO',
        updatedAt: new Date()
      }
    })

    // El pago se registra en los campos de la orden
    // No hay tabla separada de payments en este schema

    console.log(`MercadoPago payment pending for order ${order.id}`)

  } catch (error) {
    console.error('Error handling pending payment:', error)
  }
}

async function handleCancelledPayment(order: any, mpPayment: any) {
  try {
    // Actualizar la orden como cancelada
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
        paymentId: mpPayment.id.toString(),
        paymentProvider: 'MERCADOPAGO',
        updatedAt: new Date()
      }
    })

    console.log(`MercadoPago payment cancelled for order ${order.id}`)

  } catch (error) {
    console.error('Error handling cancelled payment:', error)
  }
}

async function handleRefundedPayment(order: any, mpPayment: any) {
  try {
    // Actualizar la orden como reembolsada
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
        paymentId: mpPayment.id.toString(),
        paymentProvider: 'MERCADOPAGO',
        updatedAt: new Date()
      }
    })

    // Restaurar stock de productos
    for (const item of order.orderItems) {
      if (item.productId) {
        await prisma.products.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      }
    }

    console.log(`MercadoPago payment refunded for order ${order.id}`)

  } catch (error) {
    console.error('Error handling refunded payment:', error)
  }
}

async function sendOrderConfirmationEmail(order: any) {
  try {
    // Implementar envío de email de confirmación
    console.log(`Should send confirmation email for order ${order.id}`)
  } catch (error) {
    console.error('Error sending confirmation email:', error)
  }
}