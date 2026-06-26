'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Activity,
  RefreshCw,
  Play,
  AlertTriangle
} from 'lucide-react'

interface ReminderStats {
  totalSent: number
  totalFailed: number
  successRate: string
  recentActivity: Array<{
    consultationId: string
    type: string
    sentAt: string
    status: 'sent' | 'failed'
    error?: string
  }>
}

interface SystemInfo {
  systemStatus: string
  upcomingConsultations: number
  consultations: Array<{
    id: string
    scheduledAt: string
    userEmail: string
    status: string
  }>
  reminderStats: ReminderStats
}

export default function ReminderMonitorPanel() {
  const [stats, setStats] = useState<ReminderStats | null>(null)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reminders/stats')
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

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/reminders/test')
      const data = await response.json()
      
      if (data.success) {
        setSystemInfo(data.data)
      }
    } catch (err) {
      console.error('Error obteniendo info del sistema:', err)
    }
  }

  const runManualCheck = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reminders/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'check_reminders' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchStats()
        setError(null)
      } else {
        setError(data.error || 'Error ejecutando verificación')
      }
    } catch (err) {
      setError('Error ejecutando verificación manual')
    } finally {
      setLoading(false)
    }
  }

  const createTestConsultation = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reminders/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'create_test_consultation' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchSystemInfo()
        setError(null)
      } else {
        setError(data.error || 'Error creando consulta de prueba')
      }
    } catch (err) {
      setError('Error creando consulta de prueba')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchSystemInfo()
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(() => {
      fetchStats()
      fetchSystemInfo()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getReminderTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      'booking_confirmation': { label: 'Confirmación', color: 'bg-green-100 text-green-800' },
      '1_day_before': { label: '1 día antes', color: 'bg-blue-100 text-blue-800' },
      '3_hours_before': { label: '3h antes', color: 'bg-yellow-100 text-yellow-800' },
      '2_hours_before': { label: '2h antes', color: 'bg-orange-100 text-orange-800' },
      '1_hour_before': { label: '1h antes', color: 'bg-red-100 text-red-800' },
      '30_minutes_before': { label: '30min antes', color: 'bg-purple-100 text-purple-800' }
    }
    
    const typeInfo = types[type] || { label: type, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <Badge className={`${typeInfo.color} border-0`}>
        {typeInfo.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monitor de Recordatorios</h1>
            <p className="text-gray-500">Sistema automático de notificaciones de videoconsultas</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviados</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.totalSent || 0}
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
                <p className="text-sm font-medium text-gray-600">Fallidos</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.totalFailed || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.successRate || '0%'}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximas Consultas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {systemInfo?.upcomingConsultations || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Panel de Control
          </CardTitle>
          <CardDescription>
            Herramientas de administración y testing del sistema de recordatorios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runManualCheck}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Bell className="h-4 w-4 mr-2" />
              Ejecutar Verificación Manual
            </Button>
            
            <Button 
              onClick={createTestConsultation}
              disabled={loading}
              variant="outline"
            >
              <Clock className="h-4 w-4 mr-2" />
              Crear Consulta de Prueba
            </Button>
            
            <Button 
              onClick={() => window.open('/api/reminders/test', '_blank')}
              variant="outline"
            >
              <Activity className="h-4 w-4 mr-2" />
              Ver Info del Sistema
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimos recordatorios enviados por el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.status === 'sent' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        {getReminderTypeBadge(activity.type)}
                        <span className="text-sm font-medium">
                          Consulta: {activity.consultationId.substring(0, 8)}...
                        </span>
                      </div>
                      {activity.error && (
                        <p className="text-xs text-red-600 mt-1">{activity.error}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.sentAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay actividad reciente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Consultations */}
      {systemInfo?.consultations && systemInfo.consultations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Consultas
            </CardTitle>
            <CardDescription>
              Consultas programadas que recibirán recordatorios automáticos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemInfo.consultations.map((consultation) => (
                <div key={consultation.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">{consultation.userEmail}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(consultation.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-0">
                    {consultation.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}