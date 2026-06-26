import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/admin/commissions/[id]/pay - Marcar comisión como pagada
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const commission = await prisma.commissions.findUnique({
      where: { id: params.id }
    })

    if (!commission) {
      return NextResponse.json(
        { error: 'Comisión no encontrada' },
        { status: 404 }
      )
    }

    if (commission.status === 'PAID') {
      return NextResponse.json(
        { error: 'La comisión ya está marcada como pagada' },
        { status: 400 }
      )
    }

    const updatedCommission = await prisma.commissions.update({
      where: { id: params.id },
      data: { status: 'PAID' }
    })

    return NextResponse.json({
      success: true,
      commission: updatedCommission
    })

  } catch (error) {
    console.error('Error al marcar comisión como pagada:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}