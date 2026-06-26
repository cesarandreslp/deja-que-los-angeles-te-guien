import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      provider,
      apiKey,
      model,
      enabled,
      maxTokens,
      temperature
    } = body

    // Validar datos requeridos si está habilitado
    if (enabled && (!provider || !apiKey || !model)) {
      return NextResponse.json(
        { error: 'Proveedor, API Key y modelo son requeridos cuando el servicio está habilitado' },
        { status: 400 }
      )
    }

    // Validar rangos
    if (maxTokens && (maxTokens < 1 || maxTokens > 8000)) {
      return NextResponse.json(
        { error: 'El máximo de tokens debe estar entre 1 y 8000' },
        { status: 400 }
      )
    }

    if (temperature && (temperature < 0 || temperature > 1)) {
      return NextResponse.json(
        { error: 'La temperatura debe estar entre 0 y 1' },
        { status: 400 }
      )
    }

    // Guardar cada configuración
    const configUpdates = [
      { category: 'AI', key: 'provider', value: provider || 'openai' },
      { category: 'AI', key: 'apiKey', value: apiKey || '' },
      { category: 'AI', key: 'model', value: model || 'gpt-4' },
      { category: 'AI', key: 'enabled', value: enabled.toString() },
      { category: 'AI', key: 'maxTokens', value: (maxTokens || 2000).toString() },
      { category: 'AI', key: 'temperature', value: (temperature || 0.7).toString() }
    ]

    // Usar upsert para crear o actualizar cada configuración
    for (const config of configUpdates) {
      await prisma.system_configs.upsert({
        where: {
          category_key: {
            category: config.category,
            key: config.key
          }
        },
        update: {
          value: config.value,
          updatedAt: new Date()
        },
        create: {
          category: config.category,
          key: config.key,
          value: config.value
        }
      })
    }

    return NextResponse.json({
      message: 'Configuración de IA guardada exitosamente'
    })

  } catch (error) {
    console.error('Error guardando configuración de IA:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}