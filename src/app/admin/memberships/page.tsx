'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  CurrencyDollarIcon
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

interface UserMembership {
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
  plan: {
    id: string
    name: string
    price: string
    currency: string
  }
}

export default function AdminMemberships() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'plans' | 'users'>('plans')
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchData()
  }, [session, status, router, activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'plans') {
        const response = await fetch('/api/admin/memberships/plans')
        if (response.ok) {
          const data = await response.json()
          setPlans(data.plans)
        }
      } else {
        const response = await fetch('/api/admin/memberships/users')
        if (response.ok) {
          const data = await response.json()
          setUserMemberships(data.memberships)
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/memberships/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchData() // Recargar datos
      } else {
        alert('Error al actualizar el plan')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el plan')
    }
  }

  const deletePlan = async (planId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/memberships/plans/${planId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData() // Recargar datos
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
            ⭐ Cargando Membresías...
          </h2>
          <p style={{ color: currentTheme?.colors.textSecondary }}>
            Preparando planes espirituales
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
            onClick={fetchData}
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
                ⭐ Membresías Angelicales
              </h1>
              <p className="text-white/80">
                Administra planes sagrados y suscripciones espirituales
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



      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div 
            className="rounded-xl p-1 shadow-lg"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('plans')}
                className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: activeTab === 'plans' ? currentTheme?.colors.accent : 'transparent',
                  color: activeTab === 'plans' ? 'white' : currentTheme?.colors.textSecondary,
                  fontFamily: currentTheme?.typography.bodyFont
                }}
              >
                ⭐ Planes de Membresía
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: activeTab === 'users' ? currentTheme?.colors.accent : 'transparent',
                  color: activeTab === 'users' ? 'white' : currentTheme?.colors.textSecondary,
                  fontFamily: currentTheme?.typography.bodyFont
                }}
              >
                👥 Suscripciones de Usuarios
              </button>
            </nav>
          </div>
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <h2 
                className="text-2xl font-bold"
                style={{ 
                  color: currentTheme?.colors.text,
                  fontFamily: currentTheme?.typography.headingFont
                }}
              >
                ✨ Planes de Membresía Angelical
              </h2>
              <Link
                href="/admin/memberships/plans/new"
                className="text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                style={{ background: currentTheme?.colors.buttonGradient }}
              >
                <PlusIcon className="h-5 w-5" />
                Crear Plan
              </Link>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl shadow-lg p-6 border transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  style={{ 
                    backgroundColor: currentTheme?.colors.cardBg,
                    borderColor: currentTheme?.colors.borderColor
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 
                        className="text-lg font-semibold"
                        style={{ 
                          color: currentTheme?.colors.text,
                          fontFamily: currentTheme?.typography.headingFont
                        }}
                      >
                        {plan.name}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: currentTheme?.colors.textSecondary }}
                      >
                        {plan.description}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        plan.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {plan.isActive ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline">
                      <span 
                        className="text-3xl font-bold"
                        style={{ color: currentTheme?.colors.accent }}
                      >
                        ${plan.price}
                      </span>
                      <span 
                        className="text-sm ml-1"
                        style={{ color: currentTheme?.colors.textSecondary }}
                      >
                        {plan.currency}
                      </span>
                    </div>
                    <p 
                      className="text-sm"
                      style={{ color: currentTheme?.colors.textSecondary }}
                    >
                      Por {plan.durationDays} días angelicales
                    </p>
                  </div>

                  <div 
                    className="flex items-center gap-2 mb-4 text-sm"
                    style={{ color: currentTheme?.colors.textSecondary }}
                  >
                    <UsersIcon className="h-4 w-4" />
                    <span>{plan.subscribersCount} almas benditas</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/memberships/plans/${plan.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/memberships/plans/${plan.id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                      className={`p-2 rounded ${
                        plan.isActive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={plan.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {plan.isActive ? (
                        <XCircleIcon className="h-4 w-4" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {plans.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay planes de membresía
                </h3>
                <p className="text-gray-600 mb-6">
                  Crea tu primer plan de membresía para comenzar
                </p>
                <Link
                  href="/admin/memberships/plans/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Crear Primer Plan
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Suscripciones de Usuarios</h2>

            {/* Memberships Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
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
                  {userMemberships.map((membership) => (
                    <tr key={membership.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {membership.user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{membership.user.email}</div>
                          <div className="text-xs text-gray-400">{membership.user.country}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{membership.plan.name}</div>
                        <div className="text-sm text-gray-500">
                          ${membership.plan.price} {membership.plan.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            membership.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : membership.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : membership.status === 'EXPIRED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {membership.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{membership.paymentProvider || 'N/A'}</div>
                        <div className="text-xs">{membership.paymentStatus}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Inicio: {membership.startDate ? new Date(membership.startDate).toLocaleDateString() : 'N/A'}</div>
                        <div>Fin: {membership.endDate ? new Date(membership.endDate).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/memberships/users/${membership.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {userMemberships.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No hay suscripciones
                  </h3>
                  <p className="text-gray-600">
                    Cuando los usuarios se suscriban aparecerán aquí
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}