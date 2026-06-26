import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ReminderService from '@/services/ReminderService'

// GET /api/reminders/stats - Obtener estadísticas de recordatorios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    const stats = ReminderService.getReminderStats()
    
    return NextResponse.json({
      success: true,
      data: {
        totalSent: stats.totalSent,
        totalFailed: stats.totalFailed,
        successRate: `${stats.successRate}%`,
        recentActivity: stats.recentLogs.map(log => ({
          consultationId: log.consultationId,
          type: log.type,
          sentAt: log.sentAt.toISOString(),
          status: log.status,
          error: log.error || null
        }))
      }
    })

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de recordatorios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/reminders/manual - Enviar recordatorio manual (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    const { consultationId } = await request.json()

    if (!consultationId) {
      return NextResponse.json(
        { error: 'consultationId es requerido' },
        { status: 400 }
      )
    }

    // Enviar confirmación manual
    await ReminderService.sendBookingConfirmation(consultationId)

    return NextResponse.json({
      success: true,
      message: 'Recordatorio manual enviado correctamente'
    })

  } catch (error) {
    console.error('❌ Error enviando recordatorio manual:', error)
    return NextResponse.json(
      { error: 'Error enviando recordatorio' },
      { status: 500 }
    )
  }
}