// Search API - GET /api/store/search
import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '../services'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        results: []
      })
    }
    
    const results = await ProductService.searchProducts(query, limit)
    
    return NextResponse.json({
      success: true,
      results,
      query
    })
  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error en la búsqueda'
      },
      { status: 500 }
    )
  }
}