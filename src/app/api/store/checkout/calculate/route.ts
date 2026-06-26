// Checkout Calculation API - Calcula totales con impuestos y envío
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { calculateOrderTotals } from '@/utils/taxCalculator'
import { CartItem } from '@/types/store'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body as { items: CartItem[] }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Se requiere al menos un item en el carrito'
        },
        { status: 400 }
      )
    }

    // Obtener configuración de la tienda
    // @ts-expect-error - Prisma client necesita regenerarse después de la migración
    let config = await prisma.storeConfig?.findFirst()

    // Si no existe, usar valores por defecto
    if (!config) {
      // @ts-expect-error - Prisma client necesita regenerarse después de la migración
      config = await prisma.storeConfig?.create({
        data: {
          taxEnabled: true,
          defaultTaxRate: 0.19,
          taxName: 'IVA',
          shippingEnabled: true,
          freeShippingThreshold: 5000000,
          standardShippingCents: 500000,
          currency: 'COP'
        }
      })
    }

    // Obtener información de productos
    const productIds = items.map(item => item.productId)
    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds }
      }
    })

    // Enriquecer items con información de productos
    const enrichedItems: CartItem[] = items.map(item => {
      const product = products.find(p => p.id === item.productId)
      return {
        ...item,
        product: product ? {
          id: product.id,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          currency: product.currency,
          stock: product.stock,
          category: product.category as any,
          imageUrls: product.imageUrls,
          isActive: product.isActive,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString()
        } : undefined,
        priceCents: product?.priceCents || 0
      }
    })

    // Calcular totales
    const calculation = calculateOrderTotals(enrichedItems, {
      taxEnabled: config.taxEnabled,
      defaultTaxRate: config.defaultTaxRate,
      shippingEnabled: config.shippingEnabled,
      freeShippingThreshold: config.freeShippingThreshold,
      standardShippingCents: config.standardShippingCents
    })

    return NextResponse.json({
      success: true,
      data: {
        ...calculation,
        currency: config.currency,
        taxName: config.taxName,
        config: {
          taxEnabled: config.taxEnabled,
          defaultTaxRate: config.defaultTaxRate,
          taxName: config.taxName,
          shippingEnabled: config.shippingEnabled,
          freeShippingThreshold: config.freeShippingThreshold,
          standardShippingCents: config.standardShippingCents
        }
      }
    })
  } catch (error) {
    console.error('Error calculating checkout:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al calcular totales del checkout'
      },
      { status: 500 }
    )
  }
}
