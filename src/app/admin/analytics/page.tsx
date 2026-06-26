'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'
import {
  ChartBarIcon,
  EyeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  users: {
    total: number
    active: number
    newThisMonth: number
    growth: number
  }
  consultations: {
    total: number
    completed: number
    thisMonth: number
    revenue: number
    growth: number
  }
  store: {
    orders: number
    revenue: number
    topProducts: Array<{
      name: string
      sales: number
      revenue: number
    }>
    growth: number
  }
  blog: {
    posts: number
    views: number
    comments: number
    topPosts: Array<{
      title: string
      views: number
    }>
  }
  oracle: {
    readings: number
    uniqueUsers: number
    popularCards: Array<{
      name: string
      uses: number
    }>
  }
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentTheme } = useTheme()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('30') // días

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchAnalytics()
  }, [session, status, router, dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Simulamos datos de analytics (puedes conectar con tu API real)
      const mockData: AnalyticsData = {
        users: {
          total: 1250,
          active: 834,
          newThisMonth: 127,
          growth: 12.5
        },
        consultations: {
          total: 3456,
          completed: 3201,
          thisMonth: 245,
          revenue: 48720,
          growth: 8.3
        },
        store: {
          orders: 892,
          revenue: 23450,
          growth: 15.7,
          topProducts: [
            { name: 'Vela de San Miguel', sales: 45, revenue: 1350 },
            { name: 'Cristal de Cuarzo', sales: 38, revenue: 1140 },
            { name: 'Agua Bendita', sales: 32, revenue: 960 }
          ]
        },
        blog: {
          posts: 89,
          views: 12450,
          comments: 567,
          topPosts: [
            { title: 'Los 7 Arcángeles Principales', views: 1250 },
            { title: 'Meditación Angelical', views: 890 },
            { title: 'Protección Espiritual', views: 734 }
          ]
        },
        oracle: {
          readings: 5678,
          uniqueUsers: 1234,
          popularCards: [
            { name: 'Miguel Arcángel', uses: 567 },
            { name: 'Gabriel Arcángel', uses: 434 },
            { name: 'Rafael Arcángel', uses: 398 }
          ]
        }
      }
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalytics(mockData)
      
    } catch (error) {
      console.error('Error cargando analytics:', error)
      setError('Error al cargar los datos de analytics')
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
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-32 w-32 border-b-2 mb-4"
            style={{ borderBottomColor: currentTheme?.colors.accent }}
          ></div>
          <h2 
            className="text-xl font-semibold mb-2"
            style={{ 
              color: currentTheme?.colors.text,
              fontFamily: currentTheme?.typography.headingFont
            }}
          >
            📊 Cargando Analytics...
          </h2>
          <p style={{ color: currentTheme?.colors.textSecondary }}>
            Analizando datos espirituales
          </p>
        </div>
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
          className="border rounded-xl p-6 max-w-md shadow-lg"
          style={{ 
            backgroundColor: currentTheme?.colors.cardBg,
            borderColor: currentTheme?.colors.borderColor
          }}
        >
          <h3 
            className="font-medium mb-2 text-red-600"
            style={{ fontFamily: currentTheme?.typography.headingFont }}
          >
            ❌ Error
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105"
            style={{ background: currentTheme?.colors.buttonGradient }}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div style={{ backgroundColor: currentTheme?.colors.background }}>
      {/* Header */}
      <div 
        className="shadow-lg border-b"
        style={{ 
          background: currentTheme?.colors.buttonGradient,
          borderBottomColor: currentTheme?.colors.borderColor
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 
                className="text-3xl font-bold flex items-center gap-3 text-white"
                style={{ fontFamily: currentTheme?.typography.headingFont }}
              >
                📊 Analytics Angelicales
              </h1>
              <p className="text-white/80">
                Métricas y estadísticas del oráculo espiritual
              </p>
            </div>
            <div className="flex space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20"
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
              </select>
              <Link
                href="/admin"
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                ← Volver al Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Usuarios */}
          <div 
            className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  👥 Usuarios Totales
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {analytics.users.total.toLocaleString()}
                </p>
                <div className="flex items-center">
                  {analytics.users.growth > 0 ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span 
                    className={`text-sm ml-1 ${
                      analytics.users.growth > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {analytics.users.growth}%
                  </span>
                </div>
              </div>
              <div 
                className="rounded-xl p-3 shadow-md"
                style={{ backgroundColor: currentTheme?.colors.accent }}
              >
                <UsersIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Consultas */}
          <div 
            className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  🔮 Consultas
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {analytics.consultations.total.toLocaleString()}
                </p>
                <div className="flex items-center">
                  {analytics.consultations.growth > 0 ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span 
                    className={`text-sm ml-1 ${
                      analytics.consultations.growth > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {analytics.consultations.growth}%
                  </span>
                </div>
              </div>
              <div 
                className="rounded-xl p-3 shadow-md"
                style={{ backgroundColor: currentTheme?.colors.accentSecondary }}
              >
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Ingresos */}
          <div 
            className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  💰 Ingresos
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  ${(analytics.consultations.revenue + analytics.store.revenue).toLocaleString()}
                </p>
                <div className="flex items-center">
                  {analytics.store.growth > 0 ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span 
                    className={`text-sm ml-1 ${
                      analytics.store.growth > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {analytics.store.growth}%
                  </span>
                </div>
              </div>
              <div 
                className="rounded-xl p-3 shadow-md"
                style={{ backgroundColor: '#10b981' }}
              >
                <CurrencyDollarIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Lecturas del Oráculo */}
          <div 
            className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  🃏 Lecturas
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {analytics.oracle.readings.toLocaleString()}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  {analytics.oracle.uniqueUsers} usuarios únicos
                </p>
              </div>
              <div 
                className="rounded-xl p-3 shadow-md"
                style={{ backgroundColor: '#8b5cf6' }}
              >
                <EyeIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos y Detalles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Productos */}
          <div 
            className="rounded-xl shadow-lg p-6"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ 
                color: currentTheme?.colors.text,
                fontFamily: currentTheme?.typography.headingFont
              }}
            >
              🛒 Productos Más Vendidos
            </h3>
            <div className="space-y-4">
              {analytics.store.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-medium"
                      style={{ color: currentTheme?.colors.text }}
                    >
                      {product.name}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: currentTheme?.colors.textSecondary }}
                    >
                      {product.sales} ventas
                    </p>
                  </div>
                  <p 
                    className="font-semibold"
                    style={{ color: currentTheme?.colors.accent }}
                  >
                    ${product.revenue}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Posts del Blog */}
          <div 
            className="rounded-xl shadow-lg p-6"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ 
                color: currentTheme?.colors.text,
                fontFamily: currentTheme?.typography.headingFont
              }}
            >
              📖 Posts Más Leídos
            </h3>
            <div className="space-y-4">
              {analytics.blog.topPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p 
                      className="font-medium"
                      style={{ color: currentTheme?.colors.text }}
                    >
                      {post.title}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: currentTheme?.colors.textSecondary }}
                    >
                      {post.views} visualizaciones
                    </p>
                  </div>
                  <div 
                    className="px-2 py-1 rounded-full text-xs"
                    style={{ 
                      backgroundColor: currentTheme?.colors.accent + '20',
                      color: currentTheme?.colors.accent
                    }}
                  >
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cartas Populares del Oráculo */}
        <div 
          className="rounded-xl shadow-lg p-6"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ 
              color: currentTheme?.colors.text,
              fontFamily: currentTheme?.typography.headingFont
            }}
          >
            🃏 Cartas Más Consultadas del Oráculo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.oracle.popularCards.map((card, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: currentTheme?.colors.background,
                  borderColor: currentTheme?.colors.borderColor
                }}
              >
                <p 
                  className="font-medium"
                  style={{ color: currentTheme?.colors.text }}
                >
                  {card.name}
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: currentTheme?.colors.accent }}
                >
                  {card.uses}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  consultas realizadas
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}