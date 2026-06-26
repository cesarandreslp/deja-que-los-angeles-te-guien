import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    slug: string
  }
}

// GET: Obtener categoría específica por slug con sus posts
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const category = await prisma.blog_categories.findUnique({
      where: { slug: params.slug },
      include: {
        blog_posts: {
          where: {
            status: 'PUBLISHED' // Solo posts publicados
          },
          include: {
            User: {
              select: {
                id: true,
                fullName: true
              }
            },
            _count: {
              select: {
                blog_comments: {
                  where: {
                    isApproved: true
                  }
                }
              }
            }
          },
          orderBy: {
            publishedAt: 'desc'
          }
        },
        _count: {
          select: {
            blog_posts: {
              where: {
                status: 'PUBLISHED'
              }
            }
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ category })

  } catch (error) {
    console.error('Error obteniendo categoría del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}