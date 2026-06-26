#!/usr/bin/env node

/**
 * Script de verificación de performance - Oráculo de los Arcángeles
 * Verifica que la optimización de carga inicial sea efectiva
 */

const https = require('https')
const http = require('http')

async function measurePageLoad(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const urlObj = new URL(url)
    const client = urlObj.protocol === 'https:' ? https : http
    
    const req = client.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        const endTime = Date.now()
        const loadTime = endTime - startTime
        
        resolve({
          url,
          statusCode: res.statusCode,
          loadTime,
          contentLength: data.length,
          headers: res.headers
        })
      })
    })
    
    req.on('error', reject)
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Timeout: La página tardó más de 10 segundos'))
    })
  })
}

async function testPerformance() {
  console.log('🔮 Iniciando test de performance del Oráculo...\n')
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const testUrls = [
    `${baseUrl}`,
    `${baseUrl}/api/reminders/init`,
    `${baseUrl}/login`,
    `${baseUrl}/memberships`
  ]
  
  const results = []
  
  for (const url of testUrls) {
    try {
      console.log(`📊 Midiendo carga de: ${url}`)
      const result = await measurePageLoad(url)
      results.push(result)
      
      const emoji = result.loadTime < 1000 ? '⚡' : result.loadTime < 3000 ? '🟡' : '🔴'
      console.log(`${emoji} ${result.loadTime}ms - ${result.statusCode} - ${(result.contentLength / 1024).toFixed(1)}KB\n`)
      
    } catch (error) {
      console.error(`❌ Error midiendo ${url}:`, error.message)
      results.push({ url, error: error.message })
    }
  }
  
  // Análisis de resultados
  console.log('📈 ANÁLISIS DE PERFORMANCE')
  console.log('=' * 50)
  
  const pageLoads = results.filter(r => !r.error && !r.url.includes('/api/'))
  const avgLoadTime = pageLoads.reduce((sum, r) => sum + r.loadTime, 0) / pageLoads.length
  
  console.log(`🎯 Tiempo promedio de carga: ${avgLoadTime.toFixed(0)}ms`)
  
  if (avgLoadTime < 1500) {
    console.log('✅ EXCELENTE: Carga inicial optimizada correctamente')
  } else if (avgLoadTime < 3000) {
    console.log('🟡 BUENO: Performance aceptable, pero puede mejorarse')
  } else {
    console.log('❌ CRÍTICO: Performance lenta, revisar optimizaciones')
  }
  
  // Verificar que el endpoint de recordatorios funcione
  const reminderInit = results.find(r => r.url.includes('/api/reminders/init'))
  if (reminderInit && !reminderInit.error) {
    console.log('✅ Sistema de recordatorios lazy: Funcional')
  } else {
    console.log('❌ Sistema de recordatorios lazy: Revisar implementación')
  }
  
  console.log('\n🔮 Test de performance completado')
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  testPerformance().catch(console.error)
}

module.exports = { measurePageLoad, testPerformance }