'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserPlusIcon, 
  ArrowRightIcon, 
  ShoppingCartIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface GuestCheckoutPromptProps {
  isOpen: boolean
  onClose: () => void
  onContinueAsGuest?: () => void
  cartItemsCount: number
  totalAmount: string
}

export default function GuestCheckoutPrompt({
  isOpen,
  onClose,
  onContinueAsGuest,
  cartItemsCount,
  totalAmount
}: GuestCheckoutPromptProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { currentTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  // Si el usuario ya está autenticado, no mostrar el prompt
  if (session) {
    return null
  }

  const handleLogin = async () => {
    setIsLoading(true)
    router.push('/login?from=checkout')
  }

  const handleRegister = () => {
    router.push('/register?from=checkout')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md p-6 rounded-2xl shadow-2xl border relative"
              style={{
                backgroundColor: currentTheme.colors.cardBg,
                borderColor: currentTheme.colors.borderColor
              }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: currentTheme.colors.buttonGradient
                  }}
                >
                  <ShoppingCartIcon className="w-8 h-8 text-white" />
                </div>
                
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.typography.headingFont
                  }}
                >
                  ¡Finalizar Compra!
                </h2>
                
                <p 
                  className="text-sm"
                  style={{
                    color: currentTheme.colors.textSecondary,
                    fontFamily: currentTheme.typography.bodyFont
                  }}
                >
                  Para completar tu compra necesitas una cuenta
                </p>
              </div>

              {/* Resumen del carrito */}
              <div 
                className="mb-6 p-4 rounded-lg border"
                style={{
                  backgroundColor: `${currentTheme.colors.accent}10`,
                  borderColor: `${currentTheme.colors.accent}30`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SparklesIcon 
                      className="w-5 h-5" 
                      style={{ color: currentTheme.colors.accent }} 
                    />
                    <span 
                      className="font-medium"
                      style={{ color: currentTheme.colors.text }}
                    >
                      Tu Carrito Angelical
                    </span>
                  </div>
                  <div 
                    className="text-right"
                    style={{ color: currentTheme.colors.text }}
                  >
                    <div className="text-sm opacity-75">
                      {cartItemsCount} {cartItemsCount === 1 ? 'producto' : 'productos'}
                    </div>
                    <div className="font-bold text-lg">
                      {totalAmount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opciones */}
              <div className="space-y-3">
                {/* Crear cuenta */}
                <button
                  onClick={handleRegister}
                  className="w-full p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] group"
                  style={{
                    background: currentTheme.colors.buttonGradient,
                    borderColor: 'transparent'
                  }}
                >
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <UserPlusIcon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">Crear Cuenta</div>
                        <div className="text-xs opacity-90">Recomendado • Rápido y seguro</div>
                      </div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Iniciar sesión */}
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] group"
                  style={{
                    backgroundColor: currentTheme.colors.cardBg,
                    borderColor: currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: currentTheme.colors.accent }}
                      >
                        <span className="text-white text-xs">👤</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Ya tengo cuenta</div>
                        <div className="text-xs opacity-75">Iniciar sesión</div>
                      </div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Continuar como invitado (si está habilitado) */}
                {onContinueAsGuest && (
                  <button
                    onClick={onContinueAsGuest}
                    className="w-full p-3 rounded-lg border transition-all duration-200 hover:bg-opacity-80"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: currentTheme.colors.borderColor,
                      color: currentTheme.colors.textSecondary
                    }}
                  >
                    <div className="text-sm">
                      Continuar como invitado
                    </div>
                  </button>
                )}
              </div>

              {/* Beneficios de crear cuenta */}
              <div className="mt-6 pt-4 border-t" style={{ borderColor: currentTheme.colors.borderColor }}>
                <div className="text-xs text-center space-y-1" style={{ color: currentTheme.colors.textSecondary }}>
                  <div className="flex items-center justify-center gap-1">
                    <span>✨</span>
                    <span>Historial de compras</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span>👼</span>
                    <span>Acceso a tu Ángel Mentor</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span>🎁</span>
                    <span>Ofertas exclusivas</span>
                  </div>
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 transition-colors"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}