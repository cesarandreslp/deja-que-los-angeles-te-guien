'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// PÁGINA DE PERSONALIZACIÓN DESACTIVADA
// Solo se usa el tema original del Oráculo

export default function PersonalizacionPage() {
  const router = useRouter()

  // Redirigir inmediatamente al panel principal de configuración
  useEffect(() => {
    router.push('/admin/configuracion')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Panel Desactivado
          </h1>
          <p className="text-gray-600 mb-4">
            La funcionalidad de personalización ha sido desactivada.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Solo se utilizará el tema original del Oráculo.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/admin/configuracion')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔧 Ir a Configuración General
          </button>
          
          <button
            onClick={() => router.push('/admin')}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🏠 Volver al Panel Admin
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">ℹ️ Información</h3>
          <p className="text-sm text-blue-700">
            El tema original del Oráculo se mantiene activo con sus colores púrpura-azul 
            y gradientes característicos.
          </p>
        </div>
      </div>
    </div>
  )
}