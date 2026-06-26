import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CancelSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid('ID de suscripción inválido'),
  reason: z.string().optional(),
  cancelImmediately: z.boolean().default(false)
})

// POST /api/memberships/cancel - Cancelar suscripción
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
    const validatedData = CancelSubscriptionSchema.parse(body)

    // Verificar que la suscripción existe y pertenece al usuario
    const subscription = await prisma.userMembership.findFirst({
      where: {
        id: validatedData.subscriptionId,
        userId: session.user.id
      },
      include: {
        membershipPlan: {
          select: {
            name: true,
            priceCents: true,
            currency: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la suscripción se puede cancelar
    if (subscription.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'La suscripción ya está cancelada' },
        { status: 400 }
      )
    }

    if (subscription.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'La suscripción ya ha expirado' },
        { status: 400 }
      )
    }

    // Determinar la fecha de cancelación
    let cancellationDate: Date
    let newStatus: 'CANCELLED' | 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'SUSPENDED'

    if (validatedData.cancelImmediately || subscription.status === 'PENDING') {
      // Cancelación inmediata o suscripción pendiente
      cancellationDate = new Date()
      newStatus = 'CANCELLED'
    } else {
      // Cancelación al final del período (si está activa)
      cancellationDate = subscription.endDate || new Date()
      newStatus = 'CANCELLED' // Se puede implementar 'PENDING_CANCELLATION' para cancelar al final
    }

    // Actualizar la suscripción
    const updatedSubscription = await (prisma.userMembership.update as any)({
      where: {
        id: validatedData.subscriptionId
      },
      data: {
        status: newStatus,
        ...(validatedData.cancelImmediately || subscription.status === 'PENDING' 
          ? { endDate: cancellationDate }
          : {}),
        updatedAt: new Date()
      },
      include: {
        membershipPlan: {
          select: {
            name: true,
            priceCents: true,
            currency: true
          }
        }
      }
    })

    // Registrar la razón de cancelación si se proporciona
    if (validatedData.reason) {
      // Aquí se podría crear una tabla de feedback de cancelaciones
      console.log(`Cancelación de suscripción ${validatedData.subscriptionId}: ${validatedData.reason}`)
    }

    // Preparar respuesta
    const cancellationData = {
      subscriptionId: updatedSubscription.id,
      status: updatedSubscription.status,
      plan: {
        name: updatedSubscription.membershipPlan.name,
        price: (updatedSubscription.membershipPlan.priceCents / 100).toFixed(2),
        currency: updatedSubscription.membershipPlan.currency
      },
      cancellationDate: cancellationDate.toISOString(),
      accessUntil: updatedSubscription.endDate?.toISOString() || cancellationDate.toISOString(),
      isImmediateCancellation: validatedData.cancelImmediately || subscription.status === 'PENDING',
      refundEligible: subscription.status === 'PENDING', // Solo pendientes son elegibles para reembolso
      message: validatedData.cancelImmediately || subscription.status === 'PENDING'
        ? 'Tu suscripción ha sido cancelada inmediatamente'
        : 'Tu suscripción será cancelada al final del período actual'
    }

    return NextResponse.json({
      cancellation: cancellationData,
      message: 'Suscripción cancelada exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al cancelar suscripción:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET /api/memberships/cancel - Obtener información sobre cancelación
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
    const subscriptionId = searchParams.get('subscriptionId')

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID de suscripción requerido' },
        { status: 400 }
      )
    }

    // Obtener información de la suscripción
    const subscription = await prisma.userMembership.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id
      },
      include: {
        membershipPlan: {
          select: {
            name: true,
            description: true,
            priceCents: true,
            currency: true,
            durationDays: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      )
    }

    // Calcular información de cancelación
    const now = new Date()
    const daysRemaining = subscription.endDate 
      ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0

    const cancellationInfo = {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: {
          name: subscription.membershipPlan.name,
          description: subscription.membershipPlan.description,
          price: (subscription.membershipPlan.priceCents / 100).toFixed(2),
          currency: subscription.membershipPlan.currency
        },
        startDate: subscription.startDate?.toISOString(),
        endDate: subscription.endDate?.toISOString(),
        daysRemaining
      },
      cancellationOptions: {
        canCancel: ['ACTIVE', 'PENDING'].includes(subscription.status),
        canCancelImmediately: true,
        canCancelAtPeriodEnd: subscription.status === 'ACTIVE' && daysRemaining > 0,
        isRefundEligible: subscription.status === 'PENDING',
        refundAmount: subscription.status === 'PENDING' 
          ? (subscription.membershipPlan.priceCents / 100).toFixed(2)
          : '0.00'
      },
      consequences: generateCancellationConsequences(subscription.status, daysRemaining),
      alternatives: [
        'Pausar la suscripción temporalmente',
        'Cambiar a un plan más económico',
        'Contactar soporte para opciones personalizadas'
      ]
    }

    return NextResponse.json({
      cancellationInfo,
      meta: {
        timestamp: now.toISOString()
      }
    })

  } catch (error) {
    console.error('Error al obtener información de cancelación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función para generar consecuencias de la cancelación
function generateCancellationConsequences(status: string, daysRemaining: number): string[] {
  const consequences: string[] = []

  if (status === 'PENDING') {
    consequences.push('Se cancelará inmediatamente ya que el pago está pendiente')
    consequences.push('No se te cobrará nada')
  } else if (status === 'ACTIVE') {
    consequences.push('Perderás acceso a contenido premium')
    consequences.push('No podrás programar nuevas consultas especializadas')
    consequences.push('Se perderán los descuentos exclusivos')
    
    if (daysRemaining > 0) {
      consequences.push(`Mantendrás acceso hasta ${daysRemaining} días restantes si no cancelas inmediatamente`)
    }
  }

  consequences.push('Podrás reactivar tu suscripción en cualquier momento')

  return consequences
}