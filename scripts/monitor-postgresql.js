#!/usr/bin/env node

/**
 * Monitor de conexiones PostgreSQL - Oráculo de los Arcángeles
 * Monitorea las conexiones en tiempo real para detectar errores
 */

const { PrismaClient } = require('@prisma/client')

let connectionCount = 0
let errorCount = 0
let lastError = null

const prisma = new PrismaClient({
  log: [
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
})

// Escuchar errores de Prisma
prisma.$on('error', (e) => {
  errorCount++
  lastError = {
    timestamp: new Date().toISOString(),
    message: e.message,
    target: e.target
  }
  console.error(`❌ [${lastError.timestamp}] Prisma Error:`, e.message)
})

prisma.$on('warn', (e) => {
  console.warn(`⚠️ [${new Date().toISOString()}] Prisma Warning:`, e.message)
})

async function monitorConnections() {
  console.log('🔍 MONITOR DE CONEXIONES POSTGRESQL')
  console.log('=' .repeat(50))
  console.log('⏰ Iniciado:', new Date().toISOString())
  console.log('🎯 Presiona Ctrl+C para detener\n')

  const startTime = Date.now()
  
  setInterval(async () => {
    try {
      connectionCount++
      const start = Date.now()
      
      // Consulta simple para mantener conexión activa
      await prisma.$queryRaw`SELECT 1 as ping`
      
      const duration = Date.now() - start
      const uptime = Math.floor((Date.now() - startTime) / 1000)
      
      console.log(`✅ [PING ${connectionCount}] ${duration}ms - Uptime: ${uptime}s - Errores: ${errorCount}`)
      
      if (lastError) {
        console.log(`   🔍 Último error: ${lastError.timestamp} - ${lastError.message}`)
        lastError = null // Reset después de mostrar
      }
      
    } catch (error) {
      errorCount++
      console.error(`❌ [PING ${connectionCount}] Error:`, error.message)
      
      // Intentar reconectar si falla
      try {
        await prisma.$disconnect()
        await prisma.$connect()
        console.log('🔄 Reconexión exitosa')
      } catch (reconnectError) {
        console.error('💥 Error en reconexión:', reconnectError.message)
      }
    }
  }, 5000) // Cada 5 segundos
}

// Manejo de cierre limpio
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando monitor...')
  await prisma.$disconnect()
  
  const summary = {
    conexiones: connectionCount,
    errores: errorCount,
    tasa_error: errorCount > 0 ? ((errorCount / connectionCount) * 100).toFixed(2) + '%' : '0%'
  }
  
  console.log('\n📊 RESUMEN:')
  console.log('   Conexiones totales:', summary.conexiones)
  console.log('   Errores detectados:', summary.errores)
  console.log('   Tasa de error:', summary.tasa_error)
  
  process.exit(0)
})

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  monitorConnections().catch(console.error)
}

module.exports = { monitorConnections }