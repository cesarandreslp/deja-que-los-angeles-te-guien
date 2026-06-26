const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateLogoToLocal() {
  try {
    console.log('🖼️ Configurando logo local...')
    
    // Buscar la configuración actual
    let config = await prisma.appConfig.findFirst()
    
    if (!config) {
      console.log('❌ No se encontró configuración existente')
      console.log('📝 Creando configuración con logo local...')
      
      config = await prisma.appConfig.create({
        data: {
          appName: 'Oráculo de los Arcángeles',
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
      console.log('📝 Actualizando configuración existente...')
      
      config = await prisma.appConfig.update({
        where: { id: config.id },
        data: {
          logoUrl: '/icons/logo.png'
        }
      })
    }
    
    console.log('✅ Logo configurado correctamente!')
    console.log(`🖼️ URL del logo: ${config.logoUrl}`)
    console.log(`🏢 Nombre de la app: ${config.appName}`)
    console.log(`🎨 Tema actual: ${config.theme}`)
    
    console.log('\n📌 El logo ahora aparecerá en:')
    console.log('- Navbar de toda la aplicación')
    console.log('- Usando la imagen local: /icons/logo.png')
    console.log('- Sin necesidad de URLs externas')
    
    console.log('\n🔍 Para verificar, visita:')
    console.log('- http://localhost:3004/ (página principal)')
    console.log('- http://localhost:3004/admin/configuracion/personalizacion (panel de configuración)')
    
  } catch (error) {
    console.error('❌ Error configurando logo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateLogoToLocal()