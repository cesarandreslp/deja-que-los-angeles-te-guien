import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para actualizar estado de orden
const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
})

// GET /api/orders/[orderId] - Obtener detalles de una orden
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Construir filtros según el rol
    const where: any = { id: params.orderId }
    
    if (session.user.role === 'USER') {
      where.userId = session.user.id
    }
    // Los admins pueden ver cualquier orden

    const order = await prisma.Order.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: true,
            videoConsultation: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Formatear orden
    const formattedOrder = {
      id: order.id,
      status: order.status,
      totalAmount: (order.totalCents / 100).toFixed(2),
      shippingAddress: order.shippingAddress,
      paymentProvider: (order as any).paymentProvider,
      shippingNotes: (order as any).shippingNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user,
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        type: item.product ? 'product' : 'consultation',
        name: item.product?.name || `Videoconsulta - ${item.videoConsultation?.title}`,
        price: (item.priceCents / 100).toFixed(2),
        quantity: item.quantity,
        subtotal: ((item.priceCents * item.quantity) / 100).toFixed(2),
        product: item.product,
        videoConsultation: item.videoConsultation
      }))
    }

    return NextResponse.json({
      order: formattedOrder
    })

  } catch (error) {
    console.error('Error al obtener orden:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[orderId] - Actualizar estado de una orden (solo admins)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado para actualizar órdenes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status } = UpdateOrderStatusSchema.parse(body)

    // Verificar que la orden existe
    const existingOrder = await prisma.Order.findUnique({
      where: { id: params.orderId }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar estado de la orden
    const updatedOrder = await (prisma.Order.update as any)({
      where: { id: params.orderId },
      data: { 
        status,
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
        orderItems: {
          include: {
            product: true,
            videoConsultation: true
          }
        }
      }
    })

    // Formatear orden actualizada
    const formattedOrder = {
      id: updatedOrder.id,
      status: updatedOrder.status,
      totalAmount: ((updatedOrder as any).totalCents / 100).toFixed(2),
      shippingAddress: (updatedOrder as any).shippingAddress,
      paymentProvider: (updatedOrder as any).paymentProvider,
      shippingNotes: (updatedOrder as any).shippingNotes,
      createdAt: (updatedOrder as any).createdAt,
      updatedAt: (updatedOrder as any).updatedAt,
      user: (updatedOrder as any).user,
      items: (updatedOrder as any).orderItems.map((item: any) => ({
        id: item.id,
        type: item.product ? 'product' : 'consultation',
        name: item.product?.name || `Videoconsulta - ${item.videoConsultation?.title}`,
        price: (item.priceCents / 100).toFixed(2),
        quantity: item.quantity,
        subtotal: ((item.priceCents * item.quantity) / 100).toFixed(2),
        product: item.product,
        videoConsultation: item.videoConsultation
      }))
    }

    return NextResponse.json({
      message: 'Estado de la orden actualizado exitosamente',
      order: formattedOrder
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar orden:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[orderId] - Cancelar una orden
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Construir filtros según el rol
    const where: any = { id: params.orderId }
    
    if (session.user.role === 'USER') {
      where.userId = session.user.id
    }

    const order = await prisma.Order.findFirst({
      where,
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Solo se pueden cancelar órdenes pendientes o confirmadas
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return NextResponse.json(
        { error: 'No se puede cancelar una orden en estado ' + order.status },
        { status: 400 }
      )
    }

    // Cancelar orden y restaurar stock usando transacción
    await prisma.$transaction(async (tx: any) => {
      // Actualizar estado a cancelado
      await tx.order.update({
        where: { id: params.orderId },
        data: { 
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      })

      // Restaurar stock de productos
      await Promise.all(
        (order as any).orderItems
          .filter((item: any) => item.product)
          .map((item: any) =>
            tx.product.update({
              where: { id: item.productId! },
              data: {
                stock: {
                  increment: item.quantity
                }
              }
            })
          )
      )
    })

    return NextResponse.json({
      message: 'Orden cancelada exitosamente'
    })

  } catch (error) {
    console.error('Error al cancelar orden:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}