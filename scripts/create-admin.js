// Script para crear usuario administrador
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...')
    
    // Datos del administrador
    const adminData = {
      email: 'admin@oraculo.com',
      password: 'admin123456',
      fullName: 'Administrador del Sistema',
      role: 'ADMIN'
    }
    
    // Verificar si ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email }
    })
    
    if (existingAdmin) {
      console.log('❌ Ya existe un usuario con el email:', adminData.email)
      console.log('💡 Actualizando rol a ADMIN...')
      
      const updatedUser = await prisma.user.update({
        where: { email: adminData.email },
        data: { 
          role: 'ADMIN',
          isActive: true
        }
      })
      
      console.log('✅ Usuario actualizado:', updatedUser.email, '- Rol:', updatedUser.role)
      return
    }
    
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(adminData.password, 12)
    
    // Crear usuario administrador
    const adminUser = await prisma.user.create({
      data: {
        email: adminData.email,
        passwordHash,
        fullName: adminData.fullName,
        role: adminData.role,
        isActive: true,
        emailVerified: new Date(), // Admin pre-verificado
        country: 'México',
        phone: '+52 55 1234 5678'
      }
    })
    
    console.log('✅ Usuario administrador creado exitosamente!')
    console.log('📧 Email:', adminUser.email)
    console.log('🔑 Contraseña:', adminData.password)
    console.log('👤 Rol:', adminUser.role)
    console.log('')
    console.log('🌐 Puedes acceder al panel admin en: http://localhost:3000/admin')
    console.log('📝 O usa el login directo en: http://localhost:3000/login')
    
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// También crear usuarios de ejemplo para testing
async function createTestUsers() {
  try {
    console.log('👥 Creando usuarios de ejemplo...')
    
    const testUsers = [
      {
        email: 'consultor@oraculo.com',
        password: 'consultor123',
        fullName: 'María Consultor',
        role: 'CONSULTANT'
      },
      {
        email: 'usuario@oraculo.com', 
        password: 'usuario123',
        fullName: 'Juan Usuario',
        role: 'USER'
      }
    ]
    
    for (const userData of testUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      
      if (!existing) {
        const passwordHash = await bcrypt.hash(userData.password, 12)
        
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            passwordHash,
            fullName: userData.fullName,
            role: userData.role,
            isActive: true,
            emailVerified: new Date(),
            country: 'México'
          }
        })
        
        console.log(`✅ Usuario ${userData.role} creado: ${user.email}`)
      } else {
        console.log(`⏭️ Usuario ya existe: ${userData.email}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error al crear usuarios de ejemplo:', error)
  }
}

async function main() {
  await createAdminUser()
  await createTestUsers()
  
  console.log('')
  console.log('🎉 ¡Setup completado!')
  console.log('')
  console.log('📋 Credenciales creadas:')
  console.log('👨‍💼 ADMIN: admin@oraculo.com / admin123456')
  console.log('👩‍🏫 CONSULTOR: consultor@oraculo.com / consultor123') 
  console.log('👤 USUARIO: usuario@oraculo.com / usuario123')
  console.log('')
  console.log('🔗 Accesos directos:')
  console.log('🌐 Panel Admin: http://localhost:3000/admin')
  console.log('💜 Panel Consultor: http://localhost:3000/consultant')
  console.log('💙 Panel Usuario: http://localhost:3000/user')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })