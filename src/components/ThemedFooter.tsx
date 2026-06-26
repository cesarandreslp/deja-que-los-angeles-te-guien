'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/context/ThemeContext'
import { 
  HeartIcon,
  StarIcon,
  SparklesIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export default function ThemedFooter() {
  const { currentTheme } = useTheme()
  const appName = 'Deja que los ángeles te guíen'
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    servicios: [
      { href: '/oraculo', label: 'Oráculo de los Arcángeles' },
      { href: '/book-consultation', label: 'Consulta Angelical' },
      { href: '/dashboard', label: 'Ángel Mentor' },
      { href: '/memberships', label: 'Membresías' }
    ],
    recursos: [
      { href: '/blog', label: 'Blog Espiritual' },
      { href: '/tienda', label: 'Tienda Angelical' },
      { href: '/about', label: 'Sobre Nosotros' },
      { href: '/contact', label: 'Contacto' }
    ],
    legal: [
      { href: '/privacy', label: 'Política de Privacidad' },
      { href: '/terms', label: 'Términos y Condiciones' },
      { href: '/cookies', label: 'Política de Cookies' }
    ]
  }

  return (
    <footer 
      className="footer"
      style={{
        backgroundColor: currentTheme.colors.footerBg,
        color: 'white'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sección principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          
          {/* Información de la marca */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 relative">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
                  style={{backgroundColor: currentTheme.colors.accent}}
                >
                </div>
              </div>
              
              <div>
                <h3 
                  className="text-xl font-bold"
                  style={{fontFamily: currentTheme.typography.headingFont}}
                >
                  {appName}
                </h3>
                <p className="text-sm opacity-80">
                  Plataforma espiritual angelical
                </p>
              </div>
            </div>
            
            <p 
              className="text-sm leading-relaxed opacity-90 mb-6 max-w-md"
              style={{fontFamily: currentTheme.typography.bodyFont}}
            >
              Conecta con la sabiduría angelical a través de consultas personalizadas, 
              lecturas del oráculo y la guía de tu ángel mentor personal. 
              Descubre tu camino espiritual con la ayuda divina.
            </p>
            
            {/* Información de contacto */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-sm">
                <EnvelopeIcon className="w-4 h-4 opacity-80" />
                <span>contacto@dejaquelosangeles.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <PhoneIcon className="w-4 h-4 opacity-80" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPinIcon className="w-4 h-4 opacity-80" />
                <span>Disponible en todo el mundo</span>
              </div>
            </div>
          </div>
          
          {/* Enlaces de servicios */}
          <div>
            <h4 
              className="text-lg font-semibold mb-4"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.accent
              }}
            >
              Servicios
            </h4>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2 group"
                    style={{fontFamily: currentTheme.typography.bodyFont}}
                  >
                    <SparklesIcon className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Enlaces de recursos */}
          <div>
            <h4 
              className="text-lg font-semibold mb-4"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.accent
              }}
            >
              Recursos
            </h4>
            <ul className="space-y-2">
              {footerLinks.recursos.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2 group"
                    style={{fontFamily: currentTheme.typography.bodyFont}}
                  >
                    <StarIcon className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Separador */}
        <div 
          className="border-t opacity-20"
          style={{borderTopColor: 'white'}}
        ></div>
        
        {/* Sección inferior */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p 
              className="text-sm opacity-80"
              style={{fontFamily: currentTheme.typography.bodyFont}}
            >
              © {currentYear} {appName}. Todos los derechos reservados.
            </p>
            <p className="text-xs opacity-60 mt-1">
              Hecho con <HeartIcon className="w-3 h-3 inline mx-1" style={{color: currentTheme.colors.accent}} /> 
              para conectar almas con la guía angelical
            </p>
          </div>
          
          {/* Enlaces legales */}
          <div className="flex items-center space-x-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs opacity-60 hover:opacity-100 transition-opacity duration-300"
                style={{fontFamily: currentTheme.typography.bodyFont}}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Mensaje espiritual */}
        <div 
          className="text-center py-4 border-t opacity-20"
          style={{borderTopColor: 'white'}}
        >
          <p 
            className="text-sm italic opacity-70"
            style={{
              fontFamily: currentTheme.typography.headingFont,
              color: currentTheme.colors.accent
            }}
          >
            "Que la luz angelical ilumine tu camino hacia la paz y la sabiduría"
          </p>
        </div>
      </div>
    </footer>
  )
}