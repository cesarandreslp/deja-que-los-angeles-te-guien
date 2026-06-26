/**
 * Script para probar la configuración de email con Zoho Mail
 */

const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

// Leer variables de entorno manualmente desde .env.local
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?([^"]+)"?$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '')
  }
})

process.env = { ...process.env, ...envVars }

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  debug: true, // Mostrar información de debug
  logger: true  // Mostrar logs
})

async function testEmail() {
  console.log('📧 Probando configuración de email...\n')
  
  console.log('Configuración:')
  console.log('- Host:', process.env.SMTP_HOST)
  console.log('- Port:', process.env.SMTP_PORT)
  console.log('- Secure:', process.env.SMTP_SECURE)
  console.log('- User:', process.env.SMTP_USER)
  console.log('- Password:', process.env.SMTP_PASSWORD ? '✅ Configurada' : '❌ No configurada')
  console.log('- From:', process.env.EMAIL_FROM)
  console.log('\n')

  try {
    console.log('📤 Enviando email de prueba...\n')
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: 'cesarandres.lopu@gmail.com', // Email del consultor
      subject: '✅ Test Exitoso - Sistema de Videoconsultas Oráculo Angelical',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; }
            .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Configuración Exitosa</h1>
              <p>Sistema de Emails - Oráculo Angelical</p>
            </div>
            <div class="content">
              <div class="success">
                <h2 style="margin-top: 0;">¡Email de Prueba Exitoso! 🎉</h2>
                <p>El sistema de emails está configurado correctamente con Zoho Mail.</p>
              </div>
              
              <div class="info">
                <h3>📋 Información del Sistema:</h3>
                <ul>
                  <li><strong>Servidor SMTP:</strong> ${process.env.SMTP_HOST}</li>
                  <li><strong>Puerto:</strong> ${process.env.SMTP_PORT}</li>
                  <li><strong>Usuario:</strong> ${process.env.SMTP_USER}</li>
                  <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</li>
                </ul>
              </div>
              
              <h3>🎯 Próximos Pasos:</h3>
              <ol>
                <li>Ejecutar: <code>node scripts/setup-test-users.js</code></li>
                <li>Iniciar servidor: <code>npm run dev</code></li>
                <li>Probar reserva de consulta en: <code>http://localhost:3000/book-consultation</code></li>
              </ol>
              
              <h3>📧 Tipos de Emails del Sistema:</h3>
              <ul>
                <li>✉️ Confirmación de consulta (Usuario)</li>
                <li>🔔 Notificación de nueva consulta (Consultor)</li>
                <li>⏰ Recordatorios (24h, 1h, 15min antes)</li>
                <li>❌ Cancelación de consulta</li>
              </ul>
              
              <div class="footer">
                <p>Oráculo Angelical - Sistema de Videoconsultas</p>
                <p>Este es un email de prueba automático</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        ✅ Email de Prueba Exitoso!
        
        El sistema de emails está configurado correctamente.
        
        Fecha: ${new Date().toLocaleString('es-CO')}
        Servidor: ${process.env.SMTP_HOST}
        Puerto: ${process.env.SMTP_PORT}
        Usuario: ${process.env.SMTP_USER}
        
        El sistema de videoconsultas está listo para enviar notificaciones.
      `
    })
    
    console.log('✅ ¡Email enviado exitosamente!\n')
    console.log('📊 Detalles:')
    console.log('- Message ID:', info.messageId)
    console.log('- Accepted:', info.accepted)
    console.log('- Rejected:', info.rejected)
    console.log('- Response:', info.response)
    console.log('\n✉️ Revisa tu correo: cesarandres.lopu@gmail.com')
    console.log('   (También revisa la carpeta de SPAM si no lo ves)\n')
    
  } catch (error) {
    console.error('\n❌ ERROR AL ENVIAR EMAIL:\n')
    console.error('Tipo de error:', error.code || error.message)
    console.error('\nDetalles completos:')
    console.error(error)
    
    console.log('\n🔧 POSIBLES SOLUCIONES:\n')
    
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.log('1. Problema de autenticación:')
      console.log('   - Verifica que SMTP_PASSWORD sea una "Contraseña de Aplicación"')
      console.log('   - Genera una nueva en: https://accounts.zoho.com/home#security/app-password')
      console.log('   - NO uses tu contraseña normal de Zoho')
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.log('2. Problema de conexión:')
      console.log('   - Verifica tu conexión a internet')
      console.log('   - Verifica el firewall/antivirus')
      console.log('   - Prueba cambiar puerto a 465 y SMTP_SECURE a "true"')
    } else if (error.code === 'ENOTFOUND') {
      console.log('3. Host no encontrado:')
      console.log('   - Verifica que SMTP_HOST sea "smtp.zoho.com"')
      console.log('   - Verifica tu DNS')
    }
    
    console.log('\n📖 Documentación completa en: CONFIGURACION_ZOHO_MAIL.md\n')
    process.exit(1)
  }
}

// Verificar que las variables estén configuradas
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  console.error('❌ Error: Variables de entorno no configuradas\n')
  console.log('Asegúrate de tener estas variables en .env.local:\n')
  console.log('SMTP_HOST="smtp.zoho.com"')
  console.log('SMTP_PORT="587"')
  console.log('SMTP_SECURE="false"')
  console.log('SMTP_USER="admin@ossinnovation.com"')
  console.log('SMTP_PASSWORD="tu-contraseña-de-aplicacion"')
  console.log('EMAIL_FROM="Oráculo Angelical <admin@ossinnovation.com>"\n')
  console.log('📖 Ver guía completa: CONFIGURACION_ZOHO_MAIL.md\n')
  process.exit(1)
}

testEmail()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
