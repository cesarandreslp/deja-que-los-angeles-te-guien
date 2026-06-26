import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mercadopago, formatAmountForMercadoPago, getPaymentCallbackUrls, isCurrencySupported } from '@/lib/payment-config'
import { Preference } from 'mercadopago'
import { z } from 'zod'

const CreateMercadoPagoPaymentSchema = z.object({
  subscriptionId: z.string().uuid('ID de suscripción inválido')
})

// POST /api/payments/mercadopago/create-preference - Crear preferencia de pago con MercadoPago
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
    const validatedData = CreateMercadoPagoPaymentSchema.parse(body)

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
            fullName: true,
            country: true
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

    // Verificar que la moneda sea soportada por MercadoPago
    if (!isCurrencySupported('MERCADOPAGO', subscription.membershipPlan.currency)) {
      return NextResponse.json(
        { error: `Moneda ${subscription.membershipPlan.currency} no soportada por MercadoPago` },
        { status: 400 }
      )
    }

    const { success: successUrl, cancel: cancelUrl } = getPaymentCallbackUrls(subscription.id)

    // Crear preferencia de MercadoPago
    const preference = new Preference(mercadopago)
    
    const preferenceData = {
      items: [
        {
          id: subscription.membershipPlan.id,
          title: subscription.membershipPlan.name,
          description: subscription.membershipPlan.description,
          quantity: 1,
          unit_price: formatAmountForMercadoPago(subscription.membershipPlan.priceCents / 100),
          currency_id: subscription.membershipPlan.currency,
        }
      ],
      payer: {
        email: subscription.user.email,
        name: subscription.user.fullName || '',
      },
      metadata: {
        subscription_id: subscription.id,
        plan_id: subscription.membershipPlan.id,
        user_id: session.user.id,
        provider: 'MERCADOPAGO'
      },
      external_reference: subscription.id,
      back_urls: {
        success: successUrl,
        failure: cancelUrl,
        pending: successUrl
      },
      auto_return: 'approved' as const,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    }

    const response = await preference.create({ body: preferenceData })

    if (!response.id) {
      throw new Error('No se pudo crear la preferencia de pago')
    }

    // Actualizar la suscripción con el ID de pago de MercadoPago
    await prisma.userMembership.update({
      where: { id: subscription.id },
      data: {
        paymentId: response.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      paymentUrl: response.init_point || response.sandbox_init_point,
      preferenceId: response.id,
      subscriptionId: subscription.id,
      expiresAt: preferenceData.expiration_date_to,
      message: 'Preferencia de pago creada exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creando preferencia de MercadoPago:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// GET /api/payments/mercadopago/create-preference - Verificar estado de preferencia
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const preferenceId = searchParams.get('preference_id')

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'ID de preferencia requerido' },
        { status: 400 }
      )
    }

    // Obtener información de la preferencia de MercadoPago
    const preference = new Preference(mercadopago)
    const response = await preference.get({ preferenceId })

    return NextResponse.json({
      preferenceId: response.id,
      items: response.items?.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id
      })),
      payer: response.payer,
      expirationDateTo: response.expiration_date_to,
      metadata: response.metadata,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point
    })

  } catch (error) {
    console.error('Error obteniendo preferencia de MercadoPago:', error)
    return NextResponse.json(
      { 
        error: 'Error al obtener información de la preferencia',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}