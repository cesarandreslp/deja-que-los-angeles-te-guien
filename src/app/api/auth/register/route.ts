import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateRandomToken } from '@/utils/auth'
import { sendVerificationEmail } from '@/utils/email'
import { registerSchema } from '@/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = registerSchema.parse(body)
    
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }
    
    // Hash de la contraseña
    const passwordHash = await hashPassword(validatedData.password)
    
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        passwordHash,
        dateOfBirth: validatedData.dateOfBirth,
        country: validatedData.country,
        gender: validatedData.gender,
        phone: validatedData.phone || null,
        isActive: true, // Activar inmediatamente para mejor UX
      }
    })
    
    // Generar token de verificación
    const verificationToken = generateRandomToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    
    await prisma.verification_tokens.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: expiresAt,
        userId: user.id,
      }
    })
    
    // Enviar email de verificación
    try {
      await sendVerificationEmail(user.email, verificationToken)
    } catch (emailError) {
      console.error('Error enviando email:', emailError)
      // No fallar el registro por error de email, pero logearlo
    }
    
    return NextResponse.json({
      message: '¡Registro exitoso! Tu cuenta ha sido creada.',
      userId: user.id
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Error en registro:', error)
    
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