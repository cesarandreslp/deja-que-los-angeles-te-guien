import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true para port 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verifica tu cuenta - Oráculo de los Arcángeles',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb; text-align: center;">¡Bienvenido al Oráculo de los Arcángeles!</h2>
        <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verificar mi cuenta
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Este enlace expirará en 24 horas por motivos de seguridad.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Si no te registraste en nuestra plataforma, puedes ignorar este correo.
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email de verificación enviado a:', email)
  } catch (error) {
    console.error('Error enviando email de verificación:', error)
    throw new Error('Error enviando email de verificación')
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Recuperar contraseña - Oráculo de los Arcángeles',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb; text-align: center;">Recuperar contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Este enlace expirará en 1 hora por motivos de seguridad.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email de recuperación enviado a:', email)
  } catch (error) {
    console.error('Error enviando email de recuperación:', error)
    throw new Error('Error enviando email de recuperación')
  }
}

// ============ EMAILS DE MEMBRESÍAS ============

export async function sendMembershipActivationEmail(
  email: string, 
  userName: string, 
  planName: string, 
  endDate: string,
  planPrice: string,
  currency: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🎉 ¡Tu membresía está activa! - Oráculo de los Arcángeles',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb; text-align: center;">¡Membresía Activada! 🎉</h2>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>¡Excelentes noticias! Tu membresía <strong>${planName}</strong> ha sido activada exitosamente.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #2563eb;">Detalles de tu membresía:</h3>
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 5px 0;"><strong>Precio:</strong> $${planPrice} ${currency}</p>
          <p style="margin: 5px 0;"><strong>Válida hasta:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/my-membership" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Ver Mi Membresía
          </a>
        </div>

        <h3 style="color: #2563eb;">¿Qué puedes hacer ahora?</h3>
        <ul style="color: #666;">
          <li>Acceder a consultas premium con nuestros especialistas</li>
          <li>Obtener lecturas detalladas del oráculo angelical</li>
          <li>Explorar productos exclusivos en nuestra tienda VIP</li>
          <li>Recibir contenido personalizado y prioritario</li>
        </ul>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Gracias por confiar en el Oráculo de los Arcángeles ✨
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email de activación de membresía enviado a:', email)
  } catch (error) {
    console.error('Error enviando email de activación:', error)
    throw new Error('Error enviando email de activación de membresía')
  }
}

export async function sendMembershipExpirationWarning(
  email: string, 
  userName: string, 
  planName: string, 
  daysRemaining: number,
  endDate: string
) {
  const urgencyLevel = daysRemaining <= 1 ? 'urgent' : daysRemaining <= 3 ? 'warning' : 'early_warning'
  const colors = {
    urgent: { primary: '#dc2626', secondary: '#fef2f2', border: '#fecaca' },
    warning: { primary: '#d97706', secondary: '#fffbeb', border: '#fed7aa' },
    early_warning: { primary: '#2563eb', secondary: '#f8fafc', border: '#93c5fd' }
  }
  const color = colors[urgencyLevel]

  const subjects = {
    urgent: '🚨 ¡URGENTE! Tu membresía vence mañana',
    warning: '⚠️ Tu membresía vence en 3 días - ¡Renueva ahora!',
    early_warning: '⏰ Tu membresía vence en 7 días - Renueva para continuar'
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subjects[urgencyLevel],
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: ${color.primary}; text-align: center;">
          ${daysRemaining === 1 ? '¡Tu membresía vence mañana!' : `Tu membresía vence en ${daysRemaining} días`}
        </h2>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Tu membresía <strong>${planName}</strong> está próxima a vencer.</p>
        
        <div style="background-color: ${color.secondary}; border-left: 4px solid ${color.primary}; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: ${color.primary};">⏰ Información importante:</h3>
          <p style="margin: 5px 0;"><strong>Plan actual:</strong> ${planName}</p>
          <p style="margin: 5px 0;"><strong>Vence el:</strong> ${new Date(endDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Días restantes:</strong> ${daysRemaining}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/memberships" 
             style="background-color: ${color.primary}; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Renovar Membresía
          </a>
        </div>

        <h3 style="color: ${color.primary};">¿Por qué renovar?</h3>
        <ul style="color: #666;">
          <li>Mantén acceso a todas las funciones premium</li>
          <li>No pierdas tu historial y preferencias</li>
          <li>Continúa recibiendo contenido exclusivo</li>
          <li>Consultas ilimitadas con nuestros especialistas</li>
        </ul>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          ¿Necesitas ayuda? <a href="${process.env.NEXTAUTH_URL}/soporte">Contacta nuestro soporte</a>
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email de advertencia (${daysRemaining} días) enviado a:`, email)
  } catch (error) {
    console.error('Error enviando email de advertencia:', error)
    throw new Error('Error enviando email de advertencia de membresía')
  }
}

export async function sendMembershipExpiredEmail(
  email: string, 
  userName: string, 
  planName: string,
  expiredDate: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '😔 Tu membresía ha expirado - Reactívala ahora',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626; text-align: center;">Tu membresía ha expirado</h2>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Lamentamos informarte que tu membresía <strong>${planName}</strong> expiró el ${new Date(expiredDate).toLocaleDateString()}.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">¿Qué significa esto?</h3>
          <ul style="margin: 10px 0; color: #666;">
            <li>Ya no tienes acceso a las funciones premium</li>
            <li>Las consultas especializadas están limitadas</li>
            <li>No puedes acceder a contenido exclusivo</li>
            <li>La tienda VIP no está disponible</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/memberships" 
             style="background-color: #dc2626; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Renovar Ahora
          </a>
        </div>

        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #0ea5e9;">🎁 Oferta especial</h3>
          <p style="margin: 0; color: #666;">
            Renueva en los próximos 7 días y mantén todos tus beneficios sin interrupciones.
            ¡Tu experiencia premium te está esperando!
          </p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Esperamos verte pronto de vuelta ✨
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email de membresía expirada enviado a:', email)
  } catch (error) {
    console.error('Error enviando email de expiración:', error)
    throw new Error('Error enviando email de membresía expirada')
  }
}