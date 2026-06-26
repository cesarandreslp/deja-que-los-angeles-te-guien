import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const BlockedDateSchema = z.object({
  blockedDate: z.string().datetime('Fecha inválida'),
  reason: z.string().optional()
})

// POST - Bloquear una fecha específica
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
    const validatedData = BlockedDateSchema.parse(body)

    // Verificar que la fecha sea futura
    const blockedDate = new Date(validatedData.blockedDate)
    if (blockedDate < new Date()) {
      return NextResponse.json(
        { error: 'No puedes bloquear fechas pasadas' },
        { status: 400 }
      )
    }

    // Crear bloqueo
    const blockedDateRecord = await prisma.consultant_blocked_dates.create({
      data: {
        consultantId: session.user.id,
        blockedDate,
        reason: validatedData.reason
      }
    })

    return NextResponse.json({
      success: true,
      data: blockedDateRecord,
      message: 'Fecha bloqueada exitosamente'
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
        { error: 'Esta fecha ya está bloqueada' },
        { status: 400 }
      )
    }

    console.error('Error al bloquear fecha:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - Obtener fechas bloqueadas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CONSULTANT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const blockedDates = await prisma.consultant_blocked_dates.findMany({
      where: {
        consultantId: session.user.id,
        blockedDate: {
          gte: new Date() // Solo fechas futuras
        }
      },
      orderBy: {
        blockedDate: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: blockedDates
    })

  } catch (error) {
    console.error('Error al obtener fechas bloqueadas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
