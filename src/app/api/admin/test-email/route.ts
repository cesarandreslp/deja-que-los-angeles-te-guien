import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/services/EmailService'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario sea administrador (opcional por ahora)
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { type, email, data } = await request.json()

    if (!type || !email) {
      return NextResponse.json(
        { error: 'Tipo de email y destinatario son requeridos' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'verification':
        result = await EmailService.sendVerificationEmail(email, {
          userName: data?.userName || 'Usuario de Prueba',
          verificationUrl: data?.verificationUrl || `${process.env.NEXTAUTH_URL}/verify-email?token=test-token`
        })
        break

      case 'password-reset':
        result = await EmailService.sendPasswordResetEmail(email, {
          userName: data?.userName || 'Usuario de Prueba',
          resetUrl: data?.resetUrl || `${process.env.NEXTAUTH_URL}/reset-password?token=test-token`
        })
        break

      case 'welcome':
        result = await EmailService.sendWelcomeEmail(
          email,
          data?.userName || 'Usuario de Prueba'
        )
        break

      case 'custom':
        result = await EmailService.sendEmail({
          to: email,
          subject: data?.subject || 'Email de Prueba',
          html: data?.html || '<h1>Este es un email de prueba</h1><p>Sistema funcionando correctamente.</p>'
        })
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de email no válido' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Email de tipo "${type}" enviado exitosamente a ${email}`
    })

  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error)
    
    return NextResponse.json(
      { 
        error: 'Error enviando email',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}