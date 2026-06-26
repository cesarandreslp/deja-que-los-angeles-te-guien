const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetTodayConsultations() {
  try {
    // Obtener fecha de hoy
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    console.log('🗑️ Eliminando consultas del día:', {
      startOfToday: startOfToday.toISOString(),
      endOfToday: endOfToday.toISOString()
    });

    // Eliminar todas las consultas de hoy
    const result = await prisma.mentorConsultation.deleteMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lt: endOfToday
        }
      }
    });

    console.log('✅ Consultas eliminadas:', result.count);
    console.log('🔄 Ahora Estiven puede volver a consultar');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTodayConsultations();