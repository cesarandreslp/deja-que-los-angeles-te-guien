import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateConsultationSchema = z.object({
  scheduledAt: z.string().datetime('Fecha inválida').optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  actualDuration: z.number().min(0).optional()
})

// GET - Obtener consulta por ID
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

    const consultation = await prisma.video_consultations.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true
          }
        },
        consultor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true
          }
        }
      }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos
    if (session.user.role === 'USER' && consultation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para ver esta consulta' },
        { status: 403 }
      )
    }

    if (session.user.role === 'CONSULTANT' && consultation.consultorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para ver esta consulta' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: consultation
    })

  } catch (error) {
    console.error('Error al obtener consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar consulta
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
    const validatedData = UpdateConsultationSchema.parse(body)

    // Obtener la consulta actual
    const currentConsultation = await prisma.video_consultations.findUnique({
      where: { id: params.id }
    })

    if (!currentConsultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos
    if (session.user.role === 'USER' && currentConsultation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar esta consulta' },
        { status: 403 }
      )
    }

    if (session.user.role === 'CONSULTANT' && currentConsultation.consultorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar esta consulta' },
        { status: 403 }
      )
    }

    // Preparar datos para actualizar
    const updateData: any = {}
    
    if (validatedData.scheduledAt) {
      updateData.scheduledAt = new Date(validatedData.scheduledAt)
    }
    
    if (validatedData.status) {
      updateData.status = validatedData.status
    }
    
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes
    }
    
    if (validatedData.rating !== undefined) {
      updateData.rating = validatedData.rating
    }
    
    if (validatedData.feedback !== undefined) {
      updateData.feedback = validatedData.feedback
    }
    
    if (validatedData.meetingUrl !== undefined) {
      updateData.meetingUrl = validatedData.meetingUrl
    }
    
    if (validatedData.actualDuration !== undefined) {
      updateData.actualDuration = validatedData.actualDuration
    }

    const updatedConsultation = await prisma.video_consultations.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true
          }
        },
        consultor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedConsultation
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar consulta
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

    const consultation = await prisma.video_consultations.findUnique({
      where: { id: params.id }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    // Solo el usuario que agendó o admins pueden cancelar
    if (session.user.role !== 'ADMIN' && consultation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para cancelar esta consulta' },
        { status: 403 }
      )
    }

    await prisma.video_consultations.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({
      success: true,
      message: 'Consulta cancelada correctamente'
    })

  } catch (error) {
    console.error('Error al cancelar consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}