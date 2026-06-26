// Admin Store Management Component - Shopify-style backoffice
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Product } from '@/types/store'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhotoIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/app/api/store/config'

interface StoreStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
}

export default function AdminStorePanel() {
  const { currentTheme } = useTheme()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<StoreStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchProducts()
    fetchStats()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/store/products?category=${selectedCategory}&limit=50`)
      const data = await response.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/store/analytics')
      const data = await response.json()
      if (data.success) {
        setStats({
          totalProducts: data.analytics.totalProducts,
          totalOrders: data.analytics.totalOrders,
          totalRevenue: data.analytics.totalRevenue,
          totalCustomers: data.analytics.totalCustomers
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'all', label: 'Todos los productos' },
    { value: 'crystals', label: 'Cristales' },
    { value: 'candles', label: 'Velas' },
    { value: 'incense', label: 'Inciensos' },
    { value: 'oils', label: 'Aceites' },
    { value: 'books', label: 'Libros' },
    { value: 'jewelry', label: 'Joyería' }
  ]

  return (
    <div className={`${currentTheme.colors.background} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${currentTheme.colors.text}`}>
            Gestión de Tienda
          </h1>
          <p className={`${currentTheme.colors.textSecondary} mt-1`}>
            Administra productos, pedidos y clientes de tu tienda espiritual
          </p>
        </div>
        <button className={`flex items-center px-4 py-2 ${currentTheme.colors.accent} text-white rounded-lg hover:opacity-90 transition-opacity`}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${currentTheme.colors.cardBg} p-6 rounded-lg`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${currentTheme.colors.accent} bg-opacity-10`}>
              <ShoppingCartIcon className={`h-6 w-6 ${currentTheme.colors.accent}`} />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${currentTheme.colors.textSecondary}`}>Productos</p>
              <p className={`text-2xl font-bold ${currentTheme.colors.text}`}>{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className={`${currentTheme.colors.cardBg} p-6 rounded-lg`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full bg-green-100`}>
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pedidos</p>
              <p className={`text-2xl font-bold ${currentTheme.colors.text}`}>{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className={`${currentTheme.colors.cardBg} p-6 rounded-lg`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full bg-blue-100`}>
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ingresos</p>
              <p className={`text-2xl font-bold ${currentTheme.colors.text}`}>
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className={`${currentTheme.colors.cardBg} p-6 rounded-lg`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full bg-purple-100`}>
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes</p>
              <p className={`text-2xl font-bold ${currentTheme.colors.text}`}>{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 border ${currentTheme.colors.borderColor} rounded-lg ${currentTheme.colors.background} ${currentTheme.colors.text}`}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`${currentTheme.colors.textSecondary} text-sm`}>
            {products.length} productos
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className={`${currentTheme.colors.cardBg} rounded-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${currentTheme.colors.background}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${currentTheme.colors.textSecondary} uppercase tracking-wider`}>
                  Producto
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${currentTheme.colors.textSecondary} uppercase tracking-wider`}>
                  Categoría
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${currentTheme.colors.textSecondary} uppercase tracking-wider`}>
                  Precio
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${currentTheme.colors.textSecondary} uppercase tracking-wider`}>
                  Stock
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${currentTheme.colors.textSecondary} uppercase tracking-wider`}>
                  Estado
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${currentTheme.colors.textSecondary} uppercase tracking-wider`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`${currentTheme.colors.background} divide-y ${currentTheme.colors.borderColor}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${currentTheme.colors.accent} mx-auto`}></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`px-6 py-4 text-center ${currentTheme.colors.textSecondary}`}>
                    No hay productos en esta categoría
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {product.imageUrls.length > 0 ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.imageUrls[0]}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <PhotoIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${currentTheme.colors.text}`}>
                            {product.name}
                          </div>
                          <div className={`text-sm ${currentTheme.colors.textSecondary}`}>
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${currentTheme.colors.accent} text-white`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${currentTheme.colors.text}`}>
                        {formatCurrency(product.priceCents, product.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${currentTheme.colors.text}`}>
                        {product.stock}
                        {product.stock < 5 && product.stock > 0 && (
                          <span className="ml-2 text-xs text-yellow-600">Bajo</span>
                        )}
                        {product.stock === 0 && (
                          <span className="ml-2 text-xs text-red-600">Agotado</span>
                        )}
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
                        <button className={`${currentTheme.colors.textSecondary} hover:${currentTheme.colors.text}`}>
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className={`${currentTheme.colors.textSecondary} hover:${currentTheme.colors.text}`}>
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className={`${currentTheme.colors.textSecondary} hover:text-red-600`}>
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className={`${currentTheme.colors.cardBg} p-6 rounded-lg border-2 border-dashed ${currentTheme.colors.borderColor} hover:border-${currentTheme.colors.accent} transition-colors text-center`}>
          <PlusIcon className={`h-8 w-8 ${currentTheme.colors.textSecondary} mx-auto mb-2`} />
          <div className={`${currentTheme.colors.text} font-semibold`}>Agregar Producto</div>
          <div className={`${currentTheme.colors.textSecondary} text-sm`}>Crear nuevo producto</div>
        </button>

        <button className={`${currentTheme.colors.cardBg} p-6 rounded-lg border-2 border-dashed ${currentTheme.colors.borderColor} hover:border-${currentTheme.colors.accent} transition-colors text-center`}>
          <ChartBarIcon className={`h-8 w-8 ${currentTheme.colors.textSecondary} mx-auto mb-2`} />
          <div className={`${currentTheme.colors.text} font-semibold`}>Ver Analytics</div>
          <div className={`${currentTheme.colors.textSecondary} text-sm`}>Estadísticas de ventas</div>
        </button>

        <button className={`${currentTheme.colors.cardBg} p-6 rounded-lg border-2 border-dashed ${currentTheme.colors.borderColor} hover:border-${currentTheme.colors.accent} transition-colors text-center`}>
          <UsersIcon className={`h-8 w-8 ${currentTheme.colors.textSecondary} mx-auto mb-2`} />
          <div className={`${currentTheme.colors.text} font-semibold`}>Gestionar Pedidos</div>
          <div className={`${currentTheme.colors.textSecondary} text-sm`}>Ver y procesar pedidos</div>
        </button>
      </div>
    </div>
  )
}