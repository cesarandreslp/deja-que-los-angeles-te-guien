'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface MembershipPlan {
  id: string
  name: string
  description: string
  price: string
  priceCents: number
  currency: string
  durationDays: number
  isActive: boolean
  subscribersCount: number
  createdAt: string
  updatedAt: string
}

interface Subscription {
  id: string
  status: string
  paymentProvider: string
  paymentStatus: string
  startDate: string
  endDate: string
  user: {
    id: string
    fullName: string
    email: string
    country: string
  }
}

export default function MembershipPlanDetails() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<MembershipPlan | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'subscribers'>('overview')

  // Verificar autenticación
  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchPlanDetails()
  }, [session, status, router, planId])

  const fetchPlanDetails = async () => {
    try {
      setLoading(true)

      // Obtener detalles del plan
      const planResponse = await fetch(`/api/admin/memberships/plans/${planId}`)
      if (!planResponse.ok) {
        throw new Error('Plan no encontrado')
      }
      const planData = await planResponse.json()
      setPlan(planData.plan)

      // Obtener suscriptores del plan
      const subsResponse = await fetch(`/api/admin/memberships/users?planId=${planId}`)
      if (subsResponse.ok) {
        const subsData = await subsResponse.json()
        setSubscriptions(subsData.memberships)
      }

    } catch (error) {
      console.error('Error al cargar detalles:', error)
      setError('Error al cargar los detalles del plan')
    } finally {
      setLoading(false)
    }
  }

  const togglePlanStatus = async () => {
    if (!plan) return

    try {
      const response = await fetch(`/api/admin/memberships/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...plan,
          price: parseFloat(plan.price),
          isActive: !plan.isActive 
        }),
      })

      if (response.ok) {
        fetchPlanDetails() // Recargar datos
      } else {
        alert('Error al actualizar el plan')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el plan')
    }
  }

  const deletePlan = async () => {
    if (!plan) return

    if (!confirm(`¿Estás seguro de que quieres eliminar el plan "${plan.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/memberships/plans/${planId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/memberships')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar el plan')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el plan')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/admin/memberships"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver a Membresías
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/memberships"
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      plan.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {plan.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/memberships/plans/${planId}/edit`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Editar plan"
              >
                <PencilIcon className="h-5 w-5" />
              </Link>
              <button
                onClick={togglePlanStatus}
                className={`p-2 rounded-lg ${
                  plan.isActive
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-green-600 hover:bg-green-50'
                }`}
                title={plan.isActive ? 'Desactivar' : 'Activar'}
              >
                {plan.isActive ? (
                  <XCircleIcon className="h-5 w-5" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={deletePlan}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Eliminar plan"
                disabled={plan.subscribersCount > 0}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`${
                activeTab === 'subscribers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Suscriptores ({plan.subscribersCount})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        ${plan.price}
                      </p>
                      <p className="ml-2 text-sm text-gray-600">{plan.currency}</p>
                    </div>
                    <p className="text-sm text-gray-500">Precio del Plan</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">
                      {plan.durationDays}
                    </p>
                    <p className="text-sm text-gray-500">Días de Duración</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">
                      {plan.subscribersCount}
                    </p>
                    <p className="text-sm text-gray-500">Suscriptores Activos</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-semibold text-gray-900">
                      ${(parseFloat(plan.price) * plan.subscribersCount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Ingresos Potenciales</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Plan Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información del Plan
                </h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID del Plan</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                      {plan.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                    <dd className="mt-1 text-sm text-gray-900">{plan.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                    <dd className="mt-1 text-sm text-gray-900">{plan.description}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          plan.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {plan.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Dates */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Fechas Importantes
                </h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha de Creación</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(plan.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Última Actualización</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(plan.updatedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Precio por Día</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      ${(parseFloat(plan.price) / plan.durationDays).toFixed(2)} {plan.currency}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'subscribers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Suscriptores del Plan
            </h2>

            {subscriptions.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fechas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {subscription.user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">{subscription.user.email}</div>
                            <div className="text-xs text-gray-400">{subscription.user.country}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              subscription.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : subscription.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : subscription.status === 'EXPIRED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {subscription.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{subscription.paymentProvider || 'N/A'}</div>
                          <div className="text-xs">{subscription.paymentStatus}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Inicio: {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}</div>
                          <div>Fin: {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/admin/memberships/users/${subscription.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver detalles
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay suscriptores
                </h3>
                <p className="text-gray-600">
                  Este plan aún no tiene suscriptores
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}