import React from 'react'
import Link from 'next/link'

export default function ReactDevToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <div className="text-6xl">🔧</div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent mb-4">
            React DevTools
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Herramientas de desarrollo para el Oráculo Angelical
          </p>
        </div>

        {/* Opciones de instalación */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Extensión del navegador */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🌐</div>
            <h3 className="text-2xl font-bold text-white mb-4">Extensión del Navegador</h3>
            <p className="text-purple-200 mb-6">Opción recomendada para la mejor experiencia de desarrollo</p>
            
            <div className="space-y-3">
              <a 
                href="https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-center"
              >
                📱 Instalar en Chrome/Edge
              </a>
              <a 
                href="https://addons.mozilla.org/en-US/firefox/addon/react-devtools/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-center"
              >
                🦊 Instalar en Firefox
              </a>
            </div>
          </div>

          {/* Aplicación Standalone */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💻</div>
            <h3 className="text-2xl font-bold text-white mb-4">Aplicación Standalone</h3>
            <p className="text-purple-200 mb-6">Aplicación independiente para debugging avanzado</p>
            
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm text-green-400">
                <div className="text-gray-400"># Lanzar DevTools:</div>
                <div>npm run devtools</div>
              </div>
              <div className="text-sm text-purple-200">
                Se conecta automáticamente en localhost:8097
              </div>
            </div>
          </div>

          {/* Desarrollo integrado */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group md:col-span-2 lg:col-span-1">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
            <h3 className="text-2xl font-bold text-white mb-4">Desarrollo Integrado</h3>
            <p className="text-purple-200 mb-6">Servidor + DevTools en un solo comando</p>
            
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm text-green-400">
                <div className="text-gray-400"># Todo en uno:</div>
                <div>npm run dev:with-devtools</div>
              </div>
              <div className="text-sm text-purple-200">
                Lanza el servidor y DevTools simultáneamente
              </div>
            </div>
          </div>
        </div>

        {/* Funcionalidades */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            🌟 Funcionalidades Disponibles
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🔍</div>
              <div>
                <h4 className="font-semibold text-white mb-2">Inspección de Componentes</h4>
                <p className="text-purple-200 text-sm">Examina la estructura y jerarquía de componentes React</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-semibold text-white mb-2">Props y State</h4>
                <p className="text-purple-200 text-sm">Visualiza y edita props y estado en tiempo real</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="text-2xl">⚡</div>
              <div>
                <h4 className="font-semibold text-white mb-2">Profiling</h4>
                <p className="text-purple-200 text-sm">Analiza el rendimiento y optimiza la aplicación</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🌳</div>
              <div>
                <h4 className="font-semibold text-white mb-2">Árbol de Componentes</h4>
                <p className="text-purple-200 text-sm">Navega por la estructura completa de la aplicación</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🔄</div>
              <div>
                <h4 className="font-semibold text-white mb-2">Hot Reloading</h4>
                <p className="text-purple-200 text-sm">Insights sobre recarga en caliente y actualizaciones</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🎨</div>
              <div>
                <h4 className="font-semibold text-white mb-2">Temas Personalizados</h4>
                <p className="text-purple-200 text-sm">Personaliza la apariencia de las DevTools</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consejos para Oráculo Angelical */}
        <div className="bg-gradient-to-r from-yellow-400/20 to-pink-400/20 backdrop-blur-xl rounded-2xl p-8 border border-yellow-400/30 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            ✨ Consejos para el Oráculo Angelical
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="text-xl">🔮</div>
              <p className="text-white">
                <strong>Navbar Angelical:</strong> Inspecciona los efectos de hover y animaciones en los componentes de navegación
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-xl">👼</div>
              <p className="text-white">
                <strong>ConfigProvider:</strong> Monitorea el contexto de configuración y cambios de tema
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-xl">🌟</div>
              <p className="text-white">
                <strong>Componentes Angelicales:</strong> Verifica el estado de los componentes con efectos visuales
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-xl">⚡</div>
              <p className="text-white">
                <strong>Rendimiento:</strong> Usa el Profiler para optimizar las animaciones y transiciones
              </p>
            </div>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="text-center">
          <div className="inline-flex space-x-4">
            <Link 
              href="/"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🏠 Volver al Inicio
            </Link>
            
            <a 
              href="https://react.dev/learn/react-developer-tools" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              📚 Documentación Oficial
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}