/**
 * Script para crear usuarios de prueba para el sistema de videoconsultas
 * 
 * Usuarios a crear:
 * 1. Admin: admin@ossinnovation.com (ADMIN)
 * 2. Consultor: cesarandres.lopu@gmail.com (CONSULTANT)
 * 3. Usuario: usuario@test.com (USER)
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciando configuración de usuarios de prueba...\n')

  // Password por defecto (puedes cambiarla)
  const defaultPassword = 'Test123456!'
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  try {
    // 1. CREAR ADMINISTRADOR
    console.log('📋 1. Creando/actualizando Administrador...')
    const admin = await prisma.user.upsert({
      where: { email: 'admin@ossinnovation.com' },
      update: {
        role: 'ADMIN',
        isActive: true,
        fullName: 'Administrador Sistema'
      },
      create: {
        email: 'admin@ossinnovation.com',
        passwordHash: hashedPassword,
        fullName: 'Administrador Sistema',
        role: 'ADMIN',
        isActive: true,
        country: 'CO',
        gender: 'OTHER',
        profileImage: '/avatars/admin.png'
      }
    })
    console.log('✅ Admin creado:', admin.email, '- ID:', admin.id)

    // 2. CREAR CONSULTOR
    console.log('\n📋 2. Creando/actualizando Consultor...')
    const consultant = await prisma.user.upsert({
      where: { email: 'cesarandres.lopu@gmail.com' },
      update: {
        role: 'CONSULTANT',
        isActive: true,
        fullName: 'César Andrés López',
        specialty: 'Guía Espiritual y Tarot',
        hourlyRate: 6000000, // $60.000 COP por hora (en centavos)
        bio: 'Consultor espiritual con más de 10 años de experiencia en lectura de tarot, guía angelical y sanación energética. Especializado en orientación de vida, relaciones y propósito espiritual.',
        consultantRating: 4.8,
        isAvailableForConsultations: true,
        totalConsultationsCompleted: 150
      },
      create: {
        email: 'cesarandres.lopu@gmail.com',
        passwordHash: hashedPassword,
        fullName: 'César Andrés López',
        role: 'CONSULTANT',
        isActive: true,
        country: 'CO',
        gender: 'MALE',
        profileImage: '/avatars/consultant.png',
        // Campos específicos del consultor
        specialty: 'Guía Espiritual y Tarot',
        hourlyRate: 6000000, // $60.000 COP por hora (en centavos)
        bio: 'Consultor espiritual con más de 10 años de experiencia en lectura de tarot, guía angelical y sanación energética. Especializado en orientación de vida, relaciones y propósito espiritual.',
        consultantRating: 4.8,
        isAvailableForConsultations: true,
        totalConsultationsCompleted: 150
      }
    })
    console.log('✅ Consultor creado:', consultant.email, '- ID:', consultant.id)

    // 3. CREAR DISPONIBILIDAD DEL CONSULTOR
    console.log('\n📋 3. Configurando disponibilidad del consultor...')
    
    // Lunes a Viernes: 9:00 AM - 6:00 PM
    const weekdayAvailability = [1, 2, 3, 4, 5] // Lunes a Viernes
    for (const day of weekdayAvailability) {
      await prisma.consultantAvailability.upsert({
        where: {
          consultantId_dayOfWeek_startTime: {
            consultantId: consultant.id,
            dayOfWeek: day,
            startTime: '09:00'
          }
        },
        update: {
          endTime: '18:00',
          isActive: true
        },
        create: {
          consultantId: consultant.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          isActive: true
        }
      })
    }

    // Sábado: 9:00 AM - 2:00 PM
    await prisma.consultantAvailability.upsert({
      where: {
        consultantId_dayOfWeek_startTime: {
          consultantId: consultant.id,
          dayOfWeek: 6,
          startTime: '09:00'
        }
      },
      update: {
        endTime: '14:00',
        isActive: true
      },
      create: {
        consultantId: consultant.id,
        dayOfWeek: 6, // Sábado
        startTime: '09:00',
        endTime: '14:00',
        isActive: true
      }
    })
    
    console.log('✅ Disponibilidad configurada: Lun-Vie 9:00-18:00, Sáb 9:00-14:00')

    // 4. CREAR USUARIO DE PRUEBA
    console.log('\n📋 4. Creando/actualizando Usuario de prueba...')
    const user = await prisma.user.upsert({
      where: { email: 'usuario@test.com' },
      update: {
        role: 'USER',
        isActive: true,
        fullName: 'Usuario de Prueba'
      },
      create: {
        email: 'usuario@test.com',
        passwordHash: hashedPassword,
        fullName: 'Usuario de Prueba',
        role: 'USER',
        isActive: true,
        country: 'CO',
        gender: 'MALE',
        profileImage: '/avatars/user.png'
      }
    })
    console.log('✅ Usuario creado:', user.email, '- ID:', user.id)

    // RESUMEN
    console.log('\n' + '='.repeat(60))
    console.log('✅ ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!')
    console.log('='.repeat(60))
    console.log('\n📝 CREDENCIALES DE ACCESO:\n')
    console.log('👑 ADMINISTRADOR:')
    console.log('   Email:    admin@ossinnovation.com')
    console.log('   Password: Test123456!')
    console.log('   Panel:    http://localhost:3000/admin/consultations')
    console.log('\n👨‍🏫 CONSULTOR:')
    console.log('   Email:    cesarandres.lopu@gmail.com')
    console.log('   Password: Test123456!')
    console.log('   Panel:    http://localhost:3000/consultant')
    console.log('   Especialidad: Guía Espiritual y Tarot')
    console.log('   Tarifa: $60.000 COP/hora')
    console.log('   Rating: 4.8 ⭐')
    console.log('   Disponibilidad: Lun-Vie 9:00-18:00, Sáb 9:00-14:00')
    console.log('\n👤 USUARIO:')
    console.log('   Email:    usuario@test.com')
    console.log('   Password: Test123456!')
    console.log('   Panel:    http://localhost:3000/user/consultations')
    console.log('\n🔗 PÁGINAS PRINCIPALES:')
    console.log('   Login:              http://localhost:3000/login')
    console.log('   Ver Consultores:    http://localhost:3000/book-consultation')
    console.log('   Reservar Consulta:  http://localhost:3000/book-consultation')
    console.log('\n💡 PRÓXIMOS PASOS:')
    console.log('   1. Actualiza la contraseña de Zoho Mail en .env.local')
    console.log('   2. Inicia el servidor: npm run dev')
    console.log('   3. Prueba el login con cualquiera de las credenciales')
    console.log('   4. Reserva una consulta como usuario')
    console.log('   5. Gestiona consultas como consultor/admin')
    console.log('\n' + '='.repeat(60))

  } catch (error) {
    console.error('❌ Error durante la configuración:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
