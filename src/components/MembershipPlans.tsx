'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'
import {
  CheckIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UsersIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface MembershipPlan {
  id: string
  name: string
  description: string
  price: string
  currency: string
  durationDays: number
  isActive: boolean
  subscribersCount: number
  pricePerDay: string
  durationText: string
  isPopular: boolean
  benefits?: string[]
  pricing?: {
    total: string
    monthly: string | null
    daily: string
  }
}

interface MembershipStatus {
  hasActiveMembership: boolean
  hasPendingMembership: boolean
  isPremium: boolean
  activeMembership?: any
  pendingMembership?: any
}

export default function MembershipPlans() {
  const { data: session } = useSession()
  const { currentTheme } = useTheme()
  const router = useRouter()
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPlans()
    if (session?.user) {
      fetchMembershipStatus()
    }
  }, [session])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/memberships/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error al cargar planes:', error)
      setError('Error al cargar los planes')
    } finally {
      setLoading(false)
    }
  }

  const fetchMembershipStatus = async () => {
    try {
      const response = await fetch('/api/memberships/status')
      if (response.ok) {
        const data = await response.json()
        setMembershipStatus(data.status)
      }
    } catch (error) {
      console.error('Error al cargar estado de membresía:', error)
    }
  }

  const handleSubscribe = async (planId: string, paymentProvider: 'STRIPE' | 'MERCADOPAGO') => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    if (membershipStatus?.hasActiveMembership) {
      alert('Ya tienes una membresía activa')
      return
    }

    setSubscribing(planId)
    setError('')

    try {
      // Paso 1: Crear la suscripción
      const subscriptionResponse = await fetch('/api/memberships/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          paymentProvider
        }),
      })

      const subscriptionData = await subscriptionResponse.json()

      if (!subscriptionResponse.ok) {
        setError(subscriptionData.error || 'Error al crear la suscripción')
        return
      }

      // Paso 2: Crear sesión de pago según el proveedor
      let paymentResponse
      
      if (paymentProvider === 'STRIPE') {
        paymentResponse = await fetch('/api/payments/stripe/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriptionId: subscriptionData.subscription.id
          }),
        })
      } else {
        paymentResponse = await fetch('/api/payments/mercadopago/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriptionId: subscriptionData.subscription.id
          }),
        })
      }

      const paymentData = await paymentResponse.json()

      if (paymentResponse.ok && paymentData.paymentUrl) {
        // Redirigir a la página de pago
        window.location.href = paymentData.paymentUrl
      } else {
        setError(paymentData.error || 'Error al crear la sesión de pago')
      }

    } catch (error) {
      console.error('Error:', error)
      setError('Error al procesar la suscripción')
    } finally {
      setSubscribing(null)
    }
  }

  const getPlanBenefits = (plan: MembershipPlan): string[] => {
    if (plan.benefits) return plan.benefits

    // Beneficios por defecto basados en la duración
    const baseBenefits = [
      'Acceso completo a todas las consultas angelicales',
      'Lecturas de oráculo ilimitadas',
      'Acceso prioritario a consultores especializados',
      'Descuentos exclusivos en la tienda angelical'
    ]

    if (plan.durationDays >= 90) {
      baseBenefits.push('Seguimiento personalizado de tu crecimiento espiritual')
    }

    if (plan.durationDays >= 180) {
      baseBenefits.push('Acceso a la comunidad VIP de miembros')
      baseBenefits.push('Consultas grupales mensuales')
    }

    if (plan.durationDays >= 365) {
      baseBenefits.push('Consultas personalizadas por video')
      baseBenefits.push('Reportes angelicales detallados en PDF')
      baseBenefits.push('Acceso a webinars exclusivos')
      baseBenefits.push('Soporte prioritario 24/7')
    }

    return baseBenefits
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: currentTheme.colors.accent }}></div>
            <p className="mt-4" style={{ color: currentTheme.colors.text }}>Cargando planes de membresía...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
      <GoldenStarsBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
            style={{ color: currentTheme.colors.accent }}
          >
            Planes de Membresía
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl max-w-3xl mx-auto"
            style={{ color: currentTheme.colors.text }}
          >
            Accede a contenido premium, consultas especializadas y beneficios exclusivos
          </motion.p>
        </div>

      {/* Status del usuario */}
      {membershipStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {membershipStatus.hasActiveMembership && (
            <div className="border rounded-lg p-4" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 mr-2" style={{ color: currentTheme.colors.accent }} />
                <div>
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                    Tienes una membresía activa: {membershipStatus.activeMembership?.plan.name}
                  </p>
                  <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                    Expira en {membershipStatus.activeMembership?.daysRemaining} días
                  </p>
                </div>
              </div>
            </div>
          )}

          {membershipStatus.hasPendingMembership && (
            <div className="border rounded-lg p-4" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
              <div className="flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" style={{ color: currentTheme.colors.accentSecondary }} />
                <div>
                  <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                    Tienes una suscripción pendiente: {membershipStatus.pendingMembership?.plan.name}
                  </p>
                  <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                    Completa el pago para activar tu membresía
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border rounded-lg p-4"
          style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}
        >
          <p style={{ color: currentTheme.colors.text }}>{error}</p>
        </motion.div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl"
            style={{ 
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: plan.isPopular ? currentTheme.colors.accent : currentTheme.colors.borderColor
            }}
          >
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1" style={{ background: currentTheme.colors.buttonGradient, color: 'white' }}>
                  <StarSolidIcon className="h-4 w-4" />
                  Más Popular
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: currentTheme.colors.text }}>{plan.name}</h3>
                <p className="text-sm mb-4" style={{ color: currentTheme.colors.textSecondary }}>{plan.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold" style={{ color: currentTheme.colors.accent }}>${plan.price}</span>
                    <span className="text-lg ml-1" style={{ color: currentTheme.colors.textSecondary }}>{plan.currency}</span>
                  </div>
                  <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>{plan.durationText}</p>
                  <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                    ${plan.pricePerDay} por día
                  </p>
                </div>

                {/* Stats */}
                <div className="flex justify-center items-center gap-4 text-sm mb-6" style={{ color: currentTheme.colors.textSecondary }}>
                  <div className="flex items-center gap-1">
                    <UsersIcon className="h-4 w-4" />
                    <span>{plan.subscribersCount} miembros</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>{plan.durationDays} días</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4" style={{ color: currentTheme.colors.text }}>Beneficios incluidos:</h4>
                <ul className="space-y-3">
                  {getPlanBenefits(plan).map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: currentTheme.colors.accent }} />
                      <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                {!session?.user ? (
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:opacity-90"
                    style={{ backgroundColor: currentTheme.colors.textSecondary, color: 'white' }}
                  >
                    Inicia Sesión para Suscribirte
                  </button>
                ) : membershipStatus?.hasActiveMembership ? (
                  <button
                    disabled
                    className="w-full font-semibold py-3 px-6 rounded-lg cursor-not-allowed opacity-50"
                    style={{ backgroundColor: currentTheme.colors.borderColor, color: currentTheme.colors.textSecondary }}
                  >
                    Ya tienes una membresía activa
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleSubscribe(plan.id, 'STRIPE')}
                      disabled={subscribing === plan.id}
                      className="w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: currentTheme.colors.buttonGradient, color: 'white' }}
                    >
                      {subscribing === plan.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Procesando...
                        </div>
                      ) : (
                        `Suscribirse con Stripe`
                      )}
                    </button>
                    <button
                      onClick={() => handleSubscribe(plan.id, 'MERCADOPAGO')}
                      disabled={subscribing === plan.id}
                      className="w-full font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      style={{ backgroundColor: currentTheme.colors.accentSecondary, color: 'white' }}
                    >
                      O pagar con MercadoPago
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
            No hay planes disponibles
          </h3>
          <p style={{ color: currentTheme.colors.textSecondary }}>
            Los planes de membresía estarán disponibles pronto
          </p>
        </div>
      )}

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 rounded-2xl p-8"
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: currentTheme.colors.text }}>
          Preguntas Frecuentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text }}>¿Puedo cancelar en cualquier momento?</h4>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              Sí, puedes cancelar tu suscripción en cualquier momento desde tu perfil.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text }}>¿Hay descuentos para estudiantes?</h4>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              Contáctanos para conocer nuestros descuentos especiales disponibles.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text }}>¿Qué métodos de pago aceptan?</h4>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              Aceptamos tarjetas de crédito/débito a través de Stripe y MercadoPago.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2" style={{ color: currentTheme.colors.text }}>¿Los precios incluyen impuestos?</h4>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              Los precios mostrados no incluyen impuestos, que se calculan al finalizar la compra.
            </p>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  )
}