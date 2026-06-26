// Product Grid Component - FASE 6 Integración Temática Completa
'use client'

import { useState, useEffect } from 'react'
import { Product, ProductFilters } from '@/types/store'
import { useProducts } from '@/hooks/store/useProducts'
import { useTheme } from '@/context/ThemeContext'
import ProductCard from './ProductCard'
import { 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  SparklesIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface ProductGridProps {
  category?: string
  searchQuery?: string
  initialProducts?: Product[]
  showFilters?: boolean
  viewMode?: 'grid' | 'list'
  angelicalMode?: boolean
}

export default function ProductGrid({ 
  category, 
  searchQuery, 
  initialProducts,
  showFilters = true,
  viewMode: propViewMode = 'grid',
  angelicalMode = false
}: ProductGridProps) {
  const { currentTheme } = useTheme()
  const [products, setProducts] = useState<Product[]>(initialProducts || [])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<ProductFilters>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(propViewMode)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  })
  
  // Update filters when props change
  useEffect(() => {
    const newFilters: ProductFilters = {}
    if (category && category !== 'all') newFilters.category = category as any
    if (searchQuery) newFilters.search = searchQuery
    setFilters(newFilters)
    fetchProducts(newFilters)
  }, [category, searchQuery])

  const fetchProducts = async (filterParams: ProductFilters = {}) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (filterParams.category) queryParams.set('category', filterParams.category)
      if (filterParams.search) queryParams.set('search', filterParams.search)
      if (filterParams.sortBy) queryParams.set('sortBy', filterParams.sortBy)
      if (filterParams.priceRange?.min) queryParams.set('minPrice', filterParams.priceRange.min.toString())
      if (filterParams.priceRange?.max) queryParams.set('maxPrice', filterParams.priceRange.max.toString())
      if (filterParams.inStock) queryParams.set('inStock', 'true')

      const response = await fetch(`/api/store/products?${queryParams}`)
      if (!response.ok) throw new Error('Error fetching products')
      
      const data = await response.json()
      setProducts(data.products || [])
      setPagination(data.pagination || {
        page: 1,
        totalPages: 1,
        total: data.products?.length || 0,
        hasNext: false,
        hasPrev: false
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters: ProductFilters) => {
    setFilters(newFilters)
    fetchProducts(newFilters)
  }
  
  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    updateFilters({ [key]: value })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchInput })
  }

  const clearFilters = () => {
    setFilters({})
    setSearchInput('')
    fetchProducts({})
  }

  // Categorías angelicales
  const angelicalCategories = [
    { value: 'all', label: 'Todas las Bendiciones', icon: '✨' },
    { value: 'protection', label: 'Protección Angelical', icon: '🛡️' },
    { value: 'love', label: 'Amor Divino', icon: '💖' },
    { value: 'abundance', label: 'Abundancia Celestial', icon: '🌟' },
    { value: 'healing', label: 'Sanación Espiritual', icon: '🕊️' },
    { value: 'wisdom', label: 'Sabiduría Arcangélica', icon: '📚' },
    { value: 'energy', label: 'Energía Purificadora', icon: '🔮' }
  ]

  const standardCategories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'crystals', label: 'Cristales' },
    { value: 'candles', label: 'Velas' },
    { value: 'incense', label: 'Inciensos' },
    { value: 'oils', label: 'Aceites' },
    { value: 'books', label: 'Libros' },
    { value: 'jewelry', label: 'Joyería' }
  ]
  
  const sortOptions = angelicalMode ? [
    { value: 'blessing', label: 'Bendición Angelical' },
    { value: 'energy', label: 'Nivel de Energía' },
    { value: 'createdAt', label: 'Más recientes' },
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'price', label: 'Precio: menor a mayor' },
    { value: 'popularity', label: 'Más populares' }
  ] : [
    { value: 'createdAt', label: 'Más recientes' },
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'price', label: 'Precio: menor a mayor' },
    { value: 'popularity', label: 'Más populares' }
  ]

  const categories = angelicalMode ? angelicalCategories : standardCategories
  const [searchInput, setSearchInput] = useState(searchQuery || '')
  
  return (
    <div className="space-y-6">
      {/* Barra de búsqueda angelical */}
      {angelicalMode && (
        <div 
          className="p-6 rounded-lg border"
          style={{ 
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                style={{ color: currentTheme.colors.textSecondary }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Busca la bendición que tu alma necesita..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: currentTheme.colors.borderColor,
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text
                }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 rounded-md transition-all hover:scale-105"
                style={{
                  backgroundColor: currentTheme.colors.accent,
                  color: 'white'
                }}
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Header */}
      {showFilters && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-300 ${
                showFilterPanel ? 'ring-2' : ''
              }`}
              style={{
                borderColor: showFilterPanel ? currentTheme.colors.accent : currentTheme.colors.borderColor,
                backgroundColor: showFilterPanel ? `${currentTheme.colors.accent}15` : currentTheme.colors.cardBg,
                color: currentTheme.colors.text
              }}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              {angelicalMode ? 'Filtros Celestiales' : 'Filtros'}
            </button>
            
            <div className="flex items-center space-x-2">
              {angelicalMode && <SparklesIcon className="h-4 w-4" style={{ color: currentTheme.colors.accent }} />}
              <span 
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {pagination.total} {angelicalMode ? 'bendiciones' : 'productos'} encontrados
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <select
              value={filters.sortBy || (angelicalMode ? 'blessing' : 'createdAt')}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: currentTheme.colors.borderColor,
                backgroundColor: currentTheme.colors.cardBg,
                color: currentTheme.colors.text
              }}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* View Toggle */}
            <div 
              className="flex border rounded-lg overflow-hidden"
              style={{ borderColor: currentTheme.colors.borderColor }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-all duration-300 ${
                  viewMode === 'grid' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: viewMode === 'grid' 
                    ? currentTheme.colors.accent 
                    : currentTheme.colors.cardBg,
                  color: viewMode === 'grid' ? 'white' : currentTheme.colors.text
                }}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-all duration-300 ${
                  viewMode === 'list' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: viewMode === 'list' 
                    ? currentTheme.colors.accent 
                    : currentTheme.colors.cardBg,
                  color: viewMode === 'list' ? 'white' : currentTheme.colors.text
                }}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div 
          className="rounded-lg p-6 space-y-6 border"
          style={{ 
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                {angelicalMode ? 'Tipo de Bendición' : 'Categoría'}
              </label>
              <select
                value={filters.category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: currentTheme.colors.borderColor,
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text
                }}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {'icon' in category ? `${category.icon} ${category.label}` : category.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Price Range */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                {angelicalMode ? 'Inversión Espiritual' : 'Rango de precio'}
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: e.target.value ? parseInt(e.target.value) * 100 : undefined
                  })}
                  className="w-full px-2 py-1 rounded border text-sm focus:outline-none focus:ring-1 transition-all"
                  style={{
                    borderColor: currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: e.target.value ? parseInt(e.target.value) * 100 : undefined
                  })}
                  className="w-full px-2 py-1 rounded border text-sm focus:outline-none focus:ring-1 transition-all"
                  style={{
                    borderColor: currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                />
              </div>
            </div>
            
            {/* Stock Filter */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Disponibilidad
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="mr-2 rounded focus:ring-2 transition-all"
                  style={{ accentColor: currentTheme.colors.accent }}
                />
                <span 
                  className="text-sm"
                  style={{ color: currentTheme.colors.text }}
                >
                  {angelicalMode ? 'Solo bendiciones disponibles' : 'Solo en stock'}
                </span>
              </label>
            </div>
            
            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg border transition-all hover:scale-105 text-sm"
                style={{
                  borderColor: currentTheme.colors.borderColor,
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text
                }}
              >
                <XMarkIcon className="h-4 w-4 inline mr-1" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Products Grid/List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
            style={{ borderColor: currentTheme.colors.accent }}
          />
          <p style={{ color: currentTheme.colors.textSecondary }}>
            {angelicalMode ? 'Los ángeles están preparando tus bendiciones...' : 'Cargando productos...'}
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <SparklesIcon 
            className="h-16 w-16 mx-auto mb-4 opacity-50"
            style={{ color: currentTheme.colors.textSecondary }}
          />
          <p 
            className="text-lg mb-2"
            style={{ color: currentTheme.colors.text }}
          >
            {angelicalMode ? 'No se encontraron bendiciones' : 'No se encontraron productos'}
          </p>
          <p style={{ color: currentTheme.colors.textSecondary }}>
            {angelicalMode 
              ? 'Los ángeles te guiarán hacia otros productos que necesitas'
              : 'Intenta ajustar los filtros de búsqueda'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              angelicalMode={angelicalMode}
            />
          ))}
        </div>
      )}
      
      {/* Pagination angelical */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          {pagination.hasPrev && (
            <button
              onClick={() => {/* TODO: Implement pagination */}}
              className="px-4 py-2 rounded-lg border transition-all hover:scale-105"
              style={{
                borderColor: currentTheme.colors.borderColor,
                backgroundColor: currentTheme.colors.cardBg,
                color: currentTheme.colors.text
              }}
            >
              ← Anterior
            </button>
          )}
          
          <div 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: `${currentTheme.colors.accent}15`,
              color: currentTheme.colors.text
            }}
          >
            {angelicalMode && <StarIcon className="h-4 w-4" style={{ color: currentTheme.colors.accent }} />}
            <span>
              Página {pagination.page} de {pagination.totalPages}
            </span>
          </div>
          
          {pagination.hasNext && (
            <button
              onClick={() => {/* TODO: Implement pagination */}}
              className="px-4 py-2 rounded-lg border transition-all hover:scale-105"
              style={{
                borderColor: currentTheme.colors.borderColor,
                backgroundColor: currentTheme.colors.cardBg,
                color: currentTheme.colors.text
              }}
            >
              Siguiente →
            </button>
          )}
        </div>
      )}

      {/* Mensaje angelical al final */}
      {angelicalMode && products.length > 0 && (
        <div 
          className="text-center p-6 rounded-lg border-l-4 mt-8"
          style={{
            backgroundColor: `${currentTheme.colors.accent}15`,
            borderLeftColor: currentTheme.colors.accent
          }}
        >
          <SparklesIcon 
            className="h-6 w-6 mx-auto mb-2"
            style={{ color: currentTheme.colors.accent }}
          />
          <p 
            className="italic"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            "Cada producto ha sido seleccionado con amor divino para acompañarte en tu camino espiritual. 
            Que la luz de los ángeles ilumine tu elección." ✨🙏
          </p>
        </div>
      )}
    </div>
  )
}