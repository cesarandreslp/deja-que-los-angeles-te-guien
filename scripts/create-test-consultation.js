const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestConsultation() {
  try {
    console.log('🧪 Creando consulta de prueba...')

    // Buscar usuarios existentes
    const testUser = await prisma.user.findUnique({
      where: { email: 'user.test@oraculo.com' }
    })

    const testConsultant = await prisma.user.findUnique({
      where: { email: 'consultor.test@oraculo.com' }
    })

    if (!testUser || !testConsultant) {
      console.log('❌ Usuarios de prueba no encontrados')
      return
    }

    // Crear consulta de prueba
    const testConsultation = await prisma.videoConsultation.create({
      data: {
        userId: testUser.id,
        consultorId: testConsultant.id,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        duration: 60,
        price: 5000, // 50,000 COP en centavos
        status: 'PAID',
        meetingLink: 'https://meet.jit.si/test-room-123',
        notes: 'Consulta de prueba para testing'
      }
    })

    console.log('✅ Consulta de prueba creada:', testConsultation.id)

  } catch (error) {
    console.error('❌ Error creando consulta de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestConsultation()