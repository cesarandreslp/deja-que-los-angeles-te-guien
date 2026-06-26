import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que sea consultor o admin
    if (session.user.role !== 'CONSULTANT' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo consultores y administradores.' },
        { status: 403 }
      )
    }

    // Si es admin, puede ver comisiones de cualquier consultor
    let consultorId = session.user.id

    if (session.user.role === 'ADMIN') {
      const { searchParams } = new URL(request.url)
      const queryConsultorId = searchParams.get('consultorId')
      if (queryConsultorId) {
        consultorId = queryConsultorId
      }
    }

    // Obtener comisiones
    const commissions = await prisma.commissions.findMany({
      where: { consultorId },
      orderBy: { createdAt: 'desc' }
    })

    // Obtener estadísticas
    const [totalEarned, totalPaid, totalPending] = await Promise.all([
      prisma.commissions.aggregate({
        where: { consultorId },
        _sum: { amountCents: true }
      }),
      prisma.commissions.aggregate({
        where: { consultorId, status: 'PAID' },
        _sum: { amountCents: true }
      }),
      prisma.commissions.aggregate({
        where: { consultorId, status: 'PENDING' },
        _sum: { amountCents: true }
      })
    ])

    // Obtener configuración de comisión
    const commissionConfig = await prisma.config.findFirst({
      where: { key: 'commissionRate' }
    })

    const stats = {
      totalEarned: totalEarned._sum.amountCents || 0,
      totalPaid: totalPaid._sum.amountCents || 0,
      totalPending: totalPending._sum.amountCents || 0,
      commissionRate: commissionConfig ? parseFloat(commissionConfig.value) : 20
    }

    return NextResponse.json({
      success: true,
      data: {
        commissions,
        stats
      }
    })

  } catch (error) {
    console.error('Error al obtener comisiones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}