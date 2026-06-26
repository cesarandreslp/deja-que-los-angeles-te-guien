import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ReminderService from '@/services/ReminderService'
import PushNotificationService from '@/services/PushNotificationService'
import Stripe from 'stripe'
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configurar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

// Configurar MercadoPago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

// POST /api/payment/webhook - Confirmar pago desde las pasarelas
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature') || request.headers.get('x-signature')
    const body = await request.text()

    // Detectar si es webhook de Stripe o MercadoPago
    const isStripe = request.headers.get('stripe-signature')
    const isMercadoPago = request.headers.get('x-signature')

    if (isStripe) {
      // Manejar webhook de Stripe
      return await handleStripeWebhook(body, signature!)
    } else if (isMercadoPago) {
      // Manejar webhook de MercadoPago
      return await handleMercadoPagoWebhook(body, signature!)
    } else {
      return NextResponse.json(
        { error: 'Webhook no válido' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Error en webhook:', error)
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    )
  }
}

async function handleStripeWebhook(body: string, signature: string) {
  try {
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const bookingId = session.metadata.bookingId

      await updateBookingAfterPayment(bookingId, 'STRIPE', 'SUCCESS')
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error en webhook de Stripe:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }
}

async function handleMercadoPagoWebhook(body: string, signature: string) {
  try {
    // Validar firma de MercadoPago (implementación básica)
    const data = JSON.parse(body)
    
    if (data.type === 'payment' && data.action === 'payment.updated') {
      const paymentId = data.data.id
      // Aquí verificarías el pago con la API de MercadoPago
      // Por simplicidad, asumimos que el metadata contiene el bookingId
      const bookingId = data.metadata?.booking_id

      if (bookingId) {
        await updateBookingAfterPayment(bookingId, 'MERCADOPAGO', 'SUCCESS')
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error en webhook de MercadoPago:', error)
    return NextResponse.json(
      { error: 'Invalid webhook' },
      { status: 400 }
    )
  }
}

async function updateBookingAfterPayment(
  bookingId: string, 
  paymentProvider: 'STRIPE' | 'MERCADOPAGO', 
  paymentStatus: 'SUCCESS' | 'FAILED'
) {
  try {
    // Actualizar estado de la cita
    const booking = await prisma.video_consultations.update({
      where: { id: bookingId },
      data: {
        status: paymentStatus === 'SUCCESS' ? 'PAID' : 'CANCELLED',
        paymentProvider,
        paymentStatus,
        videoLink: paymentStatus === 'SUCCESS' ? await generateVideoLink(bookingId) : null,
        updatedAt: new Date()
      },
      include: {
        user: true,
        consultor: true
      }
    })

    if (paymentStatus === 'SUCCESS') {
      console.log(`✅ Pago confirmado para cita ${bookingId}`)
      console.log(`🎥 Link de videollamada generado: ${booking.videoLink}`)
      
      // Enviar confirmación de booking automáticamente (Fase 4)
      await ReminderService.sendBookingConfirmation(bookingId)
      console.log(`📧 Confirmación de booking enviada a ${booking.user.email}`)
      
      // Programar recordatorios PWA automáticos
      const reminderSuccess = await PushNotificationService.scheduleAutomaticReminders(bookingId)
      if (reminderSuccess) {
        console.log(`🔔 Recordatorios PWA programados para la consulta ${bookingId}`)
      } else {
        console.warn(`⚠️ No se pudieron programar recordatorios PWA para la consulta ${bookingId}`)
      }
    }

    return booking
  } catch (error) {
    console.error('Error actualizando booking después del pago:', error)
    throw error
  }
}

async function generateVideoLink(bookingId: string): Promise<string> {
  // Generar link de videollamada con Jitsi Meet (gratuito)
  const roomName = `oraculo-consulta-${bookingId}`
  const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si'
  
  return `https://${jitsiDomain}/${roomName}`
  
  // Alternativamente, podrías usar Daily.co API:
  // const daily = require('@daily-co/daily-js')
  // const room = await daily.createRoom({ name: roomName })
  // return room.url
}