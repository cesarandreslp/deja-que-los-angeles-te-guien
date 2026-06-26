const { PrismaClient } = require('@prisma/client');

async function checkOraculoStructure() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando estructura del Oráculo...\n');
    
    // Contar Arcángeles
    const arcangeles = await prisma.archangel.findMany({
      select: { 
        id: true, 
        name: true,
        _count: {
          select: { cards: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`📊 Total Arcángeles: ${arcangeles.length}`);
    console.log('📋 Distribución de cartas por Arcángel:');
    
    let totalCards = 0;
    arcangeles.forEach(arc => {
      console.log(`   - ${arc.name}: ${arc._count.cards} cartas`);
      totalCards += arc._count.cards;
    });
    
    console.log(`\n📊 Total de cartas: ${totalCards}`);
    
    // Verificar si es exactamente 15 arcángeles con 3 cartas cada uno
    const perfectStructure = arcangeles.length === 15 && 
                             arcangeles.every(arc => arc._count.cards === 3);
    
    if (perfectStructure) {
      console.log('\n✅ ESTRUCTURA PERFECTA: 15 arcángeles × 3 cartas = 45 cartas');
    } else {
      console.log('\n⚠️  ESTRUCTURA IRREGULAR:');
      if (arcangeles.length !== 15) {
        console.log(`   - Esperado: 15 arcángeles, Actual: ${arcangeles.length}`);
      }
      
      const irregular = arcangeles.filter(arc => arc._count.cards !== 3);
      if (irregular.length > 0) {
        console.log('   - Arcángeles con cantidad irregular de cartas:');
        irregular.forEach(arc => {
          console.log(`     * ${arc.name}: ${arc._count.cards} cartas (esperado: 3)`);
        });
      }
    }
    
    // Verificar cartas huérfanas
    const totalCardsDB = await prisma.card.count();
    if (totalCardsDB !== totalCards) {
      console.log(`\n⚠️  INCONSISTENCIA: Cartas contadas ${totalCards} vs DB ${totalCardsDB}`);
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkOraculoStructure();