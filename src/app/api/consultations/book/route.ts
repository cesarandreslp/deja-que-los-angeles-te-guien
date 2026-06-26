import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateJitsiMeetingLink } from '@/utils/jitsi'
import { sendEmail, getConsultationConfirmationEmail } from '@/lib/email'

// Schema de validación para agendar consulta
const BookConsultationSchema = z.object({
  consultantId: z.string().min(1, 'El consultor es requerido'),
  scheduledAt: z.string().datetime('Fecha inválida'),
  duration: z.number().min(15, 'Duración mínima 15 minutos').max(120, 'Duración máxima 120 minutos'),
  notes: z.string().optional()
})

// POST - Agendar nueva consulta
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
    const validatedData = BookConsultationSchema.parse(body)

    // Verificar que el consultor existe y está activo
    const consultant = await prisma.user.findFirst({
      where: {
        id: validatedData.consultantId,
        role: 'CONSULTANT',
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true
      }
    })

    if (!consultant) {
      return NextResponse.json(
        { error: 'Consultor no encontrado o inactivo' },
        { status: 400 }
      )
    }

    // Calcular precio basado en tarifa fija por consulta (60000 COP por hora = 1000 COP por minuto)
    const pricePerMinute = 1000 // 1000 COP por minuto
    const totalPrice = Math.round(pricePerMinute * validatedData.duration)

    // Verificar disponibilidad (no permitir consultas en el mismo horario)
    const scheduledAt = new Date(validatedData.scheduledAt)
    const endTime = new Date(scheduledAt.getTime() + validatedData.duration * 60000)

    const conflictingConsultation = await prisma.video_consultations.findFirst({
      where: {
        consultorId: validatedData.consultantId,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'PAID'] },
        OR: [
          {
            AND: [
              { scheduledAt: { lte: scheduledAt } },
              { scheduledAt: { gte: new Date(scheduledAt.getTime() - validatedData.duration * 60000) } }
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

    // Crear la consulta inicialmente
    const consultation = await prisma.video_consultations.create({
      data: {
        userId: session.user.id,
        consultorId: validatedData.consultantId,
        scheduledAt: scheduledAt,
        duration: validatedData.duration,
        price: totalPrice,
        notes: validatedData.notes,
        status: 'SCHEDULED'
      }
    })

    // Generar el enlace de videollamada usando el ID de la consulta
    const videoLink = generateJitsiMeetingLink(consultation.id)

    // Actualizar la consulta con el enlace de video
    const updatedConsultation = await prisma.video_consultations.update({
      where: { id: consultation.id },
      data: { videoLink },
      include: {
        User_video_consultations_userIdTousers: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true
          }
        },
        User_video_consultations_consultorIdTousers: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true
          }
        }
      }
    })

    // Formatear fecha y hora para emails
    const formattedDate = scheduledAt.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const formattedTime = scheduledAt.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    // Enviar email de confirmación (no bloqueante)
    const emailData = getConsultationConfirmationEmail({
      userName: session.user.name || 'Usuario',
      consultantName: consultant.fullName,
      date: formattedDate,
      time: formattedTime,
      duration: validatedData.duration,
      videoLink: videoLink,
      consultationId: consultation.id
    })

    // Enviar email de forma asíncrona sin esperar
    sendEmail({
      to: session.user.email || '',
      subject: emailData.subject,
      html: emailData.html
    }).catch(error => {
      console.error('Error al enviar email de confirmación:', error)
      // No fallar la petición si el email falla
    })

    // También notificar al consultor
    sendEmail({
      to: consultant.email,
      subject: `Nueva Consulta Agendada - ${session.user.name}`,
      html: `
        <h2>Nueva Consulta Agendada</h2>
        <p>Hola ${consultant.fullName},</p>
        <p>Tienes una nueva consulta agendada:</p>
        <ul>
          <li><strong>Cliente:</strong> ${session.user.name}</li>
          <li><strong>Fecha:</strong> ${formattedDate}</li>
          <li><strong>Hora:</strong> ${formattedTime}</li>
          <li><strong>Duración:</strong> ${validatedData.duration} minutos</li>
        </ul>
        <p><a href="${process.env.NEXTAUTH_URL}/consultant/consultations">Ver en Panel de Consultor</a></p>
      `
    }).catch(error => {
      console.error('Error al enviar email al consultor:', error)
    })

    return NextResponse.json({
      success: true,
      consultation: updatedConsultation,
      message: 'Consulta agendada exitosamente'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al agendar consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}