import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación para arcángeles
const ArchangelSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
  isActive: z.boolean().optional()
})

// GET - Obtener todos los arcángeles
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
    const includeCards = searchParams.get('includeCards') === 'true'
    const search = searchParams.get('search')

    // Construir filtros
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const archangels = await (prisma.archangel.findMany as any)({
      where,
      include: {
        cards: includeCards,
        _count: {
          select: { cards: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: archangels
    })

  } catch (error) {
    console.error('Error al obtener arcángeles:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo arcángel (solo admins)
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
    const validatedData = ArchangelSchema.parse(body)

    const archangel = await prisma.archangel.create({
      data: {
        ...validatedData,
        imageUrl: validatedData.imageUrl || `/oraculo/arcangeles/${validatedData.name.toLowerCase()}.png`,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      data: archangel
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear arcángel:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}