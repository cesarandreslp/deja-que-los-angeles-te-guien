'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import VideoCallSection from '@/components/VideoCallSection'

interface Consultation {
  id: string
  scheduledAt: string
  duration: number
  price: number
  status: string
  notes?: string
  topic?: string
  meetingUrl?: string
  user: {
    id: string
    fullName: string
    email: string
    profileImage?: string
  }
}

export default function ConsultantConsultations() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'CONSULTANT') {
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

  const updateConsultationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar consulta')
      }

      fetchConsultations()
    } catch (error) {
      console.error('Error updating consultation:', error)
      alert('Error al actualizar la consulta')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'RESCHEDULED': return 'bg-yellow-100 text-yellow-800'
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Programada'
      case 'COMPLETED': return 'Completada'
      case 'CANCELLED': return 'Cancelada'
      case 'RESCHEDULED': return 'Reprogramada'
      case 'NO_SHOW': return 'No asistió'
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
              <h1 className="text-3xl font-bold text-gray-900">Mis Consultas</h1>
              <p className="text-gray-600">Gestiona tu agenda de videoconsultas</p>
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
            <Link href="/consultant/consultations" className="bg-purple-900 px-3 py-2 rounded-md font-medium">
              Mis Consultas
            </Link>
            <Link href="/consultant/schedule" className="hover:bg-purple-700 px-3 py-2 rounded-md">
              Horarios
            </Link>
            <Link href="/consultant/commissions" className="hover:bg-purple-700 px-3 py-2 rounded-md">
              Comisiones
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('scheduled')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'scheduled' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Programadas
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'completed' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completadas
            </button>
            <button
              onClick={() => setFilter('rescheduled')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'rescheduled' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reprogramadas
            </button>
          </div>
        </div>

        {/* Consultations List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-medium mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchConsultations}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : consultations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay consultas {filter !== 'all' ? getStatusText(filter.toUpperCase()).toLowerCase() : ''}
            </h3>
            <p className="text-gray-600">
              Las consultas aparecerán aquí cuando los usuarios las programen.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
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
                        <div className="flex items-center">
                          {consultation.user.profileImage ? (
                            <img
                              className="h-8 w-8 rounded-full mr-3"
                              src={consultation.user.profileImage}
                              alt=""
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center mr-3">
                              <span className="text-white text-sm font-medium">
                                {consultation.user.fullName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {consultation.user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {consultation.user.email}
                            </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consultation.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(consultation.price / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${getStatusColor(consultation.status)}`}>
                          {getStatusText(consultation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <VideoCallSection
                            consultationId={consultation.id}
                            status={consultation.status}
                            meetingUrl={consultation.meetingUrl}
                            size="small"
                            variant="consultant"
                          />
                          
                          {(consultation.status === 'SCHEDULED' || consultation.status === 'PAID' || consultation.status === 'CONFIRMED') && false && (
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
                              <div className="flex items-center justify-center mb-2">
                                <svg className="w-4 h-4 text-purple-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs font-semibold text-purple-800">Videollamada</span>
                              </div>
                              
                              <Link
                                href={`/videocall/${consultation.id}`}
                                className="block w-full px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition-colors text-center"
                              >
                                Unirse a la Consulta
                              </Link>
                              
                              {consultation.meetingUrl && (
                                <button
                                  onClick={() => navigator.clipboard.writeText(consultation.meetingUrl!)}
                                  className="w-full mt-1 px-2 py-1 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                                >
                                  � Copiar enlace
                                </button>
                              )}
                            </div>
                          )}
                          
                          {consultation.status === 'SCHEDULED' && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <button
                                onClick={() => updateConsultationStatus(consultation.id, 'COMPLETED')}
                                className="text-green-600 hover:text-green-900 text-xs"
                              >
                                Completar
                              </button>
                              <button
                                onClick={() => updateConsultationStatus(consultation.id, 'RESCHEDULED')}
                                className="text-yellow-600 hover:text-yellow-900 text-xs"
                              >
                                Reprogramar
                              </button>
                              <button
                                onClick={() => updateConsultationStatus(consultation.id, 'NO_SHOW')}
                                className="text-gray-600 hover:text-gray-900 text-xs"
                              >
                                No Show
                              </button>
                            </div>
                          )}
                        </div>
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