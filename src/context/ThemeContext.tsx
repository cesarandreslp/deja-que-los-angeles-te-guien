'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Theme, ThemeId, ThemeContextType } from '@/types/theme'
import { getTheme } from '@/styles/themes'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>('CELESTIAL')
  const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme('CELESTIAL'))
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Marcar como hidratado en el cliente
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Cargar tema desde localStorage solo después de la hidratación
  useEffect(() => {
    if (!isHydrated) return
    
    try {
      const savedThemeId = localStorage.getItem('theme') as ThemeId
      if (savedThemeId && getTheme(savedThemeId)) {
        setThemeId(savedThemeId)
        setCurrentTheme(getTheme(savedThemeId))
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error)
    }
  }, [isHydrated])

  // Aplicar variables CSS cuando cambia el tema
  useEffect(() => {
    applyThemeVariables(currentTheme)
  }, [currentTheme])

  // Función para aplicar variables CSS al root
  const applyThemeVariables = (theme: Theme) => {
    const root = document.documentElement
    
    // Aplicar colores como variables CSS sin conflicto
    root.style.setProperty('--new-theme-background', theme.colors.background)
    root.style.setProperty('--new-theme-text', theme.colors.text)
    root.style.setProperty('--new-theme-text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--new-theme-accent', theme.colors.accent)
    root.style.setProperty('--new-theme-accent-secondary', theme.colors.accentSecondary)
    root.style.setProperty('--new-theme-navbar-bg', theme.colors.navbarBg)
    root.style.setProperty('--new-theme-footer-bg', theme.colors.footerBg)
    root.style.setProperty('--new-theme-button-gradient', theme.colors.buttonGradient)
    root.style.setProperty('--new-theme-card-bg', theme.colors.cardBg)
    root.style.setProperty('--new-theme-border-color', theme.colors.borderColor)
    root.style.setProperty('--new-theme-shadow-color', theme.colors.shadowColor)
    
    // Aplicar tipografía sin conflicto
    root.style.setProperty('--new-font-heading', theme.typography.headingFont)
    root.style.setProperty('--new-font-body', theme.typography.bodyFont)
  }

  // Función para cambiar tema localmente
  const setTheme = (newThemeId: ThemeId) => {
    const newTheme = getTheme(newThemeId)
    setThemeId(newThemeId)
    setCurrentTheme(newTheme)
    
    // Solo guardar en localStorage si estamos en el cliente
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('theme', newThemeId)
      } catch (error) {
        console.error('Error saving theme to localStorage:', error)
      }
    }
  }

  // Función para aplicar tema y sincronizar con backend
  const applyTheme = async (newThemeId: ThemeId) => {
    setIsLoading(true)
    
    try {
      // Actualizar tema localmente primero
      setTheme(newThemeId)
      
      // Sincronizar con backend
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: newThemeId,
          appName: 'Deja que los ángeles te guíen'
        }),
      })
      
      if (!response.ok) {
        throw new Error('Error al guardar tema en servidor')
      }
      
      console.log(`✨ Tema ${newThemeId} aplicado correctamente`)
      
    } catch (error) {
      console.error('Error al aplicar tema:', error)
      // En caso de error, mantener el tema local pero mostrar advertencia
    } finally {
      setIsLoading(false)
    }
  }

  const value: ThemeContextType = {
    currentTheme,
    themeId,
    setTheme,
    applyTheme,
    isLoading
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider')
  }
  return context
}

export default ThemeContext