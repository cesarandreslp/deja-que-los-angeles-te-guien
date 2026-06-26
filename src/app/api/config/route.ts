import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/config - Obtener configuración actual de la aplicación
export async function GET() {
  try {
    // Obtener la configuración actual (solo debe haber una)
    let appConfig = await prisma.app_configs.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    // Si no existe configuración, crear una por defecto
    if (!appConfig) {
      console.log('🎨 No se encontró configuración, creando configuración por defecto...')
      
      appConfig = await prisma.app_configs.create({
        data: {
          theme: 'CELESTIAL', // Tema por defecto del nuevo sistema
          appName: 'Deja que los ángeles te guíen',
          staticTexts: {
            homeTitle: 'Descubre tu Camino Angelical',
            homeSubtitle: 'Un espacio sagrado donde la guía angelical ilumina tu sendero hacia la paz y la sabiduría.',
            footerText: '© 2025 Deja que los ángeles te guíen. Todos los derechos reservados.',
            aboutTitle: 'Sobre Nosotros',
            aboutDescription: 'Conectamos almas con la sabiduría divina angelical para guiar tu camino espiritual.',
            contactTitle: 'Contacto',
            contactDescription: 'Estamos aquí para ayudarte en tu viaje espiritual.'
          }
        }
      })
      
      console.log('✅ Configuración por defecto creada')
    }

    console.log('🎨 Enviando configuración:', {
      id: appConfig.id,
      theme: appConfig.theme,
      appName: appConfig.appName,
      hasLogo: !!appConfig.logoUrl
    })

    return NextResponse.json({
      success: true,
      config: {
        id: appConfig.id,
        theme: appConfig.theme,
        primaryColor: appConfig.primaryColor,
        appName: appConfig.appName,  
        logoUrl: appConfig.logoUrl,
        staticTexts: appConfig.staticTexts,
        createdAt: appConfig.createdAt,
        updatedAt: appConfig.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}

// POST /api/config - Actualizar configuración (solo admin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar autenticación
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No autorizado' 
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Acceso denegado. Solo administradores pueden modificar la configuración.' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { theme, primaryColor, appName, logoUrl, staticTexts } = body

    console.log('🎨 Actualizando configuración:', {
      theme,
      primaryColor,
      appName,
      hasLogo: !!logoUrl,
      staticTextsKeys: staticTexts ? Object.keys(staticTexts) : []
    })

    // Validar temas permitidos
    const validThemes = [
      'CELESTIAL',
      'AURORA', 
      'ARCANGELES',
      'MINIMAL',
      'LUZ_DIVINA',
      'SABIDURIA_DORADA',
      'ESENCIA_AZUL'
    ]
    
    if (theme && !validThemes.includes(theme)) {
      return NextResponse.json(
        { 
          success: false,
          error: `Tema no válido. Temas disponibles: ${validThemes.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Validar color primario si el tema es CUSTOM
    if (theme === 'CUSTOM' && (!primaryColor || !primaryColor.match(/^#[0-9A-Fa-f]{6}$/))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Color primario requerido y debe ser un código hex válido (ej: #FF5733)' 
        },
        { status: 400 }
      )
    }

    // Obtener configuración actual
    let appConfig = await prisma.app_configs.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    const updateData: any = {}
    
    if (theme !== undefined) updateData.theme = theme
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor
    if (appName !== undefined) updateData.appName = appName
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (staticTexts !== undefined) updateData.staticTexts = staticTexts

    if (appConfig) {
      // Actualizar configuración existente
      appConfig = await prisma.app_configs.update({
        where: { id: appConfig.id },
        data: updateData
      })
      
      console.log('✅ Configuración actualizada')
    } else {
      // Crear nueva configuración si no existe
      appConfig = await prisma.app_configs.create({
        data: {
          theme: 'ORACULO', // Forzar tema original
          primaryColor: '#8B5FBF', // Color fijo del tema original
          appName: appName || 'Oráculo de los Arcángeles',
          logoUrl: logoUrl,
          staticTexts: staticTexts || {}
        }
      })
      
      console.log('✅ Nueva configuración creada')
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      config: {
        id: appConfig.id,
        theme: appConfig.theme,
        primaryColor: appConfig.primaryColor,
        appName: appConfig.appName,
        logoUrl: appConfig.logoUrl,
        staticTexts: appConfig.staticTexts,
        updatedAt: appConfig.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Error actualizando configuración:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}