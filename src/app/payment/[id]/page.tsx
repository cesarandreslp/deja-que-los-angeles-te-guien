'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'
import { 
  CreditCardIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  UserIcon,
  CurrencyDollarIcon,
  VideoCameraIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Consultation {
  id: string
  scheduledAt: string
  duration: number
  price: number
  notes?: string
  status: string
  consultor: {
    id: string
    fullName: string
    email: string
    profileImage?: string
  }
  user: {
    id: string
    fullName: string
    email: string
    profileImage?: string
  }
}

export default function PaymentPage() {
  const { data: session, status } = useSession()
  const { currentTheme } = useTheme()
  const router = useRouter()
  const params = useParams()
  const consultationId = params?.id as string

  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('mercadopago')
  const [error, setError] = useState('')

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
        setConsultation(result.data || result) // Manejar ambos formatos de respuesta
      } else {
        setError('Consulta no encontrada')
      }
    } catch (error) {
      console.error('Error fetching consultation:', error)
      setError('Error al cargar la consulta')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!consultation) return

    setProcessing(true)
    setError('')

    try {
      const response = await fetch(`/api/consultations/${consultation.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.paymentUrl) {
          // Redirigir a la página de pago externa
          window.location.href = data.paymentUrl
        } else {
          // Pago procesado directamente
          router.push(`/payment-success/${consultation.id}`)
        }
      } else {
        const error = await response.json()
        setError(error.message || 'Error al procesar el pago')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      setError('Error al procesar el pago')
    } finally {
      setProcessing(false)
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

  if (error && !consultation) {
    return (
      <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 max-w-md mx-auto px-4">
          <div className="rounded-lg shadow-sm border p-8 text-center" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4" style={{ color: '#f59e0b' }} />
            <h1 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
              Error
            </h1>
            <p className="mb-6" style={{ color: currentTheme.colors.textSecondary }}>
              {error}
            </p>
            <button
              onClick={() => router.push('/book-consultation')}
              className="text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
              style={{ background: currentTheme.colors.buttonGradient }}
            >
              Volver a Reservar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return null
  }

  const { date, time } = formatDateTime(consultation.scheduledAt)

  return (
    <div className="min-h-screen relative overflow-hidden py-8" style={{ backgroundColor: currentTheme.colors.background }}>
      <GoldenStarsBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: currentTheme.colors.text }}>
            Procesar Pago
          </h1>
          <p style={{ color: currentTheme.colors.textSecondary }}>
            Completa el pago para confirmar tu videoconsulta
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Resumen de la Consulta */}
          <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: currentTheme.colors.text }}>
              Resumen de la Consulta
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
                <ClockIcon className="w-5 h-5 mt-0.5" style={{ color: currentTheme.colors.textSecondary }} />
                <div>
                  <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Fecha y Hora</p>
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>{date}</p>
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>{time}</p>
                </div>
              </div>

              {/* Duración */}
              <div className="flex items-center space-x-3">
                <VideoCameraIcon className="w-5 h-5" style={{ color: currentTheme.colors.textSecondary }} />
                <div>
                  <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Duración</p>
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>{consultation.duration} minutos</p>
                </div>
              </div>

              {/* Notas */}
              {consultation.notes && (
                <div className="pt-4 border-t" style={{ borderColor: currentTheme.colors.borderColor }}>
                  <p className="text-sm mb-1" style={{ color: currentTheme.colors.textSecondary }}>Notas:</p>
                  <p style={{ color: currentTheme.colors.text }}>{consultation.notes}</p>
                </div>
              )}

              {/* Total */}
              <div className="pt-4 border-t" style={{ borderColor: currentTheme.colors.borderColor }}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>Total a Pagar:</span>
                  <span className="text-2xl font-bold" style={{ color: currentTheme.colors.accent }}>
                    ${consultation.price.toLocaleString()} COP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="rounded-lg shadow-sm border p-6" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
            <h2 className="text-xl font-semibold mb-6" style={{ color: currentTheme.colors.text }}>
              Método de Pago
            </h2>

            <div className="space-y-4">
              {/* MercadoPago */}
              <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                style={{ borderColor: paymentMethod === 'mercadopago' ? currentTheme.colors.accent : currentTheme.colors.borderColor }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mercadopago"
                  checked={paymentMethod === 'mercadopago'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>MercadoPago</p>
                  <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                    Tarjetas de crédito, débito, PSE
                  </p>
                </div>
                <CreditCardIcon className="w-6 h-6" style={{ color: currentTheme.colors.textSecondary }} />
              </label>

              {/* Stripe */}
              <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                style={{ borderColor: paymentMethod === 'stripe' ? currentTheme.colors.accent : currentTheme.colors.borderColor }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>Stripe</p>
                  <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                    Tarjetas internacionales
                  </p>
                </div>
                <CreditCardIcon className="w-6 h-6" style={{ color: currentTheme.colors.textSecondary }} />
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Botón de Pago */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full mt-6 text-white py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-semibold text-lg"
              style={{ background: currentTheme.colors.buttonGradient }}
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Pagar ${consultation.price.toLocaleString()} COP</span>
                </div>
              )}
            </button>

            {/* Información de Seguridad */}
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.accent}10` }}>
              <h3 className="font-medium mb-2" style={{ color: currentTheme.colors.text }}>🔒 Pago Seguro</h3>
              <ul className="text-sm space-y-1" style={{ color: currentTheme.colors.textSecondary }}>
                <li>• Transacciones encriptadas SSL</li>
                <li>• No almacenamos datos de tarjetas</li>
                <li>• Procesamiento seguro certificado</li>
                <li>• Reembolso garantizado según términos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Términos y Condiciones */}
        <div className="mt-8 rounded-lg border p-6" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
          <h3 className="font-medium mb-3" style={{ color: currentTheme.colors.text }}>📋 Términos del Servicio</h3>
          <div className="text-sm space-y-2" style={{ color: currentTheme.colors.textSecondary }}>
            <p>• Al proceder con el pago, aceptas nuestros términos y condiciones de servicio.</p>
            <p>• La videoconsulta se realizará en la fecha y hora programada.</p>
            <p>• Recibirás un enlace de videollamada por email 30 minutos antes de la consulta.</p>
            <p>• Las cancelaciones deben realizarse con al menos 24 horas de anticipación para reembolso completo.</p>
            <p>• Si el consultor no se presenta, se reembolsará el 100% del pago automáticamente.</p>
          </div>
        </div>
      </div>
    </div>
  )
}