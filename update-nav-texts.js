const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateConfig() {
  try {
    console.log('Ì¥Ñ Actualizando configuraci√≥n con nuevos textos...');
    const config = await prisma.appConfig.findFirst();
    if (config) {
      const updatedTexts = {
        ...config.staticTexts,
        nav_home: 'Nosotros',
        nav_consultas: 'Consultas', 
        nav_tienda: 'Tienda',
        nav_membresias: 'Membres√≠as',
        nav_contacto: 'Contacto',
        nav_login: 'Iniciar Sesi√≥n',
        nav_register: 'Registrarse'
      };
      
      await prisma.appConfig.update({
        where: { id: config.id },
        data: { staticTexts: updatedTexts }
      });
      
      console.log('‚úÖ Configuraci√≥n actualizada con textos de navegaci√≥n');
      console.log('Ì≥ù Textos agregados:', Object.keys(updatedTexts).filter(k => k.startsWith('nav_')));
    } else {
      console.log('‚ùå No se encontr√≥ configuraci√≥n existente');
    }
  } catch (error) {
    console.error('‚ùå Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateConfig();
