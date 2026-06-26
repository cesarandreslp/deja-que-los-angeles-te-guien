'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'

interface VideoCallSectionProps {
  consultationId: string
  status: string
  meetingUrl?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'user' | 'consultant'
}

export default function VideoCallSection({ 
  consultationId, 
  status, 
  meetingUrl, 
  size = 'medium',
  variant = 'user'
}: VideoCallSectionProps) {
  const [copied, setCopied] = useState(false)
  const { currentTheme } = useTheme()

  // Solo mostrar si está programada, pagada o confirmada
  const shouldShow = ['SCHEDULED', 'PAID', 'CONFIRMED'].includes(status)
  
  if (!shouldShow) return null;

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copiando al portapapeles:', err)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-2',
          title: 'text-xs',
          button: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3'
        }
      case 'large':
        return {
          container: 'p-4',
          title: 'text-sm',
          button: 'px-4 py-3 text-sm',
          icon: 'w-5 h-5'
        }
      default: // medium
        return {
          container: 'p-3',
          title: 'text-xs',
          button: 'px-3 py-2 text-xs',
          icon: 'w-4 h-4'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  return (
    <div 
      className={`${sizeClasses.container} rounded-lg border`}
      style={{ 
        backgroundColor: `${currentTheme.colors.accent}08`,
        borderColor: `${currentTheme.colors.accent}30`
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <svg 
            className={`${sizeClasses.icon} mr-2`}
            style={{ color: currentTheme.colors.accent }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" 
            />
          </svg>
          <span 
            className={`${sizeClasses.title} font-semibold`}
            style={{ color: currentTheme.colors.text }}
          >
            Videollamada
          </span>
        </div>
        <span 
          className="text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: '#dcfce7', color: '#166534' }}
        >
          Disponible
        </span>
      </div>
      
      <div className="space-y-2">
        {/* Botón principal para unirse */}
        <Link
          href={`/videocall/${consultationId}`}
          className={`w-full ${sizeClasses.button} text-white font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center hover:shadow-md`}
          style={{ background: currentTheme.colors.buttonGradient }}
        >
          <svg className={`${sizeClasses.icon} mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
          </svg>
          {variant === 'consultant' ? 'Unirse a la Consulta' : 'Unirse a la Videollamada'}
        </Link>
        
        {size !== 'small' && (
          <div 
            className="text-xs text-center"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {variant === 'consultant' 
              ? 'Acceso directo desde tu panel de consultor'
              : 'Enlace disponible inmediatamente después del pago'
            }
          </div>
        )}
        
        {/* Botón para copiar enlace si existe meetingUrl */}
        {meetingUrl && (
          <button
            onClick={() => copyToClipboard(meetingUrl)}
            className={`w-full px-2 py-1 text-xs rounded transition-all duration-200 hover:shadow-sm hover:opacity-80`}
            style={{ 
              color: currentTheme.colors.accent,
              backgroundColor: `${currentTheme.colors.accent}10`
            }}
          >
            {copied ? 'Enlace copiado' : 'Copiar enlace de videollamada'}
          </button>
        )}
      </div>
    </div>
  )
}