'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'
import { 
  HomeIcon,
  UsersIcon,
  VideoCameraIcon,
  SparklesIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  StarIcon,
  CogIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { currentTheme } = useTheme()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme?.colors.background || '#f9fafb' }}
      >
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, current: true },
    { name: 'Usuarios', href: '/admin/users', icon: UsersIcon },
    { name: 'Consultas', href: '/admin/consultations', icon: VideoCameraIcon },
    { name: 'Oráculo', href: '/admin/oracle', icon: SparklesIcon },
    { name: 'Blog', href: '/admin/blog', icon: BookOpenIcon },
    { name: 'Tienda', href: '/admin/store', icon: ShoppingBagIcon },
    { name: 'Membresías', href: '/admin/memberships', icon: StarIcon },
    { name: 'Comisiones', href: '/admin/commissions', icon: CurrencyDollarIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Configuración', href: '/admin/configuracion', icon: CogIcon },
  ]

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: currentTheme?.colors.background || '#f9fafb',
        fontFamily: currentTheme?.typography.bodyFont || 'Inter, sans-serif'
      }}
    >
      {/* Header */}
      <div 
        className="shadow-lg border-b"
        style={{ 
          backgroundColor: currentTheme?.colors.navbarBg || '#ffffff',
          borderBottomColor: currentTheme?.colors.borderColor || '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{ 
                  color: currentTheme?.colors.text || '#111827',
                  fontFamily: currentTheme?.typography.headingFont || 'Inter, sans-serif'
                }}
              >
                🔮 Panel de Administrador
              </h1>
              <p 
                className="mt-1"
                style={{ color: currentTheme?.colors.textSecondary || '#6b7280' }}
              >
                Bienvenido, {session?.user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="px-4 py-2 rounded-lg transition-colors duration-200"
                style={{ 
                  color: currentTheme?.colors.text || '#374151',
                  backgroundColor: currentTheme?.colors.cardBg || '#ffffff'
                }}
              >
                Mi Perfil
              </Link>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="px-4 py-2 rounded-lg text-white transition-all duration-200 hover:scale-105"
                style={{ 
                  background: currentTheme?.colors.buttonGradient || 'linear-gradient(135deg, #ef4444, #dc2626)'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div 
        className="shadow-sm"
        style={{ 
          backgroundColor: currentTheme?.colors.cardBg || '#ffffff',
          borderBottomColor: currentTheme?.colors.borderColor || '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-4 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive ? 'shadow-md scale-105' : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: isActive 
                      ? currentTheme?.colors.accent 
                      : 'transparent',
                    color: isActive 
                      ? '#ffffff' 
                      : currentTheme?.colors.text || '#374151'
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Theme Footer */}
      <footer 
        className="border-t mt-16"
        style={{ 
          backgroundColor: currentTheme?.colors.cardBg || '#ffffff',
          borderTopColor: currentTheme?.colors.borderColor || '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg shadow-md"
                style={{ 
                  background: currentTheme?.colors.buttonGradient || 'linear-gradient(135deg, #667eea, #764ba2)'
                }}
              ></div>
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: currentTheme?.colors.text || '#111827' }}
                >
                  Tema: {currentTheme?.name || 'Celestial'}
                </p>
                <p 
                  className="text-xs"
                  style={{ color: currentTheme?.colors.textSecondary || '#6b7280' }}
                >
                  {currentTheme?.description || 'Tema por defecto del sistema'}
                </p>
              </div>
            </div>
            <Link
              href="/admin/configuracion"
              className="text-sm px-3 py-2 rounded-lg transition-colors duration-200"
              style={{ 
                color: currentTheme?.colors.accent || '#667eea',
                backgroundColor: currentTheme?.colors.accentSecondary || '#f3f4f6'
              }}
            >
              Cambiar Tema
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}