import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Obtener todos los comentarios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CONSULTANT')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'approved', 'pending'
    const postId = searchParams.get('postId')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (status === 'approved') {
      where.isApproved = true
    } else if (status === 'pending') {
      where.isApproved = false
    }
    
    if (postId) {
      where.postId = postId
    }

    const [comments, total] = await Promise.all([
      prisma.blog_comments.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          blog_posts: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.blog_comments.count({ where })
    ])

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error obteniendo comentarios del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}