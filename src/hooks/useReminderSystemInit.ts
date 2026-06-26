import { useEffect, useRef } from 'react'

export function useReminderSystemInit() {
  const initializationAttempted = useRef(false)

  useEffect(() => {
    // Solo intentar inicializar una vez por sesión
    if (initializationAttempted.current) return
    
    initializationAttempted.current = true

    // OPTIMIZACIÓN: Inicializar solo después de que la página esté completamente interactiva
    const initializeReminders = async () => {
      try {
        // Esperar más tiempo para no afectar la carga inicial (5 segundos)
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        // Solo si la página está visible (no en background)
        if (document.visibilityState !== 'visible') return
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // Timeout de 3s
        
        const response = await fetch('/api/reminders/init', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('🔮 Resultado inicialización recordatorios:', result.message)

      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⏱️ Timeout en inicialización de recordatorios - continuando')
        } else {
          console.error('❌ Error inicializando recordatorios via hook:', error)
        }
        // Fallar silenciosamente para no afectar UX
      }
    }

    // Solo ejecutar en el cliente y cuando la página esté completamente cargada
    if (typeof window !== 'undefined') {
      // Usar requestIdleCallback si está disponible para no bloquear
      if ('requestIdleCallback' in window) {
        requestIdleCallback(initializeReminders, { timeout: 10000 })
      } else {
        setTimeout(initializeReminders, 0)
      }
    }

  }, [])
}