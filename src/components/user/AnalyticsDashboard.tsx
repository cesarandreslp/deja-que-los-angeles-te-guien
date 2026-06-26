'use client'

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface AnalyticsDashboardProps {
  readingsData: Array<{ month: string; count: number }>
  consultationsData: Array<{ month: string; completed: number; cancelled: number }>
  spendingData: Array<{ category: string; amount: number; color: string }>
  membershipUsage?: {
    used: number
    available: number
    daysLeft: number
  }
}

export default function AnalyticsDashboard({
  readingsData,
  consultationsData,
  spendingData,
  membershipUsage
}: AnalyticsDashboardProps) {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <ChartBarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Análisis Personal
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tu actividad en los últimos 6 meses
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lecturas del Oráculo - Line Chart */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <ArrowTrendingUpIcon className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lecturas del Oráculo
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={readingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="url(#colorGradient1)" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <defs>
                <linearGradient id="colorGradient1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Consultas - Bar Chart */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Consultas por Mes
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={consultationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="completed" 
                name="Completadas"
                fill="#10b981" 
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="cancelled" 
                name="Canceladas"
                fill="#ef4444" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gastos - Pie Chart */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Distribución de Gastos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {spendingData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.category}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${entry.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Membresía Progress */}
        {membershipUsage && (
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl shadow-xl text-white">
            <h3 className="text-lg font-semibold mb-6">
              Uso de Membresía
            </h3>
            
            {/* Circular Progress */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(membershipUsage.used / membershipUsage.available) * 440} 440`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">
                    {membershipUsage.used}/{membershipUsage.available}
                  </span>
                  <span className="text-sm opacity-90">Lecturas</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold">{membershipUsage.available - membershipUsage.used}</p>
                <p className="text-sm opacity-90">Disponibles</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold">{membershipUsage.daysLeft}</p>
                <p className="text-sm opacity-90">Días restantes</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
