'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface HydrationGuardProps {
  children: React.ReactNode
}

export default function HydrationGuard({ children }: HydrationGuardProps) {
  const { status } = useSession()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Solo permitir renderizado cuando:
    // 1. El componente está hidratado
    // 2. Y el estado de sesión no está en loading
    if (status !== 'loading') {
      setIsHydrated(true)
    }
  }, [status])

  // Mostrar loading hasta que esté todo listo
  if (!isHydrated || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white/80 rounded-full animate-spin mx-auto"></div>
          <p className="text-white/80 text-lg">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}