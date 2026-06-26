'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface SubscriptionDetails {
  id: string
  status: string
  plan: {
    name: string
    price: string
    currency: string
    durationDays: number
  }
  startDate: string | null
  endDate: string | null
  paymentProvider: string
  paymentStatus: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)
  const [error, setError] = useState('')

  const subscriptionId = searchParams.get('subscription')
  const sessionId = searchParams.get('session_id') // Stripe
  const preferenceId = searchParams.get('preference_id') // MercadoPago
  const paymentId = searchParams.get('payment_id') // MercadoPago

  useEffect(() => {
    if (subscriptionId) {
      verifyPaymentAndSubscription()
    } else {
      setError('ID de suscripción no encontrado')
      setLoading(false)
    }
  }, [subscriptionId, sessionId, preferenceId, paymentId])

  const verifyPaymentAndSubscription = async () => {
    try {
      // Obtener estado actualizado de la suscripción
      const response = await fetch(`/api/memberships/subscribe`)
      
      if (response.ok) {
        const data = await response.json()
        const currentSubscription = data.subscriptions.find((sub: any) => sub.id === subscriptionId)
        
        if (currentSubscription) {
          setSubscription(currentSubscription)
        } else {
          setError('Suscripción no encontrada')
        }
      } else {
        setError('Error al verificar la suscripción')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error al verificar el estado del pago')
    } finally {
      setLoading(false)
    }
  }

  const isPaymentSuccessful = subscription?.status === 'ACTIVE' && subscription?.paymentStatus === 'COMPLETED'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando el estado de tu pago...</p>
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
          {error ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-900 mb-4">Error</h1>
              <p className="text-red-700 mb-6">{error}</p>
              <Link
                href="/memberships"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Volver a Membresías
              </Link>
            </div>
          ) : isPaymentSuccessful ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-green-900 mb-4">¡Pago Exitoso! 🎉</h1>
              <p className="text-green-700 text-lg mb-6">
                Tu membresía ha sido activada exitosamente
              </p>

              {subscription && (
                <div className="bg-green-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-green-900 mb-4">Detalles de tu Membresía:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Plan:</span>
                      <span className="font-semibold text-green-900">{subscription.plan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Precio:</span>
                      <span className="font-semibold text-green-900">
                        ${subscription.plan.price} {subscription.plan.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Duración:</span>
                      <span className="font-semibold text-green-900">
                        {subscription.plan.durationDays} días
                      </span>
                    </div>
                    {subscription.startDate && (
                      <div className="flex justify-between">
                        <span className="text-green-700">Inicio:</span>
                        <span className="font-semibold text-green-900">
                          {new Date(subscription.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {subscription.endDate && (
                      <div className="flex justify-between">
                        <span className="text-green-700">Vencimiento:</span>
                        <span className="font-semibold text-green-900">
                          {new Date(subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-green-700">Método de pago:</span>
                      <span className="font-semibold text-green-900">{subscription.paymentProvider}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-2">¿Qué puedes hacer ahora?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Ir al Dashboard
                  </Link>
                  <Link
                    href="/consultas"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Programar Consulta
                  </Link>
                  <Link
                    href="/oraculo"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Consultar Oráculo
                  </Link>
                  <Link
                    href="/tienda"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Explorar Tienda VIP
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-yellow-900 mb-4">Procesando Pago</h1>
              <p className="text-yellow-700 mb-6">
                Tu pago está siendo procesado. Por favor espera un momento...
              </p>
              <button
                onClick={verifyPaymentAndSubscription}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Verificar Estado
              </button>
            </div>
          )}
        </motion.div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Información Importante</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Recibirás un email de confirmación con los detalles de tu membresía</p>
              <p>• Tu acceso premium estará disponible inmediatamente</p>
              <p>• Puedes cancelar tu suscripción en cualquier momento desde tu perfil</p>
              <p>• Para soporte, contacta a nuestro equipo de atención al cliente</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}