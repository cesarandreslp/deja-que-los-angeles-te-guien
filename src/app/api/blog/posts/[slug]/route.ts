import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    slug: string
  }
}

// GET: Obtener publicación específica por slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const post = await prisma.blog_posts.findUnique({
      where: { 
        slug: params.slug,
        status: 'PUBLISHED' // Solo posts publicados
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        comments: {
          where: {
            isApproved: true // Solo comentarios aprobados
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Error obteniendo post del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST: Incrementar vistas del post
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const post = await prisma.blog_posts.findUnique({
      where: { 
        slug: params.slug,
        status: 'PUBLISHED'
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    // Incrementar vistas
    await prisma.blog_posts.update({
      where: { id: post.id },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error incrementando vistas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}