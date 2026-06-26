import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verificar que la petición viene de un cron job autorizado
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('🔄 Iniciando verificación de suscripciones expiradas...')

    // Buscar suscripciones que han expirado
    const expiredSubscriptions = await prisma.userMembership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        membershipPlan: {
          select: {
            name: true,
            priceCents: true,
            currency: true
          }
        }
      }
    })

    console.log(`📊 Encontradas ${expiredSubscriptions.length} suscripciones expiradas`)

    if (expiredSubscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay suscripciones expiradas',
        processed: 0
      })
    }

    // Actualizar suscripciones expiradas a EXPIRED
    const updateResults = await Promise.allSettled(
      expiredSubscriptions.map(async (subscription: any) => {
        try {
          // Actualizar estado de la suscripción
          await prisma.userMembership.update({
            where: { id: subscription.id },
            data: { 
              status: 'EXPIRED',
              updatedAt: new Date()
            }
          })

          console.log(`✅ Suscripción ${subscription.id} marcada como expirada`)

          // Enviar email de membresía expirada
          try {
            const { sendMembershipExpiredEmail } = await import('@/utils/email')
            await sendMembershipExpiredEmail(
              subscription.user.email,
              subscription.user.name || 'Usuario',
              subscription.plan.name,
              subscription.endDate!.toISOString()
            )
          } catch (emailError) {
            console.warn('Error enviando email de expiración:', emailError)
          }

          return {
            subscriptionId: subscription.id,
            userId: subscription.userId,
            userEmail: subscription.user.email,
            planName: subscription.plan.name,
            endDate: subscription.endDate,
            success: true
          }
        } catch (error) {
          console.error(`❌ Error actualizando suscripción ${subscription.id}:`, error)
          return {
            subscriptionId: subscription.id,
            userId: subscription.userId,
            error: error instanceof Error ? error.message : 'Error desconocido',
            success: false
          }
        }
      })
    )

    // Separar resultados exitosos y fallidos
    const successful = updateResults
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(Boolean)

    const failed = updateResults
      .filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(Boolean)

    console.log(`✅ Procesadas exitosamente: ${successful.length}`)
    console.log(`❌ Fallidas: ${failed.length}`)

    // También verificar suscripciones que están próximas a vencer (en 3 días)
    const upcomingExpirations = await prisma.userMembership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 días
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        membershipPlan: {
          select: {
            name: true,
            priceCents: true,
            currency: true
          }
        }
      }
    })

    console.log(`⚠️ Suscripciones próximas a vencer: ${upcomingExpirations.length}`)

    return NextResponse.json({
      success: true,
      message: `Procesamiento completado`,
      results: {
        expired: {
          total: expiredSubscriptions.length,
          successful: successful.length,
          failed: failed.length,
          details: successful
        },
        upcomingExpirations: {
          total: upcomingExpirations.length,
          subscriptions: upcomingExpirations.map((sub: any) => ({
            id: sub.id,
            userEmail: sub.user.email,
            planName: sub.plan.name,
            endDate: sub.endDate,
            daysRemaining: Math.ceil((sub.endDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          }))
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error en el cron job de expiración:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      timestamp: new Date().toISOString()
    }, { status: 500 })

  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Cron job de expiración de suscripciones',
    status: 'active',
    description: 'Este endpoint procesa las suscripciones expiradas automáticamente',
    usage: 'POST con Bearer token de autorización'
  })
}