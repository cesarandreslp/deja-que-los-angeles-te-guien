import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    slug: string
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