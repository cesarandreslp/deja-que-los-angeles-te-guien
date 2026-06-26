// Custom hook for products management - Professional e-commerce functionality
// Optimized for both admin and public store views

import { useState, useEffect, useCallback } from 'react'
import { Product, ProductFilters, PaginatedResponse, ProductSortOption } from '@/types/store'

interface UseProductsOptions {
  initialFilters?: ProductFilters
  autoFetch?: boolean
  pageSize?: number
}

interface UseProductsReturn {
  products: Product[]
  filteredProducts: Product[]
  isLoading: boolean
  error: string | null
  filters: ProductFilters
  pagination: {
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
    total: number
  }
  // Actions
  fetchProducts: () => Promise<void>
  setFilters: (filters: Partial<ProductFilters>) => void
  resetFilters: () => void
  searchProducts: (query: string) => void
  goToPage: (page: number) => void
  refreshProducts: () => Promise<void>
}

const defaultFilters: ProductFilters = {
  category: 'all',
  sortBy: ProductSortOption.CREATED_AT,
  sortOrder: 'desc'
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    initialFilters = defaultFilters,
    autoFetch = true,
    pageSize = 12
  } = options

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<ProductFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    total: 0
  })

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      
      // Add filters to query
      if (filters.category && filters.category !== 'all') {
        queryParams.append('category', filters.category)
      }
      if (filters.search) {
        queryParams.append('search', filters.search)
      }
      if (filters.priceRange) {
        queryParams.append('minPrice', (filters.priceRange.min / 100).toString())
        queryParams.append('maxPrice', (filters.priceRange.max / 100).toString())
      }
      if (filters.inStock !== undefined) {
        queryParams.append('inStock', filters.inStock.toString())
      }
      if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy)
      }
      if (filters.sortOrder) {
        queryParams.append('sortOrder', filters.sortOrder)
      }
      
      // Add pagination
      queryParams.append('page', pagination.page.toString())
      queryParams.append('limit', pageSize.toString())

      const response = await fetch(`/api/products?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar productos angelicales')
      }

      const data: PaginatedResponse<Product> = await response.json()
      
      setProducts(data.data)
      setFilteredProducts(data.data)
      setPagination({
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        hasNext: data.pagination.hasNext,
        hasPrev: data.pagination.hasPrev,
        total: data.pagination.total
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, pagination.page, pageSize])

  // Set filters with validation
  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters }
      
      // Reset to first page when filters change
      setPagination(prev => ({ ...prev, page: 1 }))
      
      return updated
    })
  }, [])

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  // Search products with debouncing
  const searchProducts = useCallback((query: string) => {
    setFilters({ search: query })
  }, [setFilters])

  // Navigate to specific page
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }))
    }
  }, [pagination.totalPages])

  // Refresh products (force refetch)
  const refreshProducts = useCallback(async () => {
    await fetchProducts()
  }, [fetchProducts])

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchProducts()
    }
  }, [fetchProducts, autoFetch])

  // Client-side filtering for immediate response (optional optimization)
  useEffect(() => {
    let filtered = [...products]

    // Apply client-side search if needed (for better UX)
    if (filters.search && products.length > 0) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    setFilteredProducts(filtered)
  }, [products, filters.search])

  return {
    products,
    filteredProducts,
    isLoading,
    error,
    filters,
    pagination,
    fetchProducts,
    setFilters,
    resetFilters,
    searchProducts,
    goToPage,
    refreshProducts
  }
}

// Hook for single product management
interface UseProductOptions {
  productId?: string
  slug?: string
  autoFetch?: boolean
}

interface UseProductReturn {
  product: Product | null
  isLoading: boolean
  error: string | null
  relatedProducts: Product[]
  fetchProduct: () => Promise<void>
  refreshProduct: () => Promise<void>
}

export function useProduct(options: UseProductOptions = {}): UseProductReturn {
  const { productId, slug, autoFetch = true } = options
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    if (!productId && !slug) return

    try {
      setIsLoading(true)
      setError(null)

      const identifier = productId || slug
      const response = await fetch(`/api/products/${identifier}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado')
        }
        throw new Error('Error al cargar producto')
      }

      const data = await response.json()
      setProduct(data.product)
      setRelatedProducts(data.relatedProducts || [])

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error fetching product:', error)
    } finally {
      setIsLoading(false)
    }
  }, [productId, slug])

  const refreshProduct = useCallback(async () => {
    await fetchProduct()
  }, [fetchProduct])

  useEffect(() => {
    if (autoFetch && (productId || slug)) {
      fetchProduct()
    }
  }, [fetchProduct, autoFetch, productId, slug])

  return {
    product,
    isLoading,
    error,
    relatedProducts,
    fetchProduct,
    refreshProduct
  }
}