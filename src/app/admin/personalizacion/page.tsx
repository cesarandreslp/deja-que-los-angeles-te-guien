'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import ThemeCustomization from '@/components/admin/ThemeCustomization'
import { 
  Cog6ToothIcon,
  SwatchIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function AdminPersonalizationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentTheme } = useTheme()

  // Verificar autenticación y permisos
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    router.push('/login')
    return null
  }

  return (
    <div 
      className="min-h-screen py-8"
      style={{
        backgroundColor: currentTheme.colors.background,
        fontFamily: currentTheme.typography.bodyFont
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg transition-colors duration-300"
              style={{
                color: currentTheme.colors.textSecondary,
                backgroundColor: currentTheme.colors.cardBg
              }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <Cog6ToothIcon 
                className="w-8 h-8"
                style={{color: currentTheme.colors.accent}}
              />
              <div>
                <h1 
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: currentTheme.typography.headingFont,
                    color: currentTheme.colors.text
                  }}
                >
                  Panel de Administración
                </h1>
                <p 
                  className="text-sm"
                  style={{color: currentTheme.colors.textSecondary}}
                >
                  Personalización y configuración del sistema
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación de pestañas */}
        <div className="mb-8">
          <div 
            className="flex space-x-1 p-1 rounded-lg"
            style={{backgroundColor: currentTheme.colors.cardBg}}
          >
            <button
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300"
              style={{
                backgroundColor: currentTheme.colors.accent,
                color: 'white'
              }}
            >
              <SwatchIcon className="w-4 h-4" />
              <span>Personalización</span>
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div 
          className="card p-8 min-h-96"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <ThemeCustomization />
        </div>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div 
            className="card p-6 text-center"
            style={{backgroundColor: currentTheme.colors.cardBg}}
          >
            <SwatchIcon 
              className="w-8 h-8 mx-auto mb-3"
              style={{color: currentTheme.colors.accent}}
            />
            <h3 
              className="font-semibold mb-2"
              style={{color: currentTheme.colors.text}}
            >
              Temas Dinámicos
            </h3>
            <p 
              className="text-sm"
              style={{color: currentTheme.colors.textSecondary}}
            >
              Los cambios se aplican en tiempo real en toda la aplicación
            </p>
          </div>

          <div 
            className="card p-6 text-center"
            style={{backgroundColor: currentTheme.colors.cardBg}}
          >
            <Cog6ToothIcon 
              className="w-8 h-8 mx-auto mb-3"
              style={{color: currentTheme.colors.accent}}
            />
            <h3 
              className="font-semibold mb-2"
              style={{color: currentTheme.colors.text}}
            >
              Configuración Global
            </h3>
            <p 
              className="text-sm"
              style={{color: currentTheme.colors.textSecondary}}
            >
              Los ajustes se guardan automáticamente en el servidor
            </p>
          </div>

          <div 
            className="card p-6 text-center"
            style={{backgroundColor: currentTheme.colors.cardBg}}
          >
            <div 
              className="w-8 h-8 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{backgroundColor: currentTheme.colors.accent}}
            >
              <span className="text-white font-bold text-sm">7</span>
            </div>
            <h3 
              className="font-semibold mb-2"
              style={{color: currentTheme.colors.text}}
            >
              Temas Disponibles
            </h3>
            <p 
              className="text-sm"
              style={{color: currentTheme.colors.textSecondary}}
            >
              Cada tema diseñado para una experiencia única
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}