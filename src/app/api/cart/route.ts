import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para validar items del carrito
const AddCartItemSchema = z.object({
  productId: z.string().optional(),
  consultationId: z.string().optional(),
  quantity: z.number().min(1).default(1)
}).refine(data => data.productId || data.consultationId, {
  message: "Debe especificar productId o consultationId"
})

// GET /api/cart - Obtener carrito del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Buscar o crear carrito del usuario
    let cart = await prisma.carts.findUnique({
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

    if (!cart) {
      cart = await prisma.carts.create({
        data: { userId: session.user.id },
        include: {
          items: {
            include: {
              product: true,
              videoConsultation: true
            }
          }
        }
      })
    }

    // Calcular totales
    let totalAmount = 0
    const formattedItems = cart.items.map((item: any) => {
      let itemPrice = 0
      let itemName = ''
      let itemType = ''

      if (item.product) {
        itemPrice = item.product.priceCents
        itemName = item.product.name
        itemType = 'product'
      } else if (item.videoConsultation) {
        itemPrice = item.videoConsultation.priceCents
        itemName = `Videoconsulta - ${item.videoConsultation.duration} min`
        itemType = 'consultation'
      }

      const subtotal = itemPrice * item.quantity
      totalAmount += subtotal

      return {
        id: item.id,
        type: itemType,
        name: itemName,
        price: (itemPrice / 100).toFixed(2),
        quantity: item.quantity,
        subtotal: (subtotal / 100).toFixed(2),
        product: item.product,
        videoConsultation: item.videoConsultation
      }
    })

    return NextResponse.json({
      cart: {
        id: cart.id,
        items: formattedItems,
        totalItems: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        totalAmount: (totalAmount / 100).toFixed(2)
      }
    })

  } catch (error) {
    console.error('Error al obtener carrito:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Agregar item al carrito
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
    const validatedData = AddCartItemSchema.parse(body)

    // Verificar que el producto o consulta existe
    if (validatedData.productId) {
      const product = await prisma.products.findUnique({
        where: { id: validatedData.productId }
      })
      if (!product) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 }
        )
      }
    }

    if (validatedData.consultationId) {
      const consultation = await prisma.video_consultations.findUnique({
        where: { id: validatedData.consultationId }
      })
      if (!consultation) {
        return NextResponse.json(
          { error: 'Videoconsulta no encontrada' },
          { status: 404 }
        )
      }
    }

    // Buscar o crear carrito del usuario
    let cart = await prisma.carts.findUnique({
      where: { userId: session.user.id }
    })

    if (!cart) {
      cart = await prisma.carts.create({
        data: { userId: session.user.id }
      })
    }

    // Verificar si el item ya existe en el carrito
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: validatedData.productId || null,
        videoConsultationId: validatedData.consultationId || null
      }
    })

    let cartItem
    if (existingItem) {
      // Actualizar cantidad del item existente
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + validatedData.quantity },
        include: {
          product: true,
          videoConsultation: true
        }
      })
    } else {
      // Crear nuevo item en el carrito
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: validatedData.productId || null,
          videoConsultationId: validatedData.consultationId || null,
          quantity: validatedData.quantity
        },
        include: {
          product: true,
          videoConsultation: true
        }
      })
    }

    return NextResponse.json({
      message: 'Item agregado al carrito exitosamente',
      cartItem: {
        id: cartItem.id,
        type: cartItem.product ? 'product' : 'consultation',
        name: cartItem.product?.name || `Videoconsulta - ${cartItem.videoConsultation?.duration} min`,
        quantity: cartItem.quantity,
        product: cartItem.product,
        videoConsultation: cartItem.videoConsultation
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al agregar item al carrito:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Vaciar carrito completo
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const cart = await prisma.carts.findUnique({
      where: { userId: session.user.id }
    })

    if (!cart) {
      return NextResponse.json(
        { error: 'Carrito no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar todos los items del carrito
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })

    return NextResponse.json({
      message: 'Carrito vaciado exitosamente'
    })

  } catch (error) {
    console.error('Error al vaciar carrito:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}