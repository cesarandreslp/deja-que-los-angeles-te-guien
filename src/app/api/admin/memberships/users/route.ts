import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/memberships/users - Obtener membresías de usuarios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const planId = searchParams.get('planId')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (status) where.status = status
    if (planId) where.membershipPlanId = planId

    const [memberships, totalCount] = await Promise.all([
      prisma.userMembership.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              country: true
            }
          },
          membershipPlan: {
            select: {
              id: true,
              name: true,
              description: true,
              priceCents: true,
              currency: true,
              durationDays: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.userMembership.count({ where })
    ])

    // Formatear membresías
    const formattedMemberships = memberships.map((membership: any) => ({
      id: membership.id,
      status: membership.status,
      paymentProvider: membership.paymentProvider,
      paymentStatus: membership.paymentStatus,
      paymentId: membership.paymentId,
      startDate: membership.startDate,
      endDate: membership.endDate,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
      user: membership.user,
      plan: {
        id: membership.membershipPlan.id,
        name: membership.membershipPlan.name,
        description: membership.membershipPlan.description,
        price: (membership.membershipPlan.priceCents / 100).toFixed(2),
        currency: membership.membershipPlan.currency,
        durationDays: membership.membershipPlan.durationDays
      }
    }))

    // Estadísticas rápidas
    const stats = await prisma.userMembership.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const statusStats = stats.reduce((acc: any, stat: any) => {
      acc[stat.status] = stat._count.id
      return acc
    }, {})

    return NextResponse.json({
      memberships: formattedMemberships,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      },
      stats: statusStats
    })

  } catch (error) {
    console.error('Error al obtener membresías de usuarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}