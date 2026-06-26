import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/middleware'
import { updateProfileSchema } from '@/utils/validation'

// GET - Obtener datos del usuario autenticado
async function getUser(request: AuthenticatedRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.user.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        country: true,
        gender: true,
        phone: true,
        profileImage: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // No incluir passwordHash por seguridad
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user }, { status: 200 })
    
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar datos del usuario
async function updateUser(request: AuthenticatedRequest) {
  try {
    const body = await (request as any).json()
    
    // Validar datos de entrada
    const validatedData = updateProfileSchema.parse(body)
    
    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: request.user.userId },
      data: {
        ...(validatedData.fullName && { fullName: validatedData.fullName }),
        ...(validatedData.country && { country: validatedData.country }),
        ...(validatedData.gender && { gender: validatedData.gender }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
        ...(validatedData.profileImage !== undefined && { profileImage: validatedData.profileImage }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        country: true,
        gender: true,
        phone: true,
        profileImage: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Error actualizando usuario:', error)
    
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

export const GET = withAuth(getUser)
export const PUT = withAuth(updateUser)