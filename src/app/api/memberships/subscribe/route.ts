import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SubscriptionSchema = z.object({
  planId: z.string().uuid('ID de plan inválido'),
  paymentProvider: z.enum(['STRIPE', 'MERCADOPAGO'], {
    errorMap: () => ({ message: 'Proveedor de pago inválido' })
  })
})

// POST /api/memberships/subscribe - Crear nueva suscripción
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debe iniciar sesión para suscribirse' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = SubscriptionSchema.parse(body)

    // Verificar que el plan existe y está activo
    const plan = await prisma.membershipPlan.findUnique({
      where: { 
        id: validatedData.planId,
        isActive: true
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado o no disponible' },
        { status: 404 }
      )
    }

    // Verificar si el usuario ya tiene una suscripción activa
    const existingSubscription = await prisma.userMembership.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['ACTIVE', 'PENDING'] }
      },
      include: {
        membershipPlan: {
          select: {
            name: true
          }
        }
      }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { 
          error: 'Ya tienes una suscripción activa',
          details: {
            currentPlan: existingSubscription.membershipPlan.name,
            status: existingSubscription.status,
            endDate: existingSubscription.endDate
          }
        },
        { status: 400 }
      )
    }

    // Crear la suscripción en estado PENDING
    const subscription = await prisma.userMembership.create({
      data: {
        userId: session.user.id,
        membershipPlanId: validatedData.planId,
        status: 'PENDING',
        paymentProvider: validatedData.paymentProvider,
        paymentStatus: 'PENDING',
        // Las fechas se establecerán cuando se confirme el pago
        startDate: null,
        endDate: null
      },
      include: {
        membershipPlan: {
          select: {
            id: true,
            name: true,
            description: true,
            priceCents: true,
            currency: true,
            durationDays: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            country: true
          }
        }
      }
    })

    // Preparar datos para la respuesta (incluirá información para el pago)
    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      paymentProvider: subscription.paymentProvider,
      paymentStatus: subscription.paymentStatus,
      plan: {
        id: subscription.membershipPlan.id,
        name: subscription.membershipPlan.name,
        description: subscription.membershipPlan.description,
        price: (subscription.membershipPlan.priceCents / 100).toFixed(2),
        currency: subscription.membershipPlan.currency,
        durationDays: subscription.membershipPlan.durationDays
      },
      user: subscription.user,
      createdAt: subscription.createdAt.toISOString(),
      // Información para el proceso de pago
      payment: {
        amount: subscription.membershipPlan.priceCents,
        currency: subscription.membershipPlan.currency,
        description: `Suscripción a ${subscription.membershipPlan.name}`,
        // Estos campos se completarán en la integración con las pasarelas
        paymentUrl: null,
        paymentId: null
      },
      nextSteps: {
        action: 'PAYMENT_REQUIRED',
        message: 'Procede al pago para activar tu suscripción',
        paymentProvider: validatedData.paymentProvider
      }
    }

    return NextResponse.json({
      subscription: subscriptionData,
      message: 'Suscripción creada exitosamente. Procede al pago para activarla.'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear suscripción:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET /api/memberships/subscribe - Obtener suscripciones del usuario actual
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debe iniciar sesión' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Construir filtros
    const where: any = {
      userId: session.user.id
    }

    if (status) {
      where.status = status
    }

    const subscriptions = await prisma.userMembership.findMany({
      where,
      include: {
        membershipPlan: {
          select: {
            id: true,
            name: true,
            description: true,
            priceCents: true,
            currency: true,
            durationDays: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Formatear suscripciones
    const formattedSubscriptions = subscriptions.map((sub: any) => ({
      id: sub.id,
      status: sub.status,
      paymentProvider: sub.paymentProvider,
      paymentStatus: sub.paymentStatus,
      paymentId: sub.paymentId,
      startDate: sub.startDate?.toISOString() || null,
      endDate: sub.endDate?.toISOString() || null,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
      plan: {
        id: sub.membershipPlan.id,
        name: sub.membershipPlan.name,
        description: sub.membershipPlan.description,
        price: (sub.membershipPlan.priceCents / 100).toFixed(2),
        currency: sub.membershipPlan.currency,
        durationDays: sub.membershipPlan.durationDays,
        isActive: sub.membershipPlan.isActive
      },
      // Información adicional útil
      isExpired: sub.endDate ? new Date(sub.endDate) < new Date() : false,
      daysRemaining: sub.endDate && sub.status === 'ACTIVE' 
        ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
        : null
    }))

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
      meta: {
        total: formattedSubscriptions.length,
        hasActive: formattedSubscriptions.some((sub: any) => sub.status === 'ACTIVE'),
        hasPending: formattedSubscriptions.some((sub: any) => sub.status === 'PENDING')
      }
    })

  } catch (error) {
    console.error('Error al obtener suscripciones del usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}