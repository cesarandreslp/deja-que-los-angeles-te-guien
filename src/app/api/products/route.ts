import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación para productos angelicales
const ProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.number().min(0, 'El precio debe ser positivo'), // En pesos/dólares, se convertirá a centavos
  currency: z.enum(['COP', 'USD']).default('COP'),
  category: z.enum(['CLOTHING', 'JEWELRY', 'ESSENCES', 'OILS', 'RITUALS', 'ACCESSORIES']),
  stock: z.number().min(0, 'El stock debe ser positivo'),
  imageUrls: z.array(z.string()).optional(), // Permitir cualquier string (URLs o rutas locales)
  isActive: z.boolean().optional()
})

// GET - Obtener productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const inStock = searchParams.get('inStock') === 'true'

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = { isActive: true }
    if (category) where.category = category
    if (inStock) where.stock = { gt: 0 }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Obtener session para verificar si es admin
    const session = await getServerSession(authOptions)
    if (session?.user.role === 'ADMIN') {
      delete where.isActive // Los admins pueden ver productos inactivos
    }

    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      prisma.products.count({ where })
    ])

    // Formatear productos con precios legibles
    const formattedProducts = products.map((product: any) => ({
      ...product,
      price: product.priceCents / 100,
      formattedPrice: new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: product.currency
      }).format(product.priceCents / 100)
    }))

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo producto (solo admins)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = ProductSchema.parse(body)

    const product = await prisma.products.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        priceCents: Math.round(validatedData.price * 100), // Convertir a centavos
        currency: validatedData.currency,
        category: validatedData.category,
        stock: validatedData.stock,
        imageUrls: validatedData.imageUrls || [],
        isActive: validatedData.isActive ?? true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        price: product.priceCents / 100,
        formattedPrice: new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: product.currency
        }).format(product.priceCents / 100)
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      console.error('Errores de validación:', error.errors)
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: error.errors,
          message: errorMessages
        },
        { status: 400 }
      )
    }

    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}