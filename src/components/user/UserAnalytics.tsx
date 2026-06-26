'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

interface UserAnalyticsProps {
  oracleData: Array<{ month: string; readings: number }>
  consultationData: Array<{ month: string; count: number }>
  spendingData: Array<{ name: string; value: number; color: string }>
}

export default function UserAnalytics({ 
  oracleData, 
  consultationData,
  spendingData 
}: UserAnalyticsProps) {
  const { currentTheme } = useTheme()

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="rounded-lg p-3 shadow-xl border"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <p 
            className="font-semibold mb-1"
            style={{ color: currentTheme.colors.text }}
          >
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
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
      {/* Título de sección */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 
          className="text-2xl font-bold mb-2"
          style={{
            color: currentTheme.colors.text,
            fontFamily: currentTheme.typography.headingFont
          }}
        >
          📊 Tu Actividad Espiritual
        </h3>
        <p 
          className="text-sm"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Visualiza tu progreso y estadísticas personales
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de lecturas del oráculo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl shadow-xl p-6 border"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentTheme.colors.accent }}
            />
            <h4 
              className="text-lg font-semibold"
              style={{ color: currentTheme.colors.text }}
            >
              Lecturas del Oráculo
            </h4>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={oracleData}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${currentTheme.colors.borderColor}`} />
              <XAxis 
                dataKey="month" 
                stroke={currentTheme.colors.textSecondary}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={currentTheme.colors.textSecondary}
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="readings" 
                stroke={currentTheme.colors.accent}
                strokeWidth={3}
                dot={{ fill: currentTheme.colors.accent, r: 5 }}
                activeDot={{ r: 8 }}
                name="Lecturas"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico de consultas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl shadow-xl p-6 border"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#10b981' }}
            />
            <h4 
              className="text-lg font-semibold"
              style={{ color: currentTheme.colors.text }}
            >
              Consultas Realizadas
            </h4>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={consultationData}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${currentTheme.colors.borderColor}`} />
              <XAxis 
                dataKey="month" 
                stroke={currentTheme.colors.textSecondary}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke={currentTheme.colors.textSecondary}
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Consultas"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico de gastos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl shadow-xl p-6 border lg:col-span-2"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#f59e0b' }}
            />
            <h4 
              className="text-lg font-semibold"
              style={{ color: currentTheme.colors.text }}
            >
              Distribución de Gastos
            </h4>
          </div>
          
          <div className="flex items-center justify-center">
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
                  dataKey="value"
                >
                  {spendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Resumen de gastos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {spendingData.map((item, index) => (
              <div 
                key={index}
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: `${item.color}10`,
                  borderColor: `${item.color}40`
                }}
              >
                <p 
                  className="text-sm font-medium mb-1"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {item.name}
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: item.color }}
                >
                  ${(item.value / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
