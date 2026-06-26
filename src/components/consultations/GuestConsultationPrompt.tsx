'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { 
  XMarkIcon, 
  UserPlusIcon, 
  UserIcon,
  VideoCameraIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface GuestConsultationPromptProps {
  isOpen: boolean
  onClose: () => void
  consultationData: {
    consultantName: string
    date: string
    time: string
    duration: number
    totalPrice: number
  }
}

export default function GuestConsultationPrompt({ 
  isOpen, 
  onClose, 
  consultationData 
}: GuestConsultationPromptProps) {
  const { currentTheme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    // Guardar los datos de la consulta en localStorage para después del login
    localStorage.setItem('pendingConsultation', JSON.stringify(consultationData))
    router.push('/login?callbackUrl=/book-consultation&step=confirm')
  }

  const handleRegister = async () => {
    setLoading(true)
    // Guardar los datos de la consulta en localStorage para después del registro
    localStorage.setItem('pendingConsultation', JSON.stringify(consultationData))
    router.push('/register?callbackUrl=/book-consultation&step=confirm')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ 
              background: currentTheme.colors.cardBg,
              border: `1px solid ${currentTheme.colors.borderColor}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="relative px-6 py-8 text-center"
              style={{ 
                background: currentTheme.colors.buttonGradient
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
              
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/10 rounded-full">
                  <VideoCameraIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Inicia Sesión para Continuar!
              </h2>
              <p className="text-white/90 text-sm">
                Para confirmar tu videoconsulta necesitas una cuenta
              </p>
            </div>

            {/* Consultation Summary */}
            <div className="px-6 py-4">
              <div 
                className="rounded-lg p-4 mb-6"
                style={{ backgroundColor: `${currentTheme.colors.borderColor}20` }}
              >
                <h3 
                  className="font-semibold mb-3 flex items-center gap-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  <CalendarIcon className="h-5 w-5" />
                  Tu Consulta Seleccionada
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      Consultor:
                    </span>
                    <span 
                      className="font-medium"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {consultationData.consultantName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      Fecha:
                    </span>
                    <span 
                      className="font-medium"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {consultationData.date}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      Hora:
                    </span>
                    <span 
                      className="font-medium"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {consultationData.time}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      Duración:
                    </span>
                    <span 
                      className="font-medium"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {consultationData.duration} minutos
                    </span>
                  </div>
                  
                  <div className="border-t pt-2 mt-3" style={{ borderColor: currentTheme.colors.borderColor }}>
                    <div className="flex justify-between">
                      <span 
                        className="font-semibold"
                        style={{ color: currentTheme.colors.text }}
                      >
                        Total:
                      </span>
                      <span 
                        className="font-bold text-lg"
                        style={{ color: currentTheme.colors.accent }}
                      >
                        ${(consultationData.totalPrice / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                  style={{ background: currentTheme.colors.buttonGradient }}
                >
                  <UserIcon className="h-5 w-5" />
                  {loading ? 'Redirigiendo...' : 'Iniciar Sesión'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div 
                      className="w-full border-t"
                      style={{ borderColor: currentTheme.colors.borderColor }}
                    />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span 
                      className="px-2"
                      style={{ 
                        backgroundColor: currentTheme.colors.cardBg,
                        color: currentTheme.colors.textSecondary 
                      }}
                    >
                      ¿No tienes cuenta?
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg font-semibold border-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                  style={{ 
                    borderColor: currentTheme.colors.accent,
                    backgroundColor: `${currentTheme.colors.accent}10`,
                    color: currentTheme.colors.accent
                  }}
                >
                  <UserPlusIcon className="h-5 w-5" />
                  {loading ? 'Redirigiendo...' : 'Crear Cuenta'}
                </button>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-3 rounded-lg" style={{ backgroundColor: `${currentTheme.colors.borderColor}10` }}>
                <p className="text-xs text-center" style={{ color: currentTheme.colors.textSecondary }}>
                  🔒 Tu información está protegida. Solo necesitamos estos datos para procesar tu consulta y enviarte los detalles de acceso.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}