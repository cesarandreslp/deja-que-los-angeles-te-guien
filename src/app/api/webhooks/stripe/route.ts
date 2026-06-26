// Webhook para Stripe - FASE 5
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  if (!orderId) {
    console.error('No orderId found in payment intent metadata')
    return
  }

  try {
    // Actualizar la orden
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentStatus: 'SUCCESS',
        paymentId: paymentIntent.id,
        paymentProvider: 'STRIPE',
        updatedAt: new Date()
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    // El pago se registra en los campos de la orden
    // No hay tabla separada de payments en este schema

    // Reducir stock de productos
    for (const item of updatedOrder.orderItems) {
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
    if (updatedOrder.user?.email && updatedOrder.user.email.includes('@')) {
      await sendOrderConfirmationEmail(updatedOrder)
    }

    console.log(`Payment successful for order ${orderId}`)

  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  if (!orderId) {
    console.error('No orderId found in payment intent metadata')
    return
  }

  try {
    // Actualizar la orden como fallida
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
        paymentId: paymentIntent.id,
        paymentProvider: 'STRIPE',
        updatedAt: new Date()
      }
    })

    // El pago se registra en los campos de la orden
    // No hay tabla separada de payments en este schema

    console.log(`Payment failed for order ${orderId}`)

  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}

async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  if (!orderId) {
    console.error('No orderId found in payment intent metadata')
    return
  }

  try {
    // Mantener la orden en estado pendiente
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PENDING',
        paymentId: paymentIntent.id,
        paymentProvider: 'STRIPE',
        updatedAt: new Date()
      }
    })

    console.log(`Payment requires action for order ${orderId}`)

  } catch (error) {
    console.error('Error handling payment requiring action:', error)
  }
}

async function handleChargeDispute(dispute: Stripe.Dispute) {
  try {
    // Registrar la disputa para revisión manual
    console.log(`Charge dispute created: ${dispute.id}`)
    
    // Aquí podrías agregar lógica para manejar disputas
    // Por ejemplo, notificar al equipo de soporte
    
  } catch (error) {
    console.error('Error handling charge dispute:', error)
  }
}

async function sendOrderConfirmationEmail(order: any) {
  try {
    // Implementar envío de email de confirmación
    // Aquí integrarías con tu servicio de email preferido
    console.log(`Should send confirmation email for order ${order.id}`)
  } catch (error) {
    console.error('Error sending confirmation email:', error)
  }
}