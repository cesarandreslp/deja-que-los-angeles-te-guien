import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación para actualizar cartas
const UpdateCardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  description: z.string().min(1, 'La descripción es requerida').optional(),
  meaning: z.string().min(1, 'El significado es requerido').optional(),
  reversedMeaning: z.string().optional(),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
  archangelId: z.string().optional(),
  category: z.string().optional(),
  keywords: z.array(z.string()).optional()
})

// GET - Obtener carta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const card = await prisma.card.findUnique({
      where: { id: params.id }
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Carta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: card
    })

  } catch (error) {
    console.error('Error al obtener carta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar carta (solo admins)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateCardSchema.parse(body)

    const card = await prisma.card.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: card
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar carta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar carta (solo admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    await prisma.card.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Carta eliminada correctamente'
    })

  } catch (error) {
    console.error('Error al eliminar carta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}