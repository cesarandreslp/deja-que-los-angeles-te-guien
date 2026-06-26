'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { COUNTRIES, GENDER_OPTIONS } from '@/utils/constants'
import { useTheme } from '@/context/ThemeContext'
import { SparklesIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'

export default function RegisterPage() {
  const router = useRouter()
  const { currentTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fromAngel, setFromAngel] = useState(false)

  // Detectar si el usuario viene del botón del ángel
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      setFromAngel(urlParams.get('from') === 'angel')
    }
  }, [])
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    country: '',
    gender: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'La fecha de nacimiento es requerida'
    }

    if (!formData.country) {
      newErrors.country = 'El país es requerido'
    }

    if (!formData.gender) {
      newErrors.gender = 'El género es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          country: formData.country,
          gender: formData.gender,
          phone: formData.phone || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`${data.message} Iniciando sesión...`)
        
        // Iniciar sesión automáticamente después del registro exitoso
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })
        
        if (signInResult?.ok) {
          if (fromAngel) {
            setSuccess('¡Registro exitoso! Redirigiendo a tu Ángel Mentor...')
            setTimeout(() => {
              router.push('/dashboard')
              router.refresh()
            }, 1500)
          } else {
            setSuccess('¡Registro exitoso! Redirigiendo a la página principal...')
            setTimeout(() => {
              router.push('/')
              router.refresh()
            }, 1500)
          }
        } else {
          setSuccess(`${data.message} Por favor, inicia sesión manualmente.`)
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      } else {
        setError(data.error || 'Error en el registro')
      }
    } catch (err) {
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
      <div className="max-w-lg w-full space-y-8 relative z-10">
        
        {/* Card principal */}
        <div 
          className="p-8 rounded-2xl shadow-xl border backdrop-blur-sm"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor,
            boxShadow: `0 25px 50px -12px ${currentTheme.colors.shadowColor}`
          }}
        >
          {/* Banner especial cuando viene del botón del ángel */}
          {fromAngel && (
            <div 
              className="mb-6 p-4 rounded-lg border text-center"
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                color: currentTheme.colors.accent
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">👼</span>
                <SparklesIcon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium">
                ¡Tu Ángel Mentor te está esperando! Crea tu cuenta para comenzar tu viaje espiritual.
              </p>
            </div>
          )}

          {/* Header con icono */}
          <div className="text-center mb-8">
            <div 
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: currentTheme.colors.buttonGradient,
                boxShadow: `0 10px 25px ${currentTheme.colors.shadowColor}`
              }}
            >
              <UserPlusIcon className="w-10 h-10 text-white" />
            </div>
            
            <h2 
              className="text-3xl font-bold mb-2"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.text
              }}
            >
              {fromAngel ? '¡Conoce tu Ángel Mentor!' : 'Crear Cuenta'}
            </h2>
            <p 
              className="text-lg"
              style={{
                fontFamily: currentTheme.typography.bodyFont,
                color: currentTheme.colors.textSecondary
              }}
            >
              {fromAngel 
                ? '✨ Regístrate para descubrir tu guía celestial personal' 
                : 'Únete al Oráculo de los Arcángeles'
              }
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
              className="mb-6 px-4 py-3 rounded-lg border flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
                color: '#059669'
              }}
            >
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              {success}
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fila 1: Información básica */}
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              error={errors.fullName}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
            />
          </div>

          {/* Fila 2: Contraseñas en línea */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              required
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              required
            />
          </div>

          {/* Fila 3: Fecha de nacimiento y género en línea */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de nacimiento"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              error={errors.dateOfBirth}
              required
            />

            <Select
              label="Género"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              options={GENDER_OPTIONS}
              error={errors.gender}
              required
            />
          </div>

          {/* Fila 4: País y teléfono en línea */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="País"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              options={COUNTRIES}
              error={errors.country}
              required
            />

            <Input
              label="Teléfono (opcional)"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Crear cuenta
            </Button>
          </div>
        </form>

          {/* Enlace a login */}
          <div className="text-center mt-8">
            <p 
              className="text-sm"
              style={{
                color: currentTheme.colors.textSecondary,
                fontFamily: currentTheme.typography.bodyFont
              }}
            >
              ¿Ya tienes cuenta?{' '}
              <Link 
                href="/login" 
                className="font-medium hover:underline transition-colors"
                style={{color: currentTheme.colors.accent}}
              >
                Inicia sesión
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Background de partículas */}
      <GoldenStarsBackground />
    </div>
  )
}