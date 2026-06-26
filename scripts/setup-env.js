#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Función para detectar el puerto disponible
function getAvailablePort() {
  // Intentar puertos comunes de desarrollo
  const ports = [3000, 3001, 3002, 3003, 3004, 3005];
  
  for (const port of ports) {
    try {
      // En desarrollo, usualmente Next.js nos dirá qué puerto usar
      // Por ahora, devolvemos 3000 como base
      return port;
    } catch (error) {
      continue;
    }
  }
  
  return 3000; // Puerto por defecto
}

// Leer el archivo .env.local actual
const envPath = path.join(__dirname, '..', '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('No se pudo leer .env.local:', error.message);
  process.exit(1);
}

// Función para actualizar el puerto en NEXTAUTH_URL
function updateNextAuthUrl(content, port) {
  const nextAuthUrlRegex = /NEXTAUTH_URL="http:\/\/localhost:\d+"/;
  const newUrl = `NEXTAUTH_URL="http://localhost:${port}"`;
  
  if (nextAuthUrlRegex.test(content)) {
    return content.replace(nextAuthUrlRegex, newUrl);
  } else {
    // Si no existe, agregarlo
    return content + `\n${newUrl}\n`;
  }
}

// Si se pasa un puerto como argumento, usarlo
const port = process.argv[2] || getAvailablePort();

console.log(`🔧 Configurando NextAuth para puerto ${port}...`);

// Actualizar el contenido
const updatedContent = updateNextAuthUrl(envContent, port);

// Escribir el archivo actualizado
try {
  fs.writeFileSync(envPath, updatedContent);
  console.log(`✅ NEXTAUTH_URL actualizado a http://localhost:${port}`);
} catch (error) {
  console.error('❌ Error al escribir .env.local:', error.message);
  process.exit(1);
}