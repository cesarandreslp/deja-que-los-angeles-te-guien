'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/context/ThemeContext'
import { SparklesIcon, StarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface FloatingAngelButtonProps {
  href?: string
  className?: string
}

export default function FloatingAngelButton({ 
  href = '/dashboard', 
  className = '' 
}: FloatingAngelButtonProps) {
  const { data: session } = useSession()
  const { currentTheme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number}>>([])

  // Siempre dirigir a la página pública del ángel mentor
  const destinationUrl = '/arcangel-mentor'
  const tooltipText = '¡Descubre tu Ángel Mentor! ✨'
  const tooltipSubtext = session 
    ? 'Conoce tu guía celestial personal' 
    : 'Crea tu cuenta para comenzar'

  // Mostrar después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Generar sparkles animados
  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setSparkles(prev => [
          ...prev.slice(-8), // Mantener solo los últimos 8
          {
            id: Date.now() + Math.random(),
            x: Math.random() * 80 - 40,
            y: Math.random() * 80 - 40
          }
        ])
      }, 200)

      return () => clearInterval(interval)
    } else {
      setSparkles([])
    }
  }, [isHovered])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.2 
        }}
        className={`fixed bottom-6 right-6 z-50 ${className}`}
      >
        {/* Sparkles animados */}
        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: sparkle.x,
                y: sparkle.y
              }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0],
                x: sparkle.x,
                y: sparkle.y
              }}
              transition={{ duration: 1.5 }}
              className="absolute top-1/2 left-1/2"
            >
              <StarIcon className="w-3 h-3 text-yellow-300" />
            </motion.div>
          ))}
        </div>

        {/* Botón principal */}
        <Link href={destinationUrl}>
          <motion.button
            className="relative group bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.accent}dd, ${currentTheme.colors.accentSecondary}dd, #8B5CF6dd)`,
              boxShadow: `
                0 10px 25px rgba(139, 92, 246, 0.4),
                0 0 40px rgba(139, 92, 246, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `
            }}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -5, 5, 0],
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            {/* Efectos de fondo animados */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 rounded-full animate-pulse" />
            
            {/* Anillo de luz giratorio */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Contenido del botón */}
            <div className="relative flex flex-col items-center justify-center z-10">
              {/* Icono principal */}
              <motion.div
                animate={{ 
                  y: [0, -2, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-2xl mb-1"
              >
                👼
              </motion.div>
              
              {/* Texto principal */}
              <div className="text-xs font-bold text-center leading-tight">
                <div className="golden-text-mini">Tu Ángel</div>
                <div className="golden-text-mini">Mentor</div>
              </div>
              
              {/* Sparkles icono */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute -top-1 -right-1"
              >
                <SparklesIcon className="w-4 h-4 text-yellow-300" />
              </motion.div>
            </div>

            {/* Pulso de llamada a la acción */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white/10"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeOut" 
              }}
            />
          </motion.button>
        </Link>

        {/* Tooltip flotante */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-xl shadow-lg border border-white/20 whitespace-nowrap"
              style={{
                fontFamily: currentTheme.typography.bodyFont
              }}
            >
              <div className="text-sm font-semibold">{tooltipText}</div>
              <div className="text-xs opacity-75">{tooltipSubtext}</div>
              
              {/* Flecha del tooltip */}
              <div 
                className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-r-0 border-t-4 border-b-4 border-l-white/95 border-t-transparent border-b-transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Texto de llamada flotante (aparece periódicamente) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            y: [10, -10, -10, -20]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            repeatDelay: 8,
            ease: "easeOut" 
          }}
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg pointer-events-none"
          style={{
            fontFamily: currentTheme.typography.bodyFont
          }}
        >
          ¡Nuevo! 🌟
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}