import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// GET: Obtener publicación específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CONSULTANT')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const post = await prisma.blog_posts.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true
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
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
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

// PUT: Actualizar publicación
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CONSULTANT')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      title, 
      slug, 
      excerpt, 
      content, 
      coverImage, 
      categoryId, 
      status,
      tags,
      publishedAt 
    } = body

    // Verificar que la publicación existe
    const existingPost = await prisma.blog_posts.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    // Si cambia el slug, verificar que sea único
    if (slug && slug !== existingPost.slug) {
      const slugExists = await prisma.blog_posts.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'El slug ya está en uso' },
          { status: 400 }
        )
      }
    }

    // Si cambia la categoría, verificar que existe
    if (categoryId && categoryId !== existingPost.categoryId) {
      const category = await prisma.blog_categories.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Categoría no encontrada' },
          { status: 404 }
        )
      }
    }

    // Preparar datos de actualización
    const updateData: any = {}
    
    if (title) updateData.title = title
    if (slug) updateData.slug = slug
    if (excerpt) updateData.excerpt = excerpt
    if (content) updateData.content = content
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (categoryId) updateData.categoryId = categoryId
    if (status) updateData.status = status
    if (tags) updateData.tags = tags
    
    // Manejar publishedAt
    if (status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      updateData.publishedAt = publishedAt || new Date()
    } else if (status !== 'PUBLISHED') {
      updateData.publishedAt = null
    }

    // Actualizar la publicación
    const post = await prisma.blog_posts.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    })

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Error actualizando post del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar publicación
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que la publicación existe
    const existingPost = await prisma.blog_posts.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar comentarios relacionados primero
    await prisma.blogComment.deleteMany({
      where: { postId: params.id }
    })

    // Eliminar la publicación
    await prisma.blog_posts.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Publicación eliminada exitosamente' })

  } catch (error) {
    console.error('Error eliminando post del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}