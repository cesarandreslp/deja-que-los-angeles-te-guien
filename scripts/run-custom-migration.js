const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runCustomMigration() {
  try {
    console.log('🚀 Ejecutando migración personalizada para PWA...\n');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'add-pwa-notifications.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Dividir en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📋 Ejecutando ${commands.length} comandos SQL...\n`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.includes('CREATE TABLE')) {
        const tableName = command.match(/CREATE TABLE.*?"(\w+)"/)?.[1];
        console.log(`📊 Creando tabla: ${tableName}`);
      } else if (command.includes('CREATE TYPE')) {
        const typeName = command.match(/CREATE TYPE "(\w+)"/)?.[1];
        console.log(`🏷️  Creando tipo: ${typeName}`);
      } else if (command.includes('CREATE INDEX')) {
        const indexName = command.match(/CREATE.*?INDEX.*?"(\w+)"/)?.[1];
        console.log(`🔍 Creando índice: ${indexName}`);
      } else if (command.includes('ALTER TABLE')) {
        console.log(`🔧 Modificando tabla...`);
      }

      try {
        await prisma.$executeRawUnsafe(command);
        console.log(`✅ Comando ejecutado exitosamente\n`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Ya existe, omitiendo...\n`);
        } else {
          console.error(`❌ Error en comando: ${error.message}\n`);
          throw error;
        }
      }
    }

    // Verificar que las tablas fueron creadas
    console.log('🔍 Verificando tablas creadas...');
    
    const pushSubscriptions = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'push_subscriptions'
    `;
    
    const consultationReminders = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'consultation_reminders'
    `;

    console.log(`✅ Tabla push_subscriptions: ${pushSubscriptions[0].count > 0 ? 'CREADA' : 'NO ENCONTRADA'}`);
    console.log(`✅ Tabla consultation_reminders: ${consultationReminders[0].count > 0 ? 'CREADA' : 'NO ENCONTRADA'}`);

    console.log('\n🎉 Migración completada exitosamente!');
    console.log('📱 Las tablas para notificaciones PWA están listas');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runCustomMigration()
    .then(() => {
      console.log('\n✨ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en migración:', error);
      process.exit(1);
    });
}

module.exports = { runCustomMigration };