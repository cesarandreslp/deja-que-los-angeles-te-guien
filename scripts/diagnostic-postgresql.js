#!/usr/bin/env node

/**
 * Script de diagnóstico para PostgreSQL/Neon - Oráculo de los Arcángeles
 * Detecta problemas específicos de conexión a la base de datos
 */

const { PrismaClient } = require('@prisma/client')

async function diagnosticPostgreSQL() {
  console.log('🔍 DIAGNÓSTICO DE POSTGRESQL/NEON')
  console.log('=' .repeat(50))
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'info', 'warn'],
  })

  try {
    console.log('📊 1. Información de la conexión:')
    console.log('   DATABASE_URL presente:', !!process.env.DATABASE_URL)
    console.log('   URL (parcial):', process.env.DATABASE_URL?.substring(0, 30) + '...')
    
    console.log('\n🔌 2. Probando conexión básica...')
    await prisma.$connect()
    console.log('   ✅ Conexión establecida')
    
    console.log('\n📋 3. Probando consulta simple...')
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`
    console.log('   ✅ Consulta exitosa:', result[0])
    
    console.log('\n🏗️  4. Verificando esquema de tablas...')
    try {
      const userCount = await prisma.user.count()
      console.log('   ✅ Tabla users:', userCount, 'registros')
    } catch (error) {
      console.log('   ❌ Error tabla users:', error.message)
    }
    
    try {
      const configCount = await prisma.appConfig.count()
      console.log('   ✅ Tabla appConfig:', configCount, 'registros')
    } catch (error) {
      console.log('   ❌ Error tabla appConfig:', error.message)
    }
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO - Sin errores detectados')
    
  } catch (error) {
    console.error('\n❌ ERROR DETECTADO:')
    console.error('   Tipo:', error.constructor.name)
    console.error('   Mensaje:', error.message)
    console.error('   Código:', error.code)
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n🌐 PROBLEMA: No se puede resolver el DNS')
      console.error('   Solución: Verificar conexión a internet')
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n🚫 PROBLEMA: Conexión rechazada')
      console.error('   Solución: Base de datos pausada o credenciales incorrectas')
    }
    
    if (error.message.includes('timeout')) {
      console.error('\n⏰ PROBLEMA: Timeout de conexión')
      console.error('   Solución: Red lenta o base de datos sobrecargada')
    }
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n🔑 PROBLEMA: Credenciales incorrectas')
      console.error('   Solución: Verificar DATABASE_URL')
    }
    
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Conexión cerrada')
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  diagnosticPostgreSQL()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Error crítico:', error)
      process.exit(1)
    })
}

module.exports = { diagnosticPostgreSQL }