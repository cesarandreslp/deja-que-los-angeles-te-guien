'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Crown, ChevronRight, Sparkles, MessageCircle } from 'lucide-react'
import { AngelIcon, DoveIcon, StarIcon, LightIcon } from './icons/AngelIcons'

interface MentorInfo {
  arcangel: string
  arcangelInfo: {
    name: string
    day: string
    color: string
    element: string
    mission: string
    description: string
    personality: string
  }
  canConsult: boolean
  hasConsultationToday: boolean
  todayConsultation?: {
    id: string
    question: string
    answer: string
    createdAt: string
  }
  user: {
    name: string
  }
}

export default function ArcangelMentorSection() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isConsulting, setIsConsulting] = useState(false)
  const [showConsultForm, setShowConsultForm] = useState(false)
  const [question, setQuestion] = useState('')
  const [mentorInfo, setMentorInfo] = useState<MentorInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchMentorInfo()
    }
  }, [session])

  const fetchMentorInfo = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/mentor/info')
      const data = await response.json()
      
      if (!response.ok) {
        if (data.requiresBirthDate) {
          setError('Necesitas completar tu fecha de nacimiento para conocer a tu Arcángel Mentor')
        } else {
          setError(data.error || 'Error al cargar información del mentor')
        }
        return
      }
      
      setMentorInfo(data)
    } catch (error) {
      console.error('Error fetching mentor info:', error)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConsultMentor = async () => {
    if (!question.trim()) {
      alert('Por favor escribe tu pregunta')
      return
    }

    setIsConsulting(true)
    
    try {
      const response = await fetch('/api/mentor/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: question.trim() })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.hasConsultationToday) {
          // Ya hizo consulta hoy, actualizar la información
          setMentorInfo(prev => prev ? {
            ...prev,
            canConsult: false,
            hasConsultationToday: true,
            todayConsultation: data.consultation
          } : null)
          setShowConsultForm(false)
          setQuestion('')
        } else {
          alert(data.error || 'Error al realizar consulta')
        }
        return
      }
      
      // Consulta exitosa, actualizar la información
      setMentorInfo(prev => prev ? {
        ...prev,
        canConsult: false,
        hasConsultationToday: true,
        todayConsultation: data.consultation
      } : null)
      
      setShowConsultForm(false)
      setQuestion('')
      
    } catch (error) {
      console.error('Error consulting mentor:', error)
      alert('Error de conexión')
    } finally {
      setIsConsulting(false)
    }
  }

  const handleConsultarOraculo = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    
    try {
      // Verificar membresía
      const response = await fetch('/api/user/membership-status')
      const data = await response.json()
      
      if (!data.hasActiveMembreship) {
        router.push('/memberships')
        return
      }
      
      // Redirigir al oráculo si tiene membresía activa
      router.push('/oraculo')
    } catch (error) {
      console.error('Error verificando membresía:', error)
      router.push('/memberships')
    } finally {
      setIsLoading(false)
    }
  }

  // Función para obtener imagen del arcángel
  const getArcangelImage = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    return `/oraculo/arcangeles-chat/${nombreLower}_chat.png`;
  };

  if (!session) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <AngelIcon className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Descubre tu Arcángel Mentor
        </h2>
        <p className="text-purple-200 mb-6">
          Inicia sesión para conocer al arcángel que te guía según tu fecha de nacimiento
        </p>
        <button 
          onClick={() => router.push('/login')}
          className="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-purple-100 transition-colors"
        >
          Iniciar Sesión
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <LightIcon className="w-16 h-16 text-white animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Cargando tu Arcángel Mentor...
        </h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900 via-red-800 to-pink-900 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-4">
          {error.includes('fecha de nacimiento') ? 'Completa tu Perfil' : 'Error'}
        </h2>
        <p className="text-red-200 mb-6">{error}</p>
        <button 
          onClick={() => error.includes('fecha de nacimiento') ? router.push('/profile') : fetchMentorInfo()}
          className="bg-white text-red-900 px-6 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors"
        >
          {error.includes('fecha de nacimiento') ? 'Completar Perfil' : 'Reintentar'}
        </button>
      </div>
    )
  }

  if (!mentorInfo) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">❓</div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Error cargando información
        </h2>
        <button 
          onClick={fetchMentorInfo}
          className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      '#FFD700': 'from-yellow-600 to-yellow-800',
      '#FF69B4': 'from-pink-600 to-pink-800', 
      '#FFFFFF': 'from-gray-100 to-gray-300 text-gray-800',
      '#228B22': 'from-green-600 to-green-800',
      '#FF4500': 'from-orange-600 to-orange-800',
      '#8A2BE2': 'from-purple-600 to-purple-800',
      '#4169E1': 'from-blue-600 to-blue-800'
    }
    return colorMap[mentorInfo.arcangelInfo.color] || 'from-indigo-600 to-indigo-800'
  }

  const isWhiteTheme = mentorInfo.arcangelInfo.color === '#FFFFFF'

  return (
    <div className={`bg-gradient-to-br ${getColorClasses(mentorInfo.arcangelInfo.color)} rounded-xl p-8 ${isWhiteTheme ? 'text-gray-800' : 'text-white'} relative overflow-hidden`}>
      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-6">
          {/* Imagen del Arcángel */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <Image
                src={getArcangelImage(mentorInfo.arcangelInfo.name)}
                alt={`Arcángel ${mentorInfo.arcangelInfo.name}`}
                width={120}
                height={120}
                className="relative rounded-full border-4 border-white/30 shadow-2xl"
              />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">
            Tu Arcángel Mentor es {mentorInfo.arcangelInfo.name}
          </h2>
          <p className="text-xl opacity-90 mb-2">
            {mentorInfo.arcangelInfo.element}
          </p>
          <p className="opacity-80">
            {mentorInfo.arcangelInfo.description}
          </p>
        </div>

        {/* Consulta del día o formulario */}
        {mentorInfo.hasConsultationToday && mentorInfo.todayConsultation ? (
          <div className={`${isWhiteTheme ? 'bg-gray-800/20' : 'bg-white/20'} backdrop-blur-sm rounded-lg p-6 mb-6`}>
            <h3 className="text-xl font-bold mb-4 text-center">
              Consulta de Hoy - {new Date(mentorInfo.todayConsultation.createdAt).toLocaleDateString('es-ES')}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-semibold opacity-90">Tu pregunta:</p>
                <p className="opacity-80 italic">"{mentorInfo.todayConsultation.question}"</p>
              </div>
              <div>
                <p className="font-semibold opacity-90">Respuesta del Arcángel {mentorInfo.arcangelInfo.name}:</p>
                <p className="opacity-90 leading-relaxed">{mentorInfo.todayConsultation.answer}</p>
              </div>
            </div>
          </div>
        ) : showConsultForm ? (
          <div className={`${isWhiteTheme ? 'bg-gray-800/20' : 'bg-white/20'} backdrop-blur-sm rounded-lg p-6 mb-6`}>
            <h3 className="text-xl font-bold mb-4 text-center">
              Consulta a tu Arcángel {mentorInfo.arcangelInfo.name}
            </h3>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`Hola, ¿en qué puedo guiarte hoy?`}
              className={`w-full p-4 rounded-lg backdrop-blur-sm border resize-none focus:outline-none focus:ring-2 ${
                isWhiteTheme 
                  ? 'bg-gray-700/20 border-gray-600/20 placeholder-gray-600 focus:ring-gray-500/30' 
                  : 'bg-white/10 border-white/20 placeholder-white/60 focus:ring-white/30'
              }`}
              rows={4}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm opacity-60">{question.length}/1000</span>
              <div className="space-x-3">
                <button
                  onClick={() => setShowConsultForm(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isWhiteTheme 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConsultMentor}
                  disabled={isConsulting || !question.trim()}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isWhiteTheme 
                      ? 'bg-gray-800 text-white hover:bg-gray-900' 
                      : 'bg-white/30 hover:bg-white/40'
                  }`}
                >
                  {isConsulting ? 'Consultando...' : 'Consultar'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="text-center space-y-4">
          {mentorInfo.canConsult ? (
            <button
              onClick={() => setShowConsultForm(true)}
              className={`${isWhiteTheme ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-white/20 hover:bg-white/30'} backdrop-blur-sm px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 border ${isWhiteTheme ? 'border-gray-600' : 'border-white/30'} flex items-center justify-center mx-auto`}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Consultar a tu Arcángel Mentor
            </button>
          ) : (
            <p className="opacity-80 italic">
              Ya realizaste tu consulta diaria. Vuelve mañana para una nueva consulta.
            </p>
          )}
          
          <button
            onClick={handleConsultarOraculo}
            disabled={isLoading}
            className={`${isWhiteTheme ? 'bg-gray-700 text-white hover:bg-gray-800' : 'bg-white/20 hover:bg-white/30'} backdrop-blur-sm px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border ${isWhiteTheme ? 'border-gray-600' : 'border-white/30'} flex items-center justify-center mx-auto`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando...
              </span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Consultar Oráculo Completo
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center text-sm opacity-75 space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <DoveIcon className="w-4 h-4" />
            <p>Consulta diaria GRATIS a tu Arcángel Mentor</p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <StarIcon className="w-4 h-4" />
            <p>Oráculo completo requiere Membresía Premium</p>
          </div>
        </div>
      </div>
    </div>
  )
}