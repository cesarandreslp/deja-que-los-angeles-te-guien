'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import Image from 'next/image'
import { 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  
  // Obtener tema actual
  const { currentTheme } = useTheme()

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Cerrar menús cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserDropdownOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/oraculo', label: 'Oráculo' },
    { href: '/dashboard', label: 'Arcángel Mentor' }
  ]

  return (
    <nav 
      className="navbar sticky top-0 z-50 backdrop-blur-lg border-b"
      style={{
        background: currentTheme.colors.navbarBg,
        borderBottomColor: currentTheme.colors.borderColor,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo y nombre de la app - Diseño minimalista */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group transition-all duration-300"
          >
            {/* Icono angelical simple */}
            <div className="w-10 h-10 flex items-center justify-center">
              <SparklesIcon 
                className="w-8 h-8 transition-all duration-300 group-hover:scale-110" 
                style={{color: currentTheme.colors.accent}}
              />
            </div>
            
            <div>
              <h1 
                className="text-2xl font-bold leading-tight transition-colors duration-300"
                style={{
                  fontFamily: currentTheme.typography.headingFont,
                  color: currentTheme.colors.text,
                  letterSpacing: '-0.01em'
                }}
              >
                Oráculo Angelical
              </h1>
            </div>
          </Link>

          {/* Navegación desktop - Diseño minimalista */}
          <div className="hidden md:flex items-center space-x-12">
            {/* Enlaces principales sin iconos */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium transition-all duration-300 hover:opacity-70"
                style={{
                  color: isActive(link.href) ? currentTheme.colors.accent : currentTheme.colors.text,
                  fontFamily: currentTheme.typography.bodyFont,
                  fontWeight: isActive(link.href) ? '600' : '500'
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Área de usuario - Diseño minimalista */}
            {status === 'loading' ? (
              <div className="animate-pulse w-8 h-8 rounded-full"
                   style={{backgroundColor: currentTheme.colors.borderColor}}>
              </div>
            ) : session ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: currentTheme.colors.cardBg,
                    border: `1px solid ${currentTheme.colors.borderColor}`
                  }}
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Avatar"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <UserCircleIcon 
                      className="w-6 h-6" 
                      style={{color: currentTheme.colors.accent}}
                    />
                  )}
                  <span 
                    className="text-sm font-medium"
                    style={{color: currentTheme.colors.text}}
                  >
                    {session.user?.name}
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div 
                    className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden"
                    style={{
                      backgroundColor: currentTheme.colors.cardBg,
                      borderColor: currentTheme.colors.borderColor
                    }}
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-sm transition-all duration-200 hover:bg-opacity-50"
                      style={{color: currentTheme.colors.text}}
                    >
                      Mi Perfil
                    </Link>
                    
                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-sm transition-all duration-200 hover:bg-opacity-50"
                        style={{color: currentTheme.colors.text}}
                      >
                        Administración
                      </Link>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-sm transition-all duration-200 hover:bg-opacity-50"
                      style={{color: currentTheme.colors.text}}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 text-white"
                style={{
                  background: currentTheme.colors.buttonGradient,
                  fontFamily: currentTheme.typography.bodyFont
                }}
              >
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-all duration-300"
            style={{color: currentTheme.colors.text}}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden py-4 border-t"
            style={{
              borderTopColor: currentTheme.colors.borderColor,
              backgroundColor: currentTheme.colors.cardBg
            }}
          >
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-lg transition-all duration-300"
                  style={{
                    color: isActive(link.href) ? currentTheme.colors.accent : currentTheme.colors.text,
                    backgroundColor: isActive(link.href) ? currentTheme.colors.background : 'transparent'
                  }}
                >
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              
              {/* Usuario en móvil */}
              {session ? (
                <div className="border-t pt-4" style={{borderTopColor: currentTheme.colors.borderColor}}>
                  <div className="px-4 py-2">
                    <p 
                      className="text-sm font-medium mb-2"
                      style={{color: currentTheme.colors.text}}
                    >
                      {session.user?.name}
                    </p>
                    <Link
                      href="/profile"
                      className="block px-2 py-1 text-sm transition-colors duration-300"
                      style={{color: currentTheme.colors.textSecondary}}
                    >
                      Mi Perfil
                    </Link>
                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-2 py-1 text-sm transition-colors duration-300"
                        style={{color: currentTheme.colors.textSecondary}}
                      >
                        Administración
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block px-2 py-1 text-sm transition-colors duration-300 text-left"
                      style={{color: currentTheme.colors.textSecondary}}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4 px-4 space-y-2" style={{borderTopColor: currentTheme.colors.borderColor}}>
                  <Link
                    href="/login"
                    className="block btn btn-secondary text-center"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="block btn btn-primary text-center"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}