const { PrismaClient } = require('@prisma/client');

async function updateThemeToOraculo() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🎨 Actualizando tema a ORACULO...');
    
    const config = await prisma.appConfig.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (config) {
      const updatedConfig = await prisma.appConfig.update({
        where: { id: config.id },
        data: { 
          theme: 'ORACULO',
          appName: 'Oráculo de los Arcángeles' 
        }
      });
      
      console.log('✅ Configuración actualizada:', {
        id: updatedConfig.id,
        theme: updatedConfig.theme,
        appName: updatedConfig.appName
      });
    } else {
      console.log('❌ No se encontró configuración');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateThemeToOraculo();