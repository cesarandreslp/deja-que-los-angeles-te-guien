'use client'

import { SparklesIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from 'react'

interface WelcomeBannerProps {
  userName: string
  membershipTier?: 'basic' | 'premium' | 'vip'
  nextConsultation?: {
    date: Date
    mentor: string
  }
  dailyMessage?: string
}

export default function WelcomeBanner({ 
  userName, 
  membershipTier = 'basic',
  nextConsultation,
  dailyMessage 
}: WelcomeBannerProps) {
  
  const [greeting, setGreeting] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Determine greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Buenos días')
    else if (hour < 19) setGreeting('Buenas tardes')
    else setGreeting('Buenas noches')

    // Animation trigger
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const tierConfig = {
    basic: {
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      icon: '✨',
      badge: 'Básico'
    },
    premium: {
      gradient: 'from-purple-600 via-pink-600 to-red-600',
      icon: '⭐',
      badge: 'Premium'
    },
    vip: {
      gradient: 'from-yellow-400 via-orange-500 to-red-600',
      icon: '👑',
      badge: 'VIP'
    }
  }

  const config = tierConfig[membershipTier]

  return (
    <div 
      className={`
        relative overflow-hidden rounded-3xl p-8 shadow-2xl
        bg-gradient-to-br ${config.gradient}
        transform transition-all duration-700
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Floating Stars */}
      <div className="absolute inset-0 overflow-hidden">
        <SparklesIcon className="absolute top-10 right-10 w-6 h-6 text-white/50 animate-bounce" />
        <SparklesIcon className="absolute top-20 left-20 w-4 h-4 text-white/40 animate-bounce delay-300" />
        <SparklesIcon className="absolute bottom-10 left-10 w-5 h-5 text-white/30 animate-bounce delay-700" />
      </div>

      <div className="relative z-10 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          {/* Left Section */}
          <div className="space-y-3">
            {/* Greeting */}
            <div className="flex items-center gap-2">
              <span className="text-4xl">{config.icon}</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {greeting}, {userName}
                </h1>
                <p className="text-white/80 text-sm md:text-base">
                  {dailyMessage || 'El universo tiene un mensaje para ti hoy'}
                </p>
              </div>
            </div>

            {/* Membership Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
              <StarIcon className="w-4 h-4" />
              <span className="font-semibold text-sm">Membresía {config.badge}</span>
            </div>
          </div>

          {/* Right Section - Next Consultation */}
          {nextConsultation && (
            <div 
              className="
                bg-white/10 backdrop-blur-md rounded-2xl p-4 
                border border-white/20 min-w-[250px]
                transform hover:scale-105 transition-transform duration-300
              "
            >
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-5 h-5" />
                <span className="font-semibold text-sm">Próxima Consulta</span>
              </div>
              <p className="text-2xl font-bold">
                {nextConsultation.date.toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </p>
              <p className="text-white/80 text-sm">
                {nextConsultation.date.toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
              <p className="text-white/70 text-xs mt-1">
                con {nextConsultation.mentor}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex gap-3 flex-wrap">
          <button 
            className="
              bg-white/20 hover:bg-white/30 backdrop-blur-md
              px-6 py-2.5 rounded-xl font-semibold text-sm
              border border-white/30 transition-all duration-300
              hover:scale-105 hover:shadow-lg
            "
          >
            Nueva Lectura
          </button>
          <button 
            className="
              bg-white text-purple-600 hover:bg-white/90
              px-6 py-2.5 rounded-xl font-semibold text-sm
              transition-all duration-300 hover:scale-105 hover:shadow-lg
            "
          >
            Agendar Consulta
          </button>
        </div>
      </div>

      {/* Shine Effect */}
      <div 
        className="
          absolute top-0 left-0 w-full h-full 
          bg-gradient-to-r from-transparent via-white/10 to-transparent
          transform -skew-x-12 animate-shine
        "
      />

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  )
}
