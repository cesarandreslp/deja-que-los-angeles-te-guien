import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Verificar autorización para acceso a métricas
    const authHeader = request.headers.get('authorization')
    const adminSecret = process.env.ADMIN_SECRET
    
    if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('📊 Generando reporte de salud de suscripciones...')

    // Métricas generales
    const totalSubscriptions = await prisma.userMembership.count()
    
    const subscriptionsByStatus = await prisma.userMembership.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    // Suscripciones activas
    const activeSubscriptions = await prisma.userMembership.count({
      where: { status: 'ACTIVE' }
    })

    // Suscripciones que vencen en los próximos 7 días
    const expiringIn7Days = await prisma.userMembership.count({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Suscripciones que ya expiraron pero aún no se han procesado
    const unprocessedExpired = await prisma.userMembership.count({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: new Date()
        }
      }
    })

    // Ingresos por plan (sólo suscripciones activas y completadas)
    const revenueByPlan = await prisma.userMembership.groupBy({
      by: ['membershipPlanId'],
      where: {
        paymentStatus: PaymentStatus.SUCCESS
      },
      _count: { id: true }
    })

    const plansRevenue = await Promise.all(
      revenueByPlan.map(async (item: any) => {
        const plan = await prisma.membershipPlan.findUnique({
          where: { id: item.membershipPlanId },
          select: { name: true, priceCents: true, currency: true }
        })
        return {
          planName: plan?.name || 'Plan Desconocido',
          subscriptions: item._count.id,
          totalRevenue: plan ? ((plan.priceCents / 100) * item._count.id).toFixed(2) : '0',
          currency: plan?.currency || 'USD'
        }
      })
    )

    // Métricas de conversión
    const totalPendingPayments = await prisma.userMembership.count({
      where: { 
        status: 'PENDING',
        paymentStatus: 'PENDING'
      }
    })

    const completedPayments = await prisma.userMembership.count({
      where: { paymentStatus: PaymentStatus.SUCCESS }
    })

    const failedPayments = await prisma.userMembership.count({
      where: { paymentStatus: 'FAILED' }
    })

    // Suscripciones por proveedor de pago
    const paymentProviders = await prisma.userMembership.groupBy({
      by: ['paymentProvider'],
      where: { paymentStatus: PaymentStatus.SUCCESS },
      _count: { id: true }
    })

    // Nuevas suscripciones en los últimos 30 días
    const newSubscriptionsLast30Days = await prisma.userMembership.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Tasa de renovación (aproximada - suscripciones que han tenido múltiples períodos)
    const usersWithMultipleSubscriptions = await prisma.userMembership.groupBy({
      by: ['userId'],
      having: {
        id: {
          _count: {
            gt: 1
          }
        }
      },
      _count: { id: true }
    })

    const conversionRate = totalPendingPayments > 0 
      ? ((completedPayments / (completedPayments + totalPendingPayments + failedPayments)) * 100).toFixed(2)
      : '100.00'

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalSubscriptions,
        activeSubscriptions,
        conversionRate: `${conversionRate}%`,
        newSubscriptionsLast30Days,
        usersWithMultipleSubscriptions: usersWithMultipleSubscriptions.length
      },
      alerts: {
        unprocessedExpired: {
          count: unprocessedExpired,
          severity: unprocessedExpired > 0 ? 'high' : 'none',
          message: unprocessedExpired > 0 
            ? `${unprocessedExpired} suscripciones expiradas necesitan procesamiento`
            : 'Todas las suscripciones expiradas están procesadas'
        },
        expiringIn7Days: {
          count: expiringIn7Days,
          severity: expiringIn7Days > 10 ? 'medium' : 'low',
          message: `${expiringIn7Days} suscripciones vencen en los próximos 7 días`
        }
      },
      metrics: {
        subscriptionsByStatus: subscriptionsByStatus.reduce((acc: any, item: any) => {
          acc[item.status] = item._count.id
          return acc
        }, {} as Record<string, number>),
        paymentStatus: {
          completed: completedPayments,
          pending: totalPendingPayments,
          failed: failedPayments
        },
        paymentProviders: paymentProviders.reduce((acc: any, item: any) => {
          acc[item.paymentProvider || 'unknown'] = item._count.id
          return acc
        }, {} as Record<string, number>),
        revenue: {
          byPlan: plansRevenue,
          total: plansRevenue.reduce((sum: any, plan: any) => sum + parseFloat(plan.totalRevenue), 0).toFixed(2)
        }
      },
      recommendations: generateRecommendations({
        unprocessedExpired,
        expiringIn7Days,
        conversionRate: parseFloat(conversionRate),
        failedPayments,
        totalPendingPayments
      })
    })

  } catch (error) {
    console.error('❌ Error generando reporte de salud:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 })

  } finally {
    await prisma.$disconnect()
  }
}

function generateRecommendations(data: {
  unprocessedExpired: number
  expiringIn7Days: number
  conversionRate: number
  failedPayments: number
  totalPendingPayments: number
}): string[] {
  const recommendations: string[] = []

  if (data.unprocessedExpired > 0) {
    recommendations.push(`🔄 Ejecutar proceso de expiración para ${data.unprocessedExpired} suscripciones`)
  }

  if (data.expiringIn7Days > 5) {
    recommendations.push(`📧 Enviar notificaciones de renovación a ${data.expiringIn7Days} usuarios`)
  }

  if (data.conversionRate < 70) {
    recommendations.push(`📈 Mejorar proceso de pago - conversión actual: ${data.conversionRate}%`)
  }

  if (data.failedPayments > data.totalPendingPayments * 0.1) {
    recommendations.push(`💳 Revisar integración de pagos - alta tasa de fallos`)
  }

  if (data.totalPendingPayments > 20) {
    recommendations.push(`⏱️ Revisar suscripciones pendientes de pago`)
  }

  if (recommendations.length === 0) {
    recommendations.push(`✅ Sistema funcionando correctamente`)
  }

  return recommendations
}