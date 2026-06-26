import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, mercadopago } from '@/lib/payment-config'
import { prisma } from '@/lib/prisma'
import { Payment } from 'mercadopago'

// POST /api/webhooks/payments - Procesar webhooks de pagos
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature') || headers().get('x-signature')
    const userAgent = headers().get('user-agent') || ''

    // Determinar el proveedor basado en headers y contenido
    if (signature && signature.startsWith('t=') && !userAgent.includes('MercadoPago')) {
      // Webhook de Stripe
      return handleStripeWebhook(body, signature)
    } else if (userAgent.includes('MercadoPago') || body.includes('merchant_order')) {
      // Webhook de MercadoPago
      return handleMercadoPagoWebhook(body)
    } else {
      return NextResponse.json(
        { error: 'Proveedor de pago no reconocido' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error procesando webhook:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Manejar webhook de Stripe
async function handleStripeWebhook(body: string, signature: string) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET no configurado')
      return NextResponse.json(
        { error: 'Configuración de webhook faltante' },
        { status: 500 }
      )
    }

    // Verificar el webhook de Stripe
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await processStripePaymentSuccess(session)
        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object
        await processPaymentExpired(expiredSession.metadata?.subscriptionId, 'STRIPE')
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        await processPaymentFailed(failedPayment.metadata?.subscriptionId, 'STRIPE')
        break

      default:
        console.log(`Evento Stripe no manejado: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error procesando webhook de Stripe:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook de Stripe' },
      { status: 400 }
    )
  }
}

// Manejar webhook de MercadoPago
async function handleMercadoPagoWebhook(body: string) {
  try {
    const data = JSON.parse(body)

    // MercadoPago envía diferentes tipos de notificaciones
    if (data.type === 'payment') {
      const paymentId = data.data.id
      
      // Obtener información del pago desde MercadoPago
      const payment = new Payment(mercadopago)
      const paymentInfo = await payment.get({ id: paymentId })

      if (paymentInfo.status === 'approved') {
        await processMercadoPagoPaymentSuccess(paymentInfo)
      } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
        await processPaymentFailed(paymentInfo.external_reference, 'MERCADOPAGO')
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error procesando webhook de MercadoPago:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook de MercadoPago' },
      { status: 400 }
    )
  }
}

// Procesar pago exitoso de Stripe
async function processStripePaymentSuccess(session: any) {
  try {
    const subscriptionId = session.metadata?.subscriptionId

    if (!subscriptionId) {
      console.error('No se encontró subscriptionId en metadata de Stripe')
      return
    }

    await activateSubscription(subscriptionId, {
      paymentId: session.id,
      paymentProvider: 'STRIPE',
      amount: session.amount_total,
      currency: session.currency?.toUpperCase()
    })

    console.log(`Suscripción ${subscriptionId} activada exitosamente (Stripe)`)

  } catch (error) {
    console.error('Error procesando pago exitoso de Stripe:', error)
  }
}

// Procesar pago exitoso de MercadoPago
async function processMercadoPagoPaymentSuccess(paymentInfo: any) {
  try {
    const subscriptionId = paymentInfo.external_reference

    if (!subscriptionId) {
      console.error('No se encontró external_reference en pago de MercadoPago')
      return
    }

    await activateSubscription(subscriptionId, {
      paymentId: paymentInfo.id.toString(),
      paymentProvider: 'MERCADOPAGO',
      amount: Math.round(paymentInfo.transaction_amount * 100), // Convertir a centavos
      currency: paymentInfo.currency_id
    })

    console.log(`Suscripción ${subscriptionId} activada exitosamente (MercadoPago)`)

  } catch (error) {
    console.error('Error procesando pago exitoso de MercadoPago:', error)
  }
}

// Activar suscripción tras pago exitoso
async function activateSubscription(subscriptionId: string, paymentData: any) {
  try {
    // Obtener la suscripción con el plan
    const subscription = await prisma.userMembership.findUnique({
      where: { id: subscriptionId },
      include: { membershipPlan: true }
    })

    if (!subscription) {
      console.error(`Suscripción ${subscriptionId} no encontrada`)
      return
    }

    if (subscription.status === 'ACTIVE') {
      console.log(`Suscripción ${subscriptionId} ya está activa`)
      return
    }

    // Calcular fechas de inicio y fin
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + (subscription.membershipPlan.durationDays * 24 * 60 * 60 * 1000))

    // Actualizar la suscripción
    await prisma.userMembership.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        paymentStatus: 'SUCCESS',
        paymentId: paymentData.paymentId,
        startDate: startDate,
        endDate: endDate,
        updatedAt: new Date()
      }
    })

    console.log(`Suscripción ${subscriptionId} activada: ${startDate.toISOString()} - ${endDate.toISOString()}`)

    // Enviar email de activación
    try {
      const userWithSubscription = await prisma.userMembership.findUnique({
        where: { id: subscriptionId },
        include: { 
          user: { select: { email: true, fullName: true } },
          membershipPlan: true
        }
      })

      if (userWithSubscription?.user.email) {
        const { sendMembershipActivationEmail } = await import('@/utils/email')
        await sendMembershipActivationEmail(
          userWithSubscription.user.email,
          userWithSubscription.user.fullName || 'Usuario',
          userWithSubscription.membershipPlan.name,
          endDate.toISOString(),
          (userWithSubscription.membershipPlan.priceCents / 100).toString(),
          userWithSubscription.membershipPlan.currency
        )
        console.log(`Email de activación enviado a ${userWithSubscription.user.email}`)
      }
    } catch (emailError) {
      console.warn('Error enviando email de activación:', emailError)
    }

  } catch (error) {
    console.error('Error activando suscripción:', error)
  }
}

// Procesar pago expirado
async function processPaymentExpired(subscriptionId: string | undefined, provider: string) {
  if (!subscriptionId) return

  try {
    await prisma.userMembership.update({
      where: { id: subscriptionId },
      data: {
        paymentStatus: 'FAILED',
        updatedAt: new Date()
      }
    })

    console.log(`Pago de suscripción ${subscriptionId} expirado (${provider})`)

  } catch (error) {
    console.error('Error procesando pago expirado:', error)
  }
}

// Procesar pago fallido
async function processPaymentFailed(subscriptionId: string | undefined, provider: string) {
  if (!subscriptionId) return

  try {
    await prisma.userMembership.update({
      where: { id: subscriptionId },
      data: {
        paymentStatus: 'FAILED',
        updatedAt: new Date()
      }
    })

    console.log(`Pago de suscripción ${subscriptionId} falló (${provider})`)

  } catch (error) {
    console.error('Error procesando pago fallido:', error)
  }
}