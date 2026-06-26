// Script para crear configuración por defecto del sistema
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDefaultConfig() {
  try {
    console.log('🎨 Creando configuración por defecto...')
    
    // Verificar si ya existe una configuración
    const existingConfig = await prisma.appConfig.findFirst()
    
    if (existingConfig) {
      console.log('✅ Ya existe una configuración. Saltando...')
      console.log('Configuración actual:', {
        theme: existingConfig.theme,
        appName: existingConfig.appName,
        primaryColor: existingConfig.primaryColor
      })
      return
    }
    
    // Crear configuración por defecto
    const config = await prisma.appConfig.create({
      data: {
        theme: 'CELESTIAL',
        primaryColor: '#3B82F6',
        appName: 'Oráculo de los Arcángeles',
        logoUrl: null,
        staticTexts: {
          // Textos principales
          welcome: '¡Bienvenido al Oráculo de los Arcángeles!',
          subtitle: 'Un espacio sagrado donde la sabiduría de los arcángeles te guía hacia la claridad y el propósito.',
          footer: `© ${new Date().getFullYear()} Oráculo de los Arcángeles. Todos los derechos reservados.`,
          footer_description: 'Tu guía espiritual hacia la sabiduría angelical y el crecimiento personal.',
          
          // Textos de navegación
          nav_home: 'Nosotros',
          nav_consultas: 'Consultas',
          nav_tienda: 'Tienda',
          nav_membresias: 'Membresías',
          nav_contacto: 'Contacto',
          nav_login: 'Iniciar Sesión',
          nav_register: 'Registrarse',
          
          // Textos de características
          feature1_title: 'Lecturas de Oráculo',
          feature1_desc: 'Consulta las cartas sagradas para obtener respuestas y guía espiritual.',
          feature2_title: 'Consultas Personalizadas',
          feature2_desc: 'Sesiones privadas con consultores expertos en espiritualidad.',
          feature3_title: 'Tienda Espiritual',
          feature3_desc: 'Cristales, velas, inciensos y productos para tu crecimiento espiritual.',
          
          // Textos de botones
          cta_register: 'Comenzar mi Viaje Espiritual',
          cta_login: 'Ya tengo cuenta',
          
          // Textos adicionales para home
          homeTitle: 'Descubre tu Destino',
          homeSubtitle: 'Un espacio sagrado donde la sabiduría de los arcángeles te guía hacia la claridad y el propósito.',
          aboutTitle: 'Sobre Nosotros',
          aboutDescription: 'Conectamos almas con la sabiduría divina de los arcángeles para guiar tu camino espiritual.',
          contactTitle: 'Contacto',
          contactDescription: 'Estamos aquí para ayudarte en tu viaje espiritual.'
        }
      }
    })
    
    console.log('🎉 Configuración por defecto creada exitosamente!')
    console.log('Configuración:', {
      id: config.id,
      theme: config.theme,
      appName: config.appName,
      primaryColor: config.primaryColor,
      textos: Object.keys(config.staticTexts).length + ' textos estáticos'
    })
    
  } catch (error) {
    console.error('❌ Error creando configuración por defecto:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
createDefaultConfig()