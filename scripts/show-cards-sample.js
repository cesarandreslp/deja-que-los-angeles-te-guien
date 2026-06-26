const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showCardsSample() {
  console.log('🃏 Muestra de cartas del oráculo creadas...\n');

  try {
    // Mostrar algunas cartas de cada arcángel
    const arcangeles = [
      'Ariel', 'Azrael', 'Chamuel', 'Gabriel', 'Haniel', 
      'Jeremiel', 'Jofiel', 'Metatrón', 'Miguel', 'Rafael', 
      'Raguel', 'Raziel', 'Sandalfón', 'Uriel', 'Zadkiel', 'Zadquiel'
    ];

    for (const arcangel of arcangeles) {
      const cards = await prisma.card.findMany({
        where: {
          arcangel: arcangel
        },
        select: {
          code: true,
          name: true,
          shortMsg: true,
          imageUrl: true
        }
      });

      if (cards.length > 0) {
        console.log(`🔮 ARCÁNGEL ${arcangel.toUpperCase()} (${cards.length} cartas):`);
        cards.forEach(card => {
          console.log(`   ✨ ${card.name}`);
          console.log(`      💫 ${card.shortMsg}`);
          console.log(`      📸 ${card.imageUrl}`);
          console.log('');
        });
      }
    }

    // Estadísticas finales
    const totalCards = await prisma.card.count();
    const oracleCards = await prisma.card.count({
      where: {
        code: {
          not: {
            endsWith: '_chat'
          }
        }
      }
    });
    const chatCards = await prisma.card.count({
      where: {
        code: {
          endsWith: '_chat'
        }
      }
    });

    console.log('📊 ESTADÍSTICAS FINALES:');
    console.log(`   🃏 Total de cartas: ${totalCards}`);
    console.log(`   📚 Cartas del oráculo: ${oracleCards}`);
    console.log(`   💬 Cartas de chat: ${chatCards}`);
    
    // Verificar que todas las imágenes están correctamente referenciadas
    const cardsByPath = await prisma.card.groupBy({
      by: ['imageUrl'],
      _count: {
        imageUrl: true
      }
    });

    console.log('\n📁 RUTAS DE IMÁGENES:');
    cardsByPath.forEach(group => {
      console.log(`   ${group.imageUrl} (${group._count.imageUrl} cartas)`);
    });

  } catch (error) {
    console.error('❌ Error al mostrar las cartas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showCardsSample();