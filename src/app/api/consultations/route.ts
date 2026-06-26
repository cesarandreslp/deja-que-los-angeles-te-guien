import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación para videoconsultas
const VideoConsultationSchema = z.object({
  consultorId: z.string().min(1, 'El consultor es requerido'),
  scheduledAt: z.string().datetime('Fecha inválida'),
  duration: z.number().min(15, 'Duración mínima 15 minutos').max(120, 'Duración máxima 120 minutos'),
  price: z.number().min(0, 'Precio debe ser positivo'),
  notes: z.string().optional(),
  topic: z.string().optional()
})

const UpdateConsultationSchema = z.object({
  scheduledAt: z.string().datetime('Fecha inválida').optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  actualDuration: z.number().min(0).optional()
})

// GET - Obtener videoconsultas
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
    const status = searchParams.get('status')
    const consultorId = searchParams.get('consultorId')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Construir filtros según el rol
    const where: any = {}
    
    if (session.user.role === 'USER') {
      where.userId = session.user.id
    } else if (session.user.role === 'CONSULTANT') {
      where.consultorId = session.user.id
    }
    // Los admins pueden ver todas

    // Filtros adicionales
    if (status) where.status = status
    if (consultorId && session.user.role === 'ADMIN') where.consultorId = consultorId
    if (userId && session.user.role === 'ADMIN') where.userId = userId

    const [consultations, total] = await Promise.all([
      prisma.video_consultations.findMany({
        where,
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
        },
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' }
      }),
      prisma.video_consultations.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        consultations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error al obtener videoconsultas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva videoconsulta
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = VideoConsultationSchema.parse(body)

    // Verificar que el consultor existe y está activo
    const consultor = await prisma.user.findFirst({
      where: {
        id: validatedData.consultorId,
        role: 'CONSULTANT',
        isActive: true
      }
    })

    if (!consultor) {
      return NextResponse.json(
        { error: 'Consultor no encontrado o inactivo' },
        { status: 400 }
      )
    }

    // Verificar disponibilidad (no permitir consultas en el mismo horario)
    const scheduledAt = new Date(validatedData.scheduledAt)
    const endTime = new Date(scheduledAt.getTime() + validatedData.duration * 60000)

    const conflictingConsultation = await prisma.video_consultations.findFirst({
      where: {
        consultorId: validatedData.consultorId,
        status: { in: ['SCHEDULED', 'RESCHEDULED'] },
        OR: [
          {
            AND: [
              { scheduledAt: { lte: scheduledAt } },
              { scheduledAt: { gte: new Date(scheduledAt.getTime() - 60 * 60000) } } // 1 hora antes
            ]
          },
          {
            AND: [
              { scheduledAt: { gte: scheduledAt } },
              { scheduledAt: { lte: endTime } }
            ]
          }
        ]
      }
    })

    if (conflictingConsultation) {
      return NextResponse.json(
        { error: 'El consultor no está disponible en ese horario' },
        { status: 400 }
      )
    }

    const consultation = await prisma.video_consultations.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        scheduledAt: new Date(validatedData.scheduledAt),
        status: 'SCHEDULED'
      },
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
      data: consultation
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear videoconsulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}