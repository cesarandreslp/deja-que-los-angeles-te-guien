// Hook para integrar en páginas de videollamada
// Registra automáticamente la entrada y salida de usuarios

import React from 'react'

interface AttendanceHookConfig {
  consultationId: string
  userRole: 'user' | 'consultant'
  onJoinSuccess?: (data: any) => void
  onLeaveSuccess?: (data: any) => void
  onError?: (error: string) => void
}

class VideoCallAttendanceHook {
  private config: AttendanceHookConfig
  private hasJoined: boolean = false
  private beforeUnloadHandler: () => void

  constructor(config: AttendanceHookConfig) {
    this.config = config
    this.beforeUnloadHandler = () => this.recordLeave()
    
    // Auto-registrar entrada cuando se crea el hook
    this.recordJoin()
    
    // Registrar salida cuando se cierra la página/pestaña
    window.addEventListener('beforeunload', this.beforeUnloadHandler)
    
    // Registrar salida cuando se oculta la página (cambio de pestaña, minimizar, etc.)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.hasJoined) {
        this.recordLeave()
      }
    })

    console.log(`🎥 AttendanceHook inicializado para ${config.userRole} en consulta ${config.consultationId}`)
  }

  // Registrar entrada a la videollamada
  async recordJoin() {
    if (this.hasJoined) return

    try {
      const response = await fetch('/api/attendance/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          consultationId: this.config.consultationId,
          role: this.config.userRole
        })
      })

      const data = await response.json()

      if (data.success) {
        this.hasJoined = true
        console.log(`✅ ${this.config.userRole} registrado como conectado`)
        this.config.onJoinSuccess?.(data.data)
      } else {
        console.error('❌ Error registrando entrada:', data.error)
        this.config.onError?.(data.error)
      }

    } catch (error) {
      console.error('❌ Error de red registrando entrada:', error)
      this.config.onError?.('Error de conexión')
    }
  }

  // Registrar salida de la videollamada
  async recordLeave() {
    if (!this.hasJoined) return

    try {
      const response = await fetch(`/api/attendance/join?consultationId=${this.config.consultationId}&role=${this.config.userRole}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        this.hasJoined = false
        console.log(`👋 ${this.config.userRole} registrado como desconectado`)
        this.config.onLeaveSuccess?.(data.data)
      } else {
        console.error('❌ Error registrando salida:', data.error)
        this.config.onError?.(data.error)
      }

    } catch (error) {
      console.error('❌ Error de red registrando salida:', error)
      // En caso de error de red, intentar con navigator.sendBeacon
      this.fallbackRecordLeave()
    }
  }

  // Método de respaldo para registrar salida usando sendBeacon (más confiable al cerrar página)
  private fallbackRecordLeave() {
    try {
      const data = new URLSearchParams({
        consultationId: this.config.consultationId,
        role: this.config.userRole
      })

      navigator.sendBeacon(`/api/attendance/join?${data.toString()}`, JSON.stringify({ method: 'DELETE' }))
      console.log('📡 Salida registrada con sendBeacon')
    } catch (error) {
      console.error('❌ Error en fallback de salida:', error)
    }
  }

  // Limpiar event listeners cuando el componente se desmonte
  destroy() {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler)
    
    // Registrar salida al destruir el hook
    if (this.hasJoined) {
      this.recordLeave()
    }
  }

  // Forzar registro de salida (útil para botones de "Salir de la llamada")
  forceLeave() {
    this.recordLeave()
  }

  // Verificar si el usuario está registrado como conectado
  isJoined(): boolean {
    return this.hasJoined
  }
}

// Hook React para facilitar el uso
export function useVideoCallAttendance(config: AttendanceHookConfig) {
  const [attendanceHook, setAttendanceHook] = React.useState<VideoCallAttendanceHook | null>(null)
  const [isJoined, setIsJoined] = React.useState(false)

  React.useEffect(() => {
    const hook = new VideoCallAttendanceHook({
      ...config,
      onJoinSuccess: (data) => {
        setIsJoined(true)
        config.onJoinSuccess?.(data)
      },
      onLeaveSuccess: (data) => {
        setIsJoined(false)
        config.onLeaveSuccess?.(data)
      }
    })

    setAttendanceHook(hook)

    return () => {
      hook.destroy()
    }
  }, [config.consultationId, config.userRole])

  const forceLeave = React.useCallback(() => {
    attendanceHook?.forceLeave()
  }, [attendanceHook])

  return {
    isJoined,
    forceLeave,
    attendanceHook
  }
}

export default VideoCallAttendanceHook

// Ejemplo de uso:
// const { isJoined, forceLeave } = useVideoCallAttendance({
//   consultationId: 'consultation-id',
//   userRole: 'user', // o 'consultant'
//   onJoinSuccess: (data) => console.log('Conectado:', data),
//   onLeaveSuccess: (data) => console.log('Desconectado:', data),
//   onError: (error) => console.error('Error:', error)
// })