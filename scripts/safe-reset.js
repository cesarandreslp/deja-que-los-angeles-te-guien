const { backupDatabase } = require('./backup-database');
const { spawn } = require('child_process');
const path = require('path');

async function safeReset() {
  try {
    console.log('🚀 Iniciando proceso de reset seguro de la base de datos...\n');

    // 1. Crear backup
    console.log('PASO 1: Creando backup de seguridad...');
    const backupFile = await backupDatabase();
    console.log(`✅ Backup creado: ${backupFile}\n`);

    // 2. Ejecutar reset de Prisma
    console.log('PASO 2: Ejecutando reset de Prisma...');
    
    const prismaReset = spawn('npx', ['prisma', 'migrate', 'reset', '--force'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });

    await new Promise((resolve, reject) => {
      prismaReset.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Reset de Prisma completado\n');
          resolve();
        } else {
          reject(new Error(`Prisma reset falló con código: ${code}`));
        }
      });

      prismaReset.on('error', (error) => {
        reject(error);
      });
    });

    // 3. Generar cliente Prisma
    console.log('PASO 3: Generando cliente Prisma...');
    
    const prismaGenerate = spawn('npx', ['prisma', 'generate'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });

    await new Promise((resolve, reject) => {
      prismaGenerate.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Cliente Prisma generado\n');
          resolve();
        } else {
          reject(new Error(`Prisma generate falló con código: ${code}`));
        }
      });

      prismaGenerate.on('error', (error) => {
        reject(error);
      });
    });

    console.log('🎉 Reset seguro completado exitosamente!');
    console.log(`📂 Tu backup está guardado en: ${backupFile}`);
    console.log('\n📋 Para restaurar los datos más tarde, ejecuta:');
    console.log(`   node scripts/restore-database.js "${backupFile}"`);
    
    return backupFile;

  } catch (error) {
    console.error('❌ Error durante el reset seguro:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  safeReset()
    .then((backupFile) => {
      console.log('\n✨ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { safeReset };