const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('🧪 Creando usuarios de prueba para testing...')

    // Crear usuario regular para pruebas
    const testUser = await prisma.user.upsert({
      where: { email: 'user.test@oraculo.com' },
      update: {},
      create: {
        email: 'user.test@oraculo.com',
        fullName: 'Usuario de Prueba',
        passwordHash: await bcrypt.hash('test123', 12),
        role: 'USER',
        isActive: true
      }
    })

    console.log('✅ Usuario de prueba creado:', testUser.email)

    // Crear consultor para pruebas
    const testConsultant = await prisma.user.upsert({
      where: { email: 'consultor.test@oraculo.com' },
      update: {},
      create: {
        email: 'consultor.test@oraculo.com',
        fullName: 'Consultor de Prueba',
        passwordHash: await bcrypt.hash('test123', 12),
        role: 'CONSULTANT',
        isActive: true
      }
    })

    console.log('✅ Consultor de prueba creado:', testConsultant.email)

    // Crear segundo consultor para tener opciones
    const testConsultant2 = await prisma.user.upsert({
      where: { email: 'maria.consultora@oraculo.com' },
      update: {},
      create: {
        email: 'maria.consultora@oraculo.com',
        fullName: 'María González - Especialista en Tarot',
        passwordHash: await bcrypt.hash('test123', 12),
        role: 'CONSULTANT',
        isActive: true
      }
    })

    console.log('✅ Segunda consultora de prueba creada:', testConsultant2.email)

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

    console.log('\n🎯 Usuarios de prueba listos:')
    console.log('👤 Usuario: user.test@oraculo.com / test123')
    console.log('👨‍💼 Consultor 1: consultor.test@oraculo.com / test123')
    console.log('👩‍💼 Consultor 2: maria.consultora@oraculo.com / test123')
    console.log('\n🔗 Consulta de prueba ID:', testConsultation.id)

  } catch (error) {
    console.error('❌ Error creando usuarios de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()