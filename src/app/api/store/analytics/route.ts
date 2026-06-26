// Analytics API - GET /api/store/analytics
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AnalyticsService } from '../services'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'No autorizado'
        },
        { status: 401 }
      )
    }
    
    const analytics = await AnalyticsService.getStoreAnalytics()
    
    return NextResponse.json({
      success: true,
      analytics
    })
  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener analíticas'
      },
      { status: 500 }
    )
  }
}