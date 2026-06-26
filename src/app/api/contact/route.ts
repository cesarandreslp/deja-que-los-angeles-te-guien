import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

// Configurar transporter de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  consultationType: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()
    const { name, email, phone, subject, message, consultationType } = body

    // Validaciones básicas
    if (!name || !email || !subject || !message || !consultationType) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Guardar mensaje en la base de datos
    const contactMessage = await prisma.contact_messages.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        consultationType,
        status: 'PENDING'
      }
    })

    // Enviar notificación por email al administrador
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px; overflow: hidden;">
        <div style="padding: 30px; text-align: center; background: rgba(255,255,255,0.1);">
          <h1 style="margin: 0; font-size: 28px;">✨ Nuevo Mensaje de Contacto</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Oráculo Angelical</p>
        </div>
        
        <div style="padding: 30px; background: rgba(255,255,255,0.05);">
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #fff;">📋 Información del Contacto</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}
            <p><strong>Tipo de Consulta:</strong> ${consultationType}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
            <h3 style="margin: 0 0 15px 0; color: #fff;">💌 Mensaje</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background: rgba(255,255,255,0.05); font-size: 12px; opacity: 0.8;">
          <p>Mensaje recibido el ${new Date().toLocaleString('es-CO')}</p>
          <p>ID: ${contactMessage.id}</p>
        </div>
      </div>
    `

    try {
      await transporter.sendMail({
        from: `"Oráculo Angelical" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
        subject: `[Oráculo] Nuevo mensaje: ${subject}`,
        html: adminEmailContent,
      })
    } catch (emailError) {
      console.error('Error enviando email de notificación:', emailError)
      // No fallar la request si el email falla, pero log el error
    }

    // Enviar email de confirmación al usuario
    const userEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px; overflow: hidden;">
        <div style="padding: 30px; text-align: center; background: rgba(255,255,255,0.1);">
          <h1 style="margin: 0; font-size: 28px;">✨ Mensaje Recibido</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Oráculo Angelical</p>
        </div>
        
        <div style="padding: 30px; background: rgba(255,255,255,0.05);">
          <p style="font-size: 18px; margin-bottom: 20px;">¡Hola ${name}! 🌟</p>
          
          <p style="line-height: 1.6; margin-bottom: 20px;">
            Los ángeles han recibido tu mensaje y queremos confirmarte que lo hemos registrado exitosamente. 
            Nuestro equipo espiritual revisará tu consulta y te responderemos dentro de las próximas 24 horas.
          </p>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">📝 Resumen de tu mensaje:</h3>
            <p><strong>Asunto:</strong> ${subject}</p>
            <p><strong>Tipo:</strong> ${consultationType}</p>
          </div>
          
          <p style="line-height: 1.6; margin-bottom: 20px;">
            Mientras tanto, puedes explorar nuestros servicios o agendar una consulta directamente 
            desde nuestra plataforma.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/book-consultation" 
               style="background: rgba(255,255,255,0.2); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold; border: 1px solid rgba(255,255,255,0.3);">
              🎥 Agendar Videoconsulta
            </a>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; text-align: center;">
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">
              💫 "No es casualidad que hayas llegado hasta nosotros. Los ángeles han guiado tu camino hacia la luz que necesitas."
            </p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background: rgba(255,255,255,0.05); font-size: 12px; opacity: 0.8;">
          <p>Con amor y luz,<br>Equipo Oráculo Angelical ✨</p>
          <p>Este es un email automático, por favor no respondas a esta dirección.</p>
        </div>
      </div>
    `

    try {
      await transporter.sendMail({
        from: `"Oráculo Angelical" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "✨ Hemos recibido tu mensaje - Oráculo Angelical",
        html: userEmailContent,
      })
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError)
      // No fallar la request si el email falla, pero log el error
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      id: contactMessage.id
    })

  } catch (error) {
    console.error('Error en contact API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}