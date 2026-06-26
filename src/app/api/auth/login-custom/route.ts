import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/utils/auth'
import { loginSchema } from '@/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = loginSchema.parse(body)
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }
    
    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Cuenta no verificada. Revisa tu email para activar tu cuenta.' },
        { status: 401 }
      )
    }
    
    // Verificar contraseña
    const isValidPassword = await verifyPassword(validatedData.password, user.passwordHash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }
    
    // Generar tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.fullName,
      image: user.profileImage ?? undefined,
      role: user.role,
      isActive: user.isActive,
    })
    
    const refreshToken = generateRefreshToken(user.id)
    
    // Actualizar último login (opcional)
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    })
    
    // Configurar cookies httpOnly para el refresh token
    const response = NextResponse.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
      accessToken,
    }, { status: 200 })
    
    // Set refresh token in httpOnly cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    })
    
    return response
    
  } catch (error: any) {
    console.error('Error en login:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}