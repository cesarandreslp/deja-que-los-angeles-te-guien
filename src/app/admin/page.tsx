'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminStats } from '@/utils/stats'
import Link from 'next/link'

interface StatCard {
  title: string
  value: string
  description: string
  color: string
  icon: string
}

import { useTheme } from '@/context/ThemeContext'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentTheme } = useTheme()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar estadísticas')
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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme?.colors.background }}
      >
        <div 
          className="animate-spin rounded-full h-32 w-32 border-b-2"
          style={{ borderBottomColor: currentTheme?.colors.accent }}
        ></div>
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
          className="border rounded-lg p-6 max-w-md shadow-lg"
          style={{ 
            backgroundColor: currentTheme?.colors.cardBg,
            borderColor: currentTheme?.colors.borderColor
          }}
        >
          <h3 
            className="font-medium mb-2 text-red-600"
            style={{ fontFamily: currentTheme?.typography.headingFont }}
          >
            Error
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105"
            style={{ background: currentTheme?.colors.buttonGradient }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statCards: StatCard[] = [
    {
      title: 'Total Usuarios',
      value: stats.users.total.toString(),
      description: `${stats.users.active} activos`,
      color: currentTheme?.colors.accent || '#3b82f6',
      icon: '👥'
    },
    {
      title: 'Consultores',
      value: stats.users.consultors.toString(),
      description: 'Consultores registrados',
      color: currentTheme?.colors.accentSecondary || '#10b981',
      icon: '🔮'
    },
    {
      title: 'Consultas Totales',
      value: stats.consultations.total.toString(),
      description: `${stats.consultations.completed} completadas`,
      color: currentTheme?.colors.accent || '#8b5cf6',
      icon: '📞'
    },
    {
      title: 'Órdenes de Tienda',
      value: stats.store.totalOrders.toString(),
      description: `$${(stats.store.totalRevenue / 100).toFixed(2)} en ventas`,
      color: currentTheme?.colors.accentSecondary || '#f59e0b',
      icon: '🛒'
    },
    {
      title: 'Membresías',
      value: stats.memberships.activeSubscribers.toString(),
      description: `${stats.memberships.activePlans} planes activos`,
      color: currentTheme?.colors.accent || '#f97316',
      icon: '⭐'
    },
    {
      title: 'Comisiones Pagadas',
      value: `$${(stats.commissions.totalPaid / 100).toFixed(2)}`,
      description: `$${(stats.commissions.totalPending / 100).toFixed(2)} pendientes`,
      color: currentTheme?.colors.accentSecondary || '#6366f1',
      icon: '💰'
    }
  ]

  return (
    <div>
      {/* Content */}
      <div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div 
              key={index} 
              className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{ 
                backgroundColor: currentTheme?.colors.cardBg,
                borderColor: currentTheme?.colors.borderColor
              }}
            >
              <div className="flex items-center">
                <div 
                  className="rounded-xl p-3 mr-4 shadow-md"
                  style={{ backgroundColor: card.color }}
                >
                  <div className="text-white text-2xl">{card.icon}</div>
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.headingFont
                    }}
                  >
                    {card.title}
                  </h3>
                  <p 
                    className="text-3xl font-bold"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.headingFont
                    }}
                  >
                    {card.value}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: currentTheme?.colors.textSecondary }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consultas Recientes */}
          <div 
            className="rounded-xl shadow-lg p-6"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-lg font-semibold"
                style={{ 
                  color: currentTheme?.colors.text,
                  fontFamily: currentTheme?.typography.headingFont
                }}
              >
                Estado de Consultas
              </h3>
              <Link
                href="/admin/consultations"
                className="text-sm transition-colors duration-200"
                style={{ color: currentTheme?.colors.accent }}
              >
                Ver todas
              </Link>
            </div>
            <div className="space-y-3">
              <div 
                className="flex justify-between items-center p-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: currentTheme?.colors.accentSecondary + '20',
                  borderColor: currentTheme?.colors.accentSecondary
                }}
              >
                <span style={{ color: currentTheme?.colors.text }}>Programadas</span>
                <span 
                  className="font-semibold"
                  style={{ color: currentTheme?.colors.accent }}
                >
                  {stats.consultations.scheduled}
                </span>
              </div>
              <div 
                className="flex justify-between items-center p-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: currentTheme?.colors.accent + '20',
                  borderColor: currentTheme?.colors.accent
                }}
              >
                <span style={{ color: currentTheme?.colors.text }}>Completadas</span>
                <span 
                  className="font-semibold"
                  style={{ color: currentTheme?.colors.accent }}
                >
                  {stats.consultations.completed}
                </span>
              </div>
              <div 
                className="flex justify-between items-center p-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: currentTheme?.colors.accentSecondary + '30',
                  borderColor: currentTheme?.colors.accentSecondary
                }}
              >
                <span style={{ color: currentTheme?.colors.text }}>Reprogramadas</span>
                <span 
                  className="font-semibold"
                  style={{ color: currentTheme?.colors.accentSecondary }}
                >
                  {stats.consultations.rescheduled}
                </span>
              </div>
              <div 
                className="flex justify-between items-center p-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: '#ef444420',
                  borderColor: '#ef4444'
                }}
              >
                <span style={{ color: currentTheme?.colors.text }}>Canceladas</span>
                <span className="font-semibold text-red-600">
                  {stats.consultations.cancelled}
                </span>
              </div>
            </div>
          </div>

          {/* Estado de Tienda */}
          <div 
            className="rounded-xl shadow-lg p-6"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-lg font-semibold"
                style={{ 
                  color: currentTheme?.colors.text,
                  fontFamily: currentTheme?.typography.headingFont
                }}
              >
                Estado de Tienda
              </h3>
              <Link
                href="/admin/store"
                className="text-sm transition-colors duration-200"
                style={{ color: currentTheme?.colors.accent }}
              >
                Ver productos
              </Link>
            </div>
            <div className="space-y-3">
              <div 
                className="flex justify-between items-center p-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: '#fbbf2430',
                  borderColor: '#fbbf24'
                }}
              >
                <span style={{ color: currentTheme?.colors.text }}>Órdenes Pendientes</span>
                <span className="font-semibold text-yellow-600">
                  {stats.store.pendingOrders}
                </span>
              </div>
              <div 
                className="flex justify-between items-center p-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: currentTheme?.colors.accent + '20',
                  borderColor: currentTheme?.colors.accent
                }}
              >
                <span style={{ color: currentTheme?.colors.text }}>En Envío</span>
                <span 
                  className="font-semibold"
                  style={{ color: currentTheme?.colors.accent }}
                >
                  {stats.store.shippedOrders}
                </span>
              </div>
              <div 
                className="flex justify-between items-center p-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: '#10b98130',
                  borderColor: '#10b981'
                }}
              >
                <span style={{ color: currentTheme?.colors.text }}>Entregadas</span>
                <span className="font-semibold text-green-600">
                  {stats.store.deliveredOrders}
                </span>
              </div>
              <div 
                className="flex justify-between items-center p-3 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: currentTheme?.colors.accentSecondary + '20',
                  borderColor: currentTheme?.colors.accentSecondary
                }}
              >
                <span style={{ color: currentTheme?.colors.text }}>Revenue Total</span>
                <span 
                  className="font-semibold"
                  style={{ color: currentTheme?.colors.accentSecondary }}
                >
                  ${(stats.store.totalRevenue / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className="rounded-xl shadow-lg p-6 mt-6"
          style={{ 
            backgroundColor: currentTheme?.colors.cardBg,
            borderColor: currentTheme?.colors.borderColor
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ 
              color: currentTheme?.colors.text,
              fontFamily: currentTheme?.typography.headingFont
            }}
          >
            🚀 Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/users/new"
              className="flex flex-col items-center p-4 border rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ 
                borderColor: currentTheme?.colors.borderColor,
                backgroundColor: currentTheme?.colors.background
              }}
            >
              <div className="text-2xl mb-2">👤</div>
              <span 
                className="text-sm text-center"
                style={{ color: currentTheme?.colors.textSecondary }}
              >
                Crear Usuario
              </span>
            </Link>
            <Link
              href="/admin/oracle/cards/new"
              className="flex flex-col items-center p-4 border rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ 
                borderColor: currentTheme?.colors.borderColor,
                backgroundColor: currentTheme?.colors.background
              }}
            >
              <div className="text-2xl mb-2">🃏</div>
              <span 
                className="text-sm text-center"
                style={{ color: currentTheme?.colors.textSecondary }}
              >
                Nueva Carta
              </span>
            </Link>
            <Link
              href="/admin/store/products/new"
              className="flex flex-col items-center p-4 border rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ 
                borderColor: currentTheme?.colors.borderColor,
                backgroundColor: currentTheme?.colors.background
              }}
            >
              <div className="text-2xl mb-2">🛍️</div>
              <span 
                className="text-sm text-center"
                style={{ color: currentTheme?.colors.textSecondary }}
              >
                Nuevo Producto
              </span>
            </Link>
            <Link
              href="/admin/configuracion"
              className="flex flex-col items-center p-4 border rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ 
                borderColor: currentTheme?.colors.accent,
                backgroundColor: currentTheme?.colors.accent + '10'
              }}
            >
              <div className="text-2xl mb-2">🎨</div>
              <span 
                className="text-sm text-center font-medium"
                style={{ color: currentTheme?.colors.accent }}
              >
                Cambiar Tema
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}