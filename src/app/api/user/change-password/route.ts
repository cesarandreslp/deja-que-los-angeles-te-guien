import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/utils/middleware'
import { verifyPassword, hashPassword } from '@/utils/auth'
import { changePasswordSchema } from '@/utils/validation'

async function changePassword(request: AuthenticatedRequest) {
  try {
    const body = await (request as any).json()
    
    // Validar datos de entrada
    const validatedData = changePasswordSchema.parse(body)
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: request.user.userId }
    })
    
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Esta cuenta utiliza login con Google y no puede cambiar contraseña' },
        { status: 400 }
      )
    }
    
    // Verificar contraseña actual
    const isValidCurrentPassword = await verifyPassword(
      validatedData.currentPassword, 
      user.passwordHash
    )
    
    if (!isValidCurrentPassword) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 400 }
      )
    }
    
    // Hash de la nueva contraseña
    const newPasswordHash = await hashPassword(validatedData.newPassword)
    
    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    })
    
    return NextResponse.json(
      { message: 'Contraseña actualizada exitosamente' },
      { status: 200 }
    )
    
  } catch (error: any) {
    console.error('Error cambiando contraseña:', error)
    
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

export const PUT = withAuth(changePassword)