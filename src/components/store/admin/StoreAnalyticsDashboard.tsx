// Admin Store Analytics Dashboard - Métricas completas de la tienda
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { formatCurrency } from '@/app/api/store/config'
import { 
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  topProducts: Array<{
    product: {
      id: string
      name: string
      imageUrls: string[]
    }
    totalSold: number
    revenue: number
  }>
  recentOrders: Array<{
    id: string
    orderNumber: string
    user: { fullName: string; email: string }
    totalCents: number
    createdAt: string
    orderItems: Array<{
      product: { name: string }
      quantity: number
    }>
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
    orders: number
  }>
}

interface StoreAnalyticsDashboardProps {
  dateRange?: '7d' | '30d' | '90d' | '1y'
}

export default function StoreAnalyticsDashboard({ dateRange = '30d' }: StoreAnalyticsDashboardProps) {
  const { currentTheme } = useTheme()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(dateRange)
  
  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/store/analytics?period=${selectedPeriod}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${currentTheme.colors.cardBg} rounded-lg p-6 animate-pulse`}>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (!analytics) {
    return (
      <div className={`${currentTheme.colors.cardBg} rounded-lg p-12 text-center`}>
        <ChartBarIcon className={`mx-auto h-12 w-12 ${currentTheme.colors.textSecondary} mb-4`} />
        <p className={`${currentTheme.colors.textSecondary}`}>
          No se pudieron cargar las analíticas
        </p>
      </div>
    )
  }
  
  const calculateGrowth = (current: number, previous: number): { percentage: number; isPositive: boolean } => {
    if (previous === 0) return { percentage: 0, isPositive: true }
    const percentage = ((current - previous) / previous) * 100
    return { percentage: Math.abs(percentage), isPositive: percentage >= 0 }
  }
  
  // Mock previous period data for growth calculation
  const previousRevenue = analytics.totalRevenue * 0.85
  const previousOrders = analytics.totalOrders * 0.9
  const previousCustomers = analytics.totalCustomers * 0.95
  
  const revenueGrowth = calculateGrowth(analytics.totalRevenue, previousRevenue)
  const ordersGrowth = calculateGrowth(analytics.totalOrders, previousOrders)
  const customersGrowth = calculateGrowth(analytics.totalCustomers, previousCustomers)
  
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    growth, 
    formatter = (val: any) => val.toString() 
  }: {
    title: string
    value: number
    icon: React.ReactNode
    growth?: { percentage: number; isPositive: boolean }
    formatter?: (value: number) => string
  }) => (
    <div className={`${currentTheme.colors.cardBg} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${currentTheme.colors.textSecondary} mb-1`}>{title}</p>
          <p className={`text-2xl font-bold`} style={{ color: currentTheme.colors.text }}>
            {formatter(value)}
          </p>
          {growth && (
            <div className={`flex items-center mt-2 text-sm ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {growth.isPositive ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              <span>{growth.percentage.toFixed(1)}%</span>
              <span className={`ml-1 ${currentTheme.colors.textSecondary}`}>vs período anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${currentTheme.colors.accent} bg-opacity-10`}>
          <div className={`${currentTheme.colors.accent}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold`} style={{ color: currentTheme.colors.text }}>
            Analíticas de Tienda
          </h2>
          <p className={`${currentTheme.colors.textSecondary}`}>
            Resumen del rendimiento de tu tienda espiritual
          </p>
        </div>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className={`px-4 py-2 border ${currentTheme.colors.borderColor} rounded-lg ${currentTheme.colors.background}`}
          style={{ color: currentTheme.colors.text }}
        >
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
          <option value="90d">Últimos 90 días</option>
          <option value="1y">Último año</option>
        </select>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Ingresos Totales"
          value={analytics.totalRevenue}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          growth={revenueGrowth}
          formatter={(val) => formatCurrency(val)}
        />
        
        <StatCard
          title="Pedidos Totales"
          value={analytics.totalOrders}
          icon={<ShoppingBagIcon className="h-6 w-6" />}
          growth={ordersGrowth}
        />
        
        <StatCard
          title="Clientes Activos"
          value={analytics.totalCustomers}
          icon={<UsersIcon className="h-6 w-6" />}
          growth={customersGrowth}
        />
        
        <StatCard
          title="Productos Activos"
          value={analytics.totalProducts}
          icon={<CubeIcon className="h-6 w-6" />}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className={`${currentTheme.colors.cardBg} rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold`} style={{ color: currentTheme.colors.text }}>
              Productos Más Vendidos
            </h3>
            <span className={`text-sm ${currentTheme.colors.textSecondary}`}>
              Últimos {selectedPeriod}
            </span>
          </div>
          
          <div className="space-y-4">
            {analytics.topProducts.slice(0, 5).map((item, index) => (
              <div key={item.product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${currentTheme.colors.accent} bg-opacity-10 flex items-center justify-center`}>
                    <span className={`text-sm font-bold ${currentTheme.colors.accent}`}>
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className={`font-medium truncate max-w-[200px]`} style={{ color: currentTheme.colors.text }}>
                      {item.product.name}
                    </p>
                    <p className={`text-sm ${currentTheme.colors.textSecondary}`}>
                      {item.totalSold} vendidos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold`} style={{ color: currentTheme.colors.text }}>
                    {formatCurrency(item.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className={`${currentTheme.colors.cardBg} rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold`} style={{ color: currentTheme.colors.text }}>
              Pedidos Recientes
            </h3>
            <span className={`text-sm ${currentTheme.colors.textSecondary}`}>
              Últimas 24h
            </span>
          </div>
          
          <div className="space-y-4">
            {analytics.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate`} style={{ color: currentTheme.colors.text }}>
                    #{order.id.slice(0, 8)}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-sm ${currentTheme.colors.textSecondary} truncate`}>
                    {order.user.fullName}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold`} style={{ color: currentTheme.colors.text }}>
                    {formatCurrency(order.totalCents)}
                  </p>
                  <p className={`text-sm ${currentTheme.colors.textSecondary}`}>
                    {order.orderItems.length} productos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Order Value */}
        <div className={`${currentTheme.colors.cardBg} rounded-lg p-6 text-center`}>
          <div className={`inline-flex p-3 rounded-full ${currentTheme.colors.cardBg} mb-4`}>
            <CurrencyDollarIcon className={`h-6 w-6 ${currentTheme.colors.accent}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2`} style={{ color: currentTheme.colors.text }}>
            Valor Promedio del Pedido
          </h3>
          <p className={`text-3xl font-bold`} style={{ color: currentTheme.colors.text }}>
            {formatCurrency(analytics.totalOrders > 0 ? analytics.totalRevenue / analytics.totalOrders : 0)}
          </p>
          <p className={`text-sm ${currentTheme.colors.textSecondary} mt-2`}>
            Por transacción
          </p>
        </div>
        
        {/* Conversion Rate */}
        <div className={`${currentTheme.colors.cardBg} rounded-lg p-6 text-center`}>
          <div className={`inline-flex p-3 rounded-full ${currentTheme.colors.cardBg} mb-4`}>
            <ChartBarIcon className={`h-6 w-6 ${currentTheme.colors.accent}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2`} style={{ color: currentTheme.colors.text }}>
            Tasa de Conversión
          </h3>
          <p className={`text-3xl font-bold`} style={{ color: currentTheme.colors.text }}>
            2.4%
          </p>
          <p className={`text-sm ${currentTheme.colors.textSecondary} mt-2`}>
            Visitantes que compran
          </p>
        </div>
        
        {/* Customer Lifetime Value */}
        <div className={`${currentTheme.colors.cardBg} rounded-lg p-6 text-center`}>
          <div className={`inline-flex p-3 rounded-full ${currentTheme.colors.cardBg} mb-4`}>
            <UsersIcon className={`h-6 w-6 ${currentTheme.colors.accent}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2`} style={{ color: currentTheme.colors.text }}>
            Valor del Cliente
          </h3>
          <p className={`text-3xl font-bold`} style={{ color: currentTheme.colors.text }}>
            {formatCurrency(analytics.totalCustomers > 0 ? analytics.totalRevenue / analytics.totalCustomers : 0)}
          </p>
          <p className={`text-sm ${currentTheme.colors.textSecondary} mt-2`}>
            Promedio de vida
          </p>
        </div>
      </div>
    </div>
  )
}