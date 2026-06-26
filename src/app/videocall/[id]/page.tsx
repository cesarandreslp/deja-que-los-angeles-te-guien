'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/context/ThemeContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'
import { useVideoCallAttendance } from '@/hooks/useVideoCallAttendance'
import { 
  VideoCameraIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhoneIcon,
  UsersIcon,
  ArrowLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

// Declarar el API de Jitsi Meet
declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

interface ConsultationData {
  id: string
  scheduledAt: string
  duration: number
  status: string
  videoLink: string
  user: {
    fullName: string
    email: string
  }
  consultor: {
    fullName: string
    email: string
  } | null
}

export default function VideoCallPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { currentTheme } = useTheme()
  const consultationId = params.id as string

  // Estados
  const [consultation, setConsultation] = useState<ConsultationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jitsiApi, setJitsiApi] = useState<any>(null)
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false)
  const [callStatus, setCallStatus] = useState<'waiting' | 'connecting' | 'connected' | 'ended'>('waiting')
  const [participants, setParticipants] = useState<string[]>([])

  // Determinar el rol del usuario
  const userRole = consultation && session ? 
    (consultation.user.email === session.user?.email ? 'user' : 'consultant') : 'user'

  // Hook de seguimiento de asistencia
  const { isJoined, forceLeave } = useVideoCallAttendance({
    consultationId,
    userRole: userRole as 'user' | 'consultant',
    onJoinSuccess: (data) => {
      console.log('✅ Asistencia registrada:', data)
    },
    onLeaveSuccess: (data) => {
      console.log('👋 Salida registrada:', data)
      if (data.actualDuration) {
        alert(`Consulta finalizada. Duración: ${data.actualDuration} minutos`)
      }
    },
    onError: (error) => {
      console.error('❌ Error de asistencia:', error)
    }
  })

  // Cargar datos de la consulta
  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const response = await fetch(`/api/consultations/${consultationId}`)
        const data = await response.json()
        
        if (data.success) {
          setConsultation(data.data)
        } else {
          setError(data.error || 'Error cargando consulta')
        }
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    if (consultationId) {
      fetchConsultation()
    }
  }, [consultationId])

  // Cargar script de Jitsi Meet
  useEffect(() => {
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        setIsJitsiLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://meet.jit.si/external_api.js'
      script.async = true
      script.onload = () => setIsJitsiLoaded(true)
      script.onerror = () => setError('Error cargando Jitsi Meet')
      document.head.appendChild(script)
    }

    loadJitsiScript()
  }, [])

  // Inicializar videollamada de Jitsi
  const initializeJitsi = () => {
    if (!isJitsiLoaded || !consultation || jitsiApi) return

    const domain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
    const roomName = `oraculo-consulta-${consultation.id}`
    
    const options = {
      roomName,
      width: '100%',
      height: 500,
      parentNode: document.querySelector('#jitsi-container'),
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableClosePage: false,
        defaultLanguage: 'es',
        disableInviteFunctions: true,
        doNotStoreRoom: true,
        startScreenSharing: false,
        enableEmailInStats: false,
        enableNoAudioDetection: true,
        enableNoisyMicDetection: true,
        resolution: 720,
        constraints: {
          video: {
            aspectRatio: 16 / 9,
            height: {
              ideal: 720,
              max: 720,
              min: 240
            }
          }
        }
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        SHOW_POWERED_BY: false,
        DEFAULT_BACKGROUND: '#1a1a1a',
        DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
        DISABLE_FOCUS_INDICATOR: false,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        DISABLE_PRESENCE_STATUS: false,
        DISABLE_RINGING: false,
        AUDIO_LEVEL_PRIMARY_COLOR: 'rgba(255,255,255,0.4)',
        AUDIO_LEVEL_SECONDARY_COLOR: 'rgba(255,255,255,0.2)',
        POLICY_LOGO: null,
        LOCAL_THUMBNAIL_RATIO: 16 / 9,
        REMOTE_THUMBNAIL_RATIO: 1,
        LIVE_STREAMING_HELP_LINK: 'https://jitsi.org/live',
        MOBILE_APP_PROMO: false
      },
      userInfo: {
        displayName: session?.user?.name || 'Usuario',
        email: session?.user?.email
      }
    }

    const api = new window.JitsiMeetExternalAPI(domain, options)
    setJitsiApi(api)
    setCallStatus('connecting')

    // Event listeners
    api.addEventListener('ready', () => {
      console.log('🎥 Jitsi Meet listo')
      setCallStatus('connected')
    })

    api.addEventListener('participantJoined', (participant: any) => {
      console.log('👤 Participante se unió:', participant.displayName)
      setParticipants(prev => [...prev, participant.displayName])
    })

    api.addEventListener('participantLeft', (participant: any) => {
      console.log('👋 Participante salió:', participant.displayName)
      setParticipants(prev => prev.filter(name => name !== participant.displayName))
    })

    api.addEventListener('videoConferenceJoined', () => {
      console.log('✅ Usuario se unió a la conferencia')
      setCallStatus('connected')
    })

    api.addEventListener('videoConferenceLeft', () => {
      console.log('👋 Usuario salió de la conferencia')
      setCallStatus('ended')
      forceLeave()
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    })

    api.addEventListener('readyToClose', () => {
      console.log('🔚 Listo para cerrar')
      api.dispose()
      setJitsiApi(null)
      setCallStatus('ended')
    })
  }

  // Finalizar llamada
  const endCall = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup')
    }
    forceLeave()
    router.push('/dashboard')
  }

  // Renderizado condicional por estado
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-6" style={{ borderColor: currentTheme.colors.accent }}></div>
          <div className="space-y-2">
            <p className="text-lg font-medium" style={{ color: currentTheme.colors.text }}>
              Preparando Conexión
            </p>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              Cargando videollamada...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="rounded-lg shadow-sm border p-8 text-center" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.accent }} />
            <h1 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
              Acceso Requerido
            </h1>
            <p className="mb-6" style={{ color: currentTheme.colors.textSecondary }}>
              Debes iniciar sesión para acceder a la videollamada.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              style={{ background: currentTheme.colors.buttonGradient }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="rounded-lg shadow-sm border p-8 text-center" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.accent }} />
            <h1 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
              Error
            </h1>
            <p className="mb-6" style={{ color: currentTheme.colors.textSecondary }}>
              {error}
            </p>
            <button
              onClick={() => router.push('/user/consultations')}
              className="w-full border px-6 py-3 rounded-lg hover:shadow-md transition-all duration-200 font-medium flex items-center justify-center gap-2"
              style={{ 
                borderColor: currentTheme.colors.accent, 
                color: currentTheme.colors.accent,
                backgroundColor: `${currentTheme.colors.accent}05`
              }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver a Mis Consultas
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="rounded-lg shadow-sm border p-8 text-center" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.accent }} />
            <h1 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
              Consulta No Encontrada
            </h1>
            <p className="mb-6" style={{ color: currentTheme.colors.textSecondary }}>
              No se pudo encontrar la consulta solicitada en el sistema.
            </p>
            <button
              onClick={() => router.push('/user/consultations')}
              className="w-full border px-6 py-3 rounded-lg hover:shadow-md transition-all duration-200 font-medium flex items-center justify-center gap-2"
              style={{ 
                borderColor: currentTheme.colors.accent, 
                color: currentTheme.colors.accent,
                backgroundColor: `${currentTheme.colors.accent}05`
              }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver a Mis Consultas
            </button>
          </div>
        </div>
      </div>
    )
  }

  const scheduledTime = new Date(consultation.scheduledAt)
  const now = new Date()
  const isScheduledTime = now >= scheduledTime
  const minutesUntilStart = Math.max(0, Math.floor((scheduledTime.getTime() - now.getTime()) / (1000 * 60)))

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('es-CO', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const { date, time } = formatDateTime(consultation.scheduledAt)

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
      <GoldenStarsBackground />
      
      {/* Header */}
      <div className="relative z-10 border-b" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/user/consultations')}
                className="p-2 rounded-lg hover:opacity-75 transition-opacity"
                style={{ backgroundColor: `${currentTheme.colors.accent}20` }}
              >
                <ArrowLeftIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
              </button>
              <VideoCameraIcon className="w-8 h-8" style={{ color: currentTheme.colors.accent }} />
              <div>
                <h1 className="text-xl font-bold" style={{ color: currentTheme.colors.text }}>
                  Videoconsulta
                </h1>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  {userRole === 'user' ? 'Tu consulta' : 'Consulta como consultor'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                  {date}
                </p>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  {time}
                </p>
              </div>
              
              {isJoined && (
                <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                  <CheckCircleIcon className="w-3 h-3 inline mr-1" />
                  Conectado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Video Container */}
          <div className="lg:col-span-3">
            <div className="rounded-lg shadow-sm border" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
              <div className="p-6 pb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                  <VideoCameraIcon className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
                  {callStatus === 'waiting' && 'Sala de Videollamada'}
                  {callStatus === 'connecting' && 'Conectando...'}
                  {callStatus === 'connected' && 'Videollamada Activa'}
                  {callStatus === 'ended' && 'Llamada Finalizada'}
                </h2>
                <p className="text-sm mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                  {!isScheduledTime && `Faltan ${minutesUntilStart} minutos para comenzar`}
                  {isScheduledTime && callStatus === 'waiting' && 'La consulta puede comenzar'}
                  {callStatus === 'connected' && `${participants.length + 1} participante(s) conectado(s)`}
                </p>
              </div>
              
              <div className="p-6 pt-0">
                {!isScheduledTime ? (
                  // Sala de espera
                  <div className="rounded-lg p-8 text-center border" style={{ 
                    backgroundColor: `${currentTheme.colors.accent}05`, 
                    borderColor: `${currentTheme.colors.accent}30` 
                  }}>
                    <ClockIcon className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.accent }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                      La consulta comenzará pronto
                    </h3>
                    <p className="mb-4" style={{ color: currentTheme.colors.textSecondary }}>
                      Faltan {minutesUntilStart} minutos para la hora programada
                    </p>
                    <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                      Puedes esperar aquí o volver más tarde.
                    </p>
                  </div>
                ) : callStatus === 'waiting' ? (
                  // Botón para iniciar
                  <div className="rounded-lg p-8 text-center border" style={{ 
                    backgroundColor: `${currentTheme.colors.accent}10`, 
                    borderColor: `${currentTheme.colors.accent}40` 
                  }}>
                    <VideoCameraIcon className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.accent }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: currentTheme.colors.text }}>
                      Es hora de tu consulta
                    </h3>
                    <p className="mb-6" style={{ color: currentTheme.colors.textSecondary }}>
                      Puedes unirte a la videollamada ahora
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={initializeJitsi}
                        disabled={!isJitsiLoaded}
                        className="text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-lg font-medium"
                        style={{ background: currentTheme.colors.buttonGradient }}
                      >
                        {isJitsiLoaded ? (
                          <div className="flex items-center justify-center gap-2">
                            <VideoCameraIcon className="w-5 h-5" />
                            <span>Unirse a la Videollamada</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Cargando...</span>
                          </div>
                        )}
                      </button>
                      
                      {consultation.videoLink && (
                        <button
                          onClick={() => window.open(consultation.videoLink, '_blank')}
                          className="ml-4 border px-6 py-2 rounded-lg hover:opacity-75 transition-opacity"
                          style={{ 
                            borderColor: currentTheme.colors.accent, 
                            color: currentTheme.colors.accent,
                            backgroundColor: `${currentTheme.colors.accent}10`
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <span>Abrir en Nueva Ventana</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // Container de Jitsi Meet
                  <div className="relative">
                    <div id="jitsi-container" className="w-full h-[500px] rounded-lg overflow-hidden bg-black"></div>
                    
                    {callStatus === 'connected' && (
                      <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                        <button
                          onClick={endCall}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <PhoneIcon className="w-4 h-4" />
                          Finalizar Llamada
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Información de la Consulta */}
            <div className="rounded-lg shadow-sm border" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
              <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                  <UserIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
                  Información de la Consulta
                </h3>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
                    <UserIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Consultante</p>
                    <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                      {consultation.user.fullName}
                    </p>
                  </div>
                </div>
                
                {consultation.consultor && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
                      <VideoCameraIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Consultor</p>
                      <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                        {consultation.consultor.fullName}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
                    <ClockIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Duración</p>
                    <p className="font-medium" style={{ color: currentTheme.colors.text }}>
                      {consultation.duration} minutos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
                    <CheckCircleIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Estado</p>
                    <div className="px-3 py-1 rounded-full text-xs font-medium inline-block" 
                         style={{ backgroundColor: `${currentTheme.colors.accent}20`, color: currentTheme.colors.accent }}>
                      {consultation.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado de Conexión */}
            <div className="rounded-lg shadow-sm border" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
              <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                  <UsersIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
                  Participantes
                </h3>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.accent}05` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
                        <UserIcon className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                        {session.user?.name}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isJoined ? 'text-green-800' : 'text-gray-600'}`} 
                         style={{ backgroundColor: isJoined ? '#dcfce7' : '#f3f4f6' }}>
                      {isJoined ? 'Conectado' : 'Esperando'}
                    </div>
                  </div>
                  
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.accent}05` }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentTheme.colors.accent}20` }}>
                          <UserIcon className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                          {participant}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium text-green-800" style={{ backgroundColor: '#dcfce7' }}>
                        Conectado
                      </div>
                    </div>
                  ))}
                  
                  {participants.length === 0 && !isJoined && (
                    <div className="text-center py-4">
                      <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                        Esperando conexión...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controles Angelicales */}
            <div className="rounded-lg shadow-sm border" style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.borderColor }}>
              <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: currentTheme.colors.text }}>
                  <Cog6ToothIcon className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
                  Controles
                </h3>
              </div>
              <div className="p-6 pt-0 space-y-3">
                <button
                  onClick={() => router.push('/user/consultations')}
                  className="w-full border px-4 py-3 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                  style={{ 
                    borderColor: currentTheme.colors.accent, 
                    color: currentTheme.colors.accent,
                    backgroundColor: `${currentTheme.colors.accent}05`
                  }}
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Volver a Mis Consultas
                </button>
                
                {callStatus === 'connected' && (
                  <button
                    onClick={endCall}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    Finalizar Llamada
                  </button>
                )}
                
                {callStatus === 'waiting' && !isScheduledTime && (
                  <div className="text-center py-2 px-4 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.accent}10` }}>
                    <p className="text-sm" style={{ color: currentTheme.colors.accent }}>
                      Preparando videollamada...
                    </p>
                  </div>
                )}
                
                {callStatus === 'connecting' && (
                  <div className="text-center py-2 px-4 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.accent}10` }}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: currentTheme.colors.accent }}></div>
                      <p className="text-sm" style={{ color: currentTheme.colors.accent }}>
                        Estableciendo conexión...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}