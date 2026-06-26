import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/availability - Devuelve días y horas disponibles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const consultantId = searchParams.get('consultantId') // Opcional: filtrar por consultor
    const date = searchParams.get('date') // Opcional: fecha específica

    // Horarios de trabajo (9 AM a 6 PM, intervalos de 1 hora)
    const workingHours = [
      '09:00', '10:00', '11:00', '12:00', 
      '13:00', '14:00', '15:00', '16:00', 
      '17:00', '18:00'
    ]

    // Generar próximos 30 días (excluyendo domingos)
    const availableDays = []
    const today = new Date()
    
    for (let i = 1; i <= 30; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)
      
      // Excluir domingos (0 = domingo)
      if (currentDate.getDay() !== 0) {
        availableDays.push({
          date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
          dayName: currentDate.toLocaleDateString('es-CO', { weekday: 'long' }),
          available: true
        })
      }
    }

    // Si se especifica una fecha, obtener horas ocupadas
    if (date) {
      const startOfDay = new Date(date + 'T00:00:00.000Z')
      const endOfDay = new Date(date + 'T23:59:59.999Z')

      const occupiedSlots = await prisma.video_consultations.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: {
            in: ['PENDING', 'CONFIRMED', 'PAID', 'SCHEDULED']
          },
          ...(consultantId && { consultantId })
        },
        select: {
          time: true,
          consultantId: true
        }
      })

      // Filtrar horas disponibles
      const availableHours = workingHours.map(hour => {
        const isOccupied = occupiedSlots.some((slot: { time: string | null }) => slot.time === hour)
        return {
          time: hour,
          available: !isOccupied,
          displayTime: new Date(`2000-01-01T${hour}:00`).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          date,
          hours: availableHours
        }
      })
    }

    // Devolver días disponibles
    return NextResponse.json({
      success: true,
      data: {
        days: availableDays,
        workingHours: workingHours.map(hour => ({
          time: hour,
          displayTime: new Date(`2000-01-01T${hour}:00`).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }))
      }
    })

  } catch (error) {
    console.error('❌ Error en availability:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}