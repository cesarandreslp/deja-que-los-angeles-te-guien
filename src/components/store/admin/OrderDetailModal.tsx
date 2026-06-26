// Modal para detalles de pedidos - FASE 3 - CORREGIDO
'use client'

import { useState, useEffect } from 'react'
import { Order, OrderStatus, PaymentStatus } from '@/types/store'
import { useTheme } from '@/context/ThemeContext'
import { formatCurrency } from '@/app/api/store/config'
import {
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
  TruckIcon,
  CreditCardIcon,
  ClockIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  onStatusUpdate: (orderId: string, status: OrderStatus, notes?: string) => void
}

const statusConfig = {
  [OrderStatus.PENDING]: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: ClockIcon
  },
  [OrderStatus.CONFIRMED]: {
    label: 'Confirmado',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckIcon
  },
  [OrderStatus.PROCESSING]: {
    label: 'Procesando',
    color: 'bg-purple-100 text-purple-800',
    icon: CreditCardIcon
  },
  [OrderStatus.SHIPPED]: {
    label: 'Enviado',
    color: 'bg-indigo-100 text-indigo-800',
    icon: TruckIcon
  },
  [OrderStatus.DELIVERED]: {
    label: 'Entregado',
    color: 'bg-green-100 text-green-800',
    icon: CheckIcon
  },
  [OrderStatus.CANCELLED]: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: ExclamationTriangleIcon
  },
  [OrderStatus.REFUNDED]: {
    label: 'Reembolsado',
    color: 'bg-gray-100 text-gray-800',
    icon: ExclamationTriangleIcon
  }
}

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onStatusUpdate
}: OrderDetailModalProps) {
  const { currentTheme } = useTheme()
  const [newStatus, setNewStatus] = useState<OrderStatus>()
  const [statusNotes, setStatusNotes] = useState('')
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (order) {
      setNewStatus(order.status)
      setStatusNotes('')
    }
  }, [order])
  
  if (!isOpen || !order) return null
  
  const currentStatusConfig = statusConfig[order.status]
  const StatusIcon = currentStatusConfig.icon
  
  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) return
    
    setLoading(true)
    try {
      await onStatusUpdate(order.id, newStatus, statusNotes.trim() || undefined)
      onClose()
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getStatusTimeline = () => {
    const timeline = [
      { status: OrderStatus.PENDING, label: 'Pedido Recibido', completed: true },
      { status: OrderStatus.CONFIRMED, label: 'Confirmado', completed: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status) },
      { status: OrderStatus.PROCESSING, label: 'En Proceso', completed: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status) },
      { status: OrderStatus.SHIPPED, label: 'Enviado', completed: [OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status) },
      { status: OrderStatus.DELIVERED, label: 'Entregado', completed: order.status === OrderStatus.DELIVERED }
    ]
    
    if (order.status === OrderStatus.CANCELLED) {
      return [
        { status: OrderStatus.PENDING, label: 'Pedido Recibido', completed: true },
        { status: OrderStatus.CANCELLED, label: 'Cancelado', completed: true, cancelled: true }
      ]
    }
    
    return timeline
  }

  // Función para obtener el total del pedido
  const getOrderTotal = () => {
    return order.totalCents / 100
  }

  // Función para obtener subtotal estimado
  const getSubtotal = () => {
    return getOrderTotal() * 0.85 // Estimación del subtotal
  }

  // Función para obtener envío estimado
  const getShipping = () => {
    return getOrderTotal() > 50 ? 0 : 5.99 // Envío gratis sobre $50
  }

  // Función para obtener impuestos (ahora desde la orden)
  const getTax = () => {
    return order.taxCents || (getSubtotal() * 0.19) // Usar el taxCents guardado o calcular como fallback
  }
  
  // Función para obtener envío (ahora desde la orden)
  const getShippingCost = () => {
    return order.shippingCents || (getOrderTotal() > 50 ? 0 : 599) // Usar shippingCents guardado o calcular como fallback
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${currentTheme.colors.borderColor}`}>
          <div className="flex items-center">
            <ShoppingBagIcon className={`h-6 w-6 mr-3`} style={{ color: currentTheme.colors.accent }} />
            <div>
              <h2 className={`text-xl font-bold`} style={{ color: currentTheme.colors.text }}>
                Pedido #{order.id.slice(0, 8)}
              </h2>
              <p className={`text-sm`} style={{ color: currentTheme.colors.textSecondary }}>
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatusConfig.color}`}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {currentStatusConfig.label}
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <XMarkIcon className={`h-5 w-5`} style={{ color: currentTheme.colors.textSecondary }} />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Order Timeline */}
          <div>
            <h3 
              className={`text-lg font-semibold mb-4`}
              style={{ color: currentTheme.colors.text }}
            >
              Estado del Pedido
            </h3>
            <div className="relative">
              {getStatusTimeline().map((item, index) => {
                const isLast = index === getStatusTimeline().length - 1
                return (
                  <div key={item.status} className="relative flex items-center pb-8">
                    {!isLast && (
                      <div
                        className={`absolute left-4 top-8 w-0.5 h-8 ${
                          item.completed ? 'bg-green-500' :
                          item.cancelled ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                      />
                    )}
                    <div
                      className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                        item.completed
                          ? item.cancelled
                            ? 'bg-red-500 text-white'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {item.completed ? (
                        item.cancelled ? (
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p 
                        className={`font-medium ${
                          item.completed 
                            ? item.cancelled 
                              ? 'text-red-600' 
                              : '' 
                            : ''
                        }`}
                        style={{
                          color: item.completed 
                            ? item.cancelled 
                              ? '#dc2626' 
                              : currentTheme.colors.text 
                            : currentTheme.colors.textSecondary
                        }}
                      >
                        {item.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div>
              <h3 
                className={`text-lg font-semibold mb-4 flex items-center`}
                style={{ color: currentTheme.colors.text }}
              >
                <UserIcon className="h-5 w-5 mr-2" />
                Información del Cliente
              </h3>
              
              <div 
                className={`rounded-lg p-4 space-y-3`}
                style={{ backgroundColor: currentTheme.colors.background }}
              >
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span style={{ color: currentTheme.colors.text }}>
                    {order.user?.fullName || 'Usuario Anónimo'}
                  </span>
                </div>
                
                {order.user?.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span style={{ color: currentTheme.colors.text }}>
                      {order.user.email}
                    </span>
                  </div>
                )}
                
                {order.shippingAddress && (
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                    <div style={{ color: currentTheme.colors.text }}>
                      <div>{order.shippingAddress}</div>
                    </div>
                  </div>
                )}
                
                {order.shippingPhone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span style={{ color: currentTheme.colors.text }}>
                      {order.shippingPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Payment Information */}
            <div>
              <h3 
                className={`text-lg font-semibold mb-4 flex items-center`}
                style={{ color: currentTheme.colors.text }}
              >
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Información de Pago
              </h3>
              
              <div 
                className={`rounded-lg p-4 space-y-3`}
                style={{ backgroundColor: currentTheme.colors.background }}
              >
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.textSecondary }}>Subtotal:</span>
                  <span style={{ color: currentTheme.colors.text }}>
                    {formatCurrency(Math.round((order.totalCents * 0.85)), order.currency)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.textSecondary }}>Envío:</span>
                  <span style={{ color: currentTheme.colors.text }}>
                    {formatCurrency(order.totalCents > 5000 ? 0 : 599, order.currency)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span style={{ color: currentTheme.colors.textSecondary }}>Impuestos:</span>
                  <span style={{ color: currentTheme.colors.text }}>
                    {formatCurrency(Math.round((order.totalCents * 0.15)), order.currency)}
                  </span>
                </div>
                
                <div 
                  className={`flex justify-between pt-2 border-t`}
                  style={{ borderColor: currentTheme.colors.borderColor }}
                >
                  <span 
                    className={`font-semibold`}
                    style={{ color: currentTheme.colors.text }}
                  >
                    Total:
                  </span>
                  <span 
                    className={`font-bold text-lg`}
                    style={{ color: currentTheme.colors.text }}
                  >
                    {formatCurrency(order.totalCents, order.currency)}
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      Método de Pago:
                    </span>
                    <span style={{ color: currentTheme.colors.text }}>
                      {order.paymentProvider || 'No especificado'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      Estado del Pago:
                    </span>
                    <span className={`font-medium ${
                      order.paymentStatus === PaymentStatus.PAID ? 'text-green-600' :
                      order.paymentStatus === PaymentStatus.PENDING ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {order.paymentStatus === PaymentStatus.PAID ? 'Pagado' :
                       order.paymentStatus === PaymentStatus.PENDING ? 'Pendiente' :
                       order.paymentStatus === PaymentStatus.FAILED ? 'Fallido' :
                       'Reembolsado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div>
            <h3 
              className={`text-lg font-semibold mb-4`}
              style={{ color: currentTheme.colors.text }}
            >
              Productos Pedidos ({order.items?.length || 0})
            </h3>
            
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div 
                  key={item.id} 
                  className={`rounded-lg p-4`}
                  style={{ backgroundColor: currentTheme.colors.background }}
                >
                  <div className="flex items-center space-x-4">
                    {item.product?.imageUrls?.[0] && (
                      <img
                        src={item.product.imageUrls[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h4 
                        className={`font-medium`}
                        style={{ color: currentTheme.colors.text }}
                      >
                        {item.product?.name || 'Producto eliminado'}
                      </h4>
                      {item.product?.category && (
                        <p 
                          className={`text-sm`}
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          Categoría: {item.product.category}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div 
                        className={`font-medium`}
                        style={{ color: currentTheme.colors.text }}
                      >
                        {item.quantity} x {formatCurrency(item.priceCents, order.currency)}
                      </div>
                      <div 
                        className={`font-bold`}
                        style={{ color: currentTheme.colors.text }}
                      >
                        {formatCurrency(item.quantity * item.priceCents, order.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <p 
                  className="text-center py-4"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  No hay productos en este pedido
                </p>
              )}
            </div>
          </div>
          
          {/* Update Status */}
          {order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
            <div>
              <h3 
                className={`text-lg font-semibold mb-4`}
                style={{ color: currentTheme.colors.text }}
              >
                Actualizar Estado
              </h3>
              
              <div 
                className={`rounded-lg p-4 space-y-4`}
                style={{ backgroundColor: currentTheme.colors.background }}
              >
                <div>
                  <label 
                    className={`block text-sm font-medium mb-2`}
                    style={{ color: currentTheme.colors.text }}
                  >
                    Nuevo Estado
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    style={{ 
                      borderColor: currentTheme.colors.borderColor,
                      backgroundColor: currentTheme.colors.cardBg,
                      color: currentTheme.colors.text
                    }}
                  >
                    <option value={OrderStatus.PENDING}>Pendiente</option>
                    <option value={OrderStatus.CONFIRMED}>Confirmado</option>
                    <option value={OrderStatus.PROCESSING}>Procesando</option>
                    <option value={OrderStatus.SHIPPED}>Enviado</option>
                    <option value={OrderStatus.DELIVERED}>Entregado</option>
                    <option value={OrderStatus.CANCELLED}>Cancelado</option>
                  </select>
                </div>
                
                <div>
                  <label 
                    className={`block text-sm font-medium mb-2`}
                    style={{ color: currentTheme.colors.text }}
                  >
                    Notas (opcional)
                  </label>
                  <textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    style={{ 
                      borderColor: currentTheme.colors.borderColor,
                      backgroundColor: currentTheme.colors.cardBg,
                      color: currentTheme.colors.text
                    }}
                    placeholder="Agregar notas sobre el cambio de estado..."
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={loading || newStatus === order.status}
                    className={`px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`}
                    style={{ backgroundColor: currentTheme.colors.accent }}
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Estado'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Order Notes */}
          {order.shippingNotes && (
            <div>
              <h3 
                className={`text-lg font-semibold mb-4`}
                style={{ color: currentTheme.colors.text }}
              >
                Notas del Pedido
              </h3>
              <div 
                className={`rounded-lg p-4`}
                style={{ backgroundColor: currentTheme.colors.background }}
              >
                <p style={{ color: currentTheme.colors.text }}>
                  {order.shippingNotes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}