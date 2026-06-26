// Store API Routes - RESTful endpoints following Shopify patterns
import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '../services'
import { ProductCategory, ProductSortOption } from '@/types/store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category') || 'all'
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
    const inStock = searchParams.get('inStock') === 'true'
    
    // Parse price range
    let priceRange
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice && maxPrice) {
      priceRange = {
        min: parseInt(minPrice),
        max: parseInt(maxPrice)
      }
    }
    
    // Validar categoría
    const validCategory: ProductCategory | 'all' | undefined = category === 'all' 
      ? 'all' 
      : Object.values(ProductCategory).includes(category as ProductCategory) 
        ? (category as ProductCategory) 
        : undefined

    // Validar sortBy
    const validSortBy = Object.values(ProductSortOption).includes(sortBy as ProductSortOption)
      ? (sortBy as ProductSortOption)
      : ProductSortOption.CREATED_AT

    const filters = {
      category: validCategory,
      search: search || undefined,
      sortBy: validSortBy,
      sortOrder,
      priceRange,
      inStock
    }
    
    const result = await ProductService.getProducts(filters, page, limit)
    
    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error in products API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener productos'
      },
      { status: 500 }
    )
  }
}