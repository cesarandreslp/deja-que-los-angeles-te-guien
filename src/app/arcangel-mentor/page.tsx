'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ArcangelMentorSection from '@/components/ArcangelMentorSection'
import { useTheme } from '@/context/ThemeContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'
import { StarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

// Componente para mostrar información pública sobre el Ángel Mentor
function PublicArcangelMentorInfo() {
  const { currentTheme } = useTheme()
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        {/* Ícono principal */}
        <div className="flex justify-center mb-8">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background: currentTheme.colors.buttonGradient,
              boxShadow: `0 25px 50px ${currentTheme.colors.shadowColor}`
            }}
          >
            <StarIcon className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Título principal */}
        <h1 
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{
            fontFamily: currentTheme.typography.headingFont,
            color: currentTheme.colors.text
          }}
        >
          Descubre tu Arcángel Mentor
        </h1>
        
        <p 
          className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed"
          style={{
            fontFamily: currentTheme.typography.bodyFont,
            color: currentTheme.colors.textSecondary
          }}
        >
          Cada persona tiene un arcángel mentor asignado según el día de la semana en que nació. 
          Tu guía celestial personal te acompañará en tu camino espiritual con sabiduría divina y protección.
        </p>
      </div>

      {/* Información sobre los Arcángeles */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {[
          {
            name: "Miguel",
            day: "Domingo",
            element: "Fuego",
            description: "El Protector Divino, líder de los ejércitos celestiales",
            image: "/arcangeles-chat/miguel_chat.png"
          },
          {
            name: "Gabriel",
            day: "Lunes", 
            element: "Agua",
            description: "El Mensajero Divino, portador de buenas nuevas",
            image: "/arcangeles-chat/gabriel_chat.png"
          },
          {
            name: "Camael",
            day: "Martes",
            element: "Fuego",
            description: "El Guerrero Divino, quien fortalece el coraje",
            image: "/arcangeles-chat/chamuel_chat.png"
          },
          {
            name: "Rafael",
            day: "Miércoles",
            element: "Aire",
            description: "El Sanador Divino, quien brinda curación y guía",
            image: "/arcangeles-chat/rafael_chat.png"
          },
          {
            name: "Zadkiel",
            day: "Jueves",
            element: "Agua",
            description: "El Transformador Divino, maestro de la transmutación",
            image: "/arcangeles-chat/zadquiel_chat.png"
          },
          {
            name: "Anael",
            day: "Viernes",
            element: "Tierra",
            description: "El Amor Divino, guardián del corazón y las relaciones",
            image: "/arcangeles-chat/haniel_chat.png"
          },
          {
            name: "Cassiel",
            day: "Sábado",
            element: "Tierra",
            description: "El Contemplativo Divino, maestro de la paciencia",
            image: "/arcangeles-chat/raziel_chat.png"
          }
        ].map((arcangel, index) => (
          <div 
            key={index}
            className="rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            style={{ 
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: `${currentTheme.colors.accent}20`
            }}
          >
            <div className="text-center mb-4">
              <div 
                className="w-20 h-20 mx-auto rounded-full mb-3"
                style={{ 
                  backgroundColor: `${currentTheme.colors.accent}10`,
                  border: `2px solid ${currentTheme.colors.accent}30`,
                  overflow: 'hidden'
                }}
              >
                <img
                  src={arcangel.image}
                  alt={`Arcángel ${arcangel.name}`}
                  loading="eager"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
              <h3 
                className="text-xl font-bold mb-1"
                style={{ color: currentTheme.colors.text }}
              >
                Arcángel {arcangel.name}
              </h3>
              <p 
                className="text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.accent }}
              >
                {arcangel.day} • {arcangel.element}
              </p>
            </div>
            <p 
              className="text-sm text-center"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {arcangel.description}
            </p>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div 
        className="rounded-xl p-8 text-center shadow-lg border"
        style={{ 
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: `${currentTheme.colors.accent}30`
        }}
      >
        <div className="flex justify-center mb-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${currentTheme.colors.accent}20` }}
          >
            <StarIcon 
              className="w-8 h-8"
              style={{ color: currentTheme.colors.accent }}
            />
          </div>
        </div>
        
        <h2 
          className="text-2xl font-bold mb-4"
          style={{ color: currentTheme.colors.text }}
        >
          ¿Listo para conocer a tu Arcángel Mentor?
        </h2>
        
        <p 
          className="text-lg mb-6 max-w-2xl mx-auto"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Crea tu cuenta para descubrir qué arcángel te guía según tu fecha de nacimiento 
          y recibe orientación personalizada en tu camino espiritual.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 rounded-lg font-semibold text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            style={{ background: currentTheme.colors.buttonGradient }}
          >
            Crear mi Cuenta
          </Link>
          
          <Link
            href="/login"
            className="px-8 py-3 rounded-lg font-semibold border-2 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            style={{ 
              borderColor: currentTheme.colors.accent,
              backgroundColor: `${currentTheme.colors.accent}10`,
              color: currentTheme.colors.accent
            }}
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ArcangelMentorPage() {
  const { data: session, status } = useSession()
  const { currentTheme } = useTheme()
  const router = useRouter()
  const [showMentorSection, setShowMentorSection] = useState(false)

  useEffect(() => {
    // Mostrar siempre la información pública, no requiere autenticación
    const timer = setTimeout(() => {
      setShowMentorSection(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-6" style={{ borderColor: currentTheme.colors.accent }}></div>
          <div className="space-y-2">
            <p className="text-xl font-medium" style={{ color: currentTheme.colors.text }}>
              Cargando...
            </p>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              Preparando tu experiencia espiritual
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!showMentorSection) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {/* Ícono principal */}
            <div className="flex justify-center mb-8">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
                style={{
                  background: currentTheme.colors.buttonGradient,
                  boxShadow: `0 25px 50px ${currentTheme.colors.shadowColor}`
                }}
              >
                <StarIcon className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Título y descripción */}
            <h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.text
              }}
            >
              Conoce a tu Arcángel Mentor
            </h1>
            
            <p 
              className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
              style={{
                fontFamily: currentTheme.typography.bodyFont,
                color: currentTheme.colors.textSecondary
              }}
            >
              Cada alma tiene un arcángel mentor asignado según el día de la semana en que nació. 
              Descubre quién es tu guía celestial y recibe su sabiduría divina.
            </p>

            {/* Estado de carga con efecto de pulso */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="animate-pulse flex space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentTheme.colors.accent }}
                ></div>
                <div 
                  className="w-3 h-3 rounded-full animation-delay-150"
                  style={{ backgroundColor: currentTheme.colors.accent }}
                ></div>
                <div 
                  className="w-3 h-3 rounded-full animation-delay-300"
                  style={{ backgroundColor: currentTheme.colors.accent }}
                ></div>
              </div>
              <p 
                className="text-lg font-medium"
                style={{ color: currentTheme.colors.accent }}
              >
                Conectando con tu guía celestial...
              </p>
            </div>

            {/* Información adicional */}
            <div 
              className="rounded-xl p-6 shadow-lg border max-w-2xl mx-auto"
              style={{ 
                backgroundColor: currentTheme.colors.cardBg,
                borderColor: `${currentTheme.colors.accent}20`
              }}
            >
              <div className="flex items-center justify-center mb-4">
                <SparklesIcon 
                  className="w-6 h-6 mr-2"
                  style={{ color: currentTheme.colors.accent }}
                />
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme.colors.text }}
                >
                  ¿Sabías que...?
                </h3>
              </div>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Tu arcángel mentor te acompaña desde el momento de tu nacimiento, 
                ofreciéndote protección, guía y sabiduría específica según tu día de nacimiento. 
                Cada arcángel tiene cualidades únicas que resonarán con tu propósito de vida.
              </p>
            </div>

            {/* Enlace de respaldo */}
            <div className="mt-8">
              <Link
                href="/dashboard"
                className="text-sm hover:underline transition-all duration-200"
                style={{ color: currentTheme.colors.accent }}
              >
                ← Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
      <GoldenStarsBackground />
      <div className="relative z-10">
        {session ? (
          <ArcangelMentorSection />
        ) : (
          <PublicArcangelMentorInfo />
        )}
      </div>
    </div>
  )
}