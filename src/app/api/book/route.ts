import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import Stripe from 'stripe'
import { MercadoPagoConfig, Preference } from 'mercadopago'

// Configurar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

// Configurar MercadoPago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

// Schema de validación para booking
const BookingSchema = z.object({
  consultantId: z.string().min(1, 'El consultor es requerido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  duration: z.number().min(30).max(120).default(60), // Duración en minutos
  notes: z.string().optional()
})

// POST /api/book - Crea registro preliminar de cita con estado PENDING
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
    const validatedData = BookingSchema.parse(body)

    // Verificar que el consultor existe y está activo
    const consultant = await prisma.user.findFirst({
      where: {
        id: validatedData.consultantId,
        role: 'CONSULTANT',
        isActive: true
      }
    })

    if (!consultant) {
      return NextResponse.json(
        { error: 'Consultor no encontrado o inactivo' },
        { status: 400 }
      )
    }

    // Verificar que el turno no esté ocupado
    const startOfDay = new Date(validatedData.date + 'T00:00:00.000Z')
    const endOfDay = new Date(validatedData.date + 'T23:59:59.999Z')

    const existingBooking = await prisma.video_consultations.findFirst({
      where: {
        consultantId: validatedData.consultantId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        time: validatedData.time,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PAID', 'SCHEDULED', 'ATTENDED']
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'El turno seleccionado ya está ocupado' },
        { status: 409 }
      )
    }

    // Crear fecha completa combinando date y time
    const [hours, minutes] = validatedData.time.split(':').map(Number)
    const scheduledDateTime = new Date(validatedData.date)
    scheduledDateTime.setHours(hours, minutes, 0, 0)

    // Calcular precio base (puede ser configurable)
    const basePrice = 5000 // $50.00 USD en centavos

    // Crear registro preliminar de la cita
    const booking = await prisma.video_consultations.create({
      data: {
        userId: session.user.id,
        consultorId: validatedData.consultantId, // Mantengo compatibilidad
        consultantId: validatedData.consultantId, // Nuevo campo del PROMPT
        scheduledAt: scheduledDateTime,
        date: new Date(validatedData.date), // Campo separado del PROMPT
        time: validatedData.time, // Campo separado del PROMPT
        duration: validatedData.duration,
        price: basePrice,
        status: 'PENDING', // Estado inicial según PROMPT
        paymentStatus: 'PENDING',
        notes: validatedData.notes,
        createdAt: new Date(),
        updatedAt: new Date()
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

    // Determinar pasarela de pago según país del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { country: true }
    })

    const useStripe = user?.country !== 'CO' // Colombia usa MercadoPago, otros países Stripe
    
    // Crear checkout session según la pasarela
    let checkoutUrl = ''
    
    if (useStripe) {
      // Crear Stripe checkout session
      checkoutUrl = await createStripeCheckout(booking.id, basePrice, consultant.fullName, validatedData.date, validatedData.time)
    } else {
      // Crear MercadoPago preference
      checkoutUrl = await createMercadoPagoPreference(booking.id, basePrice, consultant.fullName, validatedData.date, validatedData.time)
    }

    return NextResponse.json({
      success: true,
      message: 'Cita reservada exitosamente. Procede al pago para confirmar.',
      data: {
        bookingId: booking.id,
        consultantName: consultant.fullName,
        date: validatedData.date,
        time: validatedData.time,
        duration: validatedData.duration,
        price: basePrice,
        status: 'PENDING',
        paymentProvider: useStripe ? 'STRIPE' : 'MERCADOPAGO',
        checkoutUrl,
        paymentRequired: true,
        nextStep: 'payment'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error en booking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// Función auxiliar para crear Stripe checkout
async function createStripeCheckout(
  bookingId: string, 
  price: number, 
  consultantName: string, 
  date: string, 
  time: string
): Promise<string> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Videoconsulta con ${consultantName}`,
              description: `Fecha: ${date} a las ${time}`,
            },
            unit_amount: price, // Precio en centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/booking/cancel`,
      metadata: {
        bookingId,
        type: 'videoconsultation'
      },
    })

    return session.url!
  } catch (error) {
    console.error('Error creando Stripe checkout:', error)
    throw new Error('Error al crear sesión de pago con Stripe')
  }
}

// Función auxiliar para crear MercadoPago preference
async function createMercadoPagoPreference(
  bookingId: string, 
  price: number, 
  consultantName: string, 
  date: string, 
  time: string
): Promise<string> {
  try {
    const preference = new Preference(mercadopago)
    
    const result = await preference.create({
      body: {
        items: [
          {
            id: bookingId,
            title: `Videoconsulta con ${consultantName}`,
            description: `Fecha: ${date} a las ${time}`,
            quantity: 1,
            unit_price: price / 100, // MercadoPago usa pesos, no centavos
            currency_id: 'COP'
          }
        ],
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/booking/success`,
          failure: `${process.env.NEXTAUTH_URL}/booking/cancel`,
          pending: `${process.env.NEXTAUTH_URL}/booking/pending`
        },
        auto_return: 'approved',
        metadata: {
          booking_id: bookingId,
          type: 'videoconsultation'
        }
      }
    })

    return result.init_point!
  } catch (error) {
    console.error('Error creando MercadoPago preference:', error)
    throw new Error('Error al crear preferencia de pago con MercadoPago')
  }
}