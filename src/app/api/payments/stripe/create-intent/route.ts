// API Route para crear Payment Intent de Stripe - FASE 5
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'mxn', orderId } = await request.json()

    // Validar datos requeridos
    if (!amount || !orderId) {
      return NextResponse.json({
        success: false,
        error: 'Datos requeridos faltantes'
      }, { status: 400 })
    }

    // Verificar que la orden existe
    const order = await prisma.Order.findUnique({
      where: { id: orderId },
      include: {
        user: true
      }
    })

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Orden no encontrada'
      }, { status: 404 })
    }

    // Crear Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        orderId: orderId,
        orderNumber: order.id,
        customerEmail: order.user?.email || '',
        source: 'tienda_angelical'
      },
      description: `Pedido #${order.id} - Tienda Angélica`,
      statement_descriptor: 'TIENDA ANGELICAL'
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 })
  }
}