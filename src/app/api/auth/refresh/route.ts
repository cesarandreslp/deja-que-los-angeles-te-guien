import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, generateAccessToken } from '@/utils/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Obtener refresh token de las cookies
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token no encontrado' },
        { status: 401 }
      )
    }
    
    // Verificar refresh token
    let decoded
    try {
      decoded = verifyToken(refreshToken)
    } catch (error) {
      return NextResponse.json(
        { error: 'Refresh token inválido' },
        { status: 401 }
      )
    }
    
    if (decoded.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Token tipo inválido' },
        { status: 401 }
      )
    }
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      )
    }
    
    // Generar nuevo access token
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.fullName,
      image: user.profileImage ?? undefined,
      role: user.role,
      isActive: user.isActive,
    })
    
    return NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error en refresh:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}