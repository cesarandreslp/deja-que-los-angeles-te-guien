import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verificar autorización
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('📧 Iniciando envío de notificaciones de suscripciones...')

    // Buscar suscripciones que vencen en 7, 3 y 1 día
    const now = new Date()
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)

    // Suscripciones que vencen en 7 días
    const expiring7Days = await prisma.userMembership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date(in7Days.getTime() - 12 * 60 * 60 * 1000), // 12 horas antes
          lte: new Date(in7Days.getTime() + 12 * 60 * 60 * 1000)  // 12 horas después
        }
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        membershipPlan: { select: { name: true, priceCents: true, currency: true } }
      }
    })

    // Suscripciones que vencen en 3 días
    const expiring3Days = await prisma.userMembership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date(in3Days.getTime() - 12 * 60 * 60 * 1000),
          lte: new Date(in3Days.getTime() + 12 * 60 * 60 * 1000)
        }
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        membershipPlan: { select: { name: true, priceCents: true, currency: true } }
      }
    })

    // Suscripciones que vencen en 1 día
    const expiring1Day = await prisma.userMembership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date(in1Day.getTime() - 12 * 60 * 60 * 1000),
          lte: new Date(in1Day.getTime() + 12 * 60 * 60 * 1000)
        }
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        membershipPlan: { select: { name: true, priceCents: true, currency: true } }
      }
    })

    console.log(`📊 Notificaciones a enviar:`)
    console.log(`   - 7 días: ${expiring7Days.length}`)
    console.log(`   - 3 días: ${expiring3Days.length}`)
    console.log(`   - 1 día: ${expiring1Day.length}`)

    const notifications = [
      ...expiring7Days.map((sub: any) => ({ ...sub, daysRemaining: 7, type: 'early_warning' })),
      ...expiring3Days.map((sub: any) => ({ ...sub, daysRemaining: 3, type: 'warning' })),
      ...expiring1Day.map((sub: any) => ({ ...sub, daysRemaining: 1, type: 'urgent' }))
    ]

    // Simular envío de notificaciones (aquí integrarías con tu servicio de email)
    const notificationResults = await Promise.allSettled(
      notifications.map(async (notification) => {
        try {
          // Usar el servicio de email existente
          const { sendMembershipExpirationWarning } = await import('@/utils/email')
          await sendMembershipExpirationWarning(
            notification.user.email,
            notification.user.name || 'Usuario',
            notification.plan.name,
            notification.daysRemaining,
            notification.endDate!.toISOString()
          )
          
          console.log(`📧 Notificación enviada a ${notification.user.email} (${notification.daysRemaining} días)`)

          return {
            subscriptionId: notification.id,
            userEmail: notification.user.email,
            daysRemaining: notification.daysRemaining,
            type: notification.type,
            success: true
          }

        } catch (error) {
          console.error(`❌ Error enviando notificación:`, error)
          return {
            subscriptionId: notification.id,
            userEmail: notification.user.email,
            error: error instanceof Error ? error.message : 'Error desconocido',
            success: false
          }
        }
      })
    )

    const successful = notificationResults
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(Boolean)

    const failed = notificationResults
      .filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(Boolean)

    return NextResponse.json({
      success: true,
      message: 'Notificaciones procesadas',
      results: {
        total: notifications.length,
        successful: successful.length,
        failed: failed.length,
        breakdown: {
          early_warning: successful.filter((n: any) => n && n.type === 'early_warning').length,
          warning: successful.filter((n: any) => n && n.type === 'warning').length,
          urgent: successful.filter((n: any) => n && n.type === 'urgent').length
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error en el cron job de notificaciones:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 })

  } finally {
    await prisma.$disconnect()
  }
}

function getEmailSubject(daysRemaining: number): string {
  switch (daysRemaining) {
    case 7:
      return '⏰ Tu membresía vence en 7 días - Renueva ahora'
    case 3:
      return '⚠️ Tu membresía vence en 3 días - ¡No te quedes sin acceso!'
    case 1:
      return '🚨 ¡URGENTE! Tu membresía vence mañana'
    default:
      return '📋 Actualización de tu membresía'
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Cron job de notificaciones de suscripciones',
    status: 'active',
    description: 'Este endpoint envía notificaciones de vencimiento próximo',
    schedule: 'Diario a las 10:00 AM',
    notifications: [
      '7 días antes del vencimiento',
      '3 días antes del vencimiento',
      '1 día antes del vencimiento'
    ]
  })
}