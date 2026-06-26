import nodemailer from 'nodemailer'

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Fallback texto plano
    })

    console.log('✅ Email enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error al enviar email:', error)
    return { success: false, error }
  }
}

// Plantillas de emails

export function getConsultationConfirmationEmail(data: {
  userName: string
  consultantName: string
  date: string
  time: string
  duration: number
  videoLink: string
  consultationId: string
}) {
  return {
    subject: `Consulta Confirmada con ${data.consultantName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Consulta Confirmada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${data.userName}</strong>,</p>
            <p>Tu consulta con <strong>${data.consultantName}</strong> ha sido confirmada exitosamente.</p>
            
            <div class="info-box">
              <h3>📅 Detalles de la Consulta</h3>
              <p><strong>Fecha:</strong> ${data.date}</p>
              <p><strong>Hora:</strong> ${data.time}</p>
              <p><strong>Duración:</strong> ${data.duration} minutos</p>
            </div>
            
            <p>Podrás unirte a la videollamada 15 minutos antes de la hora programada.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/videocall/${data.consultationId}" class="button">
                🎥 Ver Detalles de la Consulta
              </a>
            </div>
            
            <div class="info-box">
              <h3>💡 Recomendaciones</h3>
              <ul>
                <li>Asegúrate de tener una buena conexión a internet</li>
                <li>Encuentra un lugar tranquilo y con buena iluminación</li>
                <li>Verifica que tu cámara y micrófono funcionen correctamente</li>
                <li>Ten a mano cualquier pregunta o tema que quieras discutir</li>
              </ul>
            </div>
            
            <p>Recibirás recordatorios antes de tu consulta.</p>
            
            <p>Si necesitas cancelar o reprogramar, por favor hazlo con al menos 24 horas de anticipación.</p>
            
            <div class="footer">
              <p>Oráculo Loguin - Sistema de Videoconsultas</p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export function getConsultationReminderEmail(data: {
  userName: string
  consultantName: string
  date: string
  time: string
  videoLink: string
  consultationId: string
  hoursUntil: number
}) {
  const timeText = data.hoursUntil < 1 
    ? `en ${Math.round(data.hoursUntil * 60)} minutos` 
    : `en ${data.hoursUntil} hora${data.hoursUntil > 1 ? 's' : ''}`

  return {
    subject: `⏰ Recordatorio: Consulta ${timeText}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 40px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 18px; font-weight: bold; }
          .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #f5576c; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Tu consulta es pronto</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2 style="margin-top: 0;">¡No olvides tu consulta!</h2>
              <p style="font-size: 18px; margin: 0;">Tu consulta con <strong>${data.consultantName}</strong> es <strong>${timeText}</strong>.</p>
            </div>
            
            <div class="info-box">
              <p><strong>📅 Fecha:</strong> ${data.date}</p>
              <p><strong>🕐 Hora:</strong> ${data.time}</p>
              <p><strong>👨‍🏫 Consultor:</strong> ${data.consultantName}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/videocall/${data.consultationId}" class="button">
                🎥 Unirme Ahora
              </a>
            </div>
            
            <p style="text-align: center; margin-top: 20px;">
              <small>O copia este enlace: <br><a href="${data.videoLink}">${data.videoLink}</a></small>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export function getConsultationCancelledEmail(data: {
  userName: string
  consultantName: string
  date: string
  time: string
  reason?: string
}) {
  return {
    subject: `Consulta Cancelada con ${data.consultantName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f5576c 0%, #c33764 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #f5576c; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Consulta Cancelada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${data.userName}</strong>,</p>
            <p>Tu consulta con <strong>${data.consultantName}</strong> ha sido cancelada.</p>
            
            <div class="info-box">
              <p><strong>Fecha:</strong> ${data.date}</p>
              <p><strong>Hora:</strong> ${data.time}</p>
              ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ''}
            </div>
            
            <p>Si deseas reagendar, puedes hacerlo en cualquier momento desde nuestro panel de consultas.</p>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/book-consultation" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                Agendar Nueva Consulta
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}
