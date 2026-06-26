import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AttendanceService from '@/services/AttendanceService'

// GET /api/attendance/report/[id] - Obtener reporte de asistencia de una consulta
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const consultationId = params.id

    if (!consultationId) {
      return NextResponse.json(
        { error: 'ID de consulta requerido' },
        { status: 400 }
      )
    }

    const report = await AttendanceService.generateAttendanceReport(consultationId)

    return NextResponse.json({
      success: true,
      data: report
    })

  } catch (error) {
    console.error('❌ Error obteniendo reporte de asistencia:', error)
    return NextResponse.json(
      { error: 'Error obteniendo reporte de asistencia' },
      { status: 500 }
    )
  }
}