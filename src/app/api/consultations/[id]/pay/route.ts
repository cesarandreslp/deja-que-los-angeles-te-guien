import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PaymentSchema = z.object({
  paymentMethod: z.enum(['mercadopago', 'stripe']),
})

// POST - Procesar pago de consulta
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
    const validatedData = PaymentSchema.parse(body)
    const consultationId = params.id

    // Verificar que la consulta existe y pertenece al usuario
    const consultation = await prisma.video_consultations.findFirst({
      where: {
        id: consultationId,
        userId: session.user.id,
        status: 'SCHEDULED' // Solo se pueden pagar consultas programadas
      },
      include: {
        user: true,
        consultor: true
      }
    })

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada o no disponible para pago' },
        { status: 404 }
      )
    }

    // Verificar que la consulta no haya sido pagada ya
    if (consultation.paymentStatus === 'SUCCESS') {
      return NextResponse.json(
        { error: 'Esta consulta ya ha sido pagada' },
        { status: 400 }
      )
    }

    // Simular procesamiento de pago (aquí iría la integración real con MercadoPago/Stripe)
    let paymentResult
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (validatedData.paymentMethod === 'mercadopago') {
      // Simulación de MercadoPago
      paymentResult = {
        success: true,
        paymentId,
        paymentUrl: null, // Para demo, procesamos directamente
        status: 'SUCCESS'
      }
    } else if (validatedData.paymentMethod === 'stripe') {
      // Simulación de Stripe
      paymentResult = {
        success: true,
        paymentId,
        paymentUrl: null, // Para demo, procesamos directamente
        status: 'SUCCESS'
      }
    }

    if (paymentResult?.success) {
      // Actualizar la consulta con información de pago
      const updatedConsultation = await prisma.video_consultations.update({
        where: { id: consultationId },
        data: {
          paymentProvider: validatedData.paymentMethod.toUpperCase() as 'MERCADOPAGO' | 'STRIPE',
          paymentStatus: 'SUCCESS',
          status: 'PAID',
          // En un caso real, aquí se guardaría el paymentId real del proveedor
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          consultor: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      })

      // TODO: Aquí se enviarían emails de confirmación tanto al usuario como al consultor
      // TODO: Aquí se generaría el enlace de videollamada
      // TODO: Aquí se programarían recordatorios automáticos

      return NextResponse.json({
        success: true,
        message: 'Pago procesado exitosamente',
        consultation: updatedConsultation,
        paymentId: paymentResult.paymentId,
        paymentUrl: paymentResult.paymentUrl
      })
    } else {
      // Actualizar con estado de pago fallido
      await prisma.video_consultations.update({
        where: { id: consultationId },
        data: {
          paymentProvider: validatedData.paymentMethod.toUpperCase() as 'MERCADOPAGO' | 'STRIPE',
          paymentStatus: 'FAILED'
        }
      })

      return NextResponse.json(
        { error: 'Error al procesar el pago. Intenta nuevamente.' },
        { status: 400 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al procesar pago:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}