import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserStats } from '@/utils/stats'

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

    // Los usuarios solo pueden ver sus propias estadísticas
    // Los admins pueden ver las estadísticas de cualquier usuario
    let userId = session.user.id

    if (session.user.role === 'ADMIN') {
      const { searchParams } = new URL(request.url)
      const queryUserId = searchParams.get('userId')
      if (queryUserId) {
        userId = queryUserId
      }
    }

    // Obtener estadísticas
    const stats = await getUserStats(userId)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error al obtener estadísticas de usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}