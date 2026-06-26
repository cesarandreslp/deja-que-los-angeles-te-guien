'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Calendar
} from 'lucide-react'

interface AttendanceStats {
  total: number
  completed: number
  noShows: number
  cancelled: number
  attendanceRate: string
  noShowRate: string
  averageDuration: string
  activeConsultations: number
}

interface AttendanceReport {
  consultationId: string
  scheduledStart: string
  scheduledDuration: number
  actualStart?: string
  actualEnd?: string
  actualDuration?: number
  userJoinedAt?: string
  consultorJoinedAt?: string
  userLeftAt?: string
  consultorLeftAt?: string
  attendanceStatus: string
  punctualityScore: {
    user: number
    consultor: number
  }
  participationRate: {
    user: number
    consultor: number
  }
  notes?: string
}

export default function AttendanceMonitorPanel() {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [selectedReport, setSelectedReport] = useState<AttendanceReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      let url = '/api/attendance/stats'
      const params = new URLSearchParams()
      
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
        setError(null)
      } else {
        setError(data.error || 'Error obteniendo estadísticas')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }

  const checkNoShows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/attendance/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_no_shows' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchStats()
        setError(null)
      } else {
        setError(data.error || 'Error verificando no-shows')
      }
    } catch (err) {
      setError('Error verificando no-shows')
    } finally {
      setLoading(false)
    }
  }

  const viewReport = async (consultationId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/attendance/report/${consultationId}`)
      const data = await response.json()
      
      if (data.success) {
        setSelectedReport(data.data)
        setError(null)
      } else {
        setError(data.error || 'Error obteniendo reporte')
      }
    } catch (err) {
      setError('Error obteniendo reporte')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [dateRange])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      'PENDING': { label: 'Pendiente', className: 'bg-gray-100 text-gray-800', icon: <Clock className="h-3 w-3" /> },
      'USER_JOINED': { label: 'Usuario Conectado', className: 'bg-blue-100 text-blue-800', icon: <UserCheck className="h-3 w-3" /> },
      'CONSULTANT_JOINED': { label: 'Consultor Conectado', className: 'bg-yellow-100 text-yellow-800', icon: <UserCheck className="h-3 w-3" /> },
      'BOTH_JOINED': { label: 'Ambos Conectados', className: 'bg-green-100 text-green-800', icon: <Users className="h-3 w-3" /> },
      'COMPLETED': { label: 'Completada', className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      'USER_NO_SHOW': { label: 'Usuario No Asistió', className: 'bg-red-100 text-red-800', icon: <UserX className="h-3 w-3" /> },
      'CONSULTANT_NO_SHOW': { label: 'Consultor No Asistió', className: 'bg-red-100 text-red-800', icon: <UserX className="h-3 w-3" /> },
      'BOTH_NO_SHOW': { label: 'Nadie Asistió', className: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> }
    }
    
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: null }
    
    return (
      <Badge className={`${statusInfo.className} border-0 flex items-center gap-1`}>
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    )
  }

  const getPunctualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monitor de Asistencia</h1>
            <p className="text-gray-500">Seguimiento en tiempo real de videoconsultas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-sm text-gray-500">
              Última actualización: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={fetchStats} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="border-red-200 bg-red-50 border rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <Button
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              variant="outline"
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Consultas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.total || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.completed || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">No-Shows</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.noShows || 0}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Asistencia</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.attendanceRate || '0%'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa No-Show</p>
                <p className="text-xl font-bold text-red-600">
                  {stats?.noShowRate || '0%'}
                </p>
              </div>
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Duración Promedio</p>
                <p className="text-xl font-bold text-blue-600">
                  {stats?.averageDuration || '0 min'}
                </p>
              </div>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultas Activas</p>
                <p className="text-xl font-bold text-green-600">
                  {stats?.activeConsultations || 0}
                </p>
              </div>
              <Activity className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Panel de Control</CardTitle>
          <CardDescription>
            Herramientas de administración para el seguimiento de asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={checkNoShows}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <UserX className="h-4 w-4 mr-2" />
              Verificar No-Shows Manual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Reporte Detallado - {selectedReport.consultationId.substring(0, 8)}...
            </CardTitle>
            <Button 
              onClick={() => setSelectedReport(null)}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              Cerrar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Información General</h4>
                <div className="space-y-2">
                  <p><strong>Estado:</strong> {getStatusBadge(selectedReport.attendanceStatus)}</p>
                  <p><strong>Programada:</strong> {new Date(selectedReport.scheduledStart).toLocaleString()}</p>
                  <p><strong>Duración Programada:</strong> {selectedReport.scheduledDuration} min</p>
                  {selectedReport.actualDuration && (
                    <p><strong>Duración Real:</strong> {selectedReport.actualDuration} min</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Puntualidad</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Usuario:</span>
                    <span className={`font-bold ${getPunctualityColor(selectedReport.punctualityScore.user)}`}>
                      {selectedReport.punctualityScore.user}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Consultor:</span>
                    <span className={`font-bold ${getPunctualityColor(selectedReport.punctualityScore.consultor)}`}>
                      {selectedReport.punctualityScore.consultor}%
                    </span>
                  </div>
                </div>
              </div>

              {selectedReport.userJoinedAt && (
                <div>
                  <h4 className="font-semibold mb-3">Horarios de Conexión</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Usuario conectado:</strong> {new Date(selectedReport.userJoinedAt).toLocaleTimeString()}</p>
                    {selectedReport.consultorJoinedAt && (
                      <p><strong>Consultor conectado:</strong> {new Date(selectedReport.consultorJoinedAt).toLocaleTimeString()}</p>
                    )}
                    {selectedReport.userLeftAt && (
                      <p><strong>Usuario desconectado:</strong> {new Date(selectedReport.userLeftAt).toLocaleTimeString()}</p>
                    )}
                    {selectedReport.consultorLeftAt && (
                      <p><strong>Consultor desconectado:</strong> {new Date(selectedReport.consultorLeftAt).toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Participación</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Usuario:</span>
                    <span className="font-bold text-blue-600">
                      {selectedReport.participationRate.user}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Consultor:</span>
                    <span className="font-bold text-blue-600">
                      {selectedReport.participationRate.consultor}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedReport.notes && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Notas</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedReport.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}