import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getConsultorStats } from '@/utils/stats'

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

    // Verificar que sea consultor o admin
    if (session.user.role !== 'CONSULTANT' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo consultores y administradores.' },
        { status: 403 }
      )
    }

    // Si es admin, puede ver estadísticas de cualquier consultor
    let consultorId = session.user.id

    // Si es admin y se especifica un consultorId en query params
    if (session.user.role === 'ADMIN') {
      const { searchParams } = new URL(request.url)
      const queryConsultorId = searchParams.get('consultorId')
      if (queryConsultorId) {
        consultorId = queryConsultorId
      }
    }

    // Obtener estadísticas
    const stats = await getConsultorStats(consultorId)

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error al obtener estadísticas de consultor:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}