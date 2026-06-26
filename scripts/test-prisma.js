const { PrismaClient } = require('@prisma/client');

async function testPrismaConnection() {
  console.log('🔍 Probando conexión con Prisma...');
  
  const prisma = new PrismaClient();
  
  try {
    // Probar conexión básica
    const userCount = await prisma.user.count();
    console.log(`✅ Conexión exitosa - ${userCount} usuarios en la base de datos`);
    
    // Probar consulta de cartas del oráculo
    const oracleCards = await prisma.card.count();
    console.log(`✅ Cartas del oráculo: ${oracleCards}`);
    
    // Probar consulta de cartas de chat
    const chatCards = await prisma.arcangelChatCard.count();
    console.log(`✅ Cartas de chat: ${chatCards}`);
    
    console.log('🎉 Prisma funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error de conexión con Prisma:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();