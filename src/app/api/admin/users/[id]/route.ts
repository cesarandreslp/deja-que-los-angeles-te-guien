import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/users/[id] - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            userConsultations: true,
            consultorConsultations: true,
            orders: true,
            userMemberships: true,
            commissions: true
          }
        },
        userMemberships: {
          where: { status: 'ACTIVE' },
          include: {
            membershipPlan: {
              select: {
                name: true,
                priceCents: true,
                currency: true
              }
            }
          },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Remover datos sensibles
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      fullName,
      email,
      role,
      isActive,
      country,
      phone,
      dateOfBirth,
      gender,
      password
    } = body

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si se cambió el email, verificar que no esté en uso
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email }
      })

      if (emailInUse) {
        return NextResponse.json(
          { error: 'El email ya está en uso' },
          { status: 400 }
        )
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {}
    if (fullName) updateData.fullName = fullName
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (country) updateData.country = country
    if (phone) updateData.phone = phone
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth)
    if (gender) updateData.gender = gender

    // Si se proporciona nueva contraseña
    if (password && password.trim()) {
      updateData.passwordHash = await bcrypt.hash(password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        country: true,
        phone: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Desactivar usuario (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // No permitir que el admin se elimine a sí mismo
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminarte a ti mismo' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Desactivar usuario en lugar de eliminarlo
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario desactivado correctamente',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}