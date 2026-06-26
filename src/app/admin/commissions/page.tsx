'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'

interface Commission {
  id: string
  consultorId: string
  amountCents: number
  status: 'PENDING' | 'PAID'
  createdAt: string
  consultor?: {
    fullName: string
    email: string
  }
}

interface ConsultorCommissionSummary {
  consultorId: string
  consultorName: string
  consultorEmail: string
  totalEarned: number
  totalPaid: number
  totalPending: number
  commissionsCount: number
}

export default function AdminCommissionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentTheme } = useTheme()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [consultorSummaries, setConsultorSummaries] = useState<ConsultorCommissionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'individual' | 'summary'>('summary')
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('')
  const [consultorFilter, setConsultorFilter] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchCommissions()
    fetchConsultorSummaries()
  }, [session, status, router, statusFilter, consultorFilter])

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (consultorFilter) params.append('consultorId', consultorFilter)

      const response = await fetch(`/api/consultant/commissions?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar comisiones')
      }

      setCommissions(data.data?.commissions || [])
    } catch (error) {
      console.error('Error fetching commissions:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const fetchConsultorSummaries = async () => {
    try {
      // Obtener todos los consultores
      const consultorsResponse = await fetch('/api/admin/users?role=CONSULTANT&limit=100')
      const consultorsData = await consultorsResponse.json()

      if (!consultorsResponse.ok) {
        throw new Error('Error al cargar consultores')
      }

      const consultors = consultorsData.users || []
      const summaries: ConsultorCommissionSummary[] = []

      // Para cada consultor, obtener sus comisiones
      for (const consultor of consultors) {
        try {
          const commissionsResponse = await fetch(`/api/consultant/commissions?consultorId=${consultor.id}`)
          const commissionsData = await commissionsResponse.json()

          if (commissionsResponse.ok && commissionsData.data) {
            const consultorCommissions = commissionsData.data.commissions || []
            const stats = commissionsData.data.stats || {}

            summaries.push({
              consultorId: consultor.id,
              consultorName: consultor.fullName,
              consultorEmail: consultor.email,
              totalEarned: stats.totalEarned || 0,
              totalPaid: stats.totalPaid || 0,
              totalPending: stats.totalPending || 0,
              commissionsCount: consultorCommissions.length
            })
          }
        } catch (err) {
          console.error(`Error fetching commissions for consultor ${consultor.id}:`, err)
        }
      }

      setConsultorSummaries(summaries)
    } catch (error) {
      console.error('Error fetching consultor summaries:', error)
    }
  }

  const markCommissionAsPaid = async (commissionId: string) => {
    if (!confirm('¿Marcar esta comisión como pagada?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/commissions/${commissionId}/pay`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al marcar comisión como pagada')
      }

      fetchCommissions()
      fetchConsultorSummaries()
      alert('Comisión marcada como pagada')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al marcar comisión como pagada')
    }
  }

  const payAllPendingForConsultor = async (consultorId: string) => {
    if (!confirm('¿Marcar todas las comisiones pendientes de este consultor como pagadas?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/commissions/pay-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ consultorId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al pagar comisiones')
      }

      fetchCommissions()
      fetchConsultorSummaries()
      alert('Todas las comisiones pendientes han sido marcadas como pagadas')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al pagar comisiones')
    }
  }

  // Calcular estadísticas generales
  const totalCommissions = commissions.length
  const totalPaidCommissions = commissions.filter(c => c.status === 'PAID').length
  const totalPendingCommissions = commissions.filter(c => c.status === 'PENDING').length
  const totalPaidAmount = commissions
    .filter(c => c.status === 'PAID')
    .reduce((sum, c) => sum + c.amountCents, 0)
  const totalPendingAmount = commissions
    .filter(c => c.status === 'PENDING')
    .reduce((sum, c) => sum + c.amountCents, 0)

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
            💰 Cargando Comisiones...
          </h2>
          <p style={{ color: currentTheme?.colors.textSecondary }}>
            Preparando sistema de comisiones
          </p>
        </div>
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
            onClick={() => {
              fetchCommissions()
              fetchConsultorSummaries()
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
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
                💰 Comisiones Angelicales
              </h1>
              <p className="text-white/80">
                Administra pagos de comisiones a consultores espirituales
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



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="rounded-lg shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center">
              <div 
                className="rounded-lg p-3 mr-4 shadow-md"
                style={{ backgroundColor: currentTheme?.colors.accent }}
              >
                <div className="text-white text-2xl">💰</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  Total Comisiones
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {totalCommissions}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  ${((totalPaidAmount + totalPendingAmount) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-lg shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center">
              <div 
                className="rounded-lg p-3 mr-4 shadow-md"
                style={{ backgroundColor: '#10b981' }}
              >
                <div className="text-white text-2xl">✅</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  Pagadas
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {totalPaidCommissions}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  ${(totalPaidAmount / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-lg shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center">
              <div 
                className="rounded-lg p-3 mr-4 shadow-md"
                style={{ backgroundColor: '#f59e0b' }}
              >
                <div className="text-white text-2xl">⏳</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  Pendientes
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {totalPendingCommissions}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  ${(totalPendingAmount / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-lg shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center">
              <div 
                className="rounded-lg p-3 mr-4 shadow-md"
                style={{ backgroundColor: currentTheme?.colors.accentSecondary }}
              >
                <div className="text-white text-2xl">👥</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  Consultores Activos
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {consultorSummaries.length}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  Con comisiones
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div 
          className="rounded-lg shadow-lg mb-6"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <div 
            className="border-b"
            style={{ borderBottomColor: currentTheme?.colors.borderColor }}
          >
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'summary'
                    ? 'border-current'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{
                  color: activeTab === 'summary' 
                    ? currentTheme?.colors.accent
                    : currentTheme?.colors.textSecondary,
                  borderBottomColor: activeTab === 'summary' 
                    ? currentTheme?.colors.accent
                    : 'transparent'
                }}
              >
                👥 Resumen por Consultor
              </button>
              <button
                onClick={() => setActiveTab('individual')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'individual'
                    ? 'border-current'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{
                  color: activeTab === 'individual' 
                    ? currentTheme?.colors.accent
                    : currentTheme?.colors.textSecondary,
                  borderBottomColor: activeTab === 'individual' 
                    ? currentTheme?.colors.accent
                    : 'transparent'
                }}
              >
                💰 Comisiones Individuales
              </button>
            </nav>
          </div>

          {/* Contenido de Resumen por Consultor */}
          {activeTab === 'summary' && (
            <div className="p-6">
              <h2 
                className="text-xl font-semibold mb-6"
                style={{ 
                  color: currentTheme?.colors.text,
                  fontFamily: currentTheme?.typography.headingFont
                }}
              >
                👥 Resumen de Comisiones por Consultor
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: currentTheme?.colors.borderColor }}>
                  <thead style={{ backgroundColor: currentTheme?.colors.background }}>
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: currentTheme?.colors.textSecondary }}
                      >
                        Consultor
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: currentTheme?.colors.textSecondary }}
                      >
                        Total Ganado
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: currentTheme?.colors.textSecondary }}
                      >
                        Pagado
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: currentTheme?.colors.textSecondary }}
                      >
                        Pendiente
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: currentTheme?.colors.textSecondary }}
                      >
                        # Comisiones
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: currentTheme?.colors.textSecondary }}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultorSummaries.map((summary) => (
                      <tr key={summary.consultorId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {summary.consultorName}
                            </div>
                            <div className="text-sm text-gray-500">{summary.consultorEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(summary.totalEarned / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          ${(summary.totalPaid / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                          ${(summary.totalPending / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {summary.commissionsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            href={`/admin/users/${summary.consultorId}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver Perfil
                          </Link>
                          {summary.totalPending > 0 && (
                            <button
                              onClick={() => payAllPendingForConsultor(summary.consultorId)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Pagar Todo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {consultorSummaries.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">💰</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay comisiones</h3>
                    <p className="text-gray-500">Las comisiones aparecerán cuando los consultores completen consultas.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contenido de Comisiones Individuales */}
          {activeTab === 'individual' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Comisiones Individuales</h2>
                
                <div className="flex space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="PENDING">Pendientes</option>
                    <option value="PAID">Pagadas</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consultor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {commission.consultor?.fullName || 'Consultor desconocido'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {commission.consultor?.email || ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(commission.amountCents / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            commission.status === 'PAID' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {commission.status === 'PAID' ? 'Pagada' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(commission.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {commission.status === 'PENDING' && (
                            <button
                              onClick={() => markCommissionAsPaid(commission.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Marcar como Pagada
                            </button>
                          )}
                          {commission.status === 'PAID' && (
                            <span className="text-gray-400">Ya pagada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {commissions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">💰</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay comisiones</h3>
                    <p className="text-gray-500">Las comisiones aparecerán cuando los consultores completen consultas.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}