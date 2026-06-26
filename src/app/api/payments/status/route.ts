//Status de pago API endpoint - FASE 5 CORREGIDO
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const orderId = searchParams.get('orderId')
    
    if (!paymentId && !orderId) {
      return NextResponse.json(
        { error: 'Payment ID or Order ID is required' },
        { status: 400 }
      )
    }

    // Buscar la orden por paymentId o orderId
    const order = await prisma.Order.findFirst({
      where: paymentId 
        ? { paymentId: paymentId }
        : { id: orderId! },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // La información del pago está en los campos de la orden
    // No hay consulta externa - solo devolver el estado actual

    // Preparar respuesta basada en la orden
    const response = {
      paymentId: order.paymentId,
      status: order.paymentStatus,
      amount: order.totalCents,
      currency: order.currency,
      provider: order.paymentProvider,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      order: {
        id: order.id,
        status: order.status,
        total: order.totalCents,
        items: order.orderItems.map((item: any) => ({
          id: item.id,
          name: item.product?.name || 'Producto',
          price: item.priceCents,
          quantity: item.quantity,
          image: item.product?.imageUrls?.[0]
        }))
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Endpoint para consultar el estado de una orden específica
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Buscar la orden con sus items
    const order = await prisma.Order.findUnique({
      where: {
        id: orderId
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // La información del pago está en la orden misma
    const paymentInfo = {
      paymentId: order.paymentId,
      status: order.paymentStatus,
      amount: order.totalCents,
      currency: order.currency,
      provider: order.paymentProvider,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }

    // Determinar si necesita actualización de estado
    let orderStatus = order.status
    const isSuccessful = order.paymentStatus === 'SUCCESS'
    const isFailed = order.paymentStatus === 'FAILED'

    if (isSuccessful && orderStatus === 'PENDING') {
      orderStatus = 'PAID'
      await prisma.Order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      })
    } else if (isFailed && orderStatus === 'PENDING') {
      orderStatus = 'CANCELLED'
      await prisma.Order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      })
    }

    const response = {
      orderId: orderId,
      orderStatus: orderStatus,
      totalAmount: order.totalCents,
      payment: paymentInfo,
      summary: {
        hasSuccessfulPayment: isSuccessful,
        hasPendingPayment: order.paymentStatus === 'PENDING',
        paymentFailed: isFailed
      },
      order: {
        id: order.id,
        status: orderStatus,
        total: order.totalCents,
        createdAt: order.createdAt,
        items: order.orderItems.map((item: any) => ({
          id: item.id,
          name: item.product?.name || 'Producto',
          price: item.priceCents,
          quantity: item.quantity,
          image: item.product?.imageUrls?.[0]
        }))
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error checking order payment status:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}