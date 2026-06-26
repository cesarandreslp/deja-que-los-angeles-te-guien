// Página de confirmación de pago - FASE 5
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { useCart } from '@/hooks/store/useCart'
import { formatCurrency } from '@/app/api/store/config'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  EnvelopeIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

interface OrderDetails {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image?: string
  }>
  total: number
  paymentMethod: string
  paymentId?: string
  createdAt: string
  estimatedDelivery?: string
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export default function PaymentConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentTheme } = useTheme()
  const { clearCart } = useCart()
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = searchParams.get('orderId')
  const status = searchParams.get('status') as 'success' | 'error' | 'pending'
  const paymentId = searchParams.get('paymentId')

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
      // Limpiar carrito solo si el pago fue exitoso
      if (status === 'success') {
        clearCart()
      }
    } else {
      setError('No se encontró información del pedido')
      setLoading(false)
    }
  }, [orderId, status])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/store/orders/${orderId}`)
      if (!response.ok) throw new Error('Error al obtener detalles del pedido')
      
      const order = await response.json()
      setOrderDetails(order)
    } catch (error) {
      setError('Error al cargar los detalles del pedido')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-20 w-20 text-green-500" />
      case 'error':
        return <XCircleIcon className="h-20 w-20 text-red-500" />
      case 'pending':
        return <ClockIcon className="h-20 w-20 text-yellow-500" />
      default:
        return <ClockIcon className="h-20 w-20" style={{ color: currentTheme.colors.accent }} />
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return '¡Pago Exitoso!'
      case 'error':
        return 'Error en el Pago'
      case 'pending':
        return 'Pago Pendiente'
      default:
        return 'Procesando Pago'
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Los ángeles han bendecido tu transacción. Tu pedido ha sido confirmado y pronto recibirás los productos angelicales.'
      case 'error':
        return 'Hubo un problema procesando tu pago. No te preocupes, no se realizó ningún cargo. Puedes intentar nuevamente.'
      case 'pending':
        return 'Tu pago está siendo procesado. Recibirás una confirmación por email cuando se complete la transacción.'
      default:
        return 'Procesando tu solicitud...'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#10b981' // green-500
      case 'error':
        return '#ef4444' // red-500
      case 'pending':
        return '#f59e0b' // yellow-500
      default:
        return currentTheme.colors.accent
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share && orderDetails) {
      try {
        await navigator.share({
          title: 'Confirmación de Pedido Angelical',
          text: `Mi pedido #${orderDetails.id} ha sido confirmado por ${formatCurrency(orderDetails.total)}`,
          url: window.location.href
        })
      } catch (error) {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(window.location.href)
      }
    }
  }

  const sendEmailReceipt = async () => {
    if (!orderDetails) return
    
    try {
      await fetch('/api/store/orders/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderDetails.id })
      })
      alert('Recibo enviado por email ✨')
    } catch (error) {
      alert('Error enviando el recibo')
    }
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
               style={{ borderColor: currentTheme.colors.accent }} />
          <p style={{ color: currentTheme.colors.text }}>
            Cargando detalles del pedido...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
          <p className="mb-4" style={{ color: currentTheme.colors.textSecondary }}>
            {error}
          </p>
          <button
            onClick={() => router.push('/tienda')}
            className="px-6 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: currentTheme.colors.accent,
              color: 'white'
            }}
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header con status */}
        <div 
          className="text-center p-8 rounded-lg mb-8"
          style={{ backgroundColor: currentTheme.colors.cardBg }}
        >
          <div className="mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 
            className="text-3xl font-bold mb-4"
            style={{ color: getStatusColor() }}
          >
            {getStatusTitle()}
          </h1>
          
          <p 
            className="text-lg mb-6 max-w-2xl mx-auto"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {getStatusMessage()}
          </p>

          {orderDetails && (
            <div 
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${getStatusColor()}20`,
                color: getStatusColor()
              }}
            >
              <ShoppingBagIcon className="h-4 w-4 mr-2" />
              Pedido #{orderDetails.id}
            </div>
          )}
        </div>

        {/* Detalles del pedido */}
        {orderDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Resumen del pedido */}
            <div className="lg:col-span-2">
              <div 
                className="p-6 rounded-lg"
                style={{ backgroundColor: currentTheme.colors.cardBg }}
              >
                <h2 
                  className="text-xl font-bold mb-4"
                  style={{ color: currentTheme.colors.text }}
                >
                  Resumen del Pedido
                </h2>
                
                <div className="space-y-4">
                  {orderDetails.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-grow">
                        <h3 
                          className="font-semibold"
                          style={{ color: currentTheme.colors.text }}
                        >
                          {item.name}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div 
                        className="font-bold"
                        style={{ color: currentTheme.colors.accent }}
                      >
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div 
                  className="mt-6 pt-6 border-t"
                  style={{ borderColor: currentTheme.colors.borderColor }}
                >
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-xl font-bold"
                      style={{ color: currentTheme.colors.text }}
                    >
                      Total:
                    </span>
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: currentTheme.colors.accent }}
                    >
                      {formatCurrency(orderDetails.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="space-y-6">
              {/* Información de pago */}
              <div 
                className="p-6 rounded-lg"
                style={{ backgroundColor: currentTheme.colors.cardBg }}
              >
                <h3 
                  className="font-bold mb-4"
                  style={{ color: currentTheme.colors.text }}
                >
                  Información de Pago
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      Método:
                    </span>
                    <span style={{ color: currentTheme.colors.text }}>
                      {orderDetails.paymentMethod}
                    </span>
                  </div>
                  {paymentId && (
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.colors.textSecondary }}>
                        ID de Pago:
                      </span>
                      <span 
                        className="font-mono"
                        style={{ color: currentTheme.colors.text }}
                      >
                        {paymentId.substring(0, 12)}...
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      Fecha:
                    </span>
                    <span style={{ color: currentTheme.colors.text }}>
                      {new Date(orderDetails.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div 
                className="p-6 rounded-lg space-y-3"
                style={{ backgroundColor: currentTheme.colors.cardBg }}
              >
                <h3 
                  className="font-bold mb-4"
                  style={{ color: currentTheme.colors.text }}
                >
                  Acciones
                </h3>
                
                <button
                  onClick={sendEmailReceipt}
                  className="w-full flex items-center justify-center px-4 py-2 border rounded-lg transition-colors"
                  style={{
                    borderColor: currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Enviar Recibo por Email
                </button>
                
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center px-4 py-2 border rounded-lg transition-colors"
                  style={{
                    borderColor: currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Imprimir Confirmación
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center px-4 py-2 border rounded-lg transition-colors"
                  style={{
                    borderColor: currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Compartir
                </button>
              </div>

              {/* Mensaje angelical */}
              <div 
                className="p-6 rounded-lg border-l-4"
                style={{
                  backgroundColor: `${currentTheme.colors.accent}15`,
                  borderLeftColor: currentTheme.colors.accent
                }}
              >
                <p 
                  className="text-sm italic"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  "Que la luz de los ángeles acompañe cada producto que has adquirido, 
                  y que la abundancia espiritual florezca en tu vida." ✨🙏
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/tienda')}
            className="flex items-center justify-center px-6 py-3 border rounded-lg font-semibold transition-all hover:scale-105"
            style={{
              borderColor: currentTheme.colors.borderColor,
              color: currentTheme.colors.text
            }}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Continuar Comprando
          </button>
          
          {status === 'success' && (
            <button
              onClick={() => router.push('/perfil/pedidos')}
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: currentTheme.colors.accent,
                color: 'white'
              }}
            >
              Ver Mis Pedidos
            </button>
          )}
        </div>
      </div>
    </div>
  )
}