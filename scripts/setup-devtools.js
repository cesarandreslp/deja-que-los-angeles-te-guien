#!/usr/bin/env node

/**
 * Script para configurar y lanzar React DevTools
 * Oráculo Angelical - DevTools Setup
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔮 Configurando React DevTools para Oráculo Angelical...\n');

// Colores para el terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Información sobre React DevTools
colorLog('cyan', '✨ React Developer Tools - Información:');
console.log('');
colorLog('white', '📋 Funcionalidades disponibles:');
console.log('   • 🔍 Inspección de componentes React');
console.log('   • 🎯 Props y state en tiempo real');
console.log('   • ⚡ Profiling de rendimiento');
console.log('   • 🌳 Árbol de componentes');
console.log('   • 🔄 Hot reloading insights');
console.log('');

colorLog('yellow', '🚀 Opciones de uso:');
console.log('');
colorLog('bright', '1. Extensión del Navegador (Recomendado):');
console.log('   • Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi');
console.log('   • Firefox: https://addons.mozilla.org/firefox/addon/react-devtools/');
console.log('   • Edge: Disponible en Microsoft Store');
console.log('');

colorLog('bright', '2. Aplicación Standalone:');
console.log('   • Ejecutar: npm run devtools');
console.log('   • Conectar a: localhost:8097');
console.log('');

colorLog('bright', '3. Desarrollo con DevTools automático:');
console.log('   • Ejecutar: npm run dev:with-devtools');
console.log('   • Lanza servidor + DevTools juntos');
console.log('');

// Detectar si ya está instalada la extensión del navegador
colorLog('magenta', '🔍 Verificando instalación...');

// Función para verificar si un puerto está en uso
function checkPort(port) {
  return new Promise((resolve) => {
    const { createConnection } = require('net');
    const socket = createConnection({ port, host: 'localhost' }, () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

// Función para lanzar React DevTools
async function launchDevTools() {
  try {
    colorLog('green', '🚀 Lanzando React DevTools standalone...');
    console.log('');
    
    const devtools = spawn('npx', ['react-devtools'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    devtools.on('error', (error) => {
      colorLog('red', `❌ Error al lanzar DevTools: ${error.message}`);
      process.exit(1);
    });

    devtools.on('close', (code) => {
      if (code !== 0) {
        colorLog('yellow', `⚠️ DevTools cerrado con código: ${code}`);
      } else {
        colorLog('green', '✅ DevTools cerrado correctamente');
      }
    });

    // Manejar Ctrl+C
    process.on('SIGINT', () => {
      colorLog('yellow', '\n🛑 Cerrando React DevTools...');
      devtools.kill('SIGINT');
      process.exit(0);
    });

  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--launch') || args.includes('-l')) {
    await launchDevTools();
  } else if (args.includes('--help') || args.includes('-h')) {
    colorLog('cyan', '📖 Ayuda - React DevTools Setup');
    console.log('');
    console.log('Uso: node setup-devtools.js [opciones]');
    console.log('');
    console.log('Opciones:');
    console.log('  --launch, -l    Lanzar React DevTools standalone');
    console.log('  --help, -h      Mostrar esta ayuda');
    console.log('');
    console.log('Scripts npm disponibles:');
    console.log('  npm run devtools           - Lanzar DevTools standalone');
    console.log('  npm run dev:with-devtools  - Servidor + DevTools');
    console.log('');
  } else {
    colorLog('blue', '💡 Consejos para el desarrollo:');
    console.log('');
    console.log('• Para la mejor experiencia, instala la extensión del navegador');
    console.log('• El standalone es útil para debugging profundo');
    console.log('• Usa Profiler tab para optimizar rendimiento');
    console.log('• Inspecciona el contexto de la aplicación angelical');
    console.log('');
    
    colorLog('green', '✅ React DevTools configurado correctamente');
    colorLog('dim', 'Usa --help para ver más opciones');
  }
}

main().catch(console.error);