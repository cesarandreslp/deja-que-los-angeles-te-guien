import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { config, testEmail } = body

    if (!config.enabled) {
      return NextResponse.json(
        { error: 'El servicio de email no está habilitado' },
        { status: 400 }
      )
    }

    // Crear transportador con la configuración
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    })

    // Verificar conexión
    await transporter.verify()

    // Enviar email de prueba
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: testEmail,
      subject: '✅ Prueba de Configuración de Email - Oráculo de los Arcángeles',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">🎉 ¡Configuración Exitosa!</h2>
          <p>Este es un email de prueba para confirmar que la configuración de correo electrónico está funcionando correctamente.</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Detalles de la configuración:</h3>
            <ul style="color: #6B7280;">
              <li><strong>Servidor SMTP:</strong> ${config.smtpHost}</li>
              <li><strong>Puerto:</strong> ${config.smtpPort}</li>
              <li><strong>Usuario:</strong> ${config.smtpUser}</li>
              <li><strong>Email remitente:</strong> ${config.fromEmail}</li>
            </ul>
          </div>
          
          <p style="color: #6B7280;">
            Si recibiste este email, significa que el sistema está listo para enviar:
          </p>
          <ul style="color: #6B7280;">
            <li>Emails de verificación de cuenta</li>
            <li>Enlaces de recuperación de contraseña</li>
            <li>Notificaciones de la aplicación</li>
          </ul>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
            Este email fue enviado desde el panel de administración del Oráculo de los Arcángeles
          </p>
        </div>
      `
    })

    return NextResponse.json({
      message: 'Email de prueba enviado exitosamente',
      messageId: info.messageId
    })

  } catch (error: any) {
    console.error('Error enviando email de prueba:', error)
    
    let errorMessage = 'Error desconocido'
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Error de autenticación. Verifica usuario y contraseña SMTP.'
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Error de conexión. Verifica el servidor y puerto SMTP.'
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Servidor SMTP no encontrado. Verifica la dirección del servidor.'
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: `Error enviando email de prueba: ${errorMessage}` },
      { status: 500 }
    )
  }
}