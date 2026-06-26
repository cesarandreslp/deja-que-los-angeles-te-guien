'use client'

import { useState } from 'react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import {
  EyeIcon,
  PhoneIcon,
  ShoppingBagIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface StatCardProps {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  gradient: string
  trend?: {
    value: number
    isPositive: boolean
  }
  delay?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

export default function AnimatedStatCard({
  title,
  value,
  description,
  icon,
  gradient,
  trend,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals = 0
}: StatCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  })

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        animation: inView ? `fadeInUp 0.6s ease-out ${delay}s both` : 'none'
      }}
    >
      {/* Gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{ background: gradient }}
      />

      <div className="relative p-6">
        {/* Icon with gradient */}
        <div 
          className="inline-flex p-4 rounded-xl shadow-lg mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
          style={{ background: gradient }}
        >
          <div className="text-white">
            {icon}
          </div>
        </div>

        {/* Title and Trend */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h3>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              {trend.value}%
            </div>
          )}
        </div>

        {/* Animated Value */}
        <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          {inView && (
            <CountUp
              start={0}
              end={value}
              duration={2}
              delay={delay}
              decimals={decimals}
              prefix={prefix}
              suffix={suffix}
              separator=","
            />
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>

        {/* Animated progress bar */}
        <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              background: gradient,
              width: inView ? '100%' : '0%',
              transitionDelay: `${delay + 0.5}s`
            }}
          />
        </div>
      </div>

      {/* Corner decoration */}
      <div 
        className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700"
        style={{ background: gradient }}
      />
    </div>
  )
}

// Agregar estilos globales para la animación
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
