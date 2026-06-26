const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createPremiumUser() {
  try {
    console.log('🚀 Iniciando creación de usuario premium...');

    // 1. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'luisf@marmolejo.com' }
    });

    if (existingUser) {
      console.log('⚠️  Usuario ya existe. Actualizando...');
      
      // Actualizar usuario existente
      const updatedUser = await prisma.user.update({
        where: { email: 'luisf@marmolejo.com' },
        data: {
          fullName: 'Luis Fernando Marmolejo',
          dateOfBirth: new Date('1971-05-23'),
          gender: 'MALE',
          passwordHash: await bcrypt.hash('LuisF12345@', 10),
          isActive: true,
          role: 'USER'
        }
      });

      console.log('✅ Usuario actualizado:', updatedUser.email);
      
      // Verificar membresía existente
      const existingMembership = await prisma.userMembership.findFirst({
        where: { 
          userId: updatedUser.id,
          status: 'ACTIVE'
        }
      });

      if (existingMembership) {
        console.log('✅ Usuario ya tiene membresía activa');
        await prisma.$disconnect();
        return;
      }

      // Crear membresía para usuario existente
      await createMembership(updatedUser.id);
      return;
    }

    // 2. Crear usuario nuevo
    const hashedPassword = await bcrypt.hash('LuisF12345@', 10);
    
    const newUser = await prisma.user.create({
      data: {
        fullName: 'Luis Fernando Marmolejo',
        email: 'luisf@marmolejo.com',
        passwordHash: hashedPassword,
        dateOfBirth: new Date('1971-05-23'),
        gender: 'MALE',
        isActive: true,
        role: 'USER',
        country: 'Colombia',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Usuario creado exitosamente');
    console.log('   ID:', newUser.id);
    console.log('   Email:', newUser.email);
    console.log('   Nombre:', newUser.fullName);

    // 3. Crear membresía
    await createMembership(newUser.id);

  } catch (error) {
    console.error('❌ Error creando usuario premium:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function createMembership(userId) {
  try {
    // Buscar o crear plan de membresía premium
    let membershipPlan = await prisma.membershipPlan.findFirst({
      where: { name: 'Premium' }
    });

    if (!membershipPlan) {
      console.log('📦 Creando plan de membresía Premium...');
      membershipPlan = await prisma.membershipPlan.create({
        data: {
          name: 'Premium',
          description: 'Acceso completo a todas las funcionalidades',
          priceCents: 999, // $9.99
          currency: 'USD',
          durationDays: 30,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('✅ Plan Premium creado');
    }

    // Crear membresía activa para el usuario
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365); // 1 año de membresía

    const membership = await prisma.userMembership.create({
      data: {
        userId: userId,
        membershipPlanId: membershipPlan.id,
        status: 'ACTIVE',
        paymentProvider: 'STRIPE',
        paymentStatus: 'SUCCESS',
        paymentId: `MANUAL_${Date.now()}`,
        startDate: startDate,
        endDate: endDate
      }
    });

    console.log('✅ Membresía premium creada exitosamente');
    console.log('   Plan:', membershipPlan.name);
    console.log('   Estado:', membership.status);
    console.log('   Inicio:', membership.startDate.toLocaleDateString());
    console.log('   Fin:', membership.endDate.toLocaleDateString());
    console.log('   Duración: 1 año');

    // Verificar membresía
    const activeMembership = await prisma.userMembership.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: {
        membershipPlan: true
      }
    });

    if (activeMembership) {
      console.log('\n✨ VERIFICACIÓN EXITOSA ✨');
      console.log('   Usuario tiene membresía ACTIVA');
      console.log('   Plan:', activeMembership.membershipPlan.name);
    } else {
      console.log('\n⚠️  ADVERTENCIA: No se pudo verificar la membresía');
    }

  } catch (error) {
    console.error('❌ Error creando membresía:', error);
    throw error;
  }
}

// Ejecutar
createPremiumUser()
  .then(() => {
    console.log('\n🎉 ¡Proceso completado exitosamente!');
    console.log('\n📋 Credenciales del usuario:');
    console.log('   Email: luisf@marmolejo.com');
    console.log('   Contraseña: LuisF12345@');
    console.log('\n🔐 El usuario puede iniciar sesión en: http://localhost:3000/login');
    console.log('🔮 Y acceder al oráculo en: http://localhost:3000/oraculo');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
