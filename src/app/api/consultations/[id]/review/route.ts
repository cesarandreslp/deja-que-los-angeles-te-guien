import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ReviewSchema = z.object({
  rating: z.number().min(1, 'Rating mínimo es 1').max(5, 'Rating máximo es 5'),
  comment: z.string().optional()
})

// POST - Crear review para una consulta
export async function POST(
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

    const body = await request.json()
    const validatedData = ReviewSchema.parse(body)

    // Verificar que la consulta existe
    const consultation = await prisma.video_consultations.findUnique({
      where: { id: params.id }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el dueño de la consulta
    if (consultation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para dejar una review en esta consulta' },
        { status: 403 }
      )
    }

    // Verificar que la consulta está completada
    if (consultation.status !== 'COMPLETED' && consultation.status !== 'ATTENDED') {
      return NextResponse.json(
        { error: 'Solo puedes dejar una review en consultas completadas' },
        { status: 400 }
      )
    }

    // Verificar que no existe ya una review
    const existingReviewCheck = await prisma.consultation_reviews.findUnique({
      where: { consultationId: params.id }
    })
    if (existingReviewCheck) {
      return NextResponse.json(
        { error: 'Ya existe una review para esta consulta' },
        { status: 400 }
      )
    }

    // Verificar que hay un consultor asignado
    if (!consultation.consultorId) {
      return NextResponse.json(
        { error: 'No hay consultor asignado a esta consulta' },
        { status: 400 }
      )
    }

    // Crear la review
    const review = await prisma.consultation_reviews.create({
      data: {
        consultationId: params.id,
        userId: session.user.id,
        consultantId: consultation.consultorId,
        rating: validatedData.rating,
        comment: validatedData.comment
      }
    })

    // Actualizar el rating del consultor
    const consultantReviews = await prisma.consultation_reviews.findMany({
      where: {
        consultantId: consultation.consultorId
      },
      select: {
        rating: true
      }
    })

    const averageRating = consultantReviews.reduce((acc: number, rev: { rating: number }) => acc + rev.rating, 0) / consultantReviews.length

    await prisma.user.update({
      where: { id: consultation.consultorId },
      data: {
        consultantRating: Math.round(averageRating * 10) / 10 // Redondear a 1 decimal
      }
    })

    // También actualizar el campo rating de la consulta (para compatibilidad)
    await prisma.video_consultations.update({
      where: { id: params.id },
      data: {
        rating: validatedData.rating
      }
    })

    return NextResponse.json({
      success: true,
      review,
      message: 'Review creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - Obtener review de una consulta
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.consultation_reviews.findUnique({
      where: {
        consultationId: params.id
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      review
    })

  } catch (error) {
    console.error('Error al obtener review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar review
export async function PUT(
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

    const body = await request.json()
    const validatedData = ReviewSchema.parse(body)

    // Verificar que la review existe
    const existingReview = await prisma.consultation_reviews.findUnique({
      where: {
        consultationId: params.id
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el dueño de la review
    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar esta review' },
        { status: 403 }
      )
    }

    // Actualizar la review
    const updatedReview = await prisma.consultation_reviews.update({
      where: {
        consultationId: params.id
      },
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment
      }
    })

    // Recalcular el rating del consultor
    const consultantReviews = await prisma.consultation_reviews.findMany({
      where: {
        consultantId: existingReview.consultantId
      },
      select: {
        rating: true
      }
    })

    const averageRating = consultantReviews.reduce((acc: number, rev: { rating: number }) => acc + rev.rating, 0) / consultantReviews.length

    await prisma.user.update({
      where: { id: existingReview.consultantId },
      data: {
        consultantRating: Math.round(averageRating * 10) / 10
      }
    })

    // Actualizar también el campo rating de la consulta
    await prisma.video_consultations.update({
      where: { id: params.id },
      data: {
        rating: validatedData.rating
      }
    })

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: 'Review actualizada exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar review
export async function DELETE(
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

    // Verificar que la review existe
    const existingReview = await prisma.consultation_reviews.findUnique({
      where: {
        consultationId: params.id
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos (usuario dueño o admin)
    if (existingReview.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta review' },
        { status: 403 }
      )
    }

    const consultantId = existingReview.consultantId

    // Eliminar la review
    await prisma.consultation_reviews.delete({
      where: {
        consultationId: params.id
      }
    })

    // Recalcular el rating del consultor sin esta review
    const remainingReviews = await prisma.consultation_reviews.findMany({
      where: {
        consultantId
      },
      select: {
        rating: true
      }
    })

    const newAverageRating = remainingReviews.length > 0
      ? remainingReviews.reduce((acc: number, rev: { rating: number }) => acc + rev.rating, 0) / remainingReviews.length
      : 0.0

    await prisma.user.update({
      where: { id: consultantId },
      data: {
        consultantRating: Math.round(newAverageRating * 10) / 10
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Review eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
