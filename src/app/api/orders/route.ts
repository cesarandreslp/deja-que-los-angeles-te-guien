import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para validar creación de orden
const CreateOrderSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1, 'Dirección requerida'),
    city: z.string().min(1, 'Ciudad requerida'),
    state: z.string().min(1, 'Estado requerido'),
    zipCode: z.string().min(1, 'Código postal requerido'),
    country: z.string().default('México')
  }),
  paymentMethod: z.enum(['MERCADOPAGO', 'STRIPE', 'PAYPAL']).default('MERCADOPAGO'),
  notes: z.string().optional()
})

// GET - Obtener órdenes
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
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Construir filtros según el rol
    const where: any = {}
    
    if (session.user.role === 'USER') {
      where.userId = session.user.id
    }
    // Los admins pueden ver todas las órdenes

    // Filtros adicionales
    if (status) where.status = status
    if (userId && session.user.role === 'ADMIN') where.userId = userId

    const [orders, total] = await Promise.all([
      prisma.Order.findMany({
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.Order.count({ where })
    ])

    // Formatear órdenes
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      currency: order.currency,
      paymentProvider: order.paymentProvider,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      shippingPhone: order.shippingPhone,
      shippingNotes: order.shippingNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user,
      items: order.orderItems?.map((item: any) => ({
        id: item.id,
        type: item.product ? 'product' : 'consultation',
        name: item.product?.name || `Videoconsulta ${item.videoConsultation?.id || ''}`,
        price: item.priceCents,
        quantity: item.quantity,
        subtotal: item.priceCents * item.quantity,
        product: item.product,
        videoConsultation: item.videoConsultation
      })) || []
    }))

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error al obtener órdenes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Crear nueva orden (checkout)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreateOrderSchema.parse(body)

    // Obtener carrito del usuario
    const cart = await prisma.carts.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
            videoConsultation: true
          }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío' },
        { status: 400 }
      )
    }

    // Verificar disponibilidad de productos
    for (const item of cart.items) {
      if (item.product && !item.product.isActive) {
        return NextResponse.json(
          { error: `Producto ${item.product.name} no está disponible` },
          { status: 400 }
        )
      }
      if (item.product && item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${item.product.name}` },
          { status: 400 }
        )
      }
    }

    // Calcular total y preparar items de la orden
    let totalCents = 0
    const orderItems = cart.items.map((item: any) => {
      let priceCents = 0

      if (item.product) {
        priceCents = item.product.priceCents // Ya está en centavos
      } else if (item.videoConsultation) {
        priceCents = item.videoConsultation.price // Ya está en centavos
      }

      totalCents += priceCents * item.quantity

      return {
        productId: item.productId,
        videoConsultationId: item.videoConsultationId,
        quantity: item.quantity,
        priceCents
      }
    })

    // Crear la orden usando transacción
    const order = await prisma.$transaction(async (tx: any) => {
      // Crear orden
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: 'PENDING',
          totalCents,
          shippingAddress: JSON.stringify(validatedData.shippingAddress),
          shippingNotes: validatedData.notes,
          paymentProvider: validatedData.paymentMethod,
          orderItems: {
            create: orderItems
          }
        },
        include: {
          orderItems: {
            include: {
              product: true,
              videoConsultation: true
            }
          }
        }
      })

      // Reducir stock de productos
      await Promise.all(
        cart.items
          .filter((item: any) => item.product)
          .map((item: any) =>
            tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            })
          )
      )

      // Vaciar carrito después de crear la orden
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })

      return newOrder
    })

    // Formatear respuesta
    const formattedOrder = {
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      shippingAddress: order.shippingAddress,
      paymentProvider: order.paymentProvider,
      shippingNotes: order.shippingNotes,
      createdAt: order.createdAt,
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        type: item.product ? 'product' : 'consultation',
        name: item.product?.name || `Videoconsulta ${item.videoConsultation?.id || ''}`,
        price: item.priceCents,
        quantity: item.quantity,
        subtotal: item.priceCents * item.quantity,
        product: item.product,
        videoConsultation: item.videoConsultation
      }))
    }

    return NextResponse.json({
      message: 'Orden creada exitosamente',
      order: formattedOrder
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear orden:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}