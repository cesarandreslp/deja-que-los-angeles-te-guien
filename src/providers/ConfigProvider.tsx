'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface AppConfig {
  id: string
  theme: 'ORACULO' // Solo tema original del Oráculo
  primaryColor: string
  appName: string
  logoUrl: string | null
  staticTexts: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

interface ConfigContextType {
  config: AppConfig | null
  loading: boolean
  error: string | null
  refreshConfig: () => Promise<void>
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<void>
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

export const useConfig = () => {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}

interface ConfigProviderProps {
  children: React.ReactNode
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Intentar cargar desde API, pero usar configuración por defecto si falla
      try {
        const response = await fetch('/api/config')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.config) {
            setConfig(data.config)
            return
          }
        }
      } catch (apiError) {
        console.warn('API config not available, using default config')
      }
      
      // Configuración por defecto (siempre disponible) - Solo tema original
      setConfig({
        id: 'default',
        theme: 'ORACULO',
        primaryColor: '#8B5FBF',
        appName: 'Oráculo de los Arcángeles',
        logoUrl: '/icons/alas.svg',
        staticTexts: {
          // Textos principales
          welcome: '✨ Bienvenido al Oráculo de los Arcángeles ✨',
          subtitle: 'Conecta con la sabiduría divina y encuentra tu camino espiritual',
          footer: '© 2025 Oráculo de los Arcángeles. Todos los derechos reservados.',
          
          // Navegación
          nav_home: 'Inicio',
          nav_about: 'Nosotros', 
          nav_services: 'Servicios',
          nav_oraculo: 'Oráculo',
          nav_consulta: 'Consulta Arcangelical',
          nav_mentor: 'Ángel Mentor',
          nav_tienda: 'Tienda Angelical',
          nav_membresias: 'Membresías',
          nav_contacto: 'Contacto',
          nav_login: 'Iniciar Sesión',
          nav_register: 'Registrarse',
          nav_profile: 'Perfil',
          nav_dashboard: 'Panel',
          nav_logout: 'Cerrar Sesión',
          
          // Hero Section
          hero_title: 'Descubre tu Destino con los Arcángeles',
          hero_subtitle: 'Un espacio sagrado donde la sabiduría divina te guía hacia la claridad y el propósito',
          hero_cta: 'Comenzar mi Consulta',
          
          // Services
          services_title: 'Nuestros Servicios Angelicales',
          service_oraculo_title: 'Oráculo de los Arcángeles',
          service_oraculo_desc: 'Recibe mensajes divinos a través de las cartas angelicales',
          service_consulta_title: 'Consulta Arcangelical',
          service_consulta_desc: 'Videollamadas personalizadas con consultores espirituales',
          service_mentor_title: 'Ángel Mentor Diario',
          service_mentor_desc: 'Guía diaria personalizada según tu arcángel protector'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } catch (err) {
      console.error('Error in fetchConfig:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const refreshConfig = async () => {
    await fetchConfig()
  }

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    try {
      setError(null)
      
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      })
      
      if (!response.ok) {
        throw new Error(`Error updating config: ${response.status}`)
      }
      
      const data = await response.json()
      setConfig(data.config)
    } catch (err) {
      console.error('Error updating config:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    }
  }

  // Aplicar tema dinámicamente
  useEffect(() => {
    if (config) {
      // Actualizar el título de la página
      document.title = config.appName
      
      // Actualizar variables CSS para el tema
      const root = document.documentElement
      
      // Aplicar color primario personalizado
      root.style.setProperty('--primary-color', config.primaryColor)
      
      // Solo aplicar el tema original del Oráculo
      const themeClass = 'theme-oraculo'
      
      // Remover cualquier clase de tema existente
      document.body.classList.forEach(className => {
        if (className.startsWith('theme-')) {
          document.body.classList.remove(className)
        }
      })
      
      // Agregar la clase del tema original
      document.body.classList.add(themeClass)
      
      // Configurar favicon si hay logo personalizado
      if (config.logoUrl) {
        const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement
        if (favicon) {
          favicon.href = config.logoUrl
        }
      }
    }
  }, [config])

  // Cargar configuración inicial
  useEffect(() => {
    fetchConfig()
  }, [])

  const value: ConfigContextType = {
    config,
    loading,
    error,
    refreshConfig,
    updateConfig
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  )
}

// Hook para obtener textos estáticos
export const useStaticText = (key: string, defaultValue?: string): string => {
  const { config } = useConfig()
  
  if (!config || !config.staticTexts) {
    return defaultValue || key
  }
  
  return config.staticTexts[key] || defaultValue || key
}

// Hook para obtener configuración de tema (solo tema original)
export const useTheme = () => {
  const { config } = useConfig()
  
  return {
    theme: 'ORACULO', // Siempre tema original
    primaryColor: config?.primaryColor || '#8B5FBF',
    appName: config?.appName || 'Oráculo de los Arcángeles',
    logoUrl: config?.logoUrl
  }
}

export default ConfigProvider