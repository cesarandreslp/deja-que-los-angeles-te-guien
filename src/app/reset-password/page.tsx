'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [token, setToken] = useState('')
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const urlToken = searchParams?.get('token')
    if (urlToken) {
      setToken(urlToken)
    } else {
      setError('Token de recuperación no válido')
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Todos los campos son requeridos')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword)) {
      setError('La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Error restableciendo contraseña')
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Nueva contraseña</h2>
          <p className="mt-2 text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
            <p className="text-sm mt-2">Serás redirigido al login en unos segundos...</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nueva contraseña"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Confirmar nueva contraseña"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Restablecer contraseña
            </Button>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-500">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}