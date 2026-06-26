// Admin Store Management - Panel principal de administración de tienda
'use client'

import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Product } from '@/types/store'
import AdminProductManager from '@/components/store/admin/AdminProductManager'
import AdminOrderManager from '@/components/store/admin/AdminOrderManager'
import StoreAnalyticsDashboard from '@/components/store/admin/StoreAnalyticsDashboard'
import ProductFormModal from '@/components/store/admin/ProductFormModal'
import { 
  CubeIcon, 
  ShoppingBagIcon, 
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

type TabType = 'analytics' | 'products' | 'orders'

export default function AdminStorePage() {
  const { currentTheme } = useTheme()
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
        const response = await fetch(`/api/products/${productId}`, {
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

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar producto')
      }
      
      // Refresh products list
      window.location.reload()
      
    } catch (error) {
      console.error('Error saving product:', error)
      alert(error instanceof Error ? error.message : 'Error al guardar producto')
    }
  }
  
  const handleViewOrder = (order: any) => {
    // Navigate to order detail
    window.open(`/admin/store/orders/${order.id}`, '_blank')
  }

  const tabs = [
    { 
      id: 'analytics' as const, 
      name: 'Analytics', 
      description: 'Métricas y reportes',
      icon: ChartBarIcon 
    },
    { 
      id: 'products' as const, 
      name: 'Productos', 
      description: 'Gestión de inventario',
      icon: CubeIcon 
    },
    { 
      id: 'orders' as const, 
      name: 'Órdenes', 
      description: 'Pedidos y ventas',
      icon: ShoppingBagIcon 
    }
  ]

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: currentTheme?.colors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: currentTheme?.colors.text }}
          >
            🛍️ Panel de Administración - Tienda Angelical
          </h1>
          <p style={{ color: currentTheme?.colors.textSecondary }}>
            Gestiona productos, órdenes y analiza el rendimiento de tu tienda espiritual
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{
                    color: activeTab === tab.id 
                      ? currentTheme?.colors.accent 
                      : currentTheme?.colors.textSecondary
                  }}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div 
                      className="text-xs"
                      style={{ color: currentTheme?.colors.textSecondary }}
                    >
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
              className="flex items-center justify-center w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              style={{ backgroundColor: currentTheme?.colors.accent }}
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        
        {/* Product Form Modal */}
        <ProductFormModal
          isOpen={showProductForm}
          onClose={() => setShowProductForm(false)}
          product={editingProduct}
          onSave={handleSaveProduct}
        />
      </div>
    </div>
  )
}