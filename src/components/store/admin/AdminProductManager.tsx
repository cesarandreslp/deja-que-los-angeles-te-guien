// Admin Product Management - Gestión de productos para administradores
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Product, ProductFilters, ProductCategory } from '@/types/store'
import { formatCurrency } from '@/app/api/store/config'
import Image from 'next/image'
import ProductFormModal from './ProductFormModal'
import AdminConfirmModal from './AdminConfirmModal'
import { 
  PlusIcon,
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

interface AdminProductManagerProps {
  onAddProduct: () => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
}

export default function AdminProductManager({ 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct 
}: AdminProductManagerProps) {
  const { currentTheme } = useTheme()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProductFilters>({})
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  useEffect(() => {
    fetchProducts()
  }, [filters, sortBy, sortOrder])
  
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.inStock !== undefined) queryParams.append('inStock', filters.inStock.toString())
      queryParams.append('sortBy', sortBy)
      queryParams.append('sortOrder', sortOrder)
      queryParams.append('limit', '50')
      
      const response = await fetch(`/api/store/products?${queryParams}`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }
  
  const handleBulkAction = async (action: 'delete' | 'activate' | 'deactivate') => {
    if (selectedProducts.length === 0) return
    
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres ${action} ${selectedProducts.length} productos?`
    )
    
    if (confirmed) {
      try {
        // Implement bulk actions
        for (const productId of selectedProducts) {
          if (action === 'delete') {
            onDeleteProduct(productId)
          }
          // Add other bulk actions as needed
        }
        setSelectedProducts([])
        fetchProducts()
      } catch (error) {
        console.error('Error performing bulk action:', error)
      }
    }
  }
  
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600', label: 'Agotado' }
    if (stock <= 5) return { color: 'text-yellow-600', label: 'Bajo Stock' }
    return { color: 'text-green-600', label: 'En Stock' }
  }
  
  const categories = [
    { value: '', label: 'Todas las categorías' },
    { value: 'crystals', label: 'Cristales' },
    { value: 'candles', label: 'Velas' },
    { value: 'incense', label: 'Inciensos' },
    { value: 'oils', label: 'Aceites' },
    { value: 'books', label: 'Libros' },
    { value: 'jewelry', label: 'Joyería' }
  ]
  
  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${currentTheme.colors.text}`}>
            Gestión de Productos
          </h2>
          <p className={`${currentTheme.colors.textSecondary}`}>
            {products.length} productos en total
          </p>
        </div>
        
        <button
          onClick={onAddProduct}
          className={`flex items-center px-4 py-2 ${currentTheme.colors.accent} text-white rounded-lg hover:opacity-90 transition-opacity`}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Agregar Producto
        </button>
      </div>
      
      {/* Filters and Search */}
      <div className={`${currentTheme.colors.cardBg} rounded-lg p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${currentTheme.colors.textSecondary}`} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={`pl-10 pr-4 py-2 border ${currentTheme.colors.borderColor} rounded-lg ${currentTheme.colors.background} ${currentTheme.colors.text} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value === '' ? undefined : (e.target.value === 'all' ? 'all' : e.target.value as ProductCategory) })}
              className={`px-3 py-2 border ${currentTheme.colors.borderColor} rounded-lg ${currentTheme.colors.background} ${currentTheme.colors.text}`}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            
            {/* Stock Filter */}
            <select
              value={filters.inStock === undefined ? '' : filters.inStock.toString()}
              onChange={(e) => setFilters({ 
                ...filters, 
                inStock: e.target.value === '' ? undefined : e.target.value === 'true' 
              })}
              className={`px-3 py-2 border ${currentTheme.colors.borderColor} rounded-lg ${currentTheme.colors.background} ${currentTheme.colors.text}`}
            >
              <option value="">Todos los productos</option>
              <option value="true">Solo en stock</option>
              <option value="false">Sin stock</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 border ${currentTheme.colors.borderColor} rounded-lg hover:${currentTheme.colors.cardBg} transition-colors`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>
        
        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-800 font-semibold">
              {selectedProducts.length} productos seleccionados
            </span>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
            >
              Activar
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
      
      {/* Products Table */}
      <div className={`${currentTheme.colors.cardBg} rounded-lg overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${currentTheme.colors.accent}`}></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={currentTheme.colors.cardBg}>
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(products.map(p => p.id))
                        } else {
                          setSelectedProducts([])
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Nombre
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Precio
                      {sortBy === 'price' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center">
                      Stock
                      {sortBy === 'stock' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className={`${currentTheme.colors.background} divide-y divide-gray-200`}>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id])
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.imageUrls[0] ? (
                              <Image
                                src={product.imageUrls[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <PhotoIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(product.priceCents, product.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {product.stock} unidades
                        </span>
                        <div className={`text-xs ${stockStatus.color}`}>
                          {stockStatus.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => window.open(`/tienda/productos/${product.id}`, '_blank')}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => onEditProduct(product)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <PhotoIcon className={`mx-auto h-12 w-12 ${currentTheme.colors.textSecondary} mb-4`} />
            <p className={`${currentTheme.colors.textSecondary}`}>
              No se encontraron productos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}