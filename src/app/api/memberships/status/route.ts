import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/memberships/status - Verificar estado de membresía del usuario actual
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debe iniciar sesión' },
        { status: 401 }
      )
    }

    // Buscar suscripción activa del usuario
    const activeMembership = await prisma.userMembership.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
        endDate: {
          gte: new Date() // Que no haya expirado
        }
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
        }
      }
    })

    // Buscar suscripciones pendientes
    const pendingMembership = await prisma.userMembership.findFirst({
      where: {
        userId: session.user.id,
        status: 'PENDING'
      },
      include: {
        membershipPlan: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            currency: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Obtener historial de suscripciones (últimas 3)
    const membershipHistory = await prisma.userMembership.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['EXPIRED', 'CANCELLED'] }
      },
      include: {
        membershipPlan: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        endDate: 'desc'
      },
      take: 3
    })

    // Construir respuesta
    const membershipStatus = {
      hasActiveMembership: !!activeMembership,
      hasPendingMembership: !!pendingMembership,
      isPremium: !!activeMembership,
      
      // Información de la membresía activa
      activeMembership: activeMembership ? {
        id: activeMembership.id,
        plan: {
          id: activeMembership.membershipPlan.id,
          name: activeMembership.membershipPlan.name,
          description: activeMembership.membershipPlan.description,
          price: (activeMembership.membershipPlan.priceCents / 100).toFixed(2),
          currency: activeMembership.membershipPlan.currency
        },
        startDate: activeMembership.startDate?.toISOString(),
        endDate: activeMembership.endDate?.toISOString(),
        daysRemaining: activeMembership.endDate 
          ? Math.max(0, Math.ceil((new Date(activeMembership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
          : 0,
        paymentProvider: activeMembership.paymentProvider,
        paymentStatus: activeMembership.paymentStatus
      } : null,

      // Información de suscripción pendiente
      pendingMembership: pendingMembership ? {
        id: pendingMembership.id,
        plan: {
          id: pendingMembership.membershipPlan.id,
          name: pendingMembership.membershipPlan.name,
          price: (pendingMembership.membershipPlan.priceCents / 100).toFixed(2),
          currency: pendingMembership.membershipPlan.currency
        },
        paymentProvider: pendingMembership.paymentProvider,
        paymentStatus: pendingMembership.paymentStatus,
        createdAt: pendingMembership.createdAt.toISOString()
      } : null,

      // Historial de membresías
      history: membershipHistory.map((membership: any) => ({
        id: membership.id,
        planName: membership.membershipPlan.name,
        status: membership.status,
        startDate: membership.startDate?.toISOString(),
        endDate: membership.endDate?.toISOString()
      })),

      // Permisos y accesos (basado en si tiene membresía activa)
      permissions: {
        canAccessPremiumContent: !!activeMembership,
        canScheduleConsultations: !!activeMembership,
        canAccessExclusiveStore: !!activeMembership,
        hasVipSupport: !!activeMembership,
        maxConsultationsPerMonth: activeMembership ? getMaxConsultations(activeMembership.membershipPlan.durationDays) : 0
      },

      // Recomendaciones
      recommendations: generateRecommendations(!!activeMembership, !!pendingMembership, membershipHistory.length)
    }

    return NextResponse.json({
      status: membershipStatus,
      meta: {
        timestamp: new Date().toISOString(),
        userId: session.user.id
      }
    })

  } catch (error) {
    console.error('Error al verificar estado de membresía:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función para determinar el máximo de consultas según el plan
function getMaxConsultations(durationDays: number): number {
  if (durationDays >= 365) return -1 // Ilimitadas para planes anuales
  if (durationDays >= 180) return 20  // 20 por mes para planes semestrales
  if (durationDays >= 90) return 15   // 15 por mes para planes trimestrales
  return 10 // 10 por mes para planes mensuales
}

// Función para generar recomendaciones personalizadas
function generateRecommendations(hasActive: boolean, hasPending: boolean, historyCount: number): string[] {
  const recommendations: string[] = []

  if (!hasActive && !hasPending) {
    recommendations.push('Suscríbete a un plan para acceder a contenido premium')
    recommendations.push('Comienza con nuestro plan mensual para probar los beneficios')
  }

  if (hasPending) {
    recommendations.push('Completa el pago de tu suscripción pendiente para activar los beneficios')
  }

  if (hasActive) {
    recommendations.push('Aprovecha al máximo tu membresía programando consultas regulares')
    recommendations.push('Explora el contenido exclusivo disponible para miembros')
  }

  if (historyCount > 0 && !hasActive) {
    recommendations.push('¡Te extrañamos! Reactiva tu membresía con un descuento especial')
  }

  return recommendations
}