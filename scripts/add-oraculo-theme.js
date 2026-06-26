const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addOraculoTheme() {
  try {
    console.log('🔮 Agregando tema ORACULO como opción disponible...')
    
    // Verificar si ya existe una configuración
    let config = await prisma.appConfig.findFirst()
    
    if (!config) {
      console.log('📝 Creando configuración inicial con tema ORACULO...')
      config = await prisma.appConfig.create({
        data: {
          appName: 'Oráculo de los Arcángeles',
          theme: 'ORACULO',
          primaryColor: '#8B5FBF',
          logoUrl: '',
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
      console.log('✅ Configuración creada con tema ORACULO')
    } else {
      console.log('ℹ️ La configuración ya existe')
      console.log(`📄 Tema actual: ${config.theme}`)
      console.log(`🎨 Color primario: ${config.primaryColor}`)
      console.log(`🏢 Nombre de la app: ${config.appName}`)
    }
    
    console.log('\n🎨 Temas disponibles:')
    console.log('- ORACULO: Tema original púrpura-azul con gradientes')
    console.log('- LIGHT: Fondo blanco con texto negro')
    console.log('- DARK: Fondo oscuro con texto claro')  
    console.log('- CELESTIAL: Azul profundo con acentos dorados')
    console.log('- AURORA: Gradientes verdes y morados')
    console.log('- ARCANGELES: Tonos pastel angelicales')
    console.log('- MINIMAL: Diseño limpio y minimalista')
    console.log('- CUSTOM: Color primario personalizable')
    
    console.log('\n✨ El tema ORACULO está listo para usar desde el panel de administración!')
    
  } catch (error) {
    console.error('❌ Error al configurar tema ORACULO:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addOraculoTheme()