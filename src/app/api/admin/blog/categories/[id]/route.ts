import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// GET: Obtener categoría específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CONSULTANT')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const category = await prisma.blog_categories.findUnique({
      where: { id: params.id },
      include: {
        blog_posts: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true
              }
            },
            _count: {
              select: {
                comments: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            blog_posts: true
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

// PUT: Actualizar categoría
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
    const { name, slug, description } = body

    // Verificar que la categoría existe
    const existingCategory = await prisma.blog_categories.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // Si cambia el slug, verificar que sea único
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.blog_categories.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'El slug ya está en uso' },
          { status: 400 }
        )
      }
    }

    // Actualizar la categoría
    const category = await prisma.blog_categories.update({
      where: { id: params.id },
      data: {
        name: name || existingCategory.name,
        slug: slug || existingCategory.slug,
        description: description !== undefined ? description : existingCategory.description
      },
      include: {
        _count: {
          select: {
            blog_posts: true
          }
        }
      }
    })

    return NextResponse.json({ category })

  } catch (error) {
    console.error('Error actualizando categoría del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar categoría
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que la categoría existe
    const existingCategory = await prisma.blog_categories.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            blog_posts: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // No permitir eliminar categorías con publicaciones
    if (existingCategory._count.blog_posts > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una categoría que tiene publicaciones' },
        { status: 400 }
      )
    }

    // Eliminar la categoría
    await prisma.blog_categories.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Categoría eliminada exitosamente' })

  } catch (error) {
    console.error('Error eliminando categoría del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
