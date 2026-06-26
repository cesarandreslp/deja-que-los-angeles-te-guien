'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import PWANotificationSettings from '@/components/PWANotificationSettings'
import { usePWANotifications } from '@/hooks/usePWANotifications'
import { useTheme } from '@/context/ThemeContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'
import { 
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Consultation {
  id: string
  scheduledAt: string
  duration: number
  price: number
  status: string
  notes?: string
  topic?: string
  meetingUrl?: string
  rating?: number
  feedback?: string
  consultor: {
    id: string
    fullName: string
    email: string
    profileImage?: string
  }
}

export default function UserConsultations() {
  const { data: session, status } = useSession()
  const { currentTheme } = useTheme()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'USER') {
      router.push('/login')
      return
    }

    fetchConsultations()
  }, [session, status, router, filter])

  const fetchConsultations = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/consultations' 
        : `/api/consultations?status=${filter.toUpperCase()}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar consultas')
      }

      setConsultations(data.data.consultations)
    } catch (error) {
      console.error('Error fetching consultations:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const cancelConsultation = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta consulta?')) {
      return
    }

    try {
      const response = await fetch(`/api/consultations/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al cancelar consulta')
      }

      fetchConsultations()
    } catch (error) {
      console.error('Error canceling consultation:', error)
      alert('Error al cancelar la consulta')
    }
  }

  const rateConsultation = async (id: string, rating: number, feedback?: string) => {
    try {
      const response = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, feedback }),
      })

      if (!response.ok) {
        throw new Error('Error al calificar consulta')
      }

      fetchConsultations()
    } catch (error) {
      console.error('Error rating consultation:', error)
      alert('Error al calificar la consulta')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'text-blue-800'
      case 'COMPLETED': return 'text-green-800' 
      case 'CANCELLED': return 'text-red-800'
      case 'RESCHEDULED': return 'text-yellow-800'
      case 'NO_SHOW': return 'text-gray-800'
      default: return 'text-gray-800'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return '#dbeafe'
      case 'COMPLETED': return '#dcfce7'
      case 'CANCELLED': return '#fecaca'
      case 'RESCHEDULED': return '#fef3c7'
      case 'NO_SHOW': return '#f3f4f6'
      default: return '#f3f4f6'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Programada'
      case 'PAID': return 'Programada'
      case 'CONFIRMED': return 'Programada'
      case 'COMPLETED': return 'Atendida'
      case 'CANCELLED': return 'Cancelada'
      case 'RESCHEDULED': return 'Reprogramada'
      case 'NO_SHOW': return 'No Atendida'
      default: return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-6" style={{ borderColor: currentTheme.colors.accent }}></div>
          <div className="space-y-2">
            <p className="text-xl font-medium" style={{ color: currentTheme.colors.text }}>
              Cargando Consultas
            </p>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              Obteniendo tu historial de consultas...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
      <GoldenStarsBackground />
      <div className="relative z-10">
        {/* Header */}
        <div className="shadow-lg border-b" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: `${currentTheme.colors.accent}20` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
                  <PhoneIcon className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>
                    Mis Consultas
                  </h1>
                  <p style={{ color: currentTheme.colors.textSecondary }}>
                    Historial y próximas sesiones
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/user/consultations/new"
                  className="px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2"
                  style={{ background: currentTheme.colors.buttonGradient }}
                >
                  <CalendarIcon className="w-4 h-4" />
                  Nueva Consulta
                </Link>
                <Link
                  href="/user"
                  className="px-4 py-3 hover:shadow-md transition-all duration-200 rounded-lg border font-medium"
                  style={{ 
                    color: currentTheme.colors.accent,
                    borderColor: currentTheme.colors.accent,
                    backgroundColor: `${currentTheme.colors.accent}05`
                  }}
                >
                  Volver al Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="rounded-lg shadow-md p-6 mb-6 border" style={{ 
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: `${currentTheme.colors.accent}20`
        }}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
              <StarIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
              Filtros
            </h3>
            <p className="text-sm mt-1" style={{ color: currentTheme.colors.textSecondary }}>
              Organiza tus consultas por estado
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className="px-5 py-2 rounded-lg transition-all duration-300 hover:shadow-md font-medium"
              style={{
                background: filter === 'all' ? currentTheme.colors.buttonGradient : `${currentTheme.colors.accent}10`,
                color: filter === 'all' ? 'white' : currentTheme.colors.accent,
                borderColor: currentTheme.colors.accent
              }}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('scheduled')}
              className="px-5 py-2 rounded-lg transition-all duration-300 hover:shadow-md font-medium"
              style={{
                background: filter === 'scheduled' ? currentTheme.colors.buttonGradient : `${currentTheme.colors.accent}10`,
                color: filter === 'scheduled' ? 'white' : currentTheme.colors.accent,
                borderColor: currentTheme.colors.accent
              }}
            >
              Programadas
            </button>
            <button
              onClick={() => setFilter('completed')}
              className="px-5 py-2 rounded-lg transition-all duration-300 hover:shadow-md font-medium"
              style={{
                background: filter === 'completed' ? currentTheme.colors.buttonGradient : `${currentTheme.colors.accent}10`,
                color: filter === 'completed' ? 'white' : currentTheme.colors.accent,
                borderColor: currentTheme.colors.accent
              }}
            >
              Completadas
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className="px-5 py-2 rounded-lg transition-all duration-300 hover:shadow-md font-medium"
              style={{
                background: filter === 'cancelled' ? currentTheme.colors.buttonGradient : `${currentTheme.colors.accent}10`,
                color: filter === 'cancelled' ? 'white' : currentTheme.colors.accent,
                borderColor: currentTheme.colors.accent
              }}
            >
              Canceladas
            </button>
          </div>
        </div>

        {/* PWA Notifications Settings */}
        <PWANotificationSettings className="mb-6" />

        {/* Lista de Consultas */}
        {error ? (
          <div className="border rounded-lg p-8 text-center" style={{ 
            backgroundColor: currentTheme.colors.cardBg, 
            borderColor: `${currentTheme.colors.accent}30`
          }}>
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.accent }} />
            <h3 className="text-xl font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
              Error
            </h3>
            <p className="mb-6" style={{ color: currentTheme.colors.textSecondary }}>
              {error}
            </p>
            <button
              onClick={fetchConsultations}
              className="px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
              style={{ background: currentTheme.colors.buttonGradient }}
            >
              Reintentar
            </button>
          </div>
        ) : consultations.length === 0 ? (
          <div className="rounded-lg shadow-md p-12 text-center border" style={{ 
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: `${currentTheme.colors.accent}20`
          }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
              <PhoneIcon className="w-10 h-10" style={{ color: currentTheme.colors.accent }} />
            </div>
            <h3 className="text-2xl font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
              {filter !== 'all' ? `No tienes consultas ${getStatusText(filter.toUpperCase()).toLowerCase()}` : 'No tienes consultas'}
            </h3>
            <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: currentTheme.colors.textSecondary }}>
              {filter !== 'all' 
                ? 'No se encontraron consultas con este estado.'
                : 'Agenda tu primera consulta con uno de nuestros consultores.'
              }
            </p>
            <div className="space-y-4">
              <Link
                href="/user/consultations/new"
                className="inline-block px-8 py-4 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-lg"
                style={{ background: currentTheme.colors.buttonGradient }}
              >
                <CalendarIcon className="w-5 h-5 inline mr-2" />
                Agendar Consulta
              </Link>
              {filter !== 'all' && (
                <div>
                  <button
                    onClick={() => setFilter('all')}
                    className="px-6 py-2 rounded-lg border font-medium hover:shadow-md transition-all duration-200"
                    style={{ 
                      borderColor: currentTheme.colors.accent,
                      color: currentTheme.colors.accent,
                      backgroundColor: `${currentTheme.colors.accent}05`
                    }}
                  >
                    Ver Todas las Consultas
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="rounded-lg shadow-lg p-6 border hover:shadow-xl transition-all duration-300" style={{ 
                backgroundColor: currentTheme.colors.cardBg,
                borderColor: `${currentTheme.colors.accent}20`
              }}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      {consultation.consultor.profileImage ? (
                        <img
                          className="h-12 w-12 rounded-full mr-4 border-2"
                          style={{ borderColor: currentTheme.colors.accent }}
                          src={consultation.consultor.profileImage}
                          alt=""
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full flex items-center justify-center mr-4 border-2" style={{ 
                          background: currentTheme.colors.buttonGradient,
                          borderColor: currentTheme.colors.accent
                        }}>
                          <span className="text-white font-bold text-lg">
                            {consultation.consultor.fullName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
                          {consultation.consultor.fullName}
                          <span className="text-sm font-normal" style={{ color: currentTheme.colors.textSecondary }}>
                            {' '}(Consultor)
                          </span>
                        </h3>
                        <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                          {consultation.consultor.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.accent}08` }}>
                        <CalendarIcon className="w-6 h-6 mx-auto mb-2" style={{ color: currentTheme.colors.accent }} />
                        <p className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>Fecha</p>
                        <p className="font-semibold" style={{ color: currentTheme.colors.text }}>
                          {new Date(consultation.scheduledAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.accent}08` }}>
                        <ClockIcon className="w-6 h-6 mx-auto mb-2" style={{ color: currentTheme.colors.accent }} />
                        <p className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>Hora</p>
                        <p className="font-semibold" style={{ color: currentTheme.colors.text }}>
                          {new Date(consultation.scheduledAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.accent}08` }}>
                        <ClockIcon className="w-6 h-6 mx-auto mb-2" style={{ color: currentTheme.colors.accent }} />
                        <p className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>Duración</p>
                        <p className="font-semibold" style={{ color: currentTheme.colors.text }}>
                          {consultation.duration} min
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.accent}08` }}>
                        <StarIcon className="w-6 h-6 mx-auto mb-2" style={{ color: currentTheme.colors.accent }} />
                        <p className="text-xs font-medium" style={{ color: currentTheme.colors.textSecondary }}>Precio</p>
                        <p className="font-semibold text-lg" style={{ color: currentTheme.colors.accent }}>
                          ${(consultation.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {consultation.topic && (
                      <div className="mt-6 p-4 rounded-lg border" style={{ 
                        backgroundColor: `${currentTheme.colors.accent}05`,
                        borderColor: `${currentTheme.colors.accent}20`
                      }}>
                        <p className="text-sm font-medium flex items-center gap-2 mb-2" style={{ color: currentTheme.colors.accent }}>
                          <StarIcon className="w-4 h-4" />
                          Tema
                        </p>
                        <p className="font-medium" style={{ color: currentTheme.colors.text }}>{consultation.topic}</p>
                      </div>
                    )}

                    {consultation.notes && (
                      <div className="mt-4 p-4 rounded-lg border" style={{ 
                        backgroundColor: `${currentTheme.colors.accent}05`,
                        borderColor: `${currentTheme.colors.accent}20`
                      }}>
                        <p className="text-sm font-medium flex items-center gap-2 mb-2" style={{ color: currentTheme.colors.accent }}>
                          <CheckCircleIcon className="w-4 h-4" />
                          Notas
                        </p>
                        <p style={{ color: currentTheme.colors.text }}>{consultation.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col items-end">
                    <div className="text-center mb-4">
                      <p className="text-sm font-medium mb-3" style={{ color: currentTheme.colors.text }}>
                        Estado
                      </p>
                      <span className="text-lg font-bold" style={{ 
                        color: (consultation.status === 'SCHEDULED' || consultation.status === 'PAID' || consultation.status === 'CONFIRMED') ? '#D4AF37' :
                               consultation.status === 'COMPLETED' ? '#16a34a' :
                               (consultation.status === 'CANCELLED' || consultation.status === 'NO_SHOW') ? '#dc2626' :
                               '#D4AF37'
                      }}>
                        {getStatusText(consultation.status)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      {(consultation.status === 'SCHEDULED' || consultation.status === 'PAID' || consultation.status === 'CONFIRMED') && (
                        <button
                          onClick={() => cancelConsultation(consultation.id)}
                          className="px-3 py-1.5 text-white text-xs rounded-md hover:shadow-md transition-all duration-200 font-medium flex items-center gap-1"
                          style={{ backgroundColor: '#dc2626' }}
                        >
                          <XCircleIcon className="w-3 h-3" />
                          Cancelar
                        </button>
                      )}
                      
                      {consultation.status === 'COMPLETED' && !consultation.rating && (
                        <div className="text-center p-4 rounded-lg border" style={{ 
                          backgroundColor: `${currentTheme.colors.accent}05`,
                          borderColor: `${currentTheme.colors.accent}20`
                        }}>
                          <StarIcon className="w-6 h-6 mx-auto mb-2" style={{ color: currentTheme.colors.accent }} />
                          <p className="text-sm font-medium mb-3" style={{ color: currentTheme.colors.text }}>
                            Califica esta consulta
                          </p>
                          <div className="flex justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => rateConsultation(consultation.id, star)}
                                className="hover:scale-125 transition-transform text-2xl p-1"
                                style={{ color: currentTheme.colors.accent }}
                                title={`${star} estrella${star > 1 ? 's' : ''}`}
                              >
                                ⭐
                              </button>
                            ))}
                          </div>
                          <p className="text-xs mt-2" style={{ color: currentTheme.colors.textSecondary }}>
                            Tu valoración ayuda a otros usuarios
                          </p>
                        </div>
                      )}
                      
                      {consultation.rating && (
                        <div className="text-center p-4 rounded-lg border" style={{ 
                          backgroundColor: `${currentTheme.colors.accent}05`,
                          borderColor: `${currentTheme.colors.accent}20`
                        }}>
                          <StarIcon className="w-6 h-6 mx-auto mb-2" style={{ color: currentTheme.colors.accent }} />
                          <p className="text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                            Tu Calificación
                          </p>
                          <div className="flex justify-center space-x-1">
                            {[...Array(consultation.rating)].map((_, i) => (
                              <span key={i} className="text-xl" style={{ color: currentTheme.colors.accent }}>⭐</span>
                            ))}
                          </div>
                          <p className="text-xs mt-2" style={{ color: currentTheme.colors.textSecondary }}>
                            Gracias por tu retroalimentación
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}