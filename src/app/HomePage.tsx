'use client'

import { useSession } from 'next-auth/react'
import { useTheme } from '@/context/ThemeContext'
import { 
  SparklesIcon,
  StarIcon,
  UserGroupIcon,
  BookOpenIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import {
  PageContainer,
  ProfessionalCard,
  PrimaryButton,
  SecondaryButton,
  ServiceGrid,
  IconContainer,
  Badge
} from '@/components/ui/DesignSystem'
import Link from 'next/link'

export default function HomePage() {
  const { data: session } = useSession()
  const { currentTheme } = useTheme()
  
  const appName = 'Deja que los ángeles te guíen'

  const services = [
    {
      icon: SparklesIcon,
      title: 'Oráculo de los Arcángeles',
      description: 'Consulta las cartas sagradas para obtener respuestas y guía espiritual directa',
      href: '/oraculo',
      color: currentTheme.colors.accent,
      accessible: true // Sin registro requerido
    },
    {
      icon: UserGroupIcon,
      title: 'Consultas Personalizadas',
      description: 'Sesiones privadas con consultores espirituales expertos',
      href: '/book-consultation',
      color: currentTheme.colors.accentSecondary,
      accessible: true, // Visitar sin registro, reservar con registro
      requiresAuth: 'Para reservar'
    },
    {
      icon: StarIcon,
      title: 'Tu Ángel Mentor',
      description: 'Descubre tu ángel mentor personal basado en tu fecha de nacimiento',
      href: session ? '/dashboard' : '/register',
      color: currentTheme.colors.accent,
      accessible: false, // Requiere registro
      requiresAuth: 'Registro requerido'
    },
    {
      icon: BookOpenIcon,
      title: 'Blog Espiritual',
      description: 'Artículos y guías sobre espiritualidad y conexión angelical',
      href: '/blog',
      color: currentTheme.colors.accentSecondary,
      accessible: true // Sin registro requerido
    },
    {
      icon: ShoppingBagIcon,
      title: 'Tienda Espiritual',
      description: 'Productos espirituales para tu crecimiento personal',
      href: '/tienda',
      color: currentTheme.colors.accent,
      accessible: true, // Visitar sin registro, comprar con registro
      requiresAuth: 'Para comprar'
    },
    {
      icon: StarIcon,
      title: 'Membresías Premium',
      description: 'Acceso completo a todos nuestros servicios espirituales',
      href: '/memberships',
      color: currentTheme.colors.accentSecondary,
      accessible: true
    }
  ]

  return (
    <PageContainer>
      {/* Hero Section - Minimalista y Profesional */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Título Principal */}
          <h1 
            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
            style={{
              fontFamily: currentTheme.typography.headingFont,
              color: currentTheme.colors.text
            }}
          >
            {appName}
          </h1>
          
          {/* Descripción Elegante */}
          <p 
            className="text-xl md:text-2xl mb-16 max-w-3xl mx-auto leading-relaxed font-light"
            style={{
              color: currentTheme.colors.textSecondary,
              fontFamily: currentTheme.typography.bodyFont
            }}
          >
            Un espacio sagrado donde la sabiduría angelical ilumina tu sendero 
            hacia la paz, la claridad y el propósito divino
          </p>
          
          {/* Botones de Acción */}
          {session ? (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <PrimaryButton href="/dashboard" size="lg">
                <SparklesIcon className="w-6 h-6" />
                <span>Mi Espacio Espiritual</span>
              </PrimaryButton>
              
              <SecondaryButton href="/oraculo" size="lg">
                Consultar el Oráculo
              </SecondaryButton>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <PrimaryButton href="/oraculo" size="lg">
                <SparklesIcon className="w-6 h-6" />
                <span>Consultar el Oráculo</span>
              </PrimaryButton>
              
              <SecondaryButton href="/register" size="lg">
                Comenzar mi Viaje
              </SecondaryButton>
            </div>
          )}
        </div>
      </section>

      {/* Servicios - Organizados por Accesibilidad */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: currentTheme.colors.cardBg }}>
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{
              fontFamily: currentTheme.typography.headingFont,
              color: currentTheme.colors.text
            }}
          >
            Servicios Espirituales
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{
              color: currentTheme.colors.textSecondary,
              fontFamily: currentTheme.typography.bodyFont
            }}
          >
            Conecta con la sabiduría divina a través de nuestros servicios profesionales. 
            Algunos servicios requieren registro para personalizar tu experiencia.
          </p>
        </div>

        <ServiceGrid>
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Link key={index} href={service.href}>
                <ProfessionalCard className="text-center relative">
                  {/* Badges de accesibilidad */}
                  {!service.accessible && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="accent">Registro</Badge>
                    </div>
                  )}
                  
                  {service.requiresAuth && service.accessible && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">{service.requiresAuth}</Badge>
                    </div>
                  )}

                  {/* Icono del Servicio */}
                  <IconContainer icon={IconComponent} color={service.color} />
                  
                  {/* Título */}
                  <h3 
                    className="text-xl font-bold mb-4"
                    style={{
                      fontFamily: currentTheme.typography.headingFont,
                      color: currentTheme.colors.text
                    }}
                  >
                    {service.title}
                  </h3>
                  
                  {/* Descripción */}
                  <p 
                    className="text-sm leading-relaxed mb-4"
                    style={{
                      color: currentTheme.colors.textSecondary,
                      fontFamily: currentTheme.typography.bodyFont
                    }}
                  >
                    {service.description}
                  </p>

                  {/* Indicador de acción */}
                  <div 
                    className="text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1"
                    style={{color: service.color}}
                  >
                    {service.accessible ? 'Acceder ahora' : 'Registrarse para acceder'}
                  </div>
                </ProfessionalCard>
              </Link>
            )
          })}
        </ServiceGrid>
      </section>

      {/* Call to Action Final */}
      {!session && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.text
              }}
            >
              ¿Listo para conectar con tu guía angelical?
            </h2>
            <p 
              className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
              style={{
                color: currentTheme.colors.textSecondary,
                fontFamily: currentTheme.typography.bodyFont
              }}
            >
              Crea tu cuenta para acceder a todos nuestros servicios personalizados 
              y comenzar tu viaje espiritual completo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PrimaryButton href="/register">
                <SparklesIcon className="w-5 h-5" />
                <span>Crear mi Cuenta</span>
              </PrimaryButton>
              
              <SecondaryButton href="/login">
                Ya tengo cuenta
              </SecondaryButton>
            </div>
          </div>
        </section>
      )}
    </PageContainer>
  )
}