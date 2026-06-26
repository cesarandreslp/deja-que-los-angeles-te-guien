import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminStats } from '@/utils/stats'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticación
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que sea administrador
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    // Obtener estadísticas
    const stats = await getAdminStats()

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error al obtener estadísticas de admin:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}