const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('🔄 Iniciando backup de la base de datos...');
    
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {}
    };

    // Backup de usuarios
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

    // Crear directorio de backups si no existe
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Guardar backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `database-backup-${timestamp}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup completo guardado en: ${backupFile}`);
    console.log(`📊 Total de registros respaldados: ${
      users.length + products.length + 
      memberships.length + membershipPlans.length + 
      videoConsultations.length + contactMessages.length
    }`);

    return backupFile;

  } catch (error) {
    console.error('❌ Error durante el backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  backupDatabase()
    .then((file) => {
      console.log(`🎉 Backup exitoso: ${file}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en backup:', error);
      process.exit(1);
    });
}

module.exports = { backupDatabase };