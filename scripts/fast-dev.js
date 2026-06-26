#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('⚡ Iniciando desarrollo RÁPIDO...');

// Variables de entorno optimizadas para velocidad
const env = {
  ...process.env,
  NODE_ENV: 'development',
  NEXTAUTH_URL: 'http://localhost:3000',
  // Desactivar checks lentos
  SKIP_ENV_VALIDATION: 'true',
  // Optimizaciones de Node.js
  NODE_OPTIONS: '--max-old-space-size=4096',
  // Acelerar compilación
  NEXT_TELEMETRY_DISABLED: '1',
  // Cache más agresivo
  NEXT_CACHE_DISABLED: 'false'
};

// Iniciar Next.js directamente sin verificaciones (sin turbo por compatibilidad)
const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
  stdio: 'inherit',
  shell: true,
  env
});

// Manejar señales de cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor rápido...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM');
  process.exit(0);
});

console.log('🔥 Servidor optimizado para velocidad iniciado en puerto 3000');