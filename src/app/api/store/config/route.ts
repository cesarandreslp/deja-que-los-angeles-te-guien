// Store Configuration API - Configuración de la tienda angelical
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, cacheKeys, cacheTTL } from '@/lib/cache'

// GET - Obtener configuración actual de la tienda (con caché de 15 minutos)
export async function GET() {
  try {
    // Usar caché para la configuración (15 minutos - casi nunca cambia)
    const config = await cache.getOrSet(
      cacheKeys.storeConfig(),
      async () => {
        // Buscar la configuración existente
        let config = await prisma.storeConfig.findFirst()

        // Si no existe, crear una con valores por defecto
        if (!config) {
          config = await prisma.storeConfig.create({
            data: {
              taxEnabled: true,
              defaultTaxRate: 0.19, // 19% IVA Colombia
              taxName: 'IVA',
              shippingEnabled: true,
              freeShippingThreshold: 5000000, // 50.000 COP
              standardShippingCents: 500000, // 5.000 COP
              currency: 'COP'
            }
          })
        }
        
        return config;
      },
      cacheTTL.veryLong // 15 minutos
    );

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Error fetching store config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener configuración de la tienda'
      },
      { status: 500 }
    )
  }
}

// PUT - Actualizar configuración de la tienda (solo admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      taxEnabled,
      defaultTaxRate,
      taxName,
      shippingEnabled,
      freeShippingThreshold,
      standardShippingCents
    } = body

    // Validaciones
    if (typeof taxEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'taxEnabled debe ser booleano' },
        { status: 400 }
      )
    }

    if (defaultTaxRate < 0 || defaultTaxRate > 1) {
      return NextResponse.json(
        { success: false, error: 'defaultTaxRate debe estar entre 0 y 1' },
        { status: 400 }
      )
    }

    // Buscar configuración existente
    const existingConfig = await prisma.storeConfig.findFirst()

    let config
    if (existingConfig) {
      // Actualizar existente
      config = await prisma.storeConfig.update({
        where: { id: existingConfig.id },
        data: {
          taxEnabled,
          defaultTaxRate,
          taxName,
          shippingEnabled,
          freeShippingThreshold,
          standardShippingCents
        }
      })
    } else {
      // Crear nueva
      config = await prisma.storeConfig.create({
        data: {
          taxEnabled,
          defaultTaxRate,
          taxName,
          shippingEnabled,
          freeShippingThreshold,
          standardShippingCents,
          currency: 'COP'
        }
      })
    }

    // Invalidar caché después de actualizar
    cache.invalidate(cacheKeys.storeConfig());

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Configuración actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error updating store config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar configuración'
      },
      { status: 500 }
    )
  }
}
