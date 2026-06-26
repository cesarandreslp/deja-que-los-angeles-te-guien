import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    slug: string
  }
}

// POST: Dar like a un post
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

    // Incrementar likes
    const updatedPost = await prisma.blog_posts.update({
      where: { id: post.id },
      data: {
        likes: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      likes: updatedPost.likes 
    })

  } catch (error) {
    console.error('Error dando like:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}