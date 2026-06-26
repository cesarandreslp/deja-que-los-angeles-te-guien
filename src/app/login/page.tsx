'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTheme } from '@/context/ThemeContext'
import { SparklesIcon, UserIcon } from '@heroicons/react/24/outline'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    // Verificar si viene de verificación exitosa
    if (searchParams?.get('verified') === 'true') {
      setSuccess('¡Cuenta verificada exitosamente! Ya puedes iniciar sesión.')
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpiar errores cuando el usuario escriba
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Todos los campos son requeridos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Email o contraseña incorrectos')
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        // Obtener la sesión para determinar el rol del usuario
        const session = await getSession()
        
        if (session?.user) {
          // Redirigir según el rol
          switch (session.user.role) {
            case 'ADMIN':
              router.push('/admin')
              break
            case 'CONSULTANT':
              router.push('/consultant')
              break
            case 'USER':
              router.push('/user')
              break
            default:
              router.push('/profile')
          }
        }
      }
    } catch (err) {
      console.error('Error en login:', err)
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative py-12 px-4"
      style={{backgroundColor: currentTheme.colors.background}}
    >
      {/* Contenedor principal */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Card principal */}
        <div 
          className="p-8 rounded-2xl shadow-xl border backdrop-blur-sm"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor,
            boxShadow: `0 25px 50px -12px ${currentTheme.colors.shadowColor}`
          }}
        >
          {/* Header con icono */}
          <div className="text-center mb-8">
            <div 
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: currentTheme.colors.buttonGradient,
                boxShadow: `0 10px 25px ${currentTheme.colors.shadowColor}`
              }}
            >
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            
            <h2 
              className="text-3xl font-bold mb-2"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.text
              }}
            >
              Iniciar Sesión
            </h2>
            <p 
              className="text-lg"
              style={{
                fontFamily: currentTheme.typography.bodyFont,
                color: currentTheme.colors.textSecondary
              }}
            >
              Accede al Oráculo de los Arcángeles
            </p>
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div 
              className="mb-6 px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#DC2626'
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div 
              className="mb-6 px-4 py-3 rounded-lg border"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
                color: '#059669'
              }}
            >
              {success}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                background: currentTheme.colors.buttonGradient,
                fontFamily: currentTheme.typography.bodyFont
              }}
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </Button>
          </form>

          {/* Enlaces */}
          <div className="mt-8 text-center space-y-3">
            <p 
              className="text-sm"
              style={{
                fontFamily: currentTheme.typography.bodyFont,
                color: currentTheme.colors.textSecondary
              }}
            >
              ¿No tienes cuenta?{' '}
              <Link 
                href="/register" 
                className="font-medium hover:underline transition-colors duration-200"
                style={{color: currentTheme.colors.accent}}
              >
                Regístrate aquí
              </Link>
            </p>
            <p 
              className="text-sm"
              style={{
                fontFamily: currentTheme.typography.bodyFont,
                color: currentTheme.colors.textSecondary
              }}
            >
              ¿Olvidaste tu contraseña?{' '}
              <Link 
                href="/forgot-password" 
                className="font-medium hover:underline transition-colors duration-200"
                style={{color: currentTheme.colors.accent}}
              >
                Recupérala aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Decoración inferior */}
        <div className="text-center">
          <p 
            className="text-sm opacity-75"
            style={{
              fontFamily: currentTheme.typography.bodyFont,
              color: currentTheme.colors.textSecondary
            }}
          >
            Conecta con la sabiduría angelical
          </p>
        </div>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 pointer-events-none" 
           style={{backgroundColor: currentTheme.colors.accent}}></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full opacity-15 pointer-events-none" 
           style={{backgroundColor: currentTheme.colors.accentSecondary}}></div>
      
      {/* Background de partículas */}
      <GoldenStarsBackground />
    </div>
  )
}