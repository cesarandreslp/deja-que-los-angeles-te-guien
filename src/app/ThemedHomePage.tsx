'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/context/ThemeContext'
import { 
  SparklesIcon,
  StarIcon,
  HeartIcon,
  UserGroupIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  CheckIcon,
  UserIcon,
  IdentificationIcon,
  GiftIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const { data: session } = useSession()
  const { currentTheme } = useTheme()
  
  const appName = 'Deja que los ángeles te guíen'

  const features = [
    {
      icon: SparklesIcon,
      title: 'Oráculo Angelical',
      description: 'Consulta las cartas sagradas para obtener mensajes y guía de los arcángeles.',
      href: '/oraculo',
      color: currentTheme.colors.accent
    },
    {
      icon: UserGroupIcon,
      title: 'Consultas Personalizadas',
      description: 'Sesiones privadas con consultores espirituales expertos en guía angelical.',
      href: '/book-consultation',
      color: currentTheme.colors.accentSecondary
    },
    {
      icon: StarIcon,
      title: 'Ángel Mentor',
      description: 'Descubre tu ángel mentor personal basado en tu fecha de nacimiento.',
      href: '/dashboard',
      color: currentTheme.colors.accent
    },
    {
      icon: BookOpenIcon,
      title: 'Blog Espiritual',
      description: 'Artículos y guías sobre espiritualidad, meditación y conexión angelical.',
      href: '/blog',
      color: currentTheme.colors.accentSecondary
    },
    {
      icon: ShoppingBagIcon,
      title: 'Tienda Angelical',
      description: 'Cristales, velas, aceites esenciales y productos para tu crecimiento espiritual.',
      href: '/tienda',
      color: currentTheme.colors.accent
    },
    {
      icon: HeartIcon,
      title: 'Membresías',
      description: 'Acceso exclusivo a contenido premium y consultas ilimitadas.',
      href: '/memberships',
      color: currentTheme.colors.accentSecondary
    }
  ]

  const testimonials = [
    {
      name: 'María González',
      text: 'La guía angelical cambió mi perspectiva sobre la vida. Encontré paz y claridad.',
      rating: 5
    },
    {
      name: 'Carlos Mendoza',
      text: 'Mi ángel mentor me ha ayudado a tomar decisiones importantes con confianza.',
      rating: 5
    },
    {
      name: 'Ana Rodríguez',
      text: 'Las consultas personalizadas son increíbles. Recomiendo esta plataforma.',
      rating: 5
    }
  ]

  return (
    <div style={{backgroundColor: currentTheme.colors.background}}>
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            
            {/* Logo angelical */}
            <div className="mb-8">
              <div 
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-xl"
                style={{
                  background: currentTheme.colors.buttonGradient,
                  boxShadow: `0 20px 40px ${currentTheme.colors.shadowColor}`
                }}
              >
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Título principal */}
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.text
              }}
            >
              {appName}
            </h1>

            {/* Subtítulo */}
            <p 
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed"
              style={{
                fontFamily: currentTheme.typography.bodyFont,
                color: currentTheme.colors.textSecondary
              }}
            >
              Un espacio sagrado donde la sabiduría angelical ilumina tu sendero 
              hacia la paz, la claridad y el propósito divino.
            </p>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session ? (
                <>
                  <Link
                    href="/register"
                    className="btn btn-primary px-8 py-4 text-lg font-semibold"
                    style={{
                      background: currentTheme.colors.buttonGradient,
                      fontFamily: currentTheme.typography.bodyFont
                    }}
                  >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Comenzar mi Viaje Espiritual
                  </Link>
                  
                  <Link
                    href="/login"
                    className="btn btn-secondary px-8 py-4 text-lg font-semibold"
                    style={{
                      color: currentTheme.colors.text,
                      borderColor: currentTheme.colors.borderColor,
                      fontFamily: currentTheme.typography.bodyFont
                    }}
                  >
                    Ya tengo cuenta
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="btn btn-primary px-8 py-4 text-lg font-semibold"
                  style={{
                    background: currentTheme.colors.buttonGradient,
                    fontFamily: currentTheme.typography.bodyFont
                  }}
                >
                  <StarIcon className="w-5 h-5 mr-2" />
                  Ir a mi Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20"
            style={{backgroundColor: currentTheme.colors.accent}}
          ></div>
          <div 
            className="absolute bottom-20 right-10 w-24 h-24 rounded-full opacity-15"
            style={{backgroundColor: currentTheme.colors.accentSecondary}}
          ></div>
        </div>
      </section>

      {/* Angel Mentor Section */}
      <section className="py-16" style={{backgroundColor: currentTheme.colors.cardBg}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            
            {/* Ícono del Ángel Mentor */}
            <div className="flex justify-center mb-8">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                style={{
                  background: currentTheme.colors.buttonGradient,
                  boxShadow: `0 20px 40px ${currentTheme.colors.shadowColor}`
                }}
              >
                <IdentificationIcon className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Título */}
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.text
              }}
            >
              Descubre tu Ángel Mentor Personal
            </h2>

            {/* Descripción */}
            <p 
              className="text-lg max-w-3xl mx-auto mb-8"
              style={{
                fontFamily: currentTheme.typography.bodyFont,
                color: currentTheme.colors.textSecondary
              }}
            >
              Cada persona tiene un ángel mentor asignado según su fecha de nacimiento. 
              Descubre el tuyo y recibe guía personalizada en tu camino espiritual.
            </p>

            {/* Condicional basado en sesión */}
            {session ? (
              /* Usuario logueado - Mostrar información personalizada */
              <div className="space-y-6">
                <div 
                  className="inline-flex items-center space-x-3 px-6 py-3 rounded-full"
                  style={{
                    backgroundColor: currentTheme.colors.accent + '20',
                    borderColor: currentTheme.colors.accent,
                    border: '2px solid'
                  }}
                >
                  <UserIcon 
                    className="w-6 h-6"
                    style={{color: currentTheme.colors.accent}}
                  />
                  <span 
                    className="text-lg font-medium"
                    style={{
                      color: currentTheme.colors.text,
                      fontFamily: currentTheme.typography.bodyFont
                    }}
                  >
                    Bienvenido, {session.user?.name || 'Alma Bendita'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/arcangel-mentor"
                    className="btn btn-primary px-8 py-4 text-lg font-semibold"
                    style={{
                      background: currentTheme.colors.buttonGradient,
                      fontFamily: currentTheme.typography.bodyFont
                    }}
                  >
                    <StarIcon className="w-5 h-5 mr-2" />
                    Conocer mi Ángel Mentor
                  </Link>
                  
                  <Link
                    href="/oraculo"
                    className="btn btn-secondary px-8 py-4 text-lg font-semibold"
                    style={{
                      color: currentTheme.colors.text,
                      borderColor: currentTheme.colors.borderColor,
                      fontFamily: currentTheme.typography.bodyFont
                    }}
                  >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Consultar Oráculo
                  </Link>
                </div>
              </div>
            ) : (
              /* Usuario no logueado - Invitar a registrarse */
              <div className="space-y-6">
                <div 
                  className="p-6 rounded-xl border-2 border-dashed max-w-md mx-auto"
                  style={{
                    borderColor: currentTheme.colors.accent + '60',
                    backgroundColor: currentTheme.colors.accent + '10'
                  }}
                >
                  <GiftIcon 
                    className="w-12 h-12 mx-auto mb-4"
                    style={{color: currentTheme.colors.accent}}
                  />
                  <h3 
                    className="text-xl font-semibold mb-2"
                    style={{
                      fontFamily: currentTheme.typography.headingFont,
                      color: currentTheme.colors.text
                    }}
                  >
                    Tu Ángel te está esperando
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{
                      fontFamily: currentTheme.typography.bodyFont,
                      color: currentTheme.colors.textSecondary
                    }}
                  >
                    Regístrate para conocer a tu ángel mentor personal y comenzar tu transformación espiritual.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="btn btn-primary px-8 py-4 text-lg font-semibold"
                    style={{
                      background: currentTheme.colors.buttonGradient,
                      fontFamily: currentTheme.typography.bodyFont
                    }}
                  >
                    <StarIcon className="w-5 h-5 mr-2" />
                    Registrarme y Conocer mi Ángel
                  </Link>
                  
                  <Link
                    href="/oraculo"
                    className="btn btn-secondary px-8 py-4 text-lg font-semibold"
                    style={{
                      color: currentTheme.colors.text,
                      borderColor: currentTheme.colors.borderColor,
                      fontFamily: currentTheme.typography.bodyFont
                    }}
                  >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Consultar Oráculo Gratis
                  </Link>
                </div>

                <p 
                  className="text-sm opacity-75"
                  style={{
                    fontFamily: currentTheme.typography.bodyFont,
                    color: currentTheme.colors.textSecondary
                  }}
                >
                  ¿Ya tienes cuenta? <Link href="/login" className="underline" style={{color: currentTheme.colors.accent}}>Inicia sesión aquí</Link>
                </p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.text
              }}
            >
              Servicios Angelicales
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{
                fontFamily: currentTheme.typography.bodyFont,
                color: currentTheme.colors.textSecondary
              }}
            >
              Descubre las diferentes formas en que los ángeles pueden guiarte 
              en tu camino espiritual
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Link
                  key={index}
                  href={feature.href}
                  className="card p-8 text-center group hover:scale-105 transition-all duration-300"
                  style={{
                    backgroundColor: currentTheme.colors.cardBg,
                    borderColor: currentTheme.colors.borderColor
                  }}
                >
                  <div 
                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px solid #1A1A4D', // Color del navbar/footer
                      position: 'relative',
                      zIndex: 5
                    }}
                  >
                    <IconComponent 
                      className="w-8 h-8"
                      style={{
                        color: 'white', // Iconos blancos
                        position: 'relative',
                        zIndex: 10,
                        opacity: 1,
                        display: 'block',
                        visibility: 'visible',
                        width: '32px',
                        height: '32px'
                      }}
                    />
                  </div>
                  
                  <h3 
                    className="text-xl font-semibold mb-4"
                    style={{
                      fontFamily: currentTheme.typography.headingFont,
                      color: currentTheme.colors.text
                    }}
                  >
                    {feature.title}
                  </h3>
                  
                  <p 
                    className="text-sm leading-relaxed mb-4"
                    style={{
                      fontFamily: currentTheme.typography.bodyFont,
                      color: currentTheme.colors.textSecondary
                    }}
                  >
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 group-hover:space-x-3 transition-all duration-300">
                    <span 
                      className="text-sm font-medium"
                      style={{color: feature.color}}
                    >
                      Explorar
                    </span>
                    <ArrowRightIcon 
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      style={{color: feature.color}}
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        className="py-20"
        style={{backgroundColor: currentTheme.colors.cardBg}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.text
              }}
            >
              Testimonios de Luz
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{
                fontFamily: currentTheme.typography.bodyFont,
                color: currentTheme.colors.textSecondary
              }}
            >
              Historias reales de transformación espiritual y conexión angelical
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-xl shadow-md border"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.borderColor
                }}
              >
                {/* Estrellas */}
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon 
                      key={i}
                      className="w-5 h-5 fill-current"
                      style={{color: currentTheme.colors.accent}}
                    />
                  ))}
                </div>
                
                {/* Testimonio */}
                <p 
                  className="text-sm italic mb-4 leading-relaxed"
                  style={{
                    fontFamily: currentTheme.typography.bodyFont,
                    color: currentTheme.colors.text
                  }}
                >
                  "{testimonial.text}"
                </p>
                
                {/* Nombre */}
                <p 
                  className="font-semibold"
                  style={{color: currentTheme.colors.accent}}
                >
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div 
            className="p-12 rounded-2xl shadow-xl"
            style={{
              background: currentTheme.colors.buttonGradient,
              color: 'white'
            }}
          >
            <SparklesIcon className="w-16 h-16 mx-auto mb-6 opacity-90" />
            
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{fontFamily: currentTheme.typography.headingFont}}
            >
              ¿Listo para conectar con tu guía angelical?
            </h2>
            
            <p 
              className="text-lg mb-8 opacity-90 max-w-2xl mx-auto"
              style={{fontFamily: currentTheme.typography.bodyFont}}
            >
              Únete a miles de personas que han encontrado paz, claridad y propósito 
              a través de la sabiduría angelical.
            </p>
            
            {!session && (
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 text-lg font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  backgroundColor: '#FFD700',
                  color: currentTheme.colors.background,
                  fontFamily: currentTheme.typography.bodyFont
                }}
              >
                <CheckIcon className="w-5 h-5" />
                <span>Comenzar Ahora - Es Gratuito</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}