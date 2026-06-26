'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Subscription {
  id: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
  paymentProvider: string
  paymentStatus: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  plan: {
    id: string
    name: string
    description: string
    price: string
    currency: string
    durationDays: number
  }
}

interface MembershipStats {
  totalSubscriptions: number
  activeSubscriptions: number
  expiredSubscriptions: number
  totalSpent: number
  currency: string
}

export default function MyMembershipPage() {
  const { data: session, status } = useSession()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<MembershipStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMembershipData()
    }
  }, [status])

  const fetchMembershipData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/memberships/subscribe')
      
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
        
        // Calcular estadísticas
        const stats: MembershipStats = {
          totalSubscriptions: data.subscriptions.length,
          activeSubscriptions: data.subscriptions.filter((s: any) => s.status === 'ACTIVE').length,
          expiredSubscriptions: data.subscriptions.filter((s: any) => s.status === 'EXPIRED').length,
          totalSpent: data.subscriptions
            .filter((s: any) => s.paymentStatus === 'COMPLETED')
            .reduce((sum: number, s: any) => sum + parseFloat(s.plan.price), 0),
          currency: data.subscriptions[0]?.plan.currency || 'USD'
        }
        setStats(stats)
      } else {
        setError('Error al cargar las membresías')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />
      case 'EXPIRED':
        return <XCircleIcon className="h-6 w-6 text-red-600" />
      case 'CANCELLED':
        return <XCircleIcon className="h-6 w-6 text-gray-600" />
      case 'PENDING':
        return <ClockIcon className="h-6 w-6 text-yellow-600" />
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      'ACTIVE': 'Activa',
      'EXPIRED': 'Expirada',
      'CANCELLED': 'Cancelada',
      'PENDING': 'Pendiente'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-800 bg-green-100'
      case 'EXPIRED':
        return 'text-red-800 bg-red-100'
      case 'CANCELLED':
        return 'text-gray-800 bg-gray-100'
      case 'PENDING':
        return 'text-yellow-800 bg-yellow-100'
      default:
        return 'text-gray-800 bg-gray-100'
    }
  }

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tus membresías</p>
          <Link
            href="/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mi Membresía</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gestiona tus suscripciones y accede a todos los beneficios del Oráculo
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información de membresías...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchMembershipData}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Estadísticas */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalSubscriptions}</div>
                  <div className="text-gray-600">Total Suscripciones</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeSubscriptions}</div>
                  <div className="text-gray-600">Activas</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">{stats.expiredSubscriptions}</div>
                  <div className="text-gray-600">Expiradas</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    ${stats.totalSpent.toFixed(2)}
                  </div>
                  <div className="text-gray-600">Total Invertido</div>
                </div>
              </motion.div>
            )}

            {/* Lista de Suscripciones */}
            {subscriptions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg p-8 text-center"
              >
                <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes membresías</h3>
                <p className="text-gray-600 mb-6">
                  Suscríbete a un plan para acceder a todos los beneficios del Oráculo
                </p>
                <Link
                  href="/memberships"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Ver Planes Disponibles
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {subscriptions.map((subscription, index) => (
                  <motion.div
                    key={subscription.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 2) }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {subscription.plan.name}
                          </h3>
                          <p className="text-gray-600 mb-3">{subscription.plan.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>${subscription.plan.price} {subscription.plan.currency}</span>
                            <span>•</span>
                            <span>{subscription.plan.durationDays} días</span>
                            <span>•</span>
                            <span>{subscription.paymentProvider}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(subscription.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.status)}`}>
                            {getStatusText(subscription.status)}
                          </span>
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {subscription.startDate && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Inicio: {new Date(subscription.startDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {subscription.endDate && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Fin: {new Date(subscription.endDate).toLocaleDateString()}</span>
                            {subscription.status === 'ACTIVE' && (
                              <span className="text-blue-600 font-semibold">
                                ({getDaysRemaining(subscription.endDate)} días restantes)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-wrap gap-3">
                        {subscription.status === 'EXPIRED' && (
                          <Link
                            href="/memberships"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                            Renovar Membresía
                          </Link>
                        )}
                        {subscription.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              // Aquí podrías implementar lógica para completar el pago
                              window.location.href = '/memberships'
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                            Completar Pago
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // Aquí podrías implementar ver detalles
                            console.log('Ver detalles:', subscription.id)
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>

                    {/* Barra de progreso para membresías activas */}
                    {subscription.status === 'ACTIVE' && subscription.startDate && subscription.endDate && (
                      <div className="bg-gray-50 px-6 py-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progreso de la membresía</span>
                          <span>{getDaysRemaining(subscription.endDate)} días restantes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.max(0, Math.min(100, 
                                ((new Date().getTime() - new Date(subscription.startDate).getTime()) / 
                                (new Date(subscription.endDate).getTime() - new Date(subscription.startDate).getTime())) * 100
                              ))}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Acciones adicionales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Necesitas más acceso?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/memberships"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Ver Todos los Planes
                </Link>
                <Link
                  href="/soporte"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Contactar Soporte
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}