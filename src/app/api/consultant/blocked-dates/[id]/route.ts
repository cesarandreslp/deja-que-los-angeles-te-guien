import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE - Desbloquear una fecha
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

    // Verificar que el bloqueo existe y pertenece al consultor
    const blockedDate = await prisma.consultant_blocked_dates.findUnique({
      where: { id: params.id }
    })

    if (!blockedDate) {
      return NextResponse.json(
        { error: 'Bloqueo no encontrado' },
        { status: 404 }
      )
    }

    if (blockedDate.consultantId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este bloqueo' },
        { status: 403 }
      )
    }

    await prisma.consultant_blocked_dates.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Fecha desbloqueada exitosamente'
    })

  } catch (error) {
    console.error('Error al desbloquear fecha:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
