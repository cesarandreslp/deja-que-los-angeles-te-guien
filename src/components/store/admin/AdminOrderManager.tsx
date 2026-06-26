// Admin Order Management - Gestión de pedidos para administradores
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { formatCurrency } from '@/app/api/store/config'
import { 
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PrinterIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

interface Order {
  id: string
  orderNumber: string
  user: {
    id: string
    fullName: string
    email: string
  }
  orderItems: Array<{
    id: string
    quantity: number
    priceCents: number
    product: {
      id: string
      name: string
      imageUrls: string[]
    }
  }>
  totalCents: number
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}

interface AdminOrderManagerProps {
  onViewOrder: (order: Order) => void
}

export default function AdminOrderManager({ onViewOrder }: AdminOrderManagerProps) {
  const { currentTheme } = useTheme()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [sortBy, setSortBy] = useState<'createdAt' | 'totalCents' | 'status'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  
  useEffect(() => {
    fetchOrders()
  }, [statusFilter, paymentFilter, dateRange, sortBy, sortOrder])
  
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      
      if (statusFilter) queryParams.append('status', statusFilter)
      if (paymentFilter) queryParams.append('paymentStatus', paymentFilter)
      if (dateRange !== 'all') queryParams.append('dateRange', dateRange)
      queryParams.append('sortBy', sortBy)
      queryParams.append('sortOrder', sortOrder)
      queryParams.append('limit', '50')
      
      const response = await fetch(`/api/store/orders?${queryParams}`)
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/store/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }
  
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }
  
  const getStatusColor = (status: Order['status']) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-indigo-100 text-indigo-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
  
  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
  
  const getStatusIcon = (status: Order['status']) => {
    const icons = {
      PENDING: <ClockIcon className="h-4 w-4" />,
      CONFIRMED: <CheckCircleIcon className="h-4 w-4" />,
      PROCESSING: <ClockIcon className="h-4 w-4" />,
      SHIPPED: <TruckIcon className="h-4 w-4" />,
      DELIVERED: <CheckCircleIcon className="h-4 w-4" />,
      CANCELLED: <XCircleIcon className="h-4 w-4" />
    }
    return icons[status] || <ClockIcon className="h-4 w-4" />
  }
  
  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleBulkStatusUpdate = async (newStatus: Order['status']) => {
    if (selectedOrders.length === 0) return
    
    const confirmed = window.confirm(
      `¿Cambiar el estado de ${selectedOrders.length} pedidos a ${newStatus}?`
    )
    
    if (confirmed) {
      try {
        await Promise.all(
          selectedOrders.map(orderId => 
            handleStatusUpdate(orderId, newStatus)
          )
        )
        setSelectedOrders([])
      } catch (error) {
        console.error('Error updating bulk orders:', error)
      }
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${currentTheme.colors.text}`}>
            Gestión de Pedidos
          </h2>
          <p className={`${currentTheme.colors.textSecondary}`}>
            {orders.length} pedidos en total
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className={`flex items-center px-4 py-2 border ${currentTheme.colors.borderColor} rounded-lg hover:${currentTheme.colors.cardBg} transition-colors`}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <button className={`flex items-center px-4 py-2 ${currentTheme.colors.accent} text-white rounded-lg hover:opacity-90 transition-opacity`}>
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Notificar
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className={`${currentTheme.colors.cardBg} rounded-lg p-4`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${currentTheme.colors.textSecondary}`} />
            <input
              type="text"
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full border ${currentTheme.colors.borderColor} rounded-lg ${currentTheme.colors.background} ${currentTheme.colors.text} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 border ${currentTheme.colors.borderColor} rounded-lg ${currentTheme.colors.background} ${currentTheme.colors.text}`}
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PROCESSING">Procesando</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          
          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className={`px-3 py-2 border ${currentTheme.colors.borderColor} rounded-lg ${currentTheme.colors.background} ${currentTheme.colors.text}`}
          >
            <option value="">Estado de pago</option>
            <option value="PENDING">Pendiente</option>
            <option value="PAID">Pagado</option>
            <option value="FAILED">Fallido</option>
            <option value="REFUNDED">Reembolsado</option>
          </select>
          
          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className={`px-3 py-2 border ${currentTheme.colors.borderColor} rounded-lg ${currentTheme.colors.background} ${currentTheme.colors.text}`}
          >
            <option value="all">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
          
          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field as any)
              setSortOrder(order as any)
            }}
            className={`px-3 py-2 border ${currentTheme.colors.borderColor} rounded-lg ${currentTheme.colors.background} ${currentTheme.colors.text}`}
          >
            <option value="createdAt-desc">Más recientes</option>
            <option value="createdAt-asc">Más antiguos</option>
            <option value="totalCents-desc">Mayor valor</option>
            <option value="totalCents-asc">Menor valor</option>
          </select>
        </div>
        
        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center space-x-4 mt-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-800 font-semibold">
              {selectedOrders.length} pedidos seleccionados
            </span>
            <button
              onClick={() => handleBulkStatusUpdate('CONFIRMED')}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('SHIPPED')}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
            >
              Marcar Enviado
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
      
      {/* Orders Table */}
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
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(filteredOrders.map(o => o.id))
                        } else {
                          setSelectedOrders([])
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalCents')}
                  >
                    <div className="flex items-center">
                      Total
                      {sortBy === 'totalCents' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Fecha
                      {sortBy === 'createdAt' && (
                        sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4 ml-1" /> : <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className={`${currentTheme.colors.background} divide-y divide-gray-200`}>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order.id])
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order.id))
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {order.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.orderItems.length} productos
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.orderItems.slice(0, 2).map(item => item.product.name).join(', ')}
                        {order.orderItems.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalCents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => onViewOrder(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="CONFIRMED">Confirmado</option>
                          <option value="PROCESSING">Procesando</option>
                          <option value="SHIPPED">Enviado</option>
                          <option value="DELIVERED">Entregado</option>
                          <option value="CANCELLED">Cancelado</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className={`mx-auto h-12 w-12 ${currentTheme.colors.textSecondary} mb-4`} />
            <p className={`${currentTheme.colors.textSecondary}`}>
              No se encontraron pedidos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}