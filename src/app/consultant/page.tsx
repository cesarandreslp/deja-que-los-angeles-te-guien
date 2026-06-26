'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConsultorStats } from '@/utils/stats'
import Link from 'next/link'

interface StatCard {
  title: string
  value: string
  description: string
  color: string
  icon: string
}

export default function ConsultantDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<ConsultorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'CONSULTANT') {
      router.push('/login')
      return
    }

    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/consultant/stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar estadísticas')
      }

      setStats(data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statCards: StatCard[] = [
    {
      title: 'Consultas Totales',
      value: stats.consultations.total.toString(),
      description: `${stats.consultations.completed} completadas`,
      color: 'bg-purple-500',
      icon: '📞'
    },
    {
      title: 'Rating Promedio',
      value: stats.consultations.avgRating.toFixed(1),
      description: 'Calificación de clientes',
      color: 'bg-yellow-500',
      icon: '⭐'
    },
    {
      title: 'Ingresos Totales',
      value: `$${(stats.revenue.totalEarned / 100).toFixed(2)}`,
      description: `$${(stats.revenue.thisMonth / 100).toFixed(2)} este mes`,
      color: 'bg-green-500',
      icon: '💰'
    },
    {
      title: 'Comisiones',
      value: `$${(stats.commissions.total / 100).toFixed(2)}`,
      description: `$${(stats.commissions.pending / 100).toFixed(2)} pendientes`,
      color: 'bg-indigo-500',
      icon: '💳'
    },
    {
      title: 'Reprogramadas',
      value: stats.consultations.rescheduled.toString(),
      description: 'Consultas reprogramadas',
      color: 'bg-orange-500',
      icon: '📅'
    },
    {
      title: 'No Show',
      value: stats.consultations.noShow.toString(),
      description: 'Clientes que no asistieron',
      color: 'bg-red-500',
      icon: '❌'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Consultor</h1>
              <p className="text-gray-600">Bienvenido, {session?.user?.name}</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/profile"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Mi Perfil
              </Link>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            <Link href="/consultant" className="bg-purple-900 px-3 py-2 rounded-md font-medium">
              Dashboard
            </Link>
            <Link href="/consultant/consultations" className="hover:bg-purple-700 px-3 py-2 rounded-md">
              Mis Consultas
            </Link>
            <Link href="/consultant/schedule" className="hover:bg-purple-700 px-3 py-2 rounded-md">
              Horarios
            </Link>
            <Link href="/consultant/commissions" className="hover:bg-purple-700 px-3 py-2 rounded-md">
              Comisiones
            </Link>
            <Link href="/consultant/clients" className="hover:bg-purple-700 px-3 py-2 rounded-md">
              Clientes
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`${card.color} rounded-lg p-3 mr-4`}>
                  <div className="text-white text-2xl">{card.icon}</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Resumen de Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tasa de Finalización</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.consultations.total > 0 
                          ? (stats.consultations.completed / stats.consultations.total) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.consultations.total > 0 
                      ? Math.round((stats.consultations.completed / stats.consultations.total) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Satisfacción del Cliente</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(stats.consultations.avgRating / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.consultations.avgRating.toFixed(1)}/5.0
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Puntualidad</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${stats.consultations.total > 0 
                          ? ((stats.consultations.total - stats.consultations.noShow) / stats.consultations.total) * 100 
                          : 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.consultations.total > 0 
                      ? Math.round(((stats.consultations.total - stats.consultations.noShow) / stats.consultations.total) * 100)
                      : 100}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ingresos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Ingresos</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">Ingresos Totales</span>
                <span className="font-semibold text-green-900">
                  ${(stats.revenue.totalEarned / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800">Este Mes</span>
                <span className="font-semibold text-blue-900">
                  ${(stats.revenue.thisMonth / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-800">Comisiones Pagadas</span>
                <span className="font-semibold text-purple-900">
                  ${(stats.commissions.paid / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/consultant/consultations"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="text-2xl mb-2">📅</div>
              <span className="text-sm text-gray-600">Ver Agenda</span>
            </Link>
            <Link
              href="/consultant/consultations/upcoming"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="text-2xl mb-2">⏰</div>
              <span className="text-sm text-gray-600">Próximas Consultas</span>
            </Link>
            <Link
              href="/consultant/commissions"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="text-2xl mb-2">💰</div>
              <span className="text-sm text-gray-600">Ver Comisiones</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <span className="text-sm text-gray-600">Configurar Perfil</span>
            </Link>
          </div>
        </div>

        {/* Today's Schedule Preview */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Agenda de Hoy</h3>
            <Link
              href="/consultant/consultations"
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              Ver agenda completa
            </Link>
          </div>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>No hay consultas programadas para hoy</p>
            <Link
              href="/consultant/consultations"
              className="text-purple-600 hover:text-purple-800 text-sm mt-2 inline-block"
            >
              Ver próximas consultas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}