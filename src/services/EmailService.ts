import nodemailer from 'nodemailer'
import { getEmailConfig } from '@/utils/systemConfig'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface VerificationEmailData {
  userName: string
  verificationUrl: string
}

interface PasswordResetEmailData {
  userName: string
  resetUrl: string
}

export class EmailService {
  private static async createTransporter() {
    const config = await getEmailConfig()
    
    if (!config.enabled) {
      throw new Error('El servicio de email no está habilitado')
    }

    if (!config.smtpHost || !config.smtpUser || !config.smtpPassword) {
      throw new Error('Configuración de email incompleta')
    }

    return nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true para 465, false para otros puertos
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
      tls: {
        // No fallar en certificados auto-firmados
        rejectUnauthorized: false
      }
    })
  }

  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const transporter = await this.createTransporter()
      const config = await getEmailConfig()

      const mailOptions = {
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      }

      const info = await transporter.sendMail(mailOptions)
      console.log('✅ Email enviado:', info.messageId)
    } catch (error) {
      console.error('❌ Error enviando email:', error)
      throw error
    }
  }

  static async sendVerificationEmail(email: string, data: VerificationEmailData): Promise<void> {
    const subject = '✅ Verifica tu cuenta - Oráculo de los Arcángeles'
    
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Cuenta</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔮 Oráculo de los Arcángeles</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Bienvenido a tu viaje espiritual</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${data.userName}! 👋</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Gracias por registrarte en el Oráculo de los Arcángeles. Para completar tu registro y acceder a todas nuestras funcionalidades, necesitas verificar tu dirección de correo electrónico.
          </p>
          
          <div style="background: #f8f9ff; border: 2px solid #e3e8ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 16px; color: #4c51bf;">
              <strong>¿Por qué verificar tu email?</strong>
            </p>
            <ul style="margin: 10px 0 0 0; color: #666;">
              <li>Protege tu cuenta</li>
              <li>Recibe notificaciones importantes</li>
              <li>Recupera tu contraseña si la olvidas</li>
              <li>Accede a todas las funciones del oráculo</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              ✨ Verificar mi cuenta
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 14px; word-break: break-all; color: #555;">
            ${data.verificationUrl}
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #888;">
            <p><strong>⚠️ Importante:</strong> Este enlace expira en 24 horas por seguridad.</p>
            <p>Si no solicitaste esta cuenta, puedes ignorar este email.</p>
            <p style="margin-top: 20px;">
              Con cariño,<br>
              <strong>El equipo del Oráculo de los Arcángeles</strong> 🙏
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: email,
      subject,
      html
    })
  }

  static async sendPasswordResetEmail(email: string, data: PasswordResetEmailData): Promise<void> {
    const subject = '🔑 Recupera tu contraseña - Oráculo de los Arcángeles'
    
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar Contraseña</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔮 Oráculo de los Arcángeles</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Recuperación de contraseña</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${data.userName}! 👋</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el Oráculo de los Arcángeles.
          </p>
          
          <div style="background: #fff5f5; border: 2px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 16px; color: #c53030;">
              <strong>🔒 Por tu seguridad:</strong>
            </p>
            <ul style="margin: 10px 0 0 0; color: #666;">
              <li>Este enlace solo funciona una vez</li>
              <li>Expira en 1 hora</li>
              <li>Solo tú puedes usarlo</li>
              <li>Si no solicitaste esto, ignora este email</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);">
              🔑 Restablecer mi contraseña
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:
          </p>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 14px; word-break: break-all; color: #555;">
            ${data.resetUrl}
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #888;">
            <p><strong>❓ ¿No solicitaste esto?</strong></p>
            <p>Tu cuenta está segura. Simplemente ignora este email y tu contraseña no será cambiada.</p>
            <p style="margin-top: 20px;">
              Con cariño,<br>
              <strong>El equipo del Oráculo de los Arcángeles</strong> 🙏
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: email,
      subject,
      html
    })
  }

  static async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    const subject = '🎉 ¡Bienvenido al Oráculo de los Arcángeles!'
    
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #333; margin: 0; font-size: 28px;">🔮 Oráculo de los Arcángeles</h1>
          <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">Tu viaje espiritual comienza aquí</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">¡Bienvenido, ${userName}! 🌟</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Tu cuenta ha sido verificada exitosamente. Ahora puedes acceder a todas las funcionalidades del Oráculo de los Arcángeles.
          </p>
          
          <div style="background: #f0fff4; border: 2px solid #9ae6b4; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 16px; color: #2d5016;">
              <strong>✨ ¿Qué puedes hacer ahora?</strong>
            </p>
            <ul style="margin: 10px 0 0 0; color: #666;">
              <li>🃏 Consultar las cartas del oráculo</li>
              <li>📹 Agendar video consultas con nuestros expertos</li>
              <li>🛍️ Explorar nuestra tienda espiritual</li>
              <li>👤 Personalizar tu perfil</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/login" 
               style="display: inline-block; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(168, 237, 234, 0.4);">
              🚀 Comenzar mi viaje
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #888;">
            <p style="margin-top: 20px;">
              Que los arcángeles guíen tu camino,<br>
              <strong>El equipo del Oráculo de los Arcángeles</strong> 🙏✨
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: email,
      subject,
      html
    })
  }
}