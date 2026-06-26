'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface UserStats {
  membership: {
    isActive: boolean
    type: string | null
    expiresAt: Date | null
  }
}

export default function UserMembership() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'USER') {
      router.push('/login')
      return
    }

    fetchUserStats()
  }, [session, status, router])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar información')
      }

      setStats(data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const membershipPlans = [
    {
      name: 'Básica',
      price: 19.99,
      duration: 'mensual',
      features: [
        '3 lecturas de oráculo gratis al mes',
        '10% descuento en consultas',
        '5% descuento en tienda',
        'Acceso a contenido exclusivo',
        'Soporte por email'
      ],
      color: 'border-gray-300',
      buttonColor: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      name: 'Premium',
      price: 39.99,
      duration: 'mensual',
      features: [
        '10 lecturas de oráculo gratis al mes',
        '20% descuento en consultas',
        '15% descuento en tienda',
        'Consultas prioritarias',
        'Acceso a webinars exclusivos',
        'Soporte prioritario',
        'Reportes astrológicos mensuales'
      ],
      color: 'border-indigo-500',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
      popular: true
    },
    {
      name: 'VIP',
      price: 79.99,
      duration: 'mensual',
      features: [
        'Lecturas de oráculo ilimitadas',
        '30% descuento en consultas',
        '25% descuento en tienda',
        'Consultas VIP (sin espera)',
        'Sesiones grupales exclusivas',
        'Consultor personal asignado',
        'Envío gratuito en compras',
        'Acceso beta a nuevas funciones'
      ],
      color: 'border-yellow-500',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Membresía</h1>
              <p className="text-gray-600">Gestiona tu membresía y beneficios</p>
            </div>
            <Link
              href="/user"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            <Link href="/user" className="hover:bg-indigo-700 px-3 py-2 rounded-md">
              Dashboard
            </Link>
            <Link href="/user/oracle" className="hover:bg-indigo-700 px-3 py-2 rounded-md">
              Oráculo
            </Link>
            <Link href="/user/consultations" className="hover:bg-indigo-700 px-3 py-2 rounded-md">
              Mis Consultas
            </Link>
            <Link href="/user/store" className="hover:bg-indigo-700 px-3 py-2 rounded-md">
              Tienda
            </Link>
            <Link href="/user/membership" className="bg-indigo-900 px-3 py-2 rounded-md font-medium">
              Membresía
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Membership Status */}
        {stats && (
          <div className="mb-8">
            {stats.membership.isActive ? (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">⭐</div>
                  <div>
                    <h2 className="text-2xl font-bold">Membresía {stats.membership.type} Activa</h2>
                    <p className="text-yellow-100">
                      {stats.membership.expiresAt && (
                        <>Expira el: {new Date(stats.membership.expiresAt).toLocaleDateString('es-ES')}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <button className="bg-white text-orange-600 px-4 py-2 rounded font-medium hover:bg-gray-100">
                    Gestionar Membresía
                  </button>
                  <button className="bg-orange-600 text-white px-4 py-2 rounded font-medium hover:bg-orange-700">
                    Ver Beneficios
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">💫</div>
                  <div>
                    <h2 className="text-2xl font-bold">Sin Membresía Activa</h2>
                    <p className="text-gray-200">
                      Obtén beneficios exclusivos con una membresía premium
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="bg-white text-gray-600 px-6 py-2 rounded font-medium hover:bg-gray-100">
                    Explorar Planes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Membership Benefits */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">¿Por qué tener una membresía?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🔮</div>
              <h4 className="font-medium text-gray-900 mb-2">Lecturas Gratis</h4>
              <p className="text-sm text-gray-600">
                Accede a lecturas de oráculo gratuitas cada mes según tu plan
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-medium text-gray-900 mb-2">Descuentos Exclusivos</h4>
              <p className="text-sm text-gray-600">
                Obtén descuentos significativos en consultas y productos de la tienda
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-medium text-gray-900 mb-2">Acceso Prioritario</h4>
              <p className="text-sm text-gray-600">
                Agenda consultas con prioridad y accede a contenido exclusivo
              </p>
            </div>
          </div>
        </div>

        {/* Membership Plans */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Elige el plan perfecto para ti
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {membershipPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-lg shadow-lg p-6 border-2 ${plan.color} relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ${plan.price}
                  </div>
                  <p className="text-gray-600 text-sm">por {plan.duration}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium ${plan.buttonColor} transition-colors`}
                >
                  {stats?.membership.isActive && stats.membership.type === plan.name.toUpperCase()
                    ? 'Plan Actual'
                    : 'Seleccionar Plan'
                  }
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Preguntas Frecuentes</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">¿Puedo cancelar mi membresía en cualquier momento?</h4>
              <p className="text-sm text-gray-600">
                Sí, puedes cancelar tu membresía en cualquier momento. Mantendrás acceso a los beneficios hasta el final del período pagado.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">¿Los descuentos se aplican automáticamente?</h4>
              <p className="text-sm text-gray-600">
                Sí, todos los descuentos de membresía se aplican automáticamente al momento de realizar consultas o compras.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">¿Puedo cambiar de plan en cualquier momento?</h4>
              <p className="text-sm text-gray-600">
                Puedes actualizar tu plan en cualquier momento. Los downgrades entrarán en vigor en el siguiente ciclo de facturación.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">¿Las lecturas gratuitas se acumulan?</h4>
              <p className="text-sm text-gray-600">
                Las lecturas gratuitas no se acumulan entre meses. Cada mes recibes la cantidad correspondiente a tu plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}