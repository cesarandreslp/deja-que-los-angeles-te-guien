import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Obtener todas las publicaciones del blog
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      where.status = status
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Obtener posts con relaciones
    const [posts, total] = await Promise.all([
      prisma.blog_posts.findMany({
        where,
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
              blog_comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.blog_posts.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error obteniendo posts del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST: Crear nueva publicación
export async function POST(request: NextRequest) {
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
      status = 'DRAFT',
      tags = [],
      publishedAt 
    } = body

    // Validaciones básicas
    if (!title || !slug || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la categoría existe
    const category = await prisma.blog_categories.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el slug es único
    const existingPost = await prisma.blog_posts.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'El slug ya está en uso' },
        { status: 400 }
      )
    }

    // Crear la publicación
    const post = await prisma.blog_posts.create({
      data: {
        title,
        slug,
        excerpt: excerpt || content.substring(0, 200) + '...',
        content,
        coverImage,
        authorId: session.user.id,
        categoryId,
        status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        tags,
        publishedAt: status === 'PUBLISHED' ? (publishedAt || new Date()) : null
      },
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
            blog_comments: true
          }
        }
      }
    })

    return NextResponse.json({ post }, { status: 201 })

  } catch (error) {
    console.error('Error creando post del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}