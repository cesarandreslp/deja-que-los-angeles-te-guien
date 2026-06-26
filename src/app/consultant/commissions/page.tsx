'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Commission {
  id: string
  amountCents: number
  status: 'PENDING' | 'PAID'
  description?: string
  createdAt: string
  paidAt?: string
}

export default function ConsultantCommissions() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalPending: 0,
    totalPaid: 0,
    commissionRate: 20
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'CONSULTANT') {
      router.push('/login')
      return
    }

    fetchCommissions()
  }, [session, status, router])

  const fetchCommissions = async () => {
    try {
      const response = await fetch('/api/consultant/commissions')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar comisiones')
      }

      setCommissions(data.data.commissions)
      setStats(data.data.stats)
    } catch (error) {
      console.error('Error fetching commissions:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pagada'
      case 'PENDING': return 'Pendiente'
      default: return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Comisiones</h1>
              <p className="text-gray-600">Historial de pagos y comisiones pendientes</p>
            </div>
            <Link
              href="/consultant"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            <Link href="/consultant" className="hover:bg-purple-700 px-3 py-2 rounded-md">
              Dashboard
            </Link>
            <Link href="/consultant/consultations" className="hover:bg-purple-700 px-3 py-2 rounded-md">
              Mis Consultas
            </Link>
            <Link href="/consultant/schedule" className="hover:bg-purple-700 px-3 py-2 rounded-md">
              Horarios
            </Link>
            <Link href="/consultant/commissions" className="bg-purple-900 px-3 py-2 rounded-md font-medium">
              Comisiones
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-lg p-3 mr-4">
                <div className="text-white text-2xl">💰</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Ganado</h3>
                <p className="text-3xl font-bold text-gray-900">
                  ${(stats.totalEarned / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-lg p-3 mr-4">
                <div className="text-white text-2xl">💳</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Comisiones Pagadas</h3>
                <p className="text-3xl font-bold text-gray-900">
                  ${(stats.totalPaid / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-lg p-3 mr-4">
                <div className="text-white text-2xl">⏳</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pendientes</h3>
                <p className="text-3xl font-bold text-gray-900">
                  ${(stats.totalPending / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-lg p-3 mr-4">
                <div className="text-white text-2xl">📊</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tasa de Comisión</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.commissionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Cómo funcionan las comisiones?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cálculo de Comisiones</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Recibes el {stats.commissionRate}% de cada consulta completada</li>
                <li>• Las comisiones se generan automáticamente al completar una consulta</li>
                <li>• Solo las consultas con estado "COMPLETADA" generan comisiones</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Proceso de Pago</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Los pagos se procesan mensualmente</li>
                <li>• Recibirás una notificación cuando se procese tu pago</li>
                <li>• Puedes solicitar un adelanto contactando al administrador</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Commissions List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-medium mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchCommissions}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : commissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay comisiones registradas
            </h3>
            <p className="text-gray-600">
              Las comisiones aparecerán aquí cuando completes tus primeras consultas.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Historial de Comisiones</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Pago
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(commission.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {commission.description || 'Comisión por consulta completada'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${(commission.amountCents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${getStatusColor(commission.status)}`}>
                          {getStatusText(commission.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {commission.paidAt 
                          ? new Date(commission.paidAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}