'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UserStats } from '@/utils/stats'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'
import WelcomeBanner from '@/components/user/WelcomeBanner'
import AnimatedStatCard from '@/components/user/AnimatedStatCard'
import UserAnalytics from '@/components/user/UserAnalytics'
import { 
  QuickWinSkeleton,
  GradientCard,
  HoverEffectButton,
  EmptyState,
  ProgressBar,
  Badge
} from '@/components/user/QuickWins'
import { 
  UserIcon,
  ChartBarIcon,
  SparklesIcon,
  PhoneIcon,
  ShoppingBagIcon,
  StarIcon,
  PresentationChartLineIcon,
  EyeIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CreditCardIcon,
  TrophyIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  FireIcon,
  BoltIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

interface StatCard {
  title: string
  value: string
  description: string
  color: string
  icon: string
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const { currentTheme } = useTheme()
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

    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
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
        className="min-h-screen relative"
        style={{backgroundColor: currentTheme.colors.background}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="mb-8 animate-pulse">
            <div 
              className="h-48 rounded-2xl mb-8"
              style={{backgroundColor: `${currentTheme.colors.accent}20`}}
            />
          </div>
          <QuickWinSkeleton count={4} />
        </div>
        <GoldenStarsBackground />
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center relative px-4"
        style={{backgroundColor: currentTheme.colors.background}}
      >
        <div className="relative z-10 max-w-md w-full">
          <div 
            className="rounded-2xl p-8 border shadow-xl"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: 'rgba(239, 68, 68, 0.3)'
            }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 
                className="text-xl font-bold mb-2"
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.typography.headingFont
                }}
              >
                Error
              </h3>
              <p 
                className="text-sm"
                style={{
                  color: currentTheme.colors.textSecondary,
                  fontFamily: currentTheme.typography.bodyFont
                }}
              >
                {error}
              </p>
            </div>
            <button
              onClick={fetchStats}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: currentTheme.colors.buttonGradient,
                fontFamily: currentTheme.typography.bodyFont
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
        <GoldenStarsBackground />
      </div>
    )
  }

  if (!stats) return null

  const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
    const iconMap = {
      'EyeIcon': <EyeIcon className={className} />,
      'PhoneIcon': <PhoneIcon className={className} />,
      'ShoppingBagIcon': <ShoppingBagIcon className={className} />,
      'StarIcon': <StarIcon className={className} />,
      'SparklesIcon': <SparklesIcon className={className} />,
      'CalendarDaysIcon': <CalendarDaysIcon className={className} />,
      'VideoCameraIcon': <VideoCameraIcon className={className} />,
      'DocumentTextIcon': <DocumentTextIcon className={className} />,
      'CreditCardIcon': <CreditCardIcon className={className} />,
      'TrophyIcon': <TrophyIcon className={className} />,
      'ChartPieIcon': <ChartPieIcon className={className} />
    }
    return iconMap[iconName as keyof typeof iconMap] || <SparklesIcon className={className} />
  }

  const statCards: StatCard[] = [
    {
      title: 'Lecturas',
      value: stats.oracle.totalReadings.toString(),
      description: 'Total de lecturas realizadas',
      color: 'bg-purple-500',
      icon: 'EyeIcon'
    },
    {
      title: 'Consultas',
      value: stats.consultations.total.toString(),
      description: `${stats.consultations.completed} completadas`,
      color: 'bg-blue-500',
      icon: 'PhoneIcon'
    },
    {
      title: 'Compras',
      value: stats.store.totalOrders.toString(),
      description: `$${(stats.store.totalSpent / 100).toFixed(2)} gastados`,
      color: 'bg-green-500',
      icon: 'ShoppingBagIcon'
    },
    {
      title: 'Membresía',
      value: stats.membership.isActive ? 'Activa' : 'Inactiva',
      description: stats.membership.type || 'Sin membresía',
      color: stats.membership.isActive ? 'bg-yellow-500' : 'bg-gray-500',
      icon: 'StarIcon'
    }
  ]

  return (
    <div 
      className="min-h-screen relative"
      style={{backgroundColor: currentTheme.colors.background}}
    >
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Banner - Componente mejorado */}
        <div className="mb-8">
          <WelcomeBanner
            userName={session?.user?.name || 'Usuario'}
            membershipTier={
              stats.membership.type === 'VIP' ? 'vip' :
              stats.membership.type === 'Premium' ? 'premium' :
              'basic'
            }
            nextConsultation={undefined}
            dailyMessage="El universo tiene un mensaje para ti hoy"
          />
        </div>

        {/* Stats Grid - Usando AnimatedStatCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatedStatCard
            title="Lecturas"
            value={stats.oracle.totalReadings}
            icon={<EyeIcon className="w-8 h-8" />}
            description="Total de lecturas realizadas"
            gradient="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
            delay={0}
          />
          <AnimatedStatCard
            title="Consultas"
            value={stats.consultations.total}
            icon={<PhoneIcon className="w-8 h-8" />}
            description={`${stats.consultations.completed} completadas`}
            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            delay={0.1}
          />
          <AnimatedStatCard
            title="Compras"
            value={stats.store.totalOrders}
            icon={<ShoppingBagIcon className="w-8 h-8" />}
            description={`$${(stats.store.totalSpent / 100).toFixed(2)} gastados`}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            delay={0.2}
          />
          <AnimatedStatCard
            title="Puntos"
            value={stats.oracle.totalReadings * 10 + stats.consultations.completed * 50 + stats.store.totalOrders * 25}
            icon={<StarIcon className="w-8 h-8" />}
            description={stats.membership.type || 'Gana puntos con cada actividad'}
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            delay={0.3}
            suffix=" pts"
          />
        </div>

        {/* Membership Status - Mejorado */}
        {stats.membership.isActive && (
          <div className="mb-8">
            <GradientCard
              title="Membresía Activa"
              value={stats.membership.type || 'Premium'}
              icon="👑"
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            />
            {stats.membership.expiresAt && (
              <div className="mt-4 text-center">
                <Badge 
                  text={`Válida hasta ${new Date(stats.membership.expiresAt).toLocaleDateString()}`} 
                  variant="premium" 
                  icon="⏰" 
                />
              </div>
            )}
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="mb-8">
          <UserAnalytics
            oracleData={[
              { month: 'Ene', readings: stats.oracle.totalReadings > 0 ? Math.floor(stats.oracle.totalReadings * 0.7) : 0 },
              { month: 'Feb', readings: stats.oracle.totalReadings > 0 ? Math.floor(stats.oracle.totalReadings * 0.8) : 0 },
              { month: 'Mar', readings: stats.oracle.totalReadings > 0 ? Math.floor(stats.oracle.totalReadings * 0.9) : 0 },
              { month: 'Abr', readings: stats.oracle.totalReadings },
            ]}
            consultationData={[
              { month: 'Ene', count: stats.consultations.total > 0 ? Math.floor(stats.consultations.total * 0.6) : 0 },
              { month: 'Feb', count: stats.consultations.total > 0 ? Math.floor(stats.consultations.total * 0.75) : 0 },
              { month: 'Mar', count: stats.consultations.total > 0 ? Math.floor(stats.consultations.total * 0.85) : 0 },
              { month: 'Abr', count: stats.consultations.total },
            ]}
            spendingData={[
              { 
                name: 'Consultas', 
                value: stats.consultations.total * 2999, 
                color: '#3b82f6' 
              },
              { 
                name: 'Tienda', 
                value: stats.store.totalSpent, 
                color: '#10b981' 
              },
              { 
                name: 'Membresía', 
                value: stats.membership.isActive ? 1999 : 0, 
                color: '#f59e0b' 
              }
            ]}
          />
        </div>

        {/* Progress Section */}
        {stats.membership.type && (
          <div 
            className="rounded-2xl shadow-xl p-8 backdrop-blur-sm border mb-8"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.borderColor,
              boxShadow: `0 10px 25px ${currentTheme.colors.shadowColor}`
            }}
          >
            <h3 
              className="text-2xl font-bold mb-6"
              style={{
                color: currentTheme.colors.text,
                fontFamily: currentTheme.typography.headingFont
              }}
            >
              🎯 Tu Progreso Espiritual
            </h3>
            <div className="space-y-6">
              <ProgressBar
                value={stats.oracle.totalReadings}
                max={50}
                label="Lecturas del Oráculo"
                color={currentTheme.colors.accent}
              />
              <ProgressBar
                value={stats.consultations.completed}
                max={10}
                label="Consultas Completadas"
                color="#10b981"
              />
              <ProgressBar
                value={stats.store.totalOrders}
                max={20}
                label="Productos Adquiridos"
                color="#f59e0b"
              />
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div 
          className="rounded-2xl shadow-xl p-8 backdrop-blur-sm border"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor,
            boxShadow: `0 10px 25px ${currentTheme.colors.shadowColor}`
          }}
        >
          <h3 
            className="text-2xl font-bold mb-6"
            style={{
              color: currentTheme.colors.text,
              fontFamily: currentTheme.typography.headingFont
            }}
          >
            📝 Actividad Reciente
          </h3>
          <EmptyState
            icon="🔮"
            title="No hay actividad reciente"
            description="Comienza consultando el oráculo o agendando una consulta para ver tu actividad aquí"
            actionLabel="Consultar Oráculo"
            onAction={() => router.push('/oraculo')}
          />
        </div>
      </div>

      {/* Background de partículas */}
      <GoldenStarsBackground />
    </div>
  )
}