'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface SubscriptionDetails {
  id: string
  status: string
  plan: {
    name: string
    price: string
    currency: string
  }
  paymentProvider: string
  paymentStatus: string
  createdAt: string
}

export default function PaymentCancelPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)

  const subscriptionId = searchParams.get('subscription')
  const reason = searchParams.get('reason') || 'cancelled'

  useEffect(() => {
    if (subscriptionId) {
      getSubscriptionDetails()
    } else {
      setLoading(false)
    }
  }, [subscriptionId])

  const getSubscriptionDetails = async () => {
    try {
      const response = await fetch(`/api/memberships/subscribe`)
      
      if (response.ok) {
        const data = await response.json()
        const currentSubscription = data.subscriptions.find((sub: any) => sub.id === subscriptionId)
        
        if (currentSubscription) {
          setSubscription(currentSubscription)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCancelReason = (reason: string) => {
    switch (reason) {
      case 'cancelled':
        return {
          title: 'Pago Cancelado',
          message: 'Has cancelado el proceso de pago',
          icon: XCircleIcon,
          color: 'red'
        }
      case 'failed':
        return {
          title: 'Pago Fallido',
          message: 'El pago no pudo ser procesado',
          icon: ExclamationTriangleIcon,
          color: 'yellow'
        }
      case 'timeout':
        return {
          title: 'Tiempo Agotado',
          message: 'La sesión de pago ha expirado',
          icon: ExclamationTriangleIcon,
          color: 'orange'
        }
      default:
        return {
          title: 'Pago No Completado',
          message: 'El proceso de pago no se completó correctamente',
          icon: XCircleIcon,
          color: 'red'
        }
    }
  }

  const retryPayment = async () => {
    if (!subscription) return

    try {
      // Crear nueva sesión de pago
      const response = await fetch('/api/payments/stripe/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
        }
      }
    } catch (error) {
      console.error('Error retrying payment:', error)
    }
  }

  const cancelReason = getCancelReason(reason)
  const IconComponent = cancelReason.icon

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <IconComponent 
              className={`h-16 w-16 mx-auto mb-4 ${
                cancelReason.color === 'red' ? 'text-red-600' :
                cancelReason.color === 'yellow' ? 'text-yellow-600' :
                cancelReason.color === 'orange' ? 'text-orange-600' :
                'text-gray-600'
              }`} 
            />
            <h1 className={`text-3xl font-bold mb-4 ${
              cancelReason.color === 'red' ? 'text-red-900' :
              cancelReason.color === 'yellow' ? 'text-yellow-900' :
              cancelReason.color === 'orange' ? 'text-orange-900' :
              'text-gray-900'
            }`}>
              {cancelReason.title}
            </h1>
            <p className={`text-lg mb-6 ${
              cancelReason.color === 'red' ? 'text-red-700' :
              cancelReason.color === 'yellow' ? 'text-yellow-700' :
              cancelReason.color === 'orange' ? 'text-orange-700' :
              'text-gray-700'
            }`}>
              {cancelReason.message}
            </p>

            {subscription && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Detalles de la Suscripción:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-semibold text-gray-900">{subscription.plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-semibold text-gray-900">
                      ${subscription.plan.price} {subscription.plan.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-semibold ${
                      subscription.status === 'ACTIVE' ? 'text-green-600' :
                      subscription.status === 'PENDING' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {subscription.status === 'ACTIVE' ? 'Activa' :
                       subscription.status === 'PENDING' ? 'Pendiente' :
                       subscription.status === 'CANCELLED' ? 'Cancelada' :
                       'Expirada'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método de pago:</span>
                    <span className="font-semibold text-gray-900">{subscription.paymentProvider}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-2">¿Qué quieres hacer?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscription && subscription.status === 'PENDING' && (
                  <button
                    onClick={retryPayment}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Reintentar Pago
                  </button>
                )}
                <Link
                  href="/memberships"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                  Ver Membresías
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                  Ir al Dashboard
                </Link>
                <Link
                  href="/soporte"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                  Contactar Soporte
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Razones comunes y soluciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Posibles Soluciones</h3>
            <div className="text-sm text-gray-600 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Verifica tu información de pago</p>
                  <p>Asegúrate de que los datos de tu tarjeta sean correctos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Fondos suficientes</p>
                  <p>Verifica que tu cuenta tenga saldo disponible</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Contacta tu banco</p>
                  <p>Algunos bancos bloquean transacciones en línea por seguridad</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Prueba otro método de pago</p>
                  <p>Intenta con una tarjeta diferente o MercadoPago</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Información de contacto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">¿Necesitas Ayuda?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Nuestro equipo de soporte está aquí para ayudarte con cualquier problema de pago
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
              <a href="mailto:soporte@oraculo.com" className="text-blue-600 hover:text-blue-800">
                📧 soporte@oraculo.com
              </a>
              <a href="tel:+123456789" className="text-blue-600 hover:text-blue-800">
                📞 +1 (234) 567-89
              </a>
              <span className="text-blue-600">💬 Chat en vivo 24/7</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}