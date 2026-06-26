import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ReminderService from '@/services/ReminderService'

// POST /api/reminders/test - Probar sistema de recordatorios (solo desarrollo)
export async function POST(request: NextRequest) {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Endpoint no disponible en producción' },
        { status: 403 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    const { testType, consultationId } = await request.json()

    if (!testType) {
      return NextResponse.json(
        { error: 'testType es requerido' },
        { status: 400 }
      )
    }

    switch (testType) {
      case 'check_reminders':
        // Ejecutar verificación manual de recordatorios
        await ReminderService.checkAndSendReminders()
        
        return NextResponse.json({
          success: true,
          message: 'Verificación de recordatorios ejecutada manualmente',
          stats: ReminderService.getReminderStats()
        })

      case 'send_test_confirmation':
        if (!consultationId) {
          return NextResponse.json(
            { error: 'consultationId es requerido para test de confirmación' },
            { status: 400 }
          )
        }

        await ReminderService.sendBookingConfirmation(consultationId)
        
        return NextResponse.json({
          success: true,
          message: `Confirmación de prueba enviada para consulta ${consultationId}`
        })

      case 'create_test_consultation':
        // Crear consulta de prueba para testing
        const testConsultation = await prisma.video_consultations.create({
          data: {
            userId: session.user.id,
            consultorId: session.user.id, // Auto-asignar para prueba
            scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
            price: 50000, // Precio en centavos
            status: 'SCHEDULED',
            paymentProvider: 'STRIPE',
            paymentStatus: 'SUCCESS',
            videoLink: `https://meet.jit.si/oraculo-test-${Date.now()}`
          }
        } as any)

        return NextResponse.json({
          success: true,
          message: 'Consulta de prueba creada',
          consultation: {
            id: testConsultation.id,
            scheduledAt: testConsultation.scheduledAt,
            videoLink: testConsultation.videoLink
          }
        })

      default:
        return NextResponse.json(
          { error: 'testType no válido. Opciones: check_reminders, send_test_confirmation, create_test_consultation' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Error en test de recordatorios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET /api/reminders/test - Ver información del sistema
export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Endpoint no disponible en producción' },
        { status: 403 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    // Obtener consultas próximas para testing
    const upcomingConsultations = await prisma.video_consultations.findMany({
      where: {
        status: {
          in: ['PAID', 'CONFIRMED', 'SCHEDULED']
        },
        scheduledAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 48 * 60 * 60 * 1000) // Próximas 48 horas
        }
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        systemStatus: 'Activo',
        upcomingConsultations: upcomingConsultations.length,
        consultations: upcomingConsultations.map((c: any) => ({
          id: c.id,
          scheduledAt: c.scheduledAt,
          userEmail: c.user.email,
          status: c.status
        })),
        reminderStats: ReminderService.getReminderStats(),
        testCommands: [
          'POST /api/reminders/test { "testType": "check_reminders" }',
          'POST /api/reminders/test { "testType": "create_test_consultation" }',
          'POST /api/reminders/test { "testType": "send_test_confirmation", "consultationId": "xxx" }'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Error obteniendo información del sistema:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}