#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');

// Función optimizada para verificar si un puerto está disponible
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.setTimeout(1000); // Timeout de 1 segundo
    
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    
    server.on('error', () => resolve(false));
    server.on('timeout', () => {
      server.close(() => resolve(false));
    });
  });
}

// Función para encontrar el primer puerto disponible
async function findAvailablePort(startPort = 3000) {
  for (let port = startPort; port < startPort + 10; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error('No hay puertos disponibles en el rango 3000-3009');
}

// Función para actualizar NEXTAUTH_URL en .env.local
function updateNextAuthUrl(port) {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    const nextAuthUrlRegex = /NEXTAUTH_URL="[^"]*"/;
    const newUrl = `NEXTAUTH_URL="http://localhost:${port}"`;
    
    if (nextAuthUrlRegex.test(envContent)) {
      envContent = envContent.replace(nextAuthUrlRegex, newUrl);
    } else {
      envContent += `\n${newUrl}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ NEXTAUTH_URL actualizado a http://localhost:${port}`);
  } catch (error) {
    console.warn('⚠️  No se pudo actualizar .env.local:', error.message);
  }
}

async function startDevelopmentServer() {
  try {
    console.log('🔍 Verificando puerto 3000...');
    const port = 3000;
    
    // Verificar si el puerto 3000 está disponible
    if (!(await isPortAvailable(port))) {
      throw new Error(`Puerto ${port} no está disponible. Por favor, libera el puerto antes de continuar.`);
    }
    
    console.log(`🚀 Iniciando servidor en puerto ${port}`);
    
    // Actualizar variables de entorno
    updateNextAuthUrl(port);
    
    // Iniciar Next.js con el puerto específico
    const nextProcess = spawn('npx', ['next', 'dev', '-p', port.toString()], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PORT: port.toString(),
        NEXTAUTH_URL: `http://localhost:${port}`
      }
    });
    
    // Manejar señales de cierre
    process.on('SIGINT', () => {
      console.log('\n🛑 Cerrando servidor...');
      nextProcess.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      nextProcess.kill('SIGTERM');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  startDevelopmentServer();
}

module.exports = { findAvailablePort, updateNextAuthUrl };