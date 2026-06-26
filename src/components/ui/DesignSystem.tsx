// Sistema de Diseño Global - Componentes Reutilizables
'use client'

import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'
import { ReactNode } from 'react'

// Contenedor Principal
interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  const { currentTheme } = useTheme()
  
  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{
        backgroundColor: currentTheme.colors.background,
        fontFamily: currentTheme.typography.bodyFont
      }}
    >
      {children}
    </div>
  )
}

// Título Principal de Página
interface PageTitleProps {
  children: ReactNode
  className?: string
  subtitle?: string
}

export function PageTitle({ children, className = '', subtitle }: PageTitleProps) {
  const { currentTheme } = useTheme()
  
  return (
    <div className={`text-center mb-16 ${className}`}>
      <h1 
        className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
        style={{
          fontFamily: currentTheme.typography.headingFont,
          color: currentTheme.colors.text
        }}
      >
        {children}
      </h1>
      {subtitle && (
        <p 
          className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          style={{
            color: currentTheme.colors.textSecondary,
            fontFamily: currentTheme.typography.bodyFont
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

// Sección de Página
interface PageSectionProps {
  children: ReactNode
  className?: string
  background?: 'default' | 'card' | 'subtle'
}

export function PageSection({ children, className = '', background = 'default' }: PageSectionProps) {
  const { currentTheme } = useTheme()
  
  const getBackgroundColor = () => {
    switch (background) {
      case 'card':
        return currentTheme.colors.cardBg
      case 'subtle':
        return `${currentTheme.colors.cardBg}30`
      default:
        return 'transparent'
    }
  }
  
  return (
    <section 
      className={`py-24 px-4 sm:px-6 lg:px-8 ${className}`}
      style={{backgroundColor: getBackgroundColor()}}
    >
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  )
}

// Card Profesional
interface ProfessionalCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function ProfessionalCard({ children, className = '', hover = true, onClick }: ProfessionalCardProps) {
  const { currentTheme } = useTheme()
  
  return (
    <div 
      className={`p-8 rounded-2xl border transition-all duration-300 ${
        hover ? 'hover:scale-105 cursor-pointer' : ''
      } ${className}`}
      style={{
        backgroundColor: currentTheme.colors.cardBg,
        borderColor: currentTheme.colors.borderColor,
        boxShadow: `0 4px 20px ${currentTheme.colors.shadowColor}`
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Botón Principal
interface PrimaryButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function PrimaryButton({ 
  children, 
  href, 
  onClick, 
  className = '', 
  size = 'md',
  disabled = false 
}: PrimaryButtonProps) {
  const { currentTheme } = useTheme()
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-6 py-3 text-sm'
      case 'lg':
        return 'px-12 py-6 text-lg'
      default:
        return 'px-8 py-4 text-base'
    }
  }
  
  const baseClasses = `${getSizeClasses()} rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-white ${className}`
  
  const style = {
    background: disabled ? currentTheme.colors.borderColor : currentTheme.colors.buttonGradient,
    fontFamily: currentTheme.typography.bodyFont,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer'
  }
  
  if (href && !disabled) {
    return (
      <Link href={href} className={`inline-flex items-center space-x-2 ${baseClasses}`} style={style}>
        {children}
      </Link>
    )
  }
  
  return (
    <button 
      className={`inline-flex items-center space-x-2 ${baseClasses}`} 
      style={style}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// Botón Secundario
interface SecondaryButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SecondaryButton({ 
  children, 
  href, 
  onClick, 
  className = '', 
  size = 'md' 
}: SecondaryButtonProps) {
  const { currentTheme } = useTheme()
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-6 py-3 text-sm'
      case 'lg':
        return 'px-12 py-6 text-lg'
      default:
        return 'px-8 py-4 text-base'
    }
  }
  
  const baseClasses = `${getSizeClasses()} rounded-2xl font-semibold transition-all duration-300 hover:scale-105 border-2 shadow-md hover:shadow-lg ${className}`
  
  const style = {
    fontFamily: currentTheme.typography.bodyFont,
    backgroundColor: currentTheme.colors.cardBg,
    color: currentTheme.colors.text,
    borderColor: currentTheme.colors.borderColor
  }
  
  if (href) {
    return (
      <Link href={href} className={`inline-flex items-center space-x-2 ${baseClasses}`} style={style}>
        {children}
      </Link>
    )
  }
  
  return (
    <button 
      className={`inline-flex items-center space-x-2 ${baseClasses}`} 
      style={style}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Grid de servicios/elementos
interface ServiceGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function ServiceGrid({ children, columns = 3, className = '' }: ServiceGridProps) {
  const getGridClasses = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2'
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }
  
  return (
    <div className={`grid ${getGridClasses()} gap-8 ${className}`}>
      {children}
    </div>
  )
}

// Icono con contenedor elegante
interface IconContainerProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function IconContainer({ icon: Icon, color, size = 'md', className = '' }: IconContainerProps) {
  const { currentTheme } = useTheme()
  const iconColor = color || currentTheme.colors.accent
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12'
      case 'lg':
        return 'w-20 h-20'
      default:
        return 'w-16 h-16'
    }
  }
  
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6'
      case 'lg':
        return 'w-10 h-10'
      default:
        return 'w-8 h-8'
    }
  }
  
  return (
    <div 
      className={`${getSizeClasses()} mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-md ${className}`}
      style={{
        background: `linear-gradient(135deg, ${iconColor}15, ${iconColor}25)`,
        border: `2px solid ${iconColor}30`
      }}
    >
      <Icon className={getIconSize()} style={{color: iconColor}} />
    </div>
  )
}

// Badge informativo
interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'accent' | 'secondary'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const { currentTheme } = useTheme()
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return {
          backgroundColor: `${currentTheme.colors.accent}15`,
          color: currentTheme.colors.accent
        }
      case 'secondary':
        return {
          backgroundColor: `${currentTheme.colors.accentSecondary}15`,
          color: currentTheme.colors.accentSecondary
        }
      default:
        return {
          backgroundColor: currentTheme.colors.cardBg,
          color: currentTheme.colors.text,
          border: `1px solid ${currentTheme.colors.borderColor}`
        }
    }
  }
  
  return (
    <span 
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${className}`}
      style={getVariantStyles()}
    >
      {children}
    </span>
  )
}