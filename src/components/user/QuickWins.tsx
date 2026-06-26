'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

interface QuickWinSkeletonProps {
  count?: number
}

export function QuickWinSkeleton({ count = 4 }: QuickWinSkeletonProps) {
  const { currentTheme } = useTheme()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-6 border animate-pulse"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <div 
            className="w-12 h-12 rounded-full mb-4"
            style={{ backgroundColor: `${currentTheme.colors.accent}20` }}
          />
          <div 
            className="h-4 rounded mb-2"
            style={{ backgroundColor: `${currentTheme.colors.textSecondary}30` }}
          />
          <div 
            className="h-8 rounded w-3/4"
            style={{ backgroundColor: `${currentTheme.colors.textSecondary}30` }}
          />
        </div>
      ))}
    </div>
  )
}

interface GradientCardProps {
  title: string
  value: string | number
  icon: string
  gradient: string
  delay?: number
}

export function GradientCard({ title, value, icon, gradient, delay = 0 }: GradientCardProps) {
  const { currentTheme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="rounded-xl p-6 border shadow-lg relative overflow-hidden cursor-pointer"
      style={{
        backgroundColor: currentTheme.colors.cardBg,
        borderColor: currentTheme.colors.borderColor
      }}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ background: gradient }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div 
          className="text-4xl mb-3"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        >
          {icon}
        </div>
        <p 
          className="text-sm font-medium mb-1"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          {title}
        </p>
        <p 
          className="text-3xl font-bold"
          style={{ 
            color: currentTheme.colors.text,
            fontFamily: currentTheme.typography.headingFont
          }}
        >
          {value}
        </p>
      </div>

      {/* Hover effect */}
      <motion.div
        className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity"
        style={{ background: gradient }}
      />
    </motion.div>
  )
}

interface HoverEffectButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  icon?: React.ReactNode
  fullWidth?: boolean
}

export function HoverEffectButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  icon,
  fullWidth = false 
}: HoverEffectButtonProps) {
  const { currentTheme } = useTheme()

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: currentTheme.colors.buttonGradient || `linear-gradient(135deg, ${currentTheme.colors.accent}, ${currentTheme.colors.accent})`,
          color: '#ffffff',
          border: 'none'
        }
      case 'secondary':
        return {
          backgroundColor: `${currentTheme.colors.accent}20`,
          color: currentTheme.colors.accent,
          border: `2px solid ${currentTheme.colors.accent}`
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: currentTheme.colors.text,
          border: `2px solid ${currentTheme.colors.borderColor}`
        }
    }
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`
        rounded-xl px-6 py-3 font-semibold
        flex items-center justify-center gap-2
        shadow-lg transition-all duration-300
        hover:shadow-2xl
        ${fullWidth ? 'w-full' : ''}
      `}
      style={getVariantStyles()}
    >
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </motion.button>
  )
}

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  const { currentTheme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div 
        className="text-6xl mb-4 inline-block"
        style={{ filter: 'grayscale(50%)' }}
      >
        {icon}
      </div>
      <h3 
        className="text-xl font-bold mb-2"
        style={{ 
          color: currentTheme.colors.text,
          fontFamily: currentTheme.typography.headingFont
        }}
      >
        {title}
      </h3>
      <p 
        className="text-sm mb-6 max-w-md mx-auto"
        style={{ color: currentTheme.colors.textSecondary }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <HoverEffectButton onClick={onAction} variant="primary">
          {actionLabel}
        </HoverEffectButton>
      )}
    </motion.div>
  )
}

interface ProgressBarProps {
  value: number
  max: number
  label: string
  color?: string
  showPercentage?: boolean
}

export function ProgressBar({ 
  value, 
  max, 
  label, 
  color,
  showPercentage = true 
}: ProgressBarProps) {
  const { currentTheme } = useTheme()
  const percentage = Math.min((value / max) * 100, 100)
  const barColor = color || currentTheme.colors.accent

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span 
          className="text-sm font-medium"
          style={{ color: currentTheme.colors.text }}
        >
          {label}
        </span>
        {showPercentage && (
          <span 
            className="text-sm font-bold"
            style={{ color: barColor }}
          >
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
      <div 
        className="w-full h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: `${barColor}20` }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)` }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <span 
          className="text-xs"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          {value} / {max}
        </span>
      </div>
    </div>
  )
}

interface BadgeProps {
  text: string
  variant?: 'success' | 'warning' | 'error' | 'info' | 'premium'
  icon?: string
}

export function Badge({ text, variant = 'info', icon }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { bg: '#10b98120', color: '#10b981', border: '#10b98140' }
      case 'warning':
        return { bg: '#f59e0b20', color: '#f59e0b', border: '#f59e0b40' }
      case 'error':
        return { bg: '#ef444420', color: '#ef4444', border: '#ef444440' }
      case 'premium':
        return { bg: '#fbbf2420', color: '#fbbf24', border: '#fbbf2440' }
      default:
        return { bg: '#3b82f620', color: '#3b82f6', border: '#3b82f640' }
    }
  }

  const styles = getVariantStyles()

  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border"
      style={{
        backgroundColor: styles.bg,
        color: styles.color,
        borderColor: styles.border
      }}
    >
      {icon && <span>{icon}</span>}
      {text}
    </span>
  )
}
