const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanAuthData() {
  try {
    console.log('🧹 Limpiando datos de autenticación problemáticos...')
    
    // Limpiar sesiones de NextAuth si existen tablas
    try {
      await prisma.session.deleteMany({})
      console.log('✅ Sesiones de NextAuth limpiadas')
    } catch (error) {
      console.log('ℹ️ No hay tabla de sesiones (usando JWT)')
    }
    
    try {
      await prisma.account.deleteMany({})
      console.log('✅ Cuentas OAuth limpiadas')
    } catch (error) {
      console.log('ℹ️ No hay tabla de cuentas OAuth')
    }
    
    try {
      await prisma.verificationToken.deleteMany({})
      console.log('✅ Tokens de verificación limpiados')
    } catch (error) {
      console.log('ℹ️ No hay tabla de tokens de verificación')
    }
    
    console.log('\n🔧 Recomendaciones para resolver errores 401:')
    console.log('1. 🍪 Limpiar cookies del navegador:')
    console.log('   - Abre DevTools (F12)')
    console.log('   - Ve a Application > Storage')
    console.log('   - Limpia Cookies para localhost:3004')
    console.log('')
    console.log('2. 🔄 Reiniciar servidor:')
    console.log('   - Presiona Ctrl+C para detener')
    console.log('   - Ejecuta: npm run dev')
    console.log('')
    console.log('3. 🔐 Verificar credenciales:')
    console.log('   - Email: admin@oraculo.com')
    console.log('   - Password: admin123456')
    console.log('')
    console.log('4. 🌐 Usar modo incógnito para testing')
    
  } catch (error) {
    console.error('❌ Error limpiando datos de auth:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanAuthData()