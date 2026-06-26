const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupCompleteDatabase() {
  try {
    console.log('🔄 Iniciando backup completo de la base de datos...');
    
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {}
    };

    // Backup de usuarios con todas sus relaciones
    console.log('📋 Respaldando usuarios...');
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
        verificationTokens: true,
        resetTokens: true,
        commissions: true,
        orders: {
          include: {
            orderItems: true
          }
        },
        cart: {
          include: {
            items: true
          }
        },
        membership: true,
        userMemberships: true,
        userConsultations: true,
        consultorConsultations: true,
        readings: {
          include: {
            messages: true
          }
        }
      }
    });
    backupData.data.users = users;
    console.log(`✅ ${users.length} usuarios respaldados`);

    // Contar readings y messages
    const totalReadings = users.reduce((sum, user) => sum + (user.readings?.length || 0), 0);
    const totalMessages = users.reduce((sum, user) => 
      sum + user.readings.reduce((msgSum, reading) => msgSum + (reading.messages?.length || 0), 0), 0
    );
    console.log(`📖 ${totalReadings} lecturas del oráculo respaldadas`);
    console.log(`💬 ${totalMessages} mensajes de chat respaldados`);

    // Backup de productos
    console.log('📋 Respaldando productos...');
    const products = await prisma.product.findMany({
      include: {
        orderItems: true,
        cartItems: true
      }
    });
    backupData.data.products = products;
    console.log(`✅ ${products.length} productos respaldados`);

    // Backup de membresías
    console.log('📋 Respaldando membresías...');
    const memberships = await prisma.membership.findMany();
    backupData.data.memberships = memberships;
    console.log(`✅ ${memberships.length} membresías respaldadas`);

    // Backup de planes de membresía
    console.log('📋 Respaldando planes de membresía...');
    const membershipPlans = await prisma.membershipPlan.findMany({
      include: {
        userMemberships: true
      }
    });
    backupData.data.membershipPlans = membershipPlans;
    console.log(`✅ ${membershipPlans.length} planes respaldados`);

    // Backup de videoconsultas
    console.log('📋 Respaldando videoconsultas...');
    const videoConsultations = await prisma.videoConsultation.findMany();
    backupData.data.videoConsultations = videoConsultations;
    console.log(`✅ ${videoConsultations.length} videoconsultas respaldadas`);

    // Backup de mensajes de contacto
    console.log('📋 Respaldando mensajes de contacto...');
    const contactMessages = await prisma.contactMessage.findMany();
    backupData.data.contactMessages = contactMessages;
    console.log(`✅ ${contactMessages.length} mensajes respaldados`);

    // Backup adicional: todas las readings independientemente
    console.log('📋 Respaldando lecturas del oráculo (verificación)...');
    const allReadings = await prisma.reading.findMany({
      include: {
        messages: true,
        user: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });
    backupData.data.allReadings = allReadings;
    console.log(`✅ ${allReadings.length} lecturas verificadas`);

    // Crear directorio de backups si no existe
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Guardar backup de datos
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `database-complete-${timestamp}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup de datos guardado en: ${backupFile}`);

    // Backup de archivos estáticos
    console.log('📂 Iniciando backup de archivos estáticos...');
    
    const staticBackup = {
      timestamp: new Date().toISOString(),
      files: {}
    };

    // Backup de imágenes de cartas
    const cartasDir = path.join(__dirname, '..', 'public', 'oraculo', 'arcangeles_cartas');
    if (fs.existsSync(cartasDir)) {
      const cartasFiles = fs.readdirSync(cartasDir).filter(file => 
        file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
      );
      staticBackup.files.cartas = cartasFiles;
      console.log(`📸 ${cartasFiles.length} imágenes de cartas catalogadas`);
    }

    // Backup de otros archivos del oráculo
    const oraculoDir = path.join(__dirname, '..', 'public', 'oraculo');
    if (fs.existsSync(oraculoDir)) {
      const oraculoFiles = fs.readdirSync(oraculoDir).filter(file => 
        file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.mp4') || file.endsWith('.mp3')
      );
      staticBackup.files.oraculo = oraculoFiles;
      console.log(`🎭 ${oraculoFiles.length} archivos adicionales del oráculo catalogados`);
    }

    // Guardar catálogo de archivos estáticos
    const staticBackupFile = path.join(backupDir, `static-files-${timestamp}.json`);
    fs.writeFileSync(staticBackupFile, JSON.stringify(staticBackup, null, 2));
    
    console.log(`✅ Catálogo de archivos guardado en: ${staticBackupFile}`);

    // Resumen del backup
    console.log('\n📊 RESUMEN DEL BACKUP COMPLETO:');
    console.log(`👥 Usuarios: ${users.length}`);
    console.log(`📖 Lecturas del oráculo: ${totalReadings}`);
    console.log(`💬 Mensajes de chat: ${totalMessages}`);
    console.log(`🛍️ Productos: ${products.length}`);
    console.log(`💎 Membresías: ${memberships.length}`);
    console.log(`📋 Planes de membresía: ${membershipPlans.length}`);
    console.log(`📹 Videoconsultas: ${videoConsultations.length}`);
    console.log(`📧 Mensajes de contacto: ${contactMessages.length}`);
    console.log(`🃏 Imágenes de cartas: ${staticBackup.files.cartas?.length || 0}`);
    console.log(`🎭 Archivos del oráculo: ${staticBackup.files.oraculo?.length || 0}`);

    return {
      dataBackup: backupFile,
      staticBackup: staticBackupFile,
      summary: {
        users: users.length,
        readings: totalReadings,
        messages: totalMessages,
        products: products.length,
        memberships: memberships.length,
        membershipPlans: membershipPlans.length,
        videoConsultations: videoConsultations.length,
        contactMessages: contactMessages.length,
        cartasImages: staticBackup.files.cartas?.length || 0,
        oraculoFiles: staticBackup.files.oraculo?.length || 0
      }
    };

  } catch (error) {
    console.error('❌ Error durante el backup completo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  backupCompleteDatabase()
    .then((result) => {
      console.log('\n🎉 Backup completo exitoso!');
      console.log(`📄 Datos: ${result.dataBackup}`);
      console.log(`📂 Archivos: ${result.staticBackup}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en backup completo:', error);
      process.exit(1);
    });
}

module.exports = { backupCompleteDatabase };