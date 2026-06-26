import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para validar actualización de producto
const UpdateProductSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').optional(),
  description: z.string().optional(),
  priceCents: z.number().min(0, 'Precio debe ser positivo').optional(),
  category: z.enum(['CLOTHING', 'JEWELRY', 'ESSENCES', 'OILS', 'RITUALS', 'ACCESSORIES']).optional(),
  imageUrls: z.array(z.string().url('URL de imagen inválida')).optional(),
  stock: z.number().min(0, 'Stock debe ser positivo').optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional()
})

// GET /api/products/[productId] - Obtener producto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await prisma.products.findUnique({
      where: { id: params.productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Formatear producto con precio legible
    const formattedProduct = {
      ...product,
      price: (product.priceCents / 100).toFixed(2),
      priceCents: product.priceCents
    }

    return NextResponse.json({
      product: formattedProduct
    })

  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[productId] - Actualizar producto (solo admins)
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
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
        { error: 'No autorizado para actualizar productos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateProductSchema.parse(body)

    // Verificar que el producto existe
    const existingProduct = await prisma.products.findUnique({
      where: { id: params.productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar producto
    const updatedProduct = await prisma.products.update({
      where: { id: params.productId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    })

    // Formatear producto actualizado
    const formattedProduct = {
      ...updatedProduct,
      price: (updatedProduct.priceCents / 100).toFixed(2),
      priceCents: updatedProduct.priceCents
    }

    return NextResponse.json({
      message: 'Producto actualizado exitosamente',
      product: formattedProduct
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[productId] - Eliminar producto (solo admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
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
        { error: 'No autorizado para eliminar productos' },
        { status: 403 }
      )
    }

    // Verificar que el producto existe
    const existingProduct = await prisma.products.findUnique({
      where: { id: params.productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el producto tiene órdenes asociadas
    const ordersWithProduct = await prisma.order_items.findFirst({
      where: { productId: params.productId }
    })

    if (ordersWithProduct) {
      // Si tiene órdenes, solo marcar como inactivo
      await prisma.products.update({
        where: { id: params.productId },
        data: { 
          isActive: false,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        message: 'Producto desactivado exitosamente (tiene órdenes asociadas)'
      })
    } else {
      // Si no tiene órdenes, eliminar completamente
      await prisma.products.delete({
        where: { id: params.productId }
      })

      return NextResponse.json({
        message: 'Producto eliminado exitosamente'
      })
    }

  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}