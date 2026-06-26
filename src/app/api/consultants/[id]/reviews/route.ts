import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todas las reviews de un consultor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Verificar que el consultor existe
    const consultant = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: 'CONSULTANT'
      },
      select: {
        id: true,
        fullName: true,
        consultantRating: true,
        totalConsultationsCompleted: true
      }
    })
    
    // Nota: consultantRating y totalConsultationsCompleted ya están en el schema

    if (!consultant) {
      return NextResponse.json(
        { error: 'Consultor no encontrado' },
        { status: 404 }
      )
    }

    // Obtener reviews visibles
    const [reviews, total] = await Promise.all([
      prisma.consultation_reviews.findMany({
        where: {
          consultantId: params.id,
          isVisible: true
        },
        include: {
          video_consultations: {
            select: {
              id: true,
              scheduledAt: true,
              duration: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.consultation_reviews.count({
        where: {
          consultantId: params.id,
          isVisible: true
        }
      })
    ])

    // Calcular distribución de ratings
    const ratingDistribution = await prisma.consultation_reviews.groupBy({
      by: ['rating'],
      where: {
        consultantId: params.id,
        isVisible: true
      },
      _count: {
        rating: true
      }
    })

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }

    ratingDistribution.forEach((item: { rating: number; _count: { rating: number } }) => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating
    })

    return NextResponse.json({
      success: true,
      data: {
        consultant: {
          id: consultant.id,
          fullName: consultant.fullName,
          rating: consultant.consultantRating || 0,
          totalReviews: total,
          totalConsultations: consultant.totalConsultationsCompleted
        },
        reviews,
        ratingDistribution: distribution,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error al obtener reviews:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
