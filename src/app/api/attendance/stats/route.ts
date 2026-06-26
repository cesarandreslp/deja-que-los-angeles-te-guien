import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AttendanceService from '@/services/AttendanceService'

// GET /api/attendance/stats - Obtener estadísticas generales de asistencia
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    let startDate, endDate

    if (startDateStr) {
      startDate = new Date(startDateStr)
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Fecha de inicio inválida' },
          { status: 400 }
        )
      }
    }

    if (endDateStr) {
      endDate = new Date(endDateStr)
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Fecha de fin inválida' },
          { status: 400 }
        )
      }
    }

    const stats = await AttendanceService.getAttendanceStats(startDate, endDate)

    return NextResponse.json({
      success: true,
      data: stats,
      period: {
        startDate: startDate?.toISOString() || null,
        endDate: endDate?.toISOString() || null
      }
    })

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de asistencia:', error)
    return NextResponse.json(
      { error: 'Error obteniendo estadísticas de asistencia' },
      { status: 500 }
    )
  }
}

// POST /api/attendance/stats - Ejecutar verificación manual de no-shows
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      )
    }

    const { action } = await request.json()

    if (action === 'check_no_shows') {
      await AttendanceService.checkNoShows()
      
      return NextResponse.json({
        success: true,
        message: 'Verificación de no-shows ejecutada correctamente'
      })
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Error en acción de estadísticas:', error)
    return NextResponse.json(
      { error: 'Error ejecutando acción' },
      { status: 500 }
    )
  }
}