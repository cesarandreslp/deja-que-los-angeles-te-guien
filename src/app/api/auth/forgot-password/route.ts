import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/services/EmailService'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      )
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Por seguridad, siempre respondemos exitosamente
    // aunque el email no exista
    const successMessage = 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'

    if (!user || !user.passwordHash) {
      // Usuario no existe o es de Google
      return NextResponse.json({
        success: true,
        message: successMessage
      })
    }

    if (!user.isActive) {
      return NextResponse.json({
        success: true,
        message: successMessage
      })
    }

    // Eliminar tokens de reset anteriores del usuario
    await prisma.password_reset_tokens.deleteMany({
      where: { userId: user.id }
    })

    // Generar token único y fecha de expiración
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 hora

    // Crear nuevo token de reset
    await prisma.password_reset_tokens.create({
      data: {
        token: resetToken,
        userId: user.id,
        expires: expiresAt,
      }
    })

    // URL para resetear contraseña
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    // Enviar email de recuperación
    try {
      await EmailService.sendPasswordResetEmail(email, {
        userName: user.fullName || 'Usuario',
        resetUrl
      })
    } catch (emailError) {
      console.error('❌ Error enviando email de recuperación:', emailError)
      // No fallar por error de email, pero logearlo
    }

    return NextResponse.json({
      success: true,
      message: successMessage
    })

  } catch (error) {
    console.error('❌ Error en forgot-password:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}