const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function setupTestingUsers() {
  try {
    console.log('🔍 VERIFICANDO USUARIOS EXISTENTES...\n');
    
    // Verificar usuarios existentes
    const existingUsers = await prisma.user.findMany({
      select: {
        fullName: true,
        email: true,
        role: true,
        isActive: true
      },
      orderBy: { role: 'asc' }
    });
    
    console.log('👥 Usuarios disponibles:');
    existingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email}) - ${user.role} - ${user.isActive ? 'Activo' : 'Inactivo'}`);
    });
    
    // Crear/actualizar usuario tester si no existe
    const testerEmail = 'tester@oraculo.com';
    const testerExists = existingUsers.find(u => u.email === testerEmail);
    
    console.log('\n🧪 CONFIGURANDO USUARIO TESTER...\n');
    
    if (!testerExists) {
      const hashedPassword = await bcrypt.hash('tester123', 12);
      
      const testerUser = await prisma.user.create({
        data: {
          email: testerEmail,
          passwordHash: hashedPassword,
          fullName: 'Usuario Tester',
          role: 'USER',
          isActive: true,
          country: 'Colombia',
          gender: 'OTHER',
          phone: '+57 300 123 4567'
        }
      });
      
      console.log('✅ Usuario tester creado exitosamente!');
    } else {
      console.log('ℹ️ Usuario tester ya existe');
    }
    
    // Verificar planes de membresía disponibles
    console.log('\n💎 PLANES DE MEMBRESÍA DISPONIBLES:');
    const plans = await prisma.membershipPlan.findMany({
      select: {
        id: true,
        name: true,
        priceCents: true,
        currency: true,
        durationDays: true,
        isActive: true
      }
    });
    
    if (plans.length === 0) {
      console.log('⚠️ No hay planes de membresía. Creando planes básicos...');
      
      const basicPlan = await prisma.membershipPlan.create({
        data: {
          name: 'Plan Básico',
          description: 'Acceso básico a funcionalidades premium',
          priceCents: 1999, // $19.99
          currency: 'USD',
          durationDays: 30,
          isActive: true
        }
      });
      
      const premiumPlan = await prisma.membershipPlan.create({
        data: {
          name: 'Plan Premium',
          description: 'Acceso completo a todas las funcionalidades',
          priceCents: 3999, // $39.99
          currency: 'USD',
          durationDays: 30,
          isActive: true
        }
      });
      
      console.log('✅ Planes de membresía creados:');
      console.log('  - Plan Básico: $19.99/mes');
      console.log('  - Plan Premium: $39.99/mes');
    } else {
      plans.forEach((plan, index) => {
        const price = (plan.priceCents / 100).toFixed(2);
        console.log(`${index + 1}. ${plan.name}: $${price} ${plan.currency} por ${plan.durationDays} días - ${plan.isActive ? 'Activo' : 'Inactivo'}`);
      });
    }
    
    console.log('\n🎯 CREDENCIALES PARA TESTING:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('👤 USUARIO REGULAR (para probar membresías, tienda, consultas):');
    console.log('   📧 Email: tester@oraculo.com');
    console.log('   🔑 Password: tester123');
    console.log('   🎭 Rol: USER');
    console.log('');
    
    // Mostrar otros usuarios útiles
    const adminUser = existingUsers.find(u => u.role === 'ADMIN');
    const consultantUser = existingUsers.find(u => u.role === 'CONSULTANT');
    
    if (adminUser) {
      console.log('👑 ADMINISTRADOR (para panel admin):');
      console.log(`   📧 Email: ${adminUser.email}`);
      console.log('   🔑 Password: admin123456 (o verificar en scripts)');
      console.log('');
    }
    
    if (consultantUser) {
      console.log('💼 CONSULTOR (para panel de consultor):');
      console.log(`   📧 Email: ${consultantUser.email}`);
      console.log('   🔑 Password: consultor123 (o verificar en scripts)');
      console.log('');
    }
    
    console.log('🚀 FUNCIONALIDADES QUE PUEDES PROBAR CON TESTER:');
    console.log('══════════════════════════════════════════════════════');
    console.log('✅ Dashboard de usuario (/user)');
    console.log('✅ Membresías (/memberships)');
    console.log('✅ Tienda angelical (/tienda)');
    console.log('✅ Carrito de compras (/carrito)');
    console.log('✅ Agendar videoconsultas (/book-consultation)');
    console.log('✅ Ver mis consultas (/user/consultations)');
    console.log('✅ Mi perfil (/profile)');
    console.log('✅ Oráculo arcangélico (funcionalidad premium)');
    console.log('');
    console.log('💡 NOTA: Para probar pagos, las funciones están implementadas');
    console.log('   pero requieren configuración de MercadoPago/Stripe en producción.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestingUsers();