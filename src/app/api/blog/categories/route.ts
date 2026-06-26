import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CategoryWithCount {
  id: string
  name: string
  slug: string
  description: string | null
  _count: {
    posts: number
  }
}

// GET: Obtener todas las categorías públicas
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.blog_categories.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED' // Solo contar posts publicados
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Filtrar categorías que tengan al menos un post publicado
    const categoriesWithPosts = categories.filter((cat: CategoryWithCount) => cat._count.posts > 0)

    return NextResponse.json({ categories: categoriesWithPosts })

  } catch (error) {
    console.error('Error obteniendo categorías públicas del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}