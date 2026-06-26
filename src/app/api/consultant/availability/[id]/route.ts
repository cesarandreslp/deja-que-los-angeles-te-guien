import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateAvailabilitySchema = z.object({
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  isActive: z.boolean().optional()
})

// PUT - Actualizar disponibilidad
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CONSULTANT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateAvailabilitySchema.parse(body)

    // Verificar que la disponibilidad existe y pertenece al consultor
    const existingAvailability = await prisma.consultantAvailability.findUnique({
      where: { id: params.id }
    })

    if (!existingAvailability) {
      return NextResponse.json(
        { error: 'Disponibilidad no encontrada' },
        { status: 404 }
      )
    }

    if (existingAvailability.consultantId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar esta disponibilidad' },
        { status: 403 }
      )
    }

    // Actualizar
    const updatedAvailability = await prisma.consultantAvailability.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: updatedAvailability,
      message: 'Disponibilidad actualizada exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar disponibilidad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar disponibilidad
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'CONSULTANT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que la disponibilidad existe y pertenece al consultor
    const existingAvailability = await prisma.consultantAvailability.findUnique({
      where: { id: params.id }
    })

    if (!existingAvailability) {
      return NextResponse.json(
        { error: 'Disponibilidad no encontrada' },
        { status: 404 }
      )
    }

    if (existingAvailability.consultantId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta disponibilidad' },
        { status: 403 }
      )
    }

    await prisma.consultantAvailability.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Disponibilidad eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar disponibilidad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
