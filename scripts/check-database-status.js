const { PrismaClient } = require('@prisma/client');

async function checkDatabaseStatus() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando estado de la base de datos...\n');
    
    // Verificar usuarios
    const userCount = await prisma.user.count();
    console.log(`👥 Total de usuarios: ${userCount}`);
    
    if (userCount > 0) {
      const usersWithMentor = await prisma.user.count({
        where: {
          mentorArcangel: {
            not: null
          }
        }
      });
      console.log(`🔮 Usuarios con arcángel mentor asignado: ${usersWithMentor}`);
      
      // Mostrar algunos usuarios de ejemplo
      const sampleUsers = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          fullName: true,
          mentorArcangel: true,
          dateOfBirth: true,
          createdAt: true
        }
      });
      
      console.log('\n📋 Muestra de usuarios:');
      sampleUsers.forEach(user => {
        console.log(`  - ${user.fullName || 'Sin nombre'} (${user.email})`);
        console.log(`    Arcángel: ${user.mentorArcangel || 'No asignado'}`);
        console.log(`    Fecha nacimiento: ${user.dateOfBirth || 'No establecida'}`);
        console.log('');
      });
    }
    
    // Verificar consultores (usuarios con rol CONSULTANT)
    const consultantCount = await prisma.user.count({
      where: { role: 'CONSULTANT' }
    });
    console.log(`👨‍💼 Total de consultores: ${consultantCount}`);
    
    // Verificar cartas del oráculo
    const cardCount = await prisma.card.count();
    console.log(`🃏 Total de cartas del oráculo: ${cardCount}`);
    
    // Verificar consultas de mentor
    const mentorConsultationCount = await prisma.mentorConsultation.count();
    console.log(`🔮 Total de consultas de mentor: ${mentorConsultationCount}`);
    
    // Verificar lecturas del oráculo
    const readingCount = await prisma.reading.count();
    console.log(`📅 Total de lecturas del oráculo: ${readingCount}`);
    
    // Verificar membresías
    const membershipCount = await prisma.membership.count();
    console.log(`💎 Total de membresías: ${membershipCount}`);
    
    // Verificar productos de la tienda
    const productCount = await prisma.product.count();
    console.log(`🛍️ Total de productos en tienda: ${productCount}`);
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus();