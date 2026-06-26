// Admin Store Management - Panel principal de administración de tienda
'use client'

import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Product } from '@/types/store'
import AdminProductManager from '@/components/store/admin/AdminProductManager'
import AdminOrderManager from '@/components/store/admin/AdminOrderManager'
import StoreAnalyticsDashboard from '@/components/store/admin/StoreAnalyticsDashboard'
import { 
  CubeIcon, 
  ShoppingBagIcon, 
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

type TabType = 'analytics' | 'products' | 'orders'

export default function AdminStorePage() {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('analytics')
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowProductForm(true)
  }
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }
  
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const response = await fetch(`/api/store/products/${productId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          // Refresh products list
          window.location.reload()
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }
  
  const handleViewOrder = (order: any) => {
    // Open order details modal or navigate to order page
    console.log('View order:', order)
  }
  
  const tabs = [
    {
      id: 'analytics' as TabType,
      name: 'Analíticas',
      icon: ChartBarIcon,
      description: 'Métricas y estadísticas'
    },
    {
      id: 'products' as TabType,
      name: 'Productos',
      icon: CubeIcon,
      description: 'Gestión de productos'
    },
    {
      id: 'orders' as TabType,
      name: 'Pedidos',
      icon: ShoppingBagIcon,
      description: 'Gestión de pedidos'
    }
  ]
  
  return (
    <div className={`min-h-screen ${theme.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
            Administración de Tienda
          </h1>
          <p className={`${theme.textSecondary}`}>
            Gestiona productos, pedidos y analíticas de tu tienda espiritual
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? `border-indigo-500 ${theme.accent} text-indigo-600`
                      : `border-transparent ${theme.textSecondary} hover:${theme.text} hover:border-gray-300`
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className={`text-xs ${theme.textSecondary}`}>
                      {tab.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'analytics' && (
            <StoreAnalyticsDashboard />
          )}
          
          {activeTab === 'products' && (
            <AdminProductManager
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
          
          {activeTab === 'orders' && (
            <AdminOrderManager
              onViewOrder={handleViewOrder}
            />
          )}
        </div>
        
        {/* Quick Actions FAB */}
        {activeTab === 'products' && (
          <div className="fixed bottom-8 right-8">
            <button
              onClick={handleAddProduct}
              className={`flex items-center justify-center w-14 h-14 ${theme.accent} text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all`}
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        
        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.background} rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme.text}`}>
                  {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
                </h2>
                <button
                  onClick={() => setShowProductForm(false)}
                  className={`${theme.textSecondary} hover:${theme.text} transition-colors`}
                >
                  ✕
                </button>
              </div>
              
              {/* Product Form Content */}
              <div className="space-y-4">
                <p className={`${theme.textSecondary}`}>
                  Formulario de producto en desarrollo...
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowProductForm(false)}
                    className={`px-4 py-2 border ${theme.border} rounded-lg hover:${theme.secondary} transition-colors`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setShowProductForm(false)}
                    className={`px-4 py-2 ${theme.accent} text-white rounded-lg hover:opacity-90 transition-opacity`}
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchProducts()
    fetchOrders()
  }, [session, status, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar productos')
      }

      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar órdenes')
      }

      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...createFormData,
          precio: parseFloat(createFormData.precio),
          stock: parseInt(createFormData.stock)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear producto')
      }

      // Resetear formulario y cerrar modal
      setCreateFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: '',
        isActive: true
      })
      setShowCreateModal(false)
      
      // Recargar productos
      fetchProducts()
      
      alert('Producto creado exitosamente')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al crear producto')
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar producto')
      }

      fetchProducts()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar producto')
    }
  }

  const getOrderStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'SHIPPED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusDisplayName = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completada'
      case 'PENDING': return 'Pendiente'
      case 'CANCELLED': return 'Cancelada'
      case 'SHIPPED': return 'Enviada'
      default: return status
    }
  }

  // Calcular estadísticas
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.isActive).length
  const totalOrders = orders.length
  const totalRevenue = orders
    .filter(o => o.status === 'PAID' || o.status === 'DELIVERED')
    .reduce((sum, order) => sum + (order.totalCents || 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length

  if (status === 'loading' || loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme?.colors.background }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-32 w-32 border-b-2 mb-4"
            style={{ borderBottomColor: currentTheme?.colors.accent }}
          ></div>
          <h2 
            className="text-xl font-semibold mb-2"
            style={{ 
              color: currentTheme?.colors.text,
              fontFamily: currentTheme?.typography.headingFont
            }}
          >
            🛒 Cargando Tienda...
          </h2>
          <p style={{ color: currentTheme?.colors.textSecondary }}>
            Preparando productos angelicales
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme?.colors.background }}
      >
        <div 
          className="border rounded-xl p-6 max-w-md shadow-lg"
          style={{ 
            backgroundColor: currentTheme?.colors.cardBg,
            borderColor: currentTheme?.colors.borderColor
          }}
        >
          <h3 
            className="font-medium mb-2 text-red-600"
            style={{ fontFamily: currentTheme?.typography.headingFont }}
          >
            ❌ Error
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              fetchProducts()
              fetchOrders()
            }}
            className="px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105"
            style={{ background: currentTheme?.colors.buttonGradient }}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: currentTheme?.colors.background }}>
      {/* Header */}
      <div 
        className="shadow-lg border-b"
        style={{ 
          background: currentTheme?.colors.buttonGradient,
          borderBottomColor: currentTheme?.colors.borderColor
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 
                className="text-3xl font-bold flex items-center gap-3 text-white"
                style={{ fontFamily: currentTheme?.typography.headingFont }}
              >
                🛒 Tienda Angelical
              </h1>
              <p className="text-white/80">
                Administra productos espirituales y órdenes sagradas
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                ← Volver al Admin
              </Link>
            </div>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center">
              <div 
                className="rounded-xl p-3 mr-4 shadow-md"
                style={{ backgroundColor: currentTheme?.colors.accent }}
              >
                <div className="text-white text-2xl">📦</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Total Productos
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {totalProducts}
                </p>
                <p style={{ color: currentTheme?.colors.textSecondary }}>
                  {activeProducts} activos
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center">
              <div 
                className="rounded-xl p-3 mr-4 shadow-md"
                style={{ backgroundColor: currentTheme?.colors.accentSecondary }}
              >
                <div className="text-white text-2xl">🛒</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Total Órdenes
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {totalOrders}
                </p>
                <p style={{ color: currentTheme?.colors.textSecondary }}>
                  {pendingOrders} pendientes
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center">
              <div 
                className="rounded-xl p-3 mr-4 shadow-md"
                style={{ backgroundColor: currentTheme?.colors.accent }}
              >
                <div className="text-white text-2xl">💰</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Ingresos Totales
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  ${(totalRevenue / 100).toFixed(2)}
                </p>
                <p style={{ color: currentTheme?.colors.textSecondary }}>
                  Solo órdenes completadas
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center">
              <div 
                className="rounded-xl p-3 mr-4 shadow-md"
                style={{ backgroundColor: '#fbbf24' }}
              >
                <div className="text-white text-2xl">⏳</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Órdenes Pendientes
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {pendingOrders}
                </p>
                <p style={{ color: currentTheme?.colors.textSecondary }}>
                  Requieren atención
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div 
          className="rounded-xl shadow-lg mb-6"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <div 
            className="border-b"
            style={{ borderBottomColor: currentTheme?.colors.borderColor }}
          >
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className="py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200"
                style={{
                  borderBottomColor: activeTab === 'products' ? currentTheme?.colors.accent : 'transparent',
                  color: activeTab === 'products' ? currentTheme?.colors.accent : currentTheme?.colors.textSecondary,
                  fontFamily: currentTheme?.typography.bodyFont
                }}
              >
                📦 Productos ({totalProducts})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200"
                style={{
                  borderBottomColor: activeTab === 'orders' ? currentTheme?.colors.accent : 'transparent',
                  color: activeTab === 'orders' ? currentTheme?.colors.accent : currentTheme?.colors.textSecondary,
                  fontFamily: currentTheme?.typography.bodyFont
                }}
              >
                🛒 Órdenes ({totalOrders})
              </button>
            </nav>
          </div>

          {/* Contenido de Productos */}
          {activeTab === 'products' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 
                  className="text-xl font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  ✨ Gestión de Productos Angelicales
                </h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                  style={{ background: currentTheme?.colors.buttonGradient }}
                >
                  ➕ Nuevo Producto
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl shadow-lg">
                <table className="min-w-full">
                  <thead 
                    style={{ backgroundColor: currentTheme?.colors.background }}
                  >
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        📦 Producto
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        💰 Precio
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        📊 Stock
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        🏷️ Categoría
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        🔄 Estado
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        ⚙️ Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody 
                    className="divide-y"
                    style={{ 
                      backgroundColor: currentTheme?.colors.cardBg,
                      borderTopColor: currentTheme?.colors.borderColor
                    }}
                  >
                    {products.map((product) => (
                      <tr 
                        key={product.id} 
                        className="transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                        style={{ 
                          backgroundColor: currentTheme?.colors.cardBg,
                          borderBottomColor: currentTheme?.colors.borderColor + '30'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div 
                              className="text-sm font-medium"
                              style={{ 
                                color: currentTheme?.colors.text,
                                fontFamily: currentTheme?.typography.bodyFont
                              }}
                            >
                              {product.nombre}
                            </div>
                            <div 
                              className="text-sm"
                              style={{ color: currentTheme?.colors.textSecondary }}
                            >
                              {product.descripcion.length > 50 
                                ? `${product.descripcion.substring(0, 50)}...` 
                                : product.descripcion
                              }
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                          style={{ color: currentTheme?.colors.accent }}
                        >
                          ${product.precio.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span 
                            className={`font-semibold ${product.stock < 10 ? 'text-red-600' : ''}`}
                            style={{ 
                              color: product.stock < 10 ? '#ef4444' : currentTheme?.colors.text
                            }}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: currentTheme?.colors.textSecondary }}
                        >
                          {product.categoria}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? '✅ Activo' : '❌ Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <Link
                            href={`/admin/store/products/${product.id}`}
                            className="transition-all duration-200 hover:scale-105"
                            style={{ color: currentTheme?.colors.accent }}
                          >
                            ✏️ Editar
                          </Link>
                          <button
                            onClick={() => toggleProductStatus(product.id, product.isActive)}
                            className="transition-all duration-200 hover:scale-105"
                            style={{
                              color: product.isActive ? '#ef4444' : '#10b981'
                            }}
                          >
                            {product.isActive ? '⏸️ Desactivar' : '▶️ Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {products.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 
                      className="text-lg font-medium mb-2"
                      style={{ 
                        color: currentTheme?.colors.text,
                        fontFamily: currentTheme?.typography.headingFont
                      }}
                    >
                      No hay productos angelicales
                    </h3>
                    <p style={{ color: currentTheme?.colors.textSecondary }}>
                      Crea tu primer producto espiritual para empezar.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contenido de Órdenes */}
          {activeTab === 'orders' && (
            <div className="p-6">
              <h2 
                className="text-xl font-semibold mb-6"
                style={{ 
                  color: currentTheme?.colors.text,
                  fontFamily: currentTheme?.typography.headingFont
                }}
              >
                🛒 Gestión de Órdenes Sagradas
              </h2>

              <div className="overflow-x-auto rounded-xl shadow-lg">
                <table className="min-w-full">
                  <thead 
                    style={{ backgroundColor: currentTheme?.colors.background }}
                  >
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        👤 Cliente
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        📅 Fecha
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        💰 Total
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        🔄 Estado
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        💳 Pago
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ 
                          color: currentTheme?.colors.textSecondary,
                          fontFamily: currentTheme?.typography.bodyFont
                        }}
                      >
                        ⚙️ Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody 
                    className="divide-y"
                    style={{ 
                      backgroundColor: currentTheme?.colors.cardBg,
                      borderTopColor: currentTheme?.colors.borderColor
                    }}
                  >
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                        style={{ 
                          backgroundColor: currentTheme?.colors.cardBg,
                          borderBottomColor: currentTheme?.colors.borderColor + '30'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div 
                              className="text-sm font-medium"
                              style={{ 
                                color: currentTheme?.colors.text,
                                fontFamily: currentTheme?.typography.bodyFont
                              }}
                            >
                              {order.user.fullName}
                            </div>
                            <div 
                              className="text-sm"
                              style={{ color: currentTheme?.colors.textSecondary }}
                            >
                              {order.user.email}
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: currentTheme?.colors.textSecondary }}
                        >
                          {new Date(order.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                          style={{ color: currentTheme?.colors.accent }}
                        >
                          ${((order.totalCents || 0) / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getOrderStatusBadgeColor(order.status)}`}>
                            {getOrderStatusDisplayName(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="text-sm"
                            style={{ color: currentTheme?.colors.text }}
                          >
                            {order.paymentProvider || 'N/A'}
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: currentTheme?.colors.textSecondary }}
                          >
                            {order.paymentStatus || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/admin/store/orders/${order.id}`}
                            className="transition-all duration-200 hover:scale-105"
                            style={{ color: currentTheme?.colors.accent }}
                          >
                            👁️ Ver Detalle
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 
                      className="text-lg font-medium mb-2"
                      style={{ 
                        color: currentTheme?.colors.text,
                        fontFamily: currentTheme?.typography.headingFont
                      }}
                    >
                      No hay órdenes sagradas
                    </h3>
                    <p style={{ color: currentTheme?.colors.textSecondary }}>
                      Las órdenes aparecerán aquí una vez que los usuarios realicen compras espirituales.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de crear producto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div 
            className="rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <h3 
              className="text-lg font-medium mb-4"
              style={{ 
                color: currentTheme?.colors.text,
                fontFamily: currentTheme?.typography.headingFont
              }}
            >
              ✨ Crear Nuevo Producto Angelical
            </h3>
            
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.bodyFont
                  }}
                >
                  📦 Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={createFormData.nombre}
                  onChange={(e) => setCreateFormData({...createFormData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:scale-105"
                  style={{ 
                    borderColor: currentTheme?.colors.borderColor,
                    backgroundColor: currentTheme?.colors.background,
                    color: currentTheme?.colors.text,
                    outlineColor: currentTheme?.colors.accent
                  }}
                  placeholder="ej: Vela de San Miguel Arcángel"
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.bodyFont
                  }}
                >
                  📝 Descripción *
                </label>
                <textarea
                  required
                  rows={3}
                  value={createFormData.descripcion}
                  onChange={(e) => setCreateFormData({...createFormData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:scale-105"
                  style={{ 
                    borderColor: currentTheme?.colors.borderColor,
                    backgroundColor: currentTheme?.colors.background,
                    color: currentTheme?.colors.text,
                    outlineColor: currentTheme?.colors.accent
                  }}
                  placeholder="Describe las propiedades espirituales del producto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.bodyFont
                    }}
                  >
                    💰 Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={createFormData.precio}
                    onChange={(e) => setCreateFormData({...createFormData, precio: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:scale-105"
                    style={{ 
                      borderColor: currentTheme?.colors.borderColor,
                      backgroundColor: currentTheme?.colors.background,
                      color: currentTheme?.colors.text,
                      outlineColor: currentTheme?.colors.accent
                    }}
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.bodyFont
                    }}
                  >
                    📊 Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={createFormData.stock}
                    onChange={(e) => setCreateFormData({...createFormData, stock: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:scale-105"
                    style={{ 
                      borderColor: currentTheme?.colors.borderColor,
                      backgroundColor: currentTheme?.colors.background,
                      color: currentTheme?.colors.text,
                      outlineColor: currentTheme?.colors.accent
                    }}
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.bodyFont
                  }}
                >
                  🏷️ Categoría
                </label>
                <input
                  type="text"
                  value={createFormData.categoria}
                  onChange={(e) => setCreateFormData({...createFormData, categoria: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:scale-105"
                  style={{ 
                    borderColor: currentTheme?.colors.borderColor,
                    backgroundColor: currentTheme?.colors.background,
                    color: currentTheme?.colors.text,
                    outlineColor: currentTheme?.colors.accent
                  }}
                  placeholder="ej: Velas, Cristales, Libros"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={createFormData.isActive}
                  onChange={(e) => setCreateFormData({...createFormData, isActive: e.target.checked})}
                  className="mr-2 w-4 h-4 rounded"
                  style={{ accentColor: currentTheme?.colors.accent }}
                />
                <label 
                  htmlFor="isActive" 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.text }}
                >
                  ✅ Producto activo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ 
                    color: currentTheme?.colors.textSecondary,
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    border: '1px solid'
                  }}
                >
                  ❌ Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ background: currentTheme?.colors.buttonGradient }}
                >
                  ✨ Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}