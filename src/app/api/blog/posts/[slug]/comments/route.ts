import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    slug: string
  }
}

// POST: Crear comentario en un post
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para comentar' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'El comentario no puede estar vacío' },
        { status: 400 }
      )
    }

    // Verificar que el post existe y está publicado
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

    // Crear el comentario (pendiente de aprobación)
    const comment = await prisma.blog_comments.create({
      data: {
        content: content.trim(),
        postId: post.id,
        userId: session.user.id,
        isApproved: false // Los comentarios requieren aprobación
      },
      include: {
        User: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })

    return NextResponse.json({ 
      comment,
      message: 'Comentario enviado. Será revisado antes de publicarse.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando comentario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}