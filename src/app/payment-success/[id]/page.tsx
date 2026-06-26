'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  UserIcon,
  VideoCameraIcon,
  CalendarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface Consultation {
  id: string
  scheduledAt: string
  duration: number
  price: number
  status: string
  paymentStatus: string
  paymentProvider: string
  consultor: {
    id: string
    fullName: string
    email: string
    profileImage?: string
  }
}

export default function PaymentSuccessPage() {
  const { data: session, status } = useSession()
  const { currentTheme } = useTheme()
  const router = useRouter()
  const params = useParams()
  const consultationId = params?.id as string

  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (consultationId) {
      fetchConsultation()
    }
  }, [status, consultationId, router])

  const fetchConsultation = async () => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}`)
      if (response.ok) {
        const result = await response.json()
        setConsultation(result.data || result)
      }
    } catch (error) {
      console.error('Error fetching consultation:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-CO', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: currentTheme.colors.accent }}></div>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 max-w-md mx-auto px-4">
          <div className="rounded-lg shadow-sm border p-8 text-center" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
            <p style={{ color: currentTheme.colors.text }}>Consulta no encontrada</p>
          </div>
        </div>
      </div>
    )
  }

  const { date, time } = formatDateTime(consultation.scheduledAt)

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: currentTheme.colors.background }}>
      <GoldenStarsBackground />
      
      <div className="relative z-10 max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6" 
               style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
            <CheckCircleIcon className="w-12 h-12" style={{ color: currentTheme.colors.accent }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: currentTheme.colors.text }}>
            ¡Pago Exitoso!
          </h1>
          <p className="text-lg" style={{ color: currentTheme.colors.textSecondary }}>
            Tu videoconsulta ha sido confirmada
          </p>
        </div>

        {/* Consultation Details */}
        <div className="rounded-lg shadow-sm border p-6 mb-6" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: currentTheme.colors.text }}>
            Detalles de tu Consulta
          </h2>

          <div className="space-y-6">
            {/* Consultor */}
            <div className="flex items-center space-x-4">
              {consultation.consultor.profileImage ? (
                <img 
                  src={consultation.consultor.profileImage} 
                  alt={consultation.consultor.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
                  <UserIcon className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
                </div>
              )}
              <div>
                <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                  {consultation.consultor.fullName}
                </p>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  Consultor Especializado
                </p>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="flex items-start space-x-3">
              <CalendarIcon className="w-5 h-5 mt-0.5" style={{ color: currentTheme.colors.textSecondary }} />
              <div>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Fecha y Hora</p>
                <p className="font-medium" style={{ color: currentTheme.colors.text }}>{date}</p>
                <p className="font-medium" style={{ color: currentTheme.colors.text }}>{time}</p>
              </div>
            </div>

            {/* Duración */}
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5" style={{ color: currentTheme.colors.textSecondary }} />
              <div>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Duración</p>
                <p className="font-medium" style={{ color: currentTheme.colors.text }}>{consultation.duration} minutos</p>
              </div>
            </div>

            {/* Pago */}
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5" style={{ color: '#10b981' }} />
              <div>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Estado del Pago</p>
                <p className="font-medium text-green-600">
                  Pagado - ${consultation.price.toLocaleString()} COP
                </p>
                <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                  Procesado con {consultation.paymentProvider}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="rounded-lg border p-6 mb-6" style={{ backgroundColor: `${currentTheme.colors.accent}10`, borderColor: currentTheme.colors.accent }}>
          <h3 className="font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            📋 Próximos Pasos
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" 
                   style={{ backgroundColor: currentTheme.colors.accent }}>1</div>
              <div>
                <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                  Recibirás un email de confirmación
                </p>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  En unos minutos llegará a {session?.user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" 
                   style={{ backgroundColor: currentTheme.colors.accent }}>2</div>
              <div>
                <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                  Enlace de videollamada
                </p>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  Lo recibirás 30 minutos antes de la consulta
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" 
                   style={{ backgroundColor: currentTheme.colors.accent }}>3</div>
              <div>
                <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                  Recordatorios automáticos
                </p>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  Te notificaremos 24h y 1h antes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/user/consultations')}
            className="flex-1 flex items-center justify-center space-x-2 text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            style={{ background: currentTheme.colors.buttonGradient }}
          >
            <VideoCameraIcon className="w-5 h-5" />
            <span>Ver Mis Consultas</span>
          </button>
          
          <button
            onClick={() => router.push('/book-consultation')}
            className="flex-1 flex items-center justify-center space-x-2 border py-3 rounded-lg hover:opacity-75 transition-opacity font-medium"
            style={{ borderColor: currentTheme.colors.borderColor, color: currentTheme.colors.text }}
          >
            <span>Agendar Otra Consulta</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
            ¿Necesitas ayuda? Contáctanos en{' '}
            <a href="mailto:soporte@oraculo.com" className="hover:underline" style={{ color: currentTheme.colors.accent }}>
              soporte@oraculo.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}