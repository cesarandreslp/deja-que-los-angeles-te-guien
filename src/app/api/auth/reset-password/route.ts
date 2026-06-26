import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Buscar token de reset
    const resetToken = await prisma.password_reset_tokens.findUnique({
      where: { token },
      include: { user: true }
    })
    
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token de recuperación inválido' },
        { status: 400 }
      )
    }
    
    // Verificar si el token ha expirado
    if (new Date() > resetToken.expires) {
      // Eliminar token expirado
      await prisma.password_reset_tokens.delete({
        where: { id: resetToken.id }
      })
      
      return NextResponse.json(
        { error: 'Token de recuperación expirado' },
        { status: 400 }
      )
    }
    
    // Verificar que el usuario tenga contraseña (no sea de Google)
    if (!resetToken.user.passwordHash) {
      return NextResponse.json(
        { error: 'Esta cuenta utiliza login con Google' },
        { status: 400 }
      )
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { 
        passwordHash: hashedPassword
      }
    })

    // Eliminar el token usado
    await prisma.password_reset_tokens.delete({
      where: { id: resetToken.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en reset-password:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}