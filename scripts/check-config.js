const { PrismaClient } = require('@prisma/client');

async function checkConfigIssues() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando configuración actual...');
    
    // Get current config
    const config = await prisma.appConfig.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (config) {
      console.log('✅ Configuración encontrada:', {
        id: config.id,
        theme: config.theme,
        appName: config.appName,
        hasLogo: !!config.logoUrl,
        staticTexts: typeof config.staticTexts === 'object' ? Object.keys(config.staticTexts) : 'none'
      });
      
      // Check if theme is valid
      const validThemes = ['ORACULO', 'LIGHT', 'DARK', 'CELESTIAL', 'AURORA', 'ARCANGELES', 'MINIMAL', 'CUSTOM'];
      if (!validThemes.includes(config.theme)) {
        console.log('❌ Tema inválido detectado:', config.theme);
        console.log('🔧 Actualizando a tema ORACULO...');
        
        await prisma.appConfig.update({
          where: { id: config.id },
          data: { theme: 'ORACULO' }
        });
        
        console.log('✅ Tema actualizado a ORACULO');
      } else {
        console.log('✅ Tema válido:', config.theme);
      }
    } else {
      console.log('❌ No se encontró configuración, creando por defecto...');
      
      const newConfig = await prisma.appConfig.create({
        data: {
          theme: 'ORACULO',
          appName: 'Oráculo de los Arcángeles',
          logoUrl: '/images/oraculo-logo.png',
          staticTexts: {
            heroTitle: 'Conecta con los Arcángeles',
            heroSubtitle: 'Encuentra respuestas y guía espiritual a través de consultas personalizadas',
            navHome: 'Inicio',
            navConsult: 'Consultar',
            navStore: 'Tienda',
            navAbout: 'Nosotros',
            navContact: 'Contacto'
          }
        }
      });
      
      console.log('✅ Configuración por defecto creada:', {
        id: newConfig.id,
        theme: newConfig.theme,
        appName: newConfig.appName
      });
    }
    
    // Check admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@oraculo.com' }
    });
    
    console.log('\n👤 Usuario admin:', admin ? {
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      hasPassword: !!admin.passwordHash
    } : 'NO ENCONTRADO');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfigIssues();