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
      siteName,
      siteUrl,
      maintenanceMode,
      registrationEnabled,
      emailVerificationRequired,
      passwordResetEnabled,
      maxLoginAttempts,
      sessionTimeout
    } = body

    // Validar datos
    if (!siteName || !siteUrl) {
      return NextResponse.json(
        { error: 'Nombre del sitio y URL son requeridos' },
        { status: 400 }
      )
    }

    if (maxLoginAttempts && (maxLoginAttempts < 1 || maxLoginAttempts > 20)) {
      return NextResponse.json(
        { error: 'El máximo de intentos de login debe estar entre 1 y 20' },
        { status: 400 }
      )
    }

    if (sessionTimeout && (sessionTimeout < 5 || sessionTimeout > 480)) {
      return NextResponse.json(
        { error: 'El timeout de sesión debe estar entre 5 y 480 minutos' },
        { status: 400 }
      )
    }

    // Guardar cada configuración
    const configUpdates = [
      { category: 'APP', key: 'siteName', value: siteName },
      { category: 'APP', key: 'siteUrl', value: siteUrl },
      { category: 'APP', key: 'maintenanceMode', value: maintenanceMode.toString() },
      { category: 'APP', key: 'registrationEnabled', value: registrationEnabled.toString() },
      { category: 'APP', key: 'emailVerificationRequired', value: emailVerificationRequired.toString() },
      { category: 'APP', key: 'passwordResetEnabled', value: passwordResetEnabled.toString() },
      { category: 'APP', key: 'maxLoginAttempts', value: (maxLoginAttempts || 5).toString() },
      { category: 'APP', key: 'sessionTimeout', value: (sessionTimeout || 30).toString() }
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
      message: 'Configuración de la aplicación guardada exitosamente'
    })

  } catch (error) {
    console.error('Error guardando configuración de la aplicación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}