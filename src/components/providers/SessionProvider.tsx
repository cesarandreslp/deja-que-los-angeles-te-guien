'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
}

export default function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      // Configuraciones para mejorar la estabilidad de la sesión
      refetchInterval={0} // Desactivar refetch automático para evitar parpadeos
      refetchOnWindowFocus={false} // No refrescar al hacer focus
      refetchWhenOffline={false} // No refrescar cuando está offline
      basePath="/api/auth" // Asegurar la ruta base correcta
    >
      {children}
    </NextAuthSessionProvider>
  )
}