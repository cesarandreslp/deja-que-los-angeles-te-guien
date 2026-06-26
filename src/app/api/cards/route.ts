import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación para cartas
const CardSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  title: z.string().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  definition: z.string().optional(),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
  arcangelName: z.string().min(1, 'El arcángel es requerido'),
  shortMsg: z.string().optional(),
  meaning: z.string().optional(),
  isActive: z.boolean().optional()
})

// GET - Obtener todas las cartas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const archangelId = searchParams.get('archangelId')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (archangelId) where.archangelId = archangelId
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { meaning: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [cards, total] = await Promise.all([
      (prisma.card.findMany as any)({
        where,
        include: {
          arcangel: true
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.card.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        cards,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error al obtener cartas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva carta (solo admins)
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
    const validatedData = CardSchema.parse(body)

    const card = await (prisma.card.create as any)({
      data: {
        ...validatedData,
        imageUrl: validatedData.imageUrl || '/oraculo/arcangeles_cartas/dorso.png',
        title: validatedData.title || validatedData.name,
        definition: validatedData.definition || validatedData.description,
        meaning: validatedData.meaning || validatedData.description,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true
      },
      include: {
        arcangel: true
      }
    })

    return NextResponse.json({
      success: true,
      data: card
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear carta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}