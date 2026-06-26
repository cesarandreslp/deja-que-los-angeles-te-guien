import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/admin/commissions/pay-all - Pagar todas las comisiones pendientes de un consultor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { consultorId } = body

    if (!consultorId) {
      return NextResponse.json(
        { error: 'consultorId es requerido' },
        { status: 400 }
      )
    }

    // Actualizar todas las comisiones pendientes del consultor
    const updatedCommissions = await prisma.commissions.updateMany({
      where: {
        consultorId,
        status: 'PENDING'
      },
      data: {
        status: 'PAID'
      }
    })

    return NextResponse.json({
      success: true,
      message: `${updatedCommissions.count} comisiones marcadas como pagadas`,
      count: updatedCommissions.count
    })

  } catch (error) {
    console.error('Error al pagar comisiones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}