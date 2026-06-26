'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'
import Calendar from '@/components/Calendar'
import { UserIcon, ClockIcon, CurrencyDollarIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import GuestConsultationPrompt from '@/components/consultations/GuestConsultationPrompt'

interface Consultant {
  id: string
  fullName: string
  email: string
  profileImage?: string
  specialty?: string
  hourlyRate: number
  rating?: number
  totalConsultations?: number
  bio?: string
}

interface BookingData {
  consultantId: string
  date: Date
  time: { hour: number; minute: number }
  duration: number
  notes?: string
}



interface Consultant {
  id: string
  fullName: string
  email: string
  profileImage?: string
  specialty?: string
  hourlyRate: number
  rating?: number
  totalConsultations?: number
  bio?: string
}

interface BookingData {
  consultantId: string
  date: Date
  time: { hour: number; minute: number }
  duration: number
  notes?: string
}

export default function BookConsultationPage() {
  const { data: session, status } = useSession()
  const { currentTheme } = useTheme()
  const router = useRouter()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number } | null>(null)
  const [duration, setDuration] = useState(60) // 60 minutos por defecto
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Seleccionar consultor, 2: Seleccionar fecha/hora, 3: Confirmar
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)

  useEffect(() => {
    // Permitir acceso sin autenticación para navegar y seleccionar
    fetchConsultants()
    
    // Verificar si hay consulta pendiente después del login/registro
    const pendingConsultation = localStorage.getItem('pendingConsultation')
    if (pendingConsultation && session) {
      try {
        const data = JSON.parse(pendingConsultation)
        // Si hay datos pendientes y ahora está autenticado, proceder con la reserva
        localStorage.removeItem('pendingConsultation')
        // Aquí podrías restaurar el estado si es necesario
        // Por ahora, el usuario puede confirmar manualmente
      } catch (error) {
        console.error('Error parsing pending consultation:', error)
        localStorage.removeItem('pendingConsultation')
      }
    }
  }, [session])

  const fetchConsultants = async () => {
    try {
      const response = await fetch('/api/consultants')
      if (response.ok) {
        const data = await response.json()
        setConsultants(data)
      }
    } catch (error) {
      console.error('Error fetching consultants:', error)
    }
  }

  const handleBookConsultation = async () => {
    console.log('🎯 handleBookConsultation ejecutado!')
    
    if (!selectedConsultant || !selectedDate || !selectedTime) {
      console.log('❌ Datos faltantes:', { selectedConsultant, selectedDate, selectedTime })
      alert('Por favor completa todos los campos: consultor, fecha y hora')
      return
    }

    console.log('Session status:', session)
    
    // Verificar autenticación antes de proceder
    if (!session) {
      console.log('No hay sesión, mostrando prompt de invitado')
      setShowGuestPrompt(true)
      return
    }

    console.log('Iniciando booking para usuario autenticado')
    setLoading(true)
    try {
      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(selectedTime.hour, selectedTime.minute)
      console.log('Enviando datos:', {
        consultantId: selectedConsultant.id,
        scheduledAt: scheduledAt.toISOString(),
        duration,
        notes: notes.trim() || undefined,
      })

      const response = await fetch('/api/consultations/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultantId: selectedConsultant.id,
          scheduledAt: scheduledAt.toISOString(),
          duration,
          notes: notes.trim() || undefined,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const consultation = result.consultation || result
        // Redirigir al pago
        router.push(`/payment/${consultation.id}`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || error.message}`)
      }
    } catch (error) {
      console.error('Error booking consultation:', error)
      alert('Error al agendar la consulta')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (hour: number, minute: number) => {
    const time = new Date()
    time.setHours(hour, minute)
    return time.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const calculateTotal = () => {
    if (!selectedConsultant) return 0
    return (selectedConsultant.hourlyRate * duration) / 60
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: currentTheme.colors.accent }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: currentTheme.colors.background }}>
      <GoldenStarsBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <VideoCameraIcon className="mx-auto h-12 w-12 mb-4" style={{ color: currentTheme.colors.accent }} />
          <h1 className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>Agendar Videoconsulta</h1>
          <p className="mt-2" style={{ color: currentTheme.colors.textSecondary }}>
            Conecta con expertos para resolver tus consultas de manera virtual
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { number: 1, title: 'Seleccionar Consultor', active: step === 1, completed: step > 1 },
              { number: 2, title: 'Fecha y Hora', active: step === 2, completed: step > 2 },
              { number: 3, title: 'Confirmar', active: step === 3, completed: false }
            ].map(({ number, title, active, completed }) => (
              <div key={number} className="flex items-center">
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full border-2 text-white"
                  style={{
                    backgroundColor: completed || active ? currentTheme.colors.accent : 'transparent',
                    borderColor: completed || active ? currentTheme.colors.accent : currentTheme.colors.borderColor,
                    color: completed || active ? 'white' : currentTheme.colors.textSecondary
                  }}
                >
                  {completed ? '✓' : number}
                </div>
                <span 
                  className="ml-2 text-sm font-medium"
                  style={{ color: active ? currentTheme.colors.accent : currentTheme.colors.textSecondary }}
                >
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Seleccionar Consultor */}
        {step === 1 && (
          <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: currentTheme.colors.text }}>Selecciona un Consultor</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {consultants.map((consultant) => (
                <div 
                  key={consultant.id}
                  className="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
                  style={{
                    borderColor: selectedConsultant?.id === consultant.id ? currentTheme.colors.accent : currentTheme.colors.borderColor,
                    backgroundColor: selectedConsultant?.id === consultant.id ? `${currentTheme.colors.accent}10` : 'transparent'
                  }}
                  onClick={() => setSelectedConsultant(consultant)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    {consultant.profileImage ? (
                      <img 
                        src={consultant.profileImage} 
                        alt={consultant.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
                        <UserIcon className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium" style={{ color: currentTheme.colors.text }}>{consultant.fullName}</h3>
                      {consultant.specialty && (
                        <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>{consultant.specialty}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Tarifa por hora</span>
                      <span className="font-medium" style={{ color: currentTheme.colors.accent }}>
                        ${consultant.hourlyRate.toLocaleString()} COP
                      </span>
                    </div>
                    
                    {consultant.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Calificación</span>
                        <div className="flex items-center">
                          <span style={{ color: currentTheme.colors.accentSecondary }}>★</span>
                          <span className="text-sm ml-1" style={{ color: currentTheme.colors.text }}>{consultant.rating}/5</span>
                        </div>
                      </div>
                    )}
                    
                    {consultant.totalConsultations && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Consultas</span>
                        <span className="text-sm" style={{ color: currentTheme.colors.text }}>{consultant.totalConsultations}</span>
                      </div>
                    )}
                  </div>
                  
                  {consultant.bio && (
                    <p className="mt-3 text-sm line-clamp-2" style={{ color: currentTheme.colors.textSecondary }}>
                      {consultant.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            {selectedConsultant && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ background: currentTheme.colors.buttonGradient }}
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Seleccionar Fecha y Hora */}
        {step === 2 && selectedConsultant && (
          <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
                Selecciona Fecha y Hora
              </h2>
              <button
                onClick={() => setStep(1)}
                className="text-sm hover:opacity-75 transition-opacity"
                style={{ color: currentTheme.colors.accent }}
              >
                ← Cambiar consultor
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <Calendar
                  selectedDate={selectedDate || undefined}
                  selectedTime={selectedTime}
                  onDateSelect={(date) => {
                    setSelectedDate(date)
                    setSelectedTime(null)
                  }}
                  onTimeSelect={(time) => {
                    setSelectedTime(time)
                  }}
                  minDate={new Date()}
                />
              </div>

              <div className="space-y-6">
                {/* Información del consultor seleccionado */}
                <div className="border rounded-lg p-4" style={{ borderColor: currentTheme.colors.borderColor }}>
                  <h3 className="font-medium mb-2" style={{ color: currentTheme.colors.text }}>Consultor Seleccionado</h3>
                  <div className="flex items-center space-x-3">
                    {selectedConsultant.profileImage ? (
                      <img 
                        src={selectedConsultant.profileImage} 
                        alt={selectedConsultant.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
                        <UserIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
                      </div>
                    )}
                    <div>
                      <p className="font-medium" style={{ color: currentTheme.colors.text }}>{selectedConsultant.fullName}</p>
                      <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                        ${selectedConsultant.hourlyRate.toLocaleString()} COP/hora
                      </p>
                    </div>
                  </div>
                </div>

                {/* Duración */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                    Duración de la consulta
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: currentTheme.colors.borderColor, 
                      backgroundColor: currentTheme.colors.cardBg,
                      color: currentTheme.colors.text
                    }}
                  >
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1.5 horas</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: currentTheme.colors.borderColor, 
                      backgroundColor: currentTheme.colors.cardBg,
                      color: currentTheme.colors.text
                    }}
                    placeholder="Describe brevemente el tema de tu consulta..."
                  />
                </div>

                {/* Total */}
                <div className="border-t pt-4" style={{ borderColor: currentTheme.colors.borderColor }}>
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span style={{ color: currentTheme.colors.text }}>Total:</span>
                    <span style={{ color: currentTheme.colors.accent }}>
                      ${calculateTotal().toLocaleString()} COP
                    </span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                    {duration} minutos × ${selectedConsultant.hourlyRate.toLocaleString()}/hora
                  </p>
                </div>

                {selectedDate && (
                  <button
                    onClick={() => {
                      console.log('🔄 Navegando al paso 3')
                      setStep(3)
                    }}
                    className="w-full text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
                    style={{ background: currentTheme.colors.buttonGradient }}
                  >
                    Continuar a Confirmación
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmación */}
        {step === 3 && selectedConsultant && selectedDate && (
          <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: currentTheme.colors.text }}>
                Confirmar Videoconsulta
              </h2>
              <button
                onClick={() => setStep(2)}
                className="text-sm hover:opacity-75 transition-opacity"
                style={{ color: currentTheme.colors.accent }}
              >
                ← Modificar fecha/hora
              </button>
            </div>

            <div className="space-y-6">
              {/* Resumen de la consulta */}
              <div className="rounded-lg p-6" style={{ backgroundColor: `${currentTheme.colors.borderColor}50` }}>
                <h3 className="font-medium mb-4" style={{ color: currentTheme.colors.text }}>Resumen de tu Videoconsulta</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5" style={{ color: currentTheme.colors.textSecondary }} />
                      <div>
                        <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Consultor</p>
                        <p className="font-medium" style={{ color: currentTheme.colors.text }}>{selectedConsultant.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-5 h-5" style={{ color: currentTheme.colors.textSecondary }} />
                      <div>
                        <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Fecha y Hora</p>
                        <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                          {selectedDate.toLocaleDateString('es-CO', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        {selectedTime && (
                          <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                            {formatTime(selectedTime.hour, selectedTime.minute)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <VideoCameraIcon className="w-5 h-5" style={{ color: currentTheme.colors.textSecondary }} />
                      <div>
                        <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Duración</p>
                        <p className="font-medium" style={{ color: currentTheme.colors.text }}>{duration} minutos</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CurrencyDollarIcon className="w-5 h-5" style={{ color: currentTheme.colors.textSecondary }} />
                      <div>
                        <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Total a Pagar</p>
                        <p className="font-medium text-xl" style={{ color: currentTheme.colors.accent }}>
                          ${calculateTotal().toLocaleString()} COP
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {notes && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: currentTheme.colors.borderColor }}>
                    <p className="text-sm mb-1" style={{ color: currentTheme.colors.textSecondary }}>Notas adicionales:</p>
                    <p style={{ color: currentTheme.colors.text }}>{notes}</p>
                  </div>
                )}
              </div>

              {/* Términos y condiciones */}
              <div className="border rounded-lg p-4" style={{ backgroundColor: `${currentTheme.colors.accent}10`, borderColor: currentTheme.colors.accent }}>
                <h4 className="font-medium mb-2" style={{ color: currentTheme.colors.text }}>📋 Términos importantes:</h4>
                <ul className="text-sm space-y-1" style={{ color: currentTheme.colors.textSecondary }}>
                  <li>• El pago se procesa al confirmar la consulta</li>
                  <li>• Recibirás un enlace de videollamada por email</li>
                  <li>• Puedes cancelar hasta 24 horas antes sin costo</li>
                  <li>• Si el consultor no se presenta, se reembolsa el 100%</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border px-6 py-3 rounded-lg hover:opacity-75 transition-opacity"
                  style={{ borderColor: currentTheme.colors.borderColor, color: currentTheme.colors.text }}
                >
                  Modificar
                </button>
                <button
                  onClick={handleBookConsultation}
                  disabled={loading}
                  className="flex-1 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                  style={{ background: currentTheme.colors.buttonGradient }}
                >
                  {loading ? 'Procesando...' : 'Confirmar y Pagar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guest Consultation Prompt */}
      <GuestConsultationPrompt
        isOpen={showGuestPrompt}
        onClose={() => setShowGuestPrompt(false)}
        consultationData={{
          consultantName: selectedConsultant?.fullName || 'Consultor',
          date: selectedDate ? new Date(selectedDate).toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : '',
          time: selectedTime ? formatTime(selectedTime.hour, selectedTime.minute) : '',
          duration,
          totalPrice: calculateTotal()
        }}
      />
    </div>
  )
}