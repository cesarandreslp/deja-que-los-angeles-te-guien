const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function fixAuthComplete() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 INICIANDO REPARACIÓN COMPLETA DE AUTENTICACIÓN...\n');
    
    // 1. Test database connection
    console.log('1️⃣ Probando conexión a base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');
    
    // 2. Clean authentication data
    console.log('2️⃣ Limpiando datos de autenticación corruptos...');
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.verificationToken.deleteMany({});
    console.log('✅ Datos de sesión limpiados\n');
    
    // 3. Check and create admin user
    console.log('3️⃣ Verificando usuario administrador...');
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@oraculo.com' }
    });
    
    if (!admin) {
      console.log('❌ Usuario admin no encontrado, creando...');
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      
      admin = await prisma.user.create({
        data: {
          email: 'admin@oraculo.com',
          fullName: 'Administrador del Oráculo',
          passwordHash: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          phone: '+1234567890',
          birthDate: new Date('1980-01-01'),
          gender: 'OTHER',
          country: 'España',
          city: 'Madrid',
          interests: 'Administración del sistema',
          profileImage: null
        }
      });
      console.log('✅ Usuario admin creado');
    } else {
      console.log('✅ Usuario admin encontrado');
      
      // Verify password is set
      if (!admin.passwordHash) {
        console.log('🔧 Estableciendo contraseña para admin...');
        const hashedPassword = await bcrypt.hash('admin123456', 12);
        await prisma.user.update({
          where: { id: admin.id },
          data: { passwordHash: hashedPassword }
        });
        console.log('✅ Contraseña establecida');
      }
      
      // Ensure admin is active
      if (!admin.isActive) {
        console.log('🔧 Activando usuario admin...');
        await prisma.user.update({
          where: { id: admin.id },
          data: { isActive: true }
        });
        console.log('✅ Usuario admin activado');
      }
    }
    
    // 4. Test password verification
    console.log('\n4️⃣ Probando verificación de contraseña...');
    const updatedAdmin = await prisma.user.findUnique({
      where: { email: 'admin@oraculo.com' }
    });
    
    if (updatedAdmin && updatedAdmin.passwordHash) {
      const isValid = await bcrypt.compare('admin123456', updatedAdmin.passwordHash);
      console.log(`✅ Verificación de contraseña: ${isValid ? 'EXITOSA' : 'FALLIDA'}`);
    }
    
    // 5. Check app configuration
    console.log('\n5️⃣ Verificando configuración de aplicación...');
    let config = await prisma.appConfig.findFirst();
    
    if (!config) {
      console.log('❌ Configuración no encontrada, creando...');
      config = await prisma.appConfig.create({
        data: {
          theme: 'ORACULO',
          appName: 'Oráculo de los Arcángeles',
          logoUrl: '/images/oraculo-logo.png',
          staticTexts: {
            heroTitle: 'Conecta con los Arcángeles',
            heroSubtitle: 'Encuentra respuestas y guía espiritual a través de consultas personalizadas',
            navHome: 'Inicio',
            navConsult: 'Consultar',
            navStore: 'Tienda',
            navAbout: 'Nosotros',
            navContact: 'Contacto'
          }
        }
      });
      console.log('✅ Configuración creada');
    } else {
      console.log('✅ Configuración encontrada');
    }
    
    // 6. Show final status
    console.log('\n📊 ESTADO FINAL:');
    const userCount = await prisma.user.count();
    console.log(`👥 Total usuarios: ${userCount}`);
    console.log(`🔑 Admin email: ${updatedAdmin?.email}`);
    console.log(`🔑 Admin role: ${updatedAdmin?.role}`);
    console.log(`🔑 Admin active: ${updatedAdmin?.isActive}`);
    console.log(`⚙️ Configuración: ${config?.theme}`);
    
    console.log('\n✅ REPARACIÓN COMPLETA EXITOSA');
    console.log('\n🔐 CREDENCIALES DE ADMIN:');
    console.log('📧 Email: admin@oraculo.com');
    console.log('🔑 Password: admin123456');
    
  } catch (error) {
    console.error('❌ Error durante la reparación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAuthComplete().catch(console.error);