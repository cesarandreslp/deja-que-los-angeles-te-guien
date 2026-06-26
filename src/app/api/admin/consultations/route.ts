import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/consultations - Obtener consultas con filtros
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
    const consultorId = searchParams.get('consultorId')
    const userId = searchParams.get('userId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (status) where.status = status
    if (consultorId) where.consultorId = consultorId
    if (userId) where.userId = userId
    
    if (dateFrom || dateTo) {
      where.scheduledAt = {}
      if (dateFrom) where.scheduledAt.gte = new Date(dateFrom)
      if (dateTo) where.scheduledAt.lte = new Date(dateTo)
    }

    const [consultations, totalCount] = await Promise.all([
      prisma.video_consultations.findMany({
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
          consultor: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.video_consultations.count({ where })
    ])

    // Estadísticas rápidas
    const stats = await prisma.video_consultations.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      _sum: {
        price: true
      }
    })

    return NextResponse.json({
      consultations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats
    })

  } catch (error) {
    console.error('Error al obtener consultas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}