import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const AvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  isActive: z.boolean().optional()
})

const BlockedDateSchema = z.object({
  blockedDate: z.string().datetime('Fecha inválida'),
  reason: z.string().optional()
})

// GET - Obtener disponibilidad del consultor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CONSULTANT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener disponibilidad semanal
    const availability = await prisma.consultantAvailability.findMany({
      where: {
        consultantId: session.user.id
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Obtener fechas bloqueadas futuras
    const blockedDates = await prisma.consultant_blocked_dates.findMany({
      where: {
        consultantId: session.user.id,
        blockedDate: {
          gte: new Date()
        }
      },
      orderBy: {
        blockedDate: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        availability,
        blockedDates
      }
    })

  } catch (error) {
    console.error('Error al obtener disponibilidad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Agregar horario de disponibilidad
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CONSULTANT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = AvailabilitySchema.parse(body)

    // Verificar que startTime sea menor que endTime
    if (validatedData.startTime >= validatedData.endTime) {
      return NextResponse.json(
        { error: 'La hora de inicio debe ser menor que la hora de fin' },
        { status: 400 }
      )
    }

    // Crear disponibilidad
    const availability = await prisma.consultantAvailability.create({
      data: {
        consultantId: session.user.id,
        dayOfWeek: validatedData.dayOfWeek,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      data: availability,
      message: 'Disponibilidad agregada exitosamente'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    // Error de unicidad
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe disponibilidad para este día y hora' },
        { status: 400 }
      )
    }

    console.error('Error al crear disponibilidad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
