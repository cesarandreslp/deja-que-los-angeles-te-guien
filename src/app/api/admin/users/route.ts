import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/users - Obtener lista de usuarios con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (role) where.role = role
    if (isActive !== null) where.isActive = isActive === 'true'
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
          country: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              userConsultations: true,
              consultorConsultations: true,
              orders: true,
              userMemberships: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Estadísticas rápidas
    const stats = await prisma.user.groupBy({
      by: ['role', 'isActive'],
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats
    })

  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Crear nuevo usuario
export async function POST(request: NextRequest) {
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
      email, 
      fullName, 
      password, 
      role = 'USER', 
      country, 
      phone, 
      dateOfBirth, 
      gender,
      isActive = true 
    } = body

    // Validaciones
    if (!email || !fullName || !password) {
      return NextResponse.json(
        { error: 'Email, nombre completo y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role,
        country,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        isActive
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        country: true,
        phone: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}