'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Redireccionar según el rol del usuario
    switch (session.user.role) {
      case 'ADMIN':
        router.push('/admin')
        break
      case 'CONSULTANT':
        router.push('/consultant')
        break
      case 'USER':
        router.push('/user')
        break
      default:
        router.push('/login')
    }
  }, [session, status, router])

  // Mostrar loader mientras se determina la redirección
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando tu panel...</h2>
        <p className="text-gray-600">Redirigiendo según tu rol de usuario</p>
      </div>
    </div>
  )
}