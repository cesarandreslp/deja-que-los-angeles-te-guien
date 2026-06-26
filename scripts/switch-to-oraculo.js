const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function switchToOraculoTheme() {
  try {
    console.log('🔮 Cambiando al tema ORACULO...')
    
    // Buscar la configuración actual
    let config = await prisma.appConfig.findFirst()
    
    if (!config) {
      console.log('❌ No se encontró configuración existente')
      console.log('📝 Creando configuración con tema ORACULO...')
      
      config = await prisma.appConfig.create({
        data: {
          appName: 'Deja que los Arcángeles te Guíen',
          theme: 'ORACULO',
          primaryColor: '#8B5FBF',
          logoUrl: '/icons/logo.png',
          staticTexts: {
            welcome_title: 'Bienvenido al Oráculo de los Arcángeles',
            welcome_subtitle: 'Encuentra la guía espiritual que necesitas',
            nav_home: 'Nosotros',
            nav_consultas: 'Consultas',
            nav_tienda: 'Tienda',
            nav_membresias: 'Membresías',
            nav_contacto: 'Contacto',
            nav_login: 'Iniciar Sesión',
            nav_register: 'Registrarse'
          }
        }
      })
    } else {
      console.log('📝 Actualizando tema a ORACULO...')
      
      config = await prisma.appConfig.update({
        where: { id: config.id },
        data: {
          theme: 'ORACULO'
        }
      })
    }
    
    console.log('✅ Tema ORACULO activado!')
    console.log(`🎨 Tema actual: ${config.theme}`)
    console.log(`🖼️ Logo: ${config.logoUrl}`)
    console.log(`🏢 Nombre de la app: ${config.appName}`)
    
    console.log('\n🌈 Características del tema ORACULO:')
    console.log('- 🎨 Gradientes púrpura-azul originales')
    console.log('- ✨ Efectos mágicos y resplandor')
    console.log('- 🔮 Perfecto contraste para texto')
    console.log('- 🌟 Tema original de la aplicación')
    
    console.log('\n🔍 Para ver los cambios:')
    console.log('- http://localhost:3004/ (página principal)')
    console.log('- http://localhost:3004/admin/configuracion/personalizacion (panel)')
    console.log('- Actualiza la página para ver el nuevo tema')
    
  } catch (error) {
    console.error('❌ Error cambiando tema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

switchToOraculoTheme()