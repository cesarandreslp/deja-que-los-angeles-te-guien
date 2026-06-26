'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { 
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  ShoppingBagIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'

export default function MainNavbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { currentTheme } = useTheme()
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const appName = 'Deja que los ángeles te guíen'

  // Cerrar menús cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserDropdownOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isActive = (path: string) => pathname === path

  const mainNavLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/blog', label: 'Blog' },
    { href: '/tienda', label: 'Tienda' },
    { href: '/oraculo', label: 'Oráculo' },
    { href: '/book-consultation', label: 'Consultas' },
    { href: '/arcangel-mentor', label: 'Mi Ángel' }
  ]

  return (
    <nav 
      className="sticky top-0 z-50 backdrop-blur-lg border-b"
      style={{
        backgroundColor: currentTheme.colors.navbarBg,
        borderBottomColor: currentTheme.colors.borderColor,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group transition-all duration-300"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.accent}20, ${currentTheme.colors.accentSecondary}20)`,
                border: `1px solid ${currentTheme.colors.accent}30`
              }}
            >
              <SparklesIcon className="w-5 h-5" style={{color: currentTheme.colors.accent}} />
            </div>
            
            <div>
              <h1 
                className="text-lg font-bold leading-tight golden-text-elegant"
                style={{
                  fontFamily: currentTheme.typography.headingFont,
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #FFFF00 75%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.1)',
                  filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))',
                  animation: 'subtle-golden-glow 3s ease-in-out infinite alternate'
                }}
              >
                {appName}
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'shadow-sm'
                    : 'hover:shadow-sm'
                }`}
                style={{
                  color: isActive(link.href) ? currentTheme.colors.accent : currentTheme.colors.text,
                  backgroundColor: isActive(link.href) ? `${currentTheme.colors.accent}15` : 'transparent',
                  fontFamily: currentTheme.typography.bodyFont
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Area */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div 
                className="animate-pulse w-8 h-8 rounded-full"
                style={{backgroundColor: currentTheme.colors.borderColor}}
              />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 hover:shadow-sm"
                  style={{backgroundColor: `${currentTheme.colors.accent}10`}}
                >
                  <UserCircleIcon 
                    className="w-6 h-6" 
                    style={{color: currentTheme.colors.accent}}
                  />
                  <span 
                    className="hidden sm:block text-sm font-medium"
                    style={{color: currentTheme.colors.text}}
                  >
                    {session.user?.name}
                  </span>
                  <ChevronDownIcon 
                    className="w-4 h-4" 
                    style={{color: currentTheme.colors.textSecondary}} 
                  />
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
                      className="block px-4 py-3 text-sm transition-colors duration-200"
                      style={{color: currentTheme.colors.text}}
                    >
                      Mi Perfil
                    </Link>
                    
                    <Link
                      href="/user/orders"
                      className="block px-4 py-3 text-sm transition-colors duration-200"
                      style={{color: currentTheme.colors.text}}
                    >
                      <div className="flex items-center space-x-2">
                        <ShoppingBagIcon className="w-4 h-4" />
                        <span>Compras Históricas</span>
                      </div>
                    </Link>
                    
                    <Link
                      href="/carrito"
                      className="block px-4 py-3 text-sm transition-colors duration-200"
                      style={{color: currentTheme.colors.text}}
                    >
                      <div className="flex items-center space-x-2">
                        <ShoppingCartIcon className="w-4 h-4" />
                        <span>Carrito de Compras</span>
                      </div>
                    </Link>
                    
                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-sm transition-colors duration-200"
                        style={{color: currentTheme.colors.text}}
                      >
                        <div className="flex items-center space-x-2">
                          <Cog6ToothIcon className="w-4 h-4" />
                          <span>Administración</span>
                        </div>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-sm transition-colors duration-200 border-t"
                      style={{
                        color: currentTheme.colors.text,
                        borderTopColor: currentTheme.colors.borderColor
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors duration-200"
                  style={{
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.typography.bodyFont
                  }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-white"
                  style={{
                    background: currentTheme.colors.buttonGradient,
                    fontFamily: currentTheme.typography.bodyFont
                  }}
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors duration-200"
              style={{color: currentTheme.colors.text}}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden py-4 border-t"
            style={{
              borderTopColor: currentTheme.colors.borderColor,
              backgroundColor: currentTheme.colors.cardBg
            }}
          >
            <div className="space-y-1">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-lg transition-colors duration-200"
                  style={{
                    color: isActive(link.href) ? currentTheme.colors.accent : currentTheme.colors.text,
                    backgroundColor: isActive(link.href) ? `${currentTheme.colors.accent}10` : 'transparent'
                  }}
                >
                  {link.label}
                </Link>
              ))}
              
              {!session && (
                <div className="pt-4 border-t space-y-2" style={{borderTopColor: currentTheme.colors.borderColor}}>
                  <Link
                    href="/login"
                    className="block px-4 py-3 text-center rounded-lg border"
                    style={{
                      color: currentTheme.colors.text,
                      borderColor: currentTheme.colors.borderColor
                    }}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-3 text-center rounded-lg text-white font-semibold"
                    style={{background: currentTheme.colors.buttonGradient}}
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