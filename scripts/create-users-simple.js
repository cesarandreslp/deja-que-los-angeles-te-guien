const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUsers() {
  try {
    console.log('🔐 Creando usuarios del sistema...')
    
    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('admin123456', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@oraculo.com' },
      update: { 
        role: 'ADMIN',
        isActive: true 
      },
      create: {
        email: 'admin@oraculo.com',
        passwordHash: adminPassword,
        fullName: 'Administrador del Sistema',
        role: 'ADMIN',
        isActive: true,
        country: 'MX',
        phone: '+52 55 1234 5678'
      }
    })
    
    console.log('✅ Usuario ADMIN creado:', admin.email)
    
    // Crear consultor
    const consultorPassword = await bcrypt.hash('consultor123', 12)
    const consultor = await prisma.user.upsert({
      where: { email: 'consultor@oraculo.com' },
      update: { 
        role: 'CONSULTANT',
        isActive: true 
      },
      create: {
        email: 'consultor@oraculo.com',
        passwordHash: consultorPassword,
        fullName: 'María Consultor',
        role: 'CONSULTANT',
        isActive: true,
        country: 'MX',
        phone: '+52 55 9876 5432'
      }
    })
    
    console.log('✅ Usuario CONSULTOR creado:', consultor.email)
    
    // Crear usuario regular
    const userPassword = await bcrypt.hash('usuario123', 12)
    const user = await prisma.user.upsert({
      where: { email: 'usuario@oraculo.com' },
      update: { 
        role: 'USER',
        isActive: true 
      },
      create: {
        email: 'usuario@oraculo.com',
        passwordHash: userPassword,
        fullName: 'Juan Usuario',
        role: 'USER',
        isActive: true,
        country: 'MX',
        phone: '+52 55 1111 2222'
      }
    })
    
    console.log('✅ Usuario USER creado:', user.email)
    
    console.log('\n🎉 ¡Usuarios creados exitosamente!')
    console.log('\n📋 Credenciales:')
    console.log('👨‍💼 ADMIN: admin@oraculo.com / admin123456')
    console.log('👩‍🏫 CONSULTOR: consultor@oraculo.com / consultor123')
    console.log('👤 USUARIO: usuario@oraculo.com / usuario123')
    console.log('\n🔗 Accesos:')
    console.log('🌐 Panel Admin: http://localhost:3000/admin')
    console.log('💜 Panel Consultor: http://localhost:3000/consultant')
    console.log('💙 Panel Usuario: http://localhost:3000/user')
    console.log('🔑 Login: http://localhost:3000/login')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUsers()