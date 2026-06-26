import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para validar actualización de cantidad
const UpdateQuantitySchema = z.object({
  quantity: z.number().min(0)
})

// PUT /api/cart/[itemId] - Actualizar cantidad de un item
export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { quantity } = UpdateQuantitySchema.parse(body)

    // Verificar que el item pertenece al usuario
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.itemId,
        cart: {
          userId: session.user.id
        }
      },
      include: {
        product: true,
        videoConsultation: true
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Item no encontrado en el carrito' },
        { status: 404 }
      )
    }

    // Si cantidad es 0, eliminar el item
    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: params.itemId }
      })

      return NextResponse.json({
        message: 'Item eliminado del carrito'
      })
    }

    // Actualizar cantidad
    const updatedItem = await prisma.cartItem.update({
      where: { id: params.itemId },
      data: { quantity },
      include: {
        product: true,
        videoConsultation: true
      }
    })

    return NextResponse.json({
      message: 'Cantidad actualizada exitosamente',
      cartItem: {
        id: updatedItem.id,
        type: updatedItem.product ? 'product' : 'consultation',
        name: updatedItem.product?.name || `Videoconsulta - ${updatedItem.videoConsultation?.duration} min`,
        quantity: updatedItem.quantity,
        product: updatedItem.product,
        videoConsultation: updatedItem.videoConsultation
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar item del carrito:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/[itemId] - Eliminar un item del carrito
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el item pertenece al usuario
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.itemId,
        cart: {
          userId: session.user.id
        }
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Item no encontrado en el carrito' },
        { status: 404 }
      )
    }

    // Eliminar el item
    await prisma.cartItem.delete({
      where: { id: params.itemId }
    })

    return NextResponse.json({
      message: 'Item eliminado del carrito exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar item del carrito:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}