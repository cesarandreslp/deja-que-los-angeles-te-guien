const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createPremiumUsers() {
  try {
    console.log('💎 Creando usuarios premium con membresía activa...')

    // Usuario Premium 1 - Membresía Anual
    const premiumUser1 = await prisma.user.upsert({
      where: { email: 'sofia.premium@oraculo.com' },
      update: {},
      create: {
        email: 'sofia.premium@oraculo.com',
        fullName: 'Sofía Mendoza',
        passwordHash: await bcrypt.hash('premium123', 12),
        role: 'USER',
        isActive: true,
        dateOfBirth: new Date('1985-03-15'), // Miércoles - Gabriel
        mentorArcangel: 'GABRIEL',
        country: 'CO',
        gender: 'FEMALE',
        phone: '+57-300-123-4567'
      }
    })

    // Crear membresía anual para Sofía
    const membership1 = await prisma.membership.upsert({
      where: { userId: premiumUser1.id },
      update: {
        type: 'ANNUAL',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        autoRenewal: true
      },
      create: {
        userId: premiumUser1.id,
        type: 'ANNUAL',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        autoRenewal: true
      }
    })

    console.log('✅ Usuario premium 1 creado:', premiumUser1.email, '- Membresía ANUAL')

    // Usuario Premium 2 - Membresía Mensual
    const premiumUser2 = await prisma.user.upsert({
      where: { email: 'carlos.vip@oraculo.com' },
      update: {},
      create: {
        email: 'carlos.vip@oraculo.com',
        fullName: 'Carlos Eduardo Ramírez',
        passwordHash: await bcrypt.hash('vip123', 12),
        role: 'USER',
        isActive: true,
        dateOfBirth: new Date('1978-07-22'), // Domingo - Miguel
        mentorArcangel: 'MIGUEL',
        country: 'MX',
        gender: 'MALE',
        phone: '+52-55-987-6543'
      }
    })

    // Crear membresía mensual para Carlos
    const membership2 = await prisma.membership.upsert({
      where: { userId: premiumUser2.id },
      update: {
        type: 'MONTHLY',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        autoRenewal: true
      },
      create: {
        userId: premiumUser2.id,
        type: 'MONTHLY',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        autoRenewal: true
      }
    })

    console.log('✅ Usuario premium 2 creado:', premiumUser2.email, '- Membresía MENSUAL')

    console.log('💎 Usuarios premium creados exitosamente!')

    console.log('\n💎 Usuarios premium listos para testing:')
    console.log('👑 Sofía Premium: sofia.premium@oraculo.com / premium123 (ANUAL)')
    console.log('💼 Carlos VIP: carlos.vip@oraculo.com / vip123 (MENSUAL)')
    console.log('\n🎯 Características:')
    console.log('• Membresías activas con renovación automática')
    console.log('• Arcángeles mentores asignados')
    console.log('• Consultas premium incluidas')
    console.log('• Perfiles completos con datos adicionales')

    return {
      premiumUser1,
      premiumUser2,
      membership1,
      membership2,
      premiumConsultation
    }

  } catch (error) {
    console.error('❌ Error creando usuarios premium:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  createPremiumUsers()
}

module.exports = { createPremiumUsers }