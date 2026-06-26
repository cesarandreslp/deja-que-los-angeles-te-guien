const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function restoreDataSafely(backupFile) {
  try {
    console.log('🔄 Iniciando restauración segura...');
    
    // Verificar que el archivo existe
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Archivo de backup no encontrado: ${backupFile}`);
    }

    // Leer datos del backup
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    console.log(`📂 Restaurando backup del: ${backupData.timestamp}\n`);

    // 1. Restaurar planes de membresía primero (no tienen dependencias)
    if (backupData.data.membershipPlans?.length > 0) {
      console.log('📋 Restaurando planes de membresía...');
      for (const plan of backupData.data.membershipPlans) {
        const { userMemberships, ...planData } = plan;
        await prisma.membershipPlan.upsert({
          where: { id: plan.id },
          update: planData,
          create: planData
        });
      }
      console.log(`✅ ${backupData.data.membershipPlans.length} planes restaurados`);
    }

    // 2. Restaurar usuarios (sin relaciones complejas primero)
    if (backupData.data.users?.length > 0) {
      console.log('📋 Restaurando usuarios básicos...');
      for (const user of backupData.data.users) {
        const { 
          accounts, sessions, verificationTokens, resetTokens,
          commissions, orders, cart, membership, userMemberships,
          userConsultations, consultorConsultations, readings,
          ...userData 
        } = user;

        await prisma.user.upsert({
          where: { id: user.id },
          update: userData,
          create: userData
        });
      }
      console.log(`✅ ${backupData.data.users.length} usuarios básicos restaurados`);
    }

    // 3. Restaurar lecturas del oráculo
    if (backupData.data.allReadings?.length > 0) {
      console.log('📋 Restaurando lecturas del oráculo...');
      for (const reading of backupData.data.allReadings) {
        const { messages, user, ...readingData } = reading;
        
        // Verificar que el usuario existe
        const userExists = await prisma.user.findUnique({
          where: { id: reading.userId }
        });
        
        if (userExists) {
          await prisma.reading.upsert({
            where: { id: reading.id },
            update: readingData,
            create: readingData
          });

          // Restaurar mensajes si existen
          if (messages?.length > 0) {
            for (const message of messages) {
              await prisma.message.upsert({
                where: { id: message.id },
                update: message,
                create: message
              });
            }
          }
        }
      }
      console.log(`✅ ${backupData.data.allReadings.length} lecturas restauradas`);
    }

    // 4. Restaurar relaciones de autenticación
    console.log('📋 Restaurando datos de autenticación...');
    for (const user of backupData.data.users || []) {
      // Accounts
      if (user.accounts?.length > 0) {
        for (const account of user.accounts) {
          await prisma.account.upsert({
            where: { id: account.id },
            update: account,
            create: account
          });
        }
      }

      // Sessions  
      if (user.sessions?.length > 0) {
        for (const session of user.sessions) {
          await prisma.session.upsert({
            where: { id: session.id },
            update: session,
            create: session
          });
        }
      }

      // Verification tokens
      if (user.verificationTokens?.length > 0) {
        for (const token of user.verificationTokens) {
          await prisma.verificationToken.upsert({
            where: { id: token.id },
            update: token,
            create: token
          });
        }
      }
    }
    console.log('✅ Datos de autenticación restaurados');

    // 5. Restaurar videoconsultas solo si ambos usuarios existen
    if (backupData.data.videoConsultations?.length > 0) {
      console.log('📋 Restaurando videoconsultas...');
      let restoredConsultations = 0;
      
      for (const consultation of backupData.data.videoConsultations) {
        // Verificar que tanto el usuario como el consultor existen
        const userExists = await prisma.user.findUnique({
          where: { id: consultation.userId }
        });
        const consultorExists = await prisma.user.findUnique({
          where: { id: consultation.consultorId }
        });

        if (userExists && consultorExists) {
          await prisma.videoConsultation.upsert({
            where: { id: consultation.id },
            update: consultation,
            create: consultation
          });
          restoredConsultations++;
        } else {
          console.log(`⚠️  Omitiendo consulta ${consultation.id} - usuarios no encontrados`);
        }
      }
      console.log(`✅ ${restoredConsultations} videoconsultas restauradas`);
    }

    console.log('\n🎉 Restauración segura completada!');
    
    // Verificar estado final
    const finalStats = {
      users: await prisma.user.count(),
      readings: await prisma.reading.count(),
      messages: await prisma.message.count(),
      consultations: await prisma.videoConsultation.count(),
      membershipPlans: await prisma.membershipPlan.count()
    };

    console.log('\n📊 ESTADO FINAL:');
    console.log(`👥 Usuarios: ${finalStats.users}`);
    console.log(`📖 Lecturas: ${finalStats.readings}`);
    console.log(`💬 Mensajes: ${finalStats.messages}`);
    console.log(`📹 Videoconsultas: ${finalStats.consultations}`);
    console.log(`📋 Planes de membresía: ${finalStats.membershipPlans}`);

  } catch (error) {
    console.error('❌ Error durante la restauración segura:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const backupFile = process.argv[2];
  
  if (!backupFile) {
    console.error('❌ Por favor proporciona la ruta del archivo de backup');
    console.log('Uso: node restore-safe.js <ruta-del-backup>');
    process.exit(1);
  }

  restoreDataSafely(backupFile)
    .then(() => {
      console.log('\n🎉 Restauración segura exitosa');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en restauración segura:', error);
      process.exit(1);
    });
}

module.exports = { restoreDataSafely };