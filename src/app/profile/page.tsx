'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { COUNTRIES, GENDER_OPTIONS, ROLE_LABELS } from '@/utils/constants'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    gender: '',
    phone: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setFormData({
          fullName: data.user.fullName || '',
          country: data.user.country || '',
          gender: data.user.gender || '',
          phone: data.user.phone || '',
        })
      } else if (response.status === 401) {
        // Token expirado, intentar refresh
        await refreshToken()
      } else {
        setError('Error cargando datos del usuario')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Reintentar cargar datos
        await loadUserData()
      } else {
        // Refresh falló, redirigir a login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        router.push('/login')
      }
    } catch (err) {
      router.push('/login')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setSuccess('Perfil actualizado exitosamente')
      } else {
        setError(data.error || 'Error actualizando perfil')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Contraseña actualizada exitosamente')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setShowPasswordForm(false)
      } else {
        setError(data.error || 'Error actualizando contraseña')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.log('Error en logout:', err)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <Button
              variant="secondary"
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              {success}
            </div>
          )}

          {/* Información del usuario */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Información de la cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rol</p>
                <p className="text-gray-900">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de nacimiento</p>
                <p className="text-gray-900">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'No especificada'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Miembro desde</p>
                <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Formulario de edición de perfil */}
          <form onSubmit={handleProfileSubmit} className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold">Editar perfil</h3>
            
            <Input
              label="Nombre completo"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />

            <Select
              label="País"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              options={COUNTRIES}
            />

            <Select
              label="Género"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              options={GENDER_OPTIONS}
            />

            <Input
              label="Teléfono"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />

            <Button
              type="submit"
              loading={loading}
            >
              Actualizar perfil
            </Button>
          </form>

          {/* Cambiar contraseña (solo para usuarios con contraseña) */}
          {user.passwordHash && (
            <div className="border-t pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Seguridad</h3>
                <Button
                  variant="secondary"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  {showPasswordForm ? 'Cancelar' : 'Cambiar contraseña'}
                </Button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <Input
                    label="Contraseña actual"
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />

                  <Input
                    label="Nueva contraseña"
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />

                  <Input
                    label="Confirmar nueva contraseña"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />

                  <Button
                    type="submit"
                    loading={loading}
                  >
                    Cambiar contraseña
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}