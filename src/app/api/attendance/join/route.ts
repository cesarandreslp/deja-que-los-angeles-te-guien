import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AttendanceService from '@/services/AttendanceService'

// POST /api/attendance/join - Registrar entrada a videollamada
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const { consultationId, role } = await request.json()

    if (!consultationId || !role) {
      return NextResponse.json(
        { error: 'consultationId y role son requeridos' },
        { status: 400 }
      )
    }

    if (!['user', 'consultant'].includes(role)) {
      return NextResponse.json(
        { error: 'role debe ser "user" o "consultant"' },
        { status: 400 }
      )
    }

    // Obtener información del cliente
    const clientInfo = {
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'Unknown',
      device: request.headers.get('sec-ch-ua-platform') || 'Unknown'
    }

    let result
    if (role === 'user') {
      result = await AttendanceService.recordUserJoined(consultationId, clientInfo)
    } else {
      result = await AttendanceService.recordConsultantJoined(consultationId, clientInfo)
    }

    return NextResponse.json({
      success: true,
      message: `${role === 'user' ? 'Usuario' : 'Consultor'} registrado como conectado`,
      data: {
        consultationId: result.id,
        attendanceStatus: result.attendanceStatus,
        joinedAt: role === 'user' ? result.userJoinedAt : result.consultorJoinedAt,
        actualStartTime: result.actualStartTime
      }
    })

  } catch (error) {
    console.error('❌ Error registrando entrada:', error)
    return NextResponse.json(
      { error: 'Error registrando entrada a videollamada' },
      { status: 500 }
    )
  }
}

// DELETE /api/attendance/join - Registrar salida de videollamada
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const consultationId = searchParams.get('consultationId')
    const role = searchParams.get('role')

    if (!consultationId || !role) {
      return NextResponse.json(
        { error: 'consultationId y role son requeridos' },
        { status: 400 }
      )
    }

    if (!['user', 'consultant'].includes(role)) {
      return NextResponse.json(
        { error: 'role debe ser "user" o "consultant"' },
        { status: 400 }
      )
    }

    let result
    if (role === 'user') {
      result = await AttendanceService.recordUserLeft(consultationId)
    } else {
      result = await AttendanceService.recordConsultantLeft(consultationId)
    }

    return NextResponse.json({
      success: true,
      message: `${role === 'user' ? 'Usuario' : 'Consultor'} registrado como desconectado`,
      data: {
        consultationId: result.id,
        attendanceStatus: result.attendanceStatus,
        leftAt: role === 'user' ? result.userLeftAt : result.consultorLeftAt,
        actualEndTime: result.actualEndTime,
        actualDuration: result.actualDuration
      }
    })

  } catch (error) {
    console.error('❌ Error registrando salida:', error)
    return NextResponse.json(
      { error: 'Error registrando salida de videollamada' },
      { status: 500 }
    )
  }
}