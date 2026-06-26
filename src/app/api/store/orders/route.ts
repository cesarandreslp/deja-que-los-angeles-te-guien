// Orders API - GET /api/store/orders
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { OrderService } from '../services'

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
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const result = await OrderService.getOrders(page, limit)
    
    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error in orders API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener pedidos'
      },
      { status: 500 }
    )
  }
}