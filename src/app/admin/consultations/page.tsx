'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'

interface Consultation {
  id: string
  status: string
  scheduledAt: string
  duration: number
  price: number
  notes?: string
  meetingLink?: string
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
    country?: string
  }
  consultor: {
    id: string
    fullName: string
    email: string
  }
}

interface ConsultationStats {
  status: string
  _count: {
    id: number
  }
  _sum: {
    price: number | null
  }
}

export default function AdminConsultationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentTheme } = useTheme()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [stats, setStats] = useState<ConsultationStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchConsultations()
  }, [session, status, router, currentPage, statusFilter, dateFromFilter, dateToFilter])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (statusFilter) params.append('status', statusFilter)
      if (dateFromFilter) params.append('dateFrom', dateFromFilter)
      if (dateToFilter) params.append('dateTo', dateToFilter)

      const response = await fetch(`/api/admin/consultations?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar consultas')
      }

      setConsultations(data.consultations)
      setStats(data.stats)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching consultations:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'NO_SHOW': return 'bg-orange-100 text-orange-800'
      case 'RESCHEDULED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completada'
      case 'SCHEDULED': return 'Programada'
      case 'CANCELLED': return 'Cancelada'
      case 'NO_SHOW': return 'No Asistió'
      case 'RESCHEDULED': return 'Reprogramada'
      case 'PENDING': return 'Pendiente'
      case 'PAID': return 'Pagada'
      default: return status
    }
  }

  const cancelConsultation = async (consultationId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta consulta?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/consultations/${consultationId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cancelar consulta')
      }

      fetchConsultations()
      alert('Consulta cancelada exitosamente')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al cancelar consulta')
    }
  }

  // Calcular estadísticas resumidas
  const summaryStats = stats.reduce((acc, stat) => {
    acc[stat.status] = {
      count: stat._count.id,
      revenue: stat._sum.price || 0
    }
    return acc
  }, {} as Record<string, { count: number, revenue: number }>)

  const totalConsultations = Object.values(summaryStats).reduce((sum, stat) => sum + stat.count, 0)
  const totalRevenue = Object.values(summaryStats).reduce((sum, stat) => sum + stat.revenue, 0)

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
            📞 Cargando Consultas...
          </h2>
          <p style={{ color: currentTheme?.colors.textSecondary }}>
            Obteniendo información de consultas
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
            onClick={fetchConsultations}
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
                className="text-3xl font-bold text-white"
                style={{ fontFamily: currentTheme?.typography.headingFont }}
              >
                📞 Gestión de Consultas
              </h1>
              <p className="text-white/80">
                Administrar consultas del sistema
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                ← Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>



      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="rounded-xl shadow-lg p-6 border hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <div className="flex items-center">
              <div 
                className="rounded-lg p-3 mr-4 shadow-lg"
                style={{ background: currentTheme?.colors.buttonGradient }}
              >
                <div className="text-white text-2xl">📞</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Total Consultas
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.accent,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  {totalConsultations}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  💰 ${(totalRevenue / 100).toFixed(2)} en ingresos
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-lg p-6 border hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <div className="flex items-center">
              <div className="bg-green-500 rounded-lg p-3 mr-4 shadow-lg">
                <div className="text-white text-2xl">✅</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Completadas
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.accent,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  {summaryStats.COMPLETED?.count || 0}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  💰 ${((summaryStats.COMPLETED?.revenue || 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-lg p-6 border hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-lg p-3 mr-4 shadow-lg">
                <div className="text-white text-2xl">📅</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Programadas
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.accent,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  {summaryStats.SCHEDULED?.count || 0}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  💰 ${((summaryStats.SCHEDULED?.revenue || 0) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-lg p-6 border hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <div className="flex items-center">
              <div className="bg-red-500 rounded-lg p-3 mr-4 shadow-lg">
                <div className="text-white text-2xl">❌</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Canceladas
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.accent,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  {summaryStats.CANCELLED?.count || 0}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  👻 {summaryStats.NO_SHOW?.count || 0} no asistieron
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div 
          className="rounded-xl shadow-lg p-6 mb-6 border"
          style={{ 
            backgroundColor: currentTheme?.colors.cardBg,
            borderColor: currentTheme?.colors.borderColor
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Filtro por estado */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                >
                  <option value="">📊 Todos los estados</option>
                  <option value="SCHEDULED">📅 Programadas</option>
                  <option value="COMPLETED">✅ Completadas</option>
                  <option value="CANCELLED">❌ Canceladas</option>
                  <option value="NO_SHOW">👻 No Asistieron</option>
                  <option value="RESCHEDULED">🔄 Reprogramadas</option>
                </select>
              </div>

              {/* Filtro por fecha desde */}
              <div>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                  placeholder="Fecha desde"
                />
              </div>

              {/* Filtro por fecha hasta */}
              <div>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Fecha hasta"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setStatusFilter('')
                  setDateFromFilter('')
                  setDateToFilter('')
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de consultas */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario / Consultor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha & Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          👤 {consultation.user.fullName}
                        </div>
                        <div className="text-xs text-gray-500">{consultation.user.email}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-purple-900">
                          🔮 {consultation.consultor.fullName}
                        </div>
                        <div className="text-xs text-gray-500">{consultation.consultor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(consultation.scheduledAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(consultation.scheduledAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(consultation.status)}`}>
                      {getStatusDisplayName(consultation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(consultation.price / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/consultations/${consultation.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver
                    </Link>
                    {consultation.meetingLink && (
                      <a
                        href={consultation.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                      >
                        Unirse
                      </a>
                    )}
                    {['SCHEDULED', 'PENDING'].includes(consultation.status) && (
                      <button
                        onClick={() => cancelConsultation(consultation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {consultations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📞</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay consultas</h3>
              <p className="text-gray-500">No se encontraron consultas con los filtros seleccionados.</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  )
}