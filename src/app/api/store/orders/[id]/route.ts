// Individual Order API - GET /api/store/orders/[id]
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { OrderService } from '../../services'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const order = await OrderService.getOrderById(params.id)
    
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pedido no encontrado'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      order
    })
  } catch (error) {
    console.error('Error in order API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener pedido'
      },
      { status: 500 }
    )
  }
}