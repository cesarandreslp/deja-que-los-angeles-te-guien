import { prisma, connectPrisma, disconnectPrisma } from './prisma-config'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🔐 Creando usuario administrador...')
  
  // Hash de la contraseña
  const passwordHash = await bcrypt.hash('admin123456', 12)
  
  try {
    // Crear o actualizar usuario admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@oraculo.com' },
      update: { 
        role: 'ADMIN',
        isActive: true,
        passwordHash
      },
      create: {
        email: 'admin@oraculo.com',
        passwordHash,
        fullName: 'Administrador del Sistema',
        role: 'ADMIN',
        isActive: true,
        country: 'México',
        phone: '+52 55 1234 5678'
      }
    })
    
    console.log('✅ Usuario administrador creado/actualizado:')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Contraseña: admin123456')
    console.log('👤 Rol:', admin.role)
    console.log('🌐 Acceso: http://localhost:3000/login')
    
    // Crear usuarios de ejemplo
    const consultor = await prisma.user.upsert({
      where: { email: 'consultor@oraculo.com' },
      update: { role: 'CONSULTANT', isActive: true },
      create: {
        email: 'consultor@oraculo.com',
        passwordHash: await bcrypt.hash('consultor123', 12),
        fullName: 'María Consultor',
        role: 'CONSULTANT',
        isActive: true,
        country: 'México'
      }
    })
    
    const usuario = await prisma.user.upsert({
      where: { email: 'usuario@oraculo.com' },
      update: { role: 'USER', isActive: true },
      create: {
        email: 'usuario@oraculo.com',
        passwordHash: await bcrypt.hash('usuario123', 12),
        fullName: 'Juan Usuario',
        role: 'USER',
        isActive: true,
        country: 'México'
      }
    })
    
    console.log('\n👥 Usuarios de ejemplo creados:')
    console.log('👩‍🏫 CONSULTOR: consultor@oraculo.com / consultor123')
    console.log('👤 USUARIO: usuario@oraculo.com / usuario123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await disconnectPrisma()
  }
}

main()