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
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      fromEmail,
      fromName,
      enabled
    } = body

    // Validar datos requeridos si está habilitado
    if (enabled && (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !fromEmail)) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos cuando el servicio está habilitado' },
        { status: 400 }
      )
    }

    // Guardar cada configuración
    const configUpdates = [
      { category: 'EMAIL', key: 'smtpHost', value: smtpHost || '' },
      { category: 'EMAIL', key: 'smtpPort', value: smtpPort?.toString() || '587' },
      { category: 'EMAIL', key: 'smtpUser', value: smtpUser || '' },
      { category: 'EMAIL', key: 'smtpPassword', value: smtpPassword || '' },
      { category: 'EMAIL', key: 'fromEmail', value: fromEmail || '' },
      { category: 'EMAIL', key: 'fromName', value: fromName || 'Oráculo de los Arcángeles' },
      { category: 'EMAIL', key: 'enabled', value: enabled.toString() }
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
      message: 'Configuración de email guardada exitosamente'
    })

  } catch (error) {
    console.error('Error guardando configuración de email:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}