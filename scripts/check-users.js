// Script para verificar usuarios en la base de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');
    
    // Contar total de usuarios
    const totalUsers = await prisma.user.count();
    console.log(`📊 Total de usuarios: ${totalUsers}`);
    
    if (totalUsers > 0) {
      // Obtener todos los usuarios con información básica
      const users = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log('\n👥 Lista de usuarios:');
      console.log('==========================================');
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🏷️  Rol: ${user.role}`);
        console.log(`   ✅ Activo: ${user.isActive ? 'Sí' : 'No'}`);
        console.log(`   📅 Registrado: ${user.createdAt.toLocaleString('es-ES')}`);
        console.log('------------------------------------------');
      });
    } else {
      console.log('\n❌ No hay usuarios registrados en la base de datos.');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();