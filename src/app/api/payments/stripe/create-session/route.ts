import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, formatAmountForStripe, getPaymentCallbackUrls, isCurrencySupported } from '@/lib/payment-config'
import { z } from 'zod'

const CreateStripePaymentSchema = z.object({
  subscriptionId: z.string().uuid('ID de suscripción inválido')
})

// POST /api/payments/stripe/create-session - Crear sesión de pago con Stripe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debe iniciar sesión' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreateStripePaymentSchema.parse(body)

    // Obtener la suscripción
    const subscription = await prisma.userMembership.findFirst({
      where: {
        id: validatedData.subscriptionId,
        userId: session.user.id,
        status: 'PENDING'
      },
      include: {
        membershipPlan: true,
        user: {
          select: {
            email: true,
            fullName: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada o ya procesada' },
        { status: 404 }
      )
    }

    // Verificar que la moneda sea soportada por Stripe
    if (!isCurrencySupported('STRIPE', subscription.membershipPlan.currency)) {
      return NextResponse.json(
        { error: `Moneda ${subscription.membershipPlan.currency} no soportada por Stripe` },
        { status: 400 }
      )
    }

    const { success: successUrl, cancel: cancelUrl } = getPaymentCallbackUrls(subscription.id)

    // Crear sesión de Stripe Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: subscription.membershipPlan.currency.toLowerCase(),
            product_data: {
              name: subscription.membershipPlan.name,
              description: subscription.membershipPlan.description,
              metadata: {
                subscriptionId: subscription.id,
                planId: subscription.membershipPlan.id,
                userId: session.user.id
              }
            },
            unit_amount: formatAmountForStripe(
              subscription.membershipPlan.priceCents / 100,
              subscription.membershipPlan.currency
            ),
          },
          quantity: 1,
        },
      ],
      metadata: {
        subscriptionId: subscription.id,
        planId: subscription.membershipPlan.id,
        userId: session.user.id,
        provider: 'STRIPE'
      },
      customer_email: subscription.user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutos
    })

    // Actualizar la suscripción con el ID de pago de Stripe
    await prisma.userMembership.update({
      where: { id: subscription.id },
      data: {
        paymentId: checkoutSession.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      paymentUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      subscriptionId: subscription.id,
      expiresAt: new Date((checkoutSession.expires_at || 0) * 1000).toISOString(),
      message: 'Sesión de pago creada exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creando sesión de Stripe:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// GET /api/payments/stripe/create-session - Verificar estado de sesión
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de sesión requerido' },
        { status: 400 }
      )
    }

    // Obtener información de la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_email,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      metadata: session.metadata
    })

  } catch (error) {
    console.error('Error obteniendo sesión de Stripe:', error)
    return NextResponse.json(
      { 
        error: 'Error al obtener información de la sesión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}