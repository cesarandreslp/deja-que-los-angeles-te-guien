import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTodayReading() {
  try {
    // Obtener fecha de hoy (solo fecha, sin hora)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    console.log('🗑️ Eliminando lecturas del oráculo de hoy...');
    console.log('📅 Rango:', startOfDay.toISOString(), 'a', endOfDay.toISOString());

    // Primero ver qué lecturas hay
    const allReadings = await prisma.reading.findMany({
      select: {
        id: true,
        createdAt: true,
        question: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log('📋 Últimas 10 lecturas en la BD:');
    allReadings.forEach(r => {
      console.log(`  - ${r.id.substring(0, 8)}... | ${r.createdAt.toISOString()} | ${r.question}`);
    });

    const deleted = await prisma.reading.deleteMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    console.log('✅ Eliminadas', deleted.count, 'lecturas');
    
  } catch (error) {
    console.error('❌ Error al eliminar lecturas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTodayReading();
