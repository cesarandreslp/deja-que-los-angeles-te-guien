// Individual Product API - GET /api/store/products/[id]
import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '../../services'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await ProductService.getProductById(params.id)
    
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Producto no encontrado'
        },
        { status: 404 }
      )
    }
    
    // Get related products
    const relatedProducts = await ProductService.getRelatedProducts(params.id, 4)
    
    return NextResponse.json({
      success: true,
      product,
      relatedProducts
    })
  } catch (error) {
    console.error('Error in product API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener producto'
      },
      { status: 500 }
    )
  }
}