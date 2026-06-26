import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isTokenExpired } from '@/utils/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación requerido' },
        { status: 400 }
      )
    }
    
    // Buscar el token de verificación
    const verificationToken = await prisma.verification_tokens.findUnique({
      where: { token },
      include: { user: true }
    })
    
    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token de verificación inválido' },
        { status: 400 }
      )
    }
    
    // Verificar si el token ha expirado
    if (isTokenExpired(verificationToken.expires)) {
      // Eliminar token expirado
      await prisma.verification_tokens.delete({
        where: { id: verificationToken.id }
      })
      
      return NextResponse.json(
        { error: 'Token de verificación expirado' },
        { status: 400 }
      )
    }
    
    // Activar la cuenta del usuario
    await prisma.user.update({
      where: { id: verificationToken.userId! },
      data: { isActive: true }
    })
    
    // Eliminar el token usado
    await prisma.verification_tokens.delete({
      where: { id: verificationToken.id }
    })
    
    // Redirigir a página de éxito o login
    return NextResponse.redirect(
      new URL('/login?verified=true', request.url)
    )
    
  } catch (error) {
    console.error('Error en verificación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}