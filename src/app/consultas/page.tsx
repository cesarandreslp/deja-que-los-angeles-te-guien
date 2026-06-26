'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ConsultasPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página de agendar consultas
    router.replace('/book-consultation')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo a consultas...</p>
      </div>
    </div>
  )
}