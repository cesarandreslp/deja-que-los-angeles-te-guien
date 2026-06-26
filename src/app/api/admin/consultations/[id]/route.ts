import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/consultations/[id] - Obtener consulta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
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
            phone: true,
            country: true
          }
        },
        consultor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
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

    return NextResponse.json({
      consultation
    })

  } catch (error) {
    console.error('Error al obtener consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/consultations/[id] - Actualizar consulta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      status,
      scheduledAt,
      duration,
      price,
      notes,
      consultorId
    } = body

    // Verificar que la consulta existe
    const existingConsultation = await prisma.video_consultations.findUnique({
      where: { id: params.id }
    })

    if (!existingConsultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    // Si se cambia el consultor, verificar que existe
    if (consultorId && consultorId !== existingConsultation.consultorId) {
      const consultant = await prisma.user.findUnique({
        where: { 
          id: consultorId,
          role: 'CONSULTANT',
          isActive: true
        }
      })

      if (!consultant) {
        return NextResponse.json(
          { error: 'Consultor no válido' },
          { status: 400 }
        )
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {}
    if (status) updateData.status = status
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt)
    if (duration) updateData.duration = parseInt(duration)
    if (price) updateData.price = parseInt(price)
    if (notes !== undefined) updateData.notes = notes
    if (consultorId) updateData.consultorId = consultorId

    const updatedConsultation = await prisma.video_consultations.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        consultor: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      consultation: updatedConsultation
    })

  } catch (error) {
    console.error('Error al actualizar consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/consultations/[id] - Cancelar consulta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
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

    // Solo se pueden cancelar consultas programadas o pendientes
    if (!['SCHEDULED', 'PENDING'].includes(consultation.status)) {
      return NextResponse.json(
        { error: 'Solo se pueden cancelar consultas programadas o pendientes' },
        { status: 400 }
      )
    }

    const cancelledConsultation = await prisma.video_consultations.update({
      where: { id: params.id },
      data: { 
        status: 'CANCELLED',
        notes: consultation.notes ? 
          `${consultation.notes}\n\nCancelada por administrador el ${new Date().toLocaleString()}` :
          `Cancelada por administrador el ${new Date().toLocaleString()}`
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Consulta cancelada correctamente',
      consultation: cancelledConsultation
    })

  } catch (error) {
    console.error('Error al cancelar consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}