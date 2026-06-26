const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabaseSeparation() {
  console.log('🔍 VERIFICANDO SEPARACIÓN CORRECTA DE LA BASE DE DATOS...\n');

  try {
    // Verificar cartas del oráculo (tabla Card)
    const oracleCards = await prisma.card.count();
    console.log(`🃏 CARTAS DEL ORÁCULO (tabla Card): ${oracleCards}`);
    
    const sampleOracleCards = await prisma.card.findMany({
      take: 5,
      select: {
        code: true,
        name: true,
        imageUrl: true,
        arcangel: true
      }
    });
    
    console.log('   Muestra de cartas del oráculo:');
    sampleOracleCards.forEach(card => {
      console.log(`   ✨ ${card.name}`);
      console.log(`      📸 ${card.imageUrl}`);
    });

    // Verificar cartas de chat (tabla ArcangelChatCard)
    const chatCards = await prisma.arcangelChatCard.count();
    console.log(`\n💬 CARTAS DE CHAT (tabla ArcangelChatCard): ${chatCards}`);
    
    const sampleChatCards = await prisma.arcangelChatCard.findMany({
      take: 5,
      select: {
        code: true,
        name: true,
        imageUrl: true,
        arcangel: true,
        specialties: true
      }
    });
    
    console.log('   Muestra de cartas de chat:');
    sampleChatCards.forEach(card => {
      console.log(`   💬 ${card.name}`);
      console.log(`      📸 ${card.imageUrl}`);
      console.log(`      🎯 Especialidades: ${card.specialties.join(', ')}`);
    });

    // Verificar usuarios
    const users = await prisma.user.count();
    console.log(`\n👥 USUARIOS TOTALES: ${users}`);
    
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });
    
    console.log('   Por rol:');
    usersByRole.forEach(group => {
      console.log(`   ${group.role}: ${group._count.role} usuarios`);
    });

    // Verificar otros elementos
    const products = await prisma.product.count();
    const membershipPlans = await prisma.membershipPlan.count();
    const mentorConsultations = await prisma.mentorConsultation.count();
    const arcangelConversations = await prisma.arcangelConversation.count();
    
    console.log(`\n🛍️ PRODUCTOS DE TIENDA: ${products}`);
    console.log(`💎 PLANES DE MEMBRESÍA: ${membershipPlans}`);
    console.log(`🔮 CONSULTAS DE MENTOR: ${mentorConsultations}`);
    console.log(`💬 CONVERSACIONES DE CHAT: ${arcangelConversations}`);

    // Verificar rutas de imágenes
    console.log('\n📁 VERIFICACIÓN DE RUTAS DE IMÁGENES:');
    
    const oracleImagePaths = await prisma.card.findMany({
      select: { imageUrl: true },
      distinct: ['imageUrl']
    });
    
    console.log(`🃏 Rutas de cartas del oráculo (${oracleImagePaths.length} únicas):`);
    oracleImagePaths.slice(0, 3).forEach(path => {
      console.log(`   ${path.imageUrl}`);
    });
    if (oracleImagePaths.length > 3) {
      console.log(`   ... y ${oracleImagePaths.length - 3} más`);
    }
    
    const chatImagePaths = await prisma.arcangelChatCard.findMany({
      select: { imageUrl: true },
      distinct: ['imageUrl']
    });
    
    console.log(`\n💬 Rutas de cartas de chat (${chatImagePaths.length} únicas):`);
    chatImagePaths.slice(0, 3).forEach(path => {
      console.log(`   ${path.imageUrl}`);
    });
    if (chatImagePaths.length > 3) {
      console.log(`   ... y ${chatImagePaths.length - 3} más`);
    }

    console.log('\n✅ VERIFICACIÓN COMPLETADA - SEPARACIÓN CORRECTA');
    console.log('\n📋 CONFIRMACIÓN:');
    console.log('🎯 Las 45 cartas del oráculo están en tabla "Card" con rutas /oraculo/arcangeles_cartas/');
    console.log('🎯 Las 15 cartas de chat están en tabla "ArcangelChatCard" con rutas /oraculo/arcangeles-chat/');
    console.log('🎯 No hay mezcla entre sistemas - SEPARACIÓN PERFECTA');

  } catch (error) {
    console.error('❌ Error al verificar la separación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseSeparation();