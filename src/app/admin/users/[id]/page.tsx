'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface UserDetail {
  id: string
  fullName: string
  email: string
  role: 'USER' | 'CONSULTANT' | 'ADMIN'
  isActive: boolean
  country?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  createdAt: string
  updatedAt: string
  _count: {
    userConsultations: number
    consultorConsultations: number
    orders: number
    userMemberships: number
    commissions: number
  }
  userMemberships: Array<{
    membershipPlan: {
      name: string
      priceCents: number
      currency: string
    }
  }>
}

export default function AdminUserDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    role: 'USER' as 'USER' | 'CONSULTANT' | 'ADMIN',
    isActive: true,
    country: '',
    phone: '',
    password: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    if (params.id) {
      fetchUser()
    }
  }, [session, status, router, params.id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar usuario')
      }

      setUser(data.user)
      setEditFormData({
        fullName: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
        isActive: data.user.isActive,
        country: data.user.country || '',
        phone: data.user.phone || '',
        password: ''
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar usuario')
      }

      setEditing(false)
      fetchUser()
      alert('Usuario actualizado exitosamente')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar usuario')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'CONSULTANT': return 'bg-purple-100 text-purple-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador'
      case 'CONSULTANT': return 'Consultor'
      default: return 'Usuario'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <div className="mt-4 space-x-2">
            <button
              onClick={fetchUser}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detalle de Usuario</h1>
              <p className="text-gray-600">{user.fullName}</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin/users"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ← Volver a Usuarios
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Usuario */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editing ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={editFormData.fullName}
                        onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol
                      </label>
                      <select
                        value={editFormData.role}
                        onChange={(e) => setEditFormData({...editFormData, role: e.target.value as 'USER' | 'CONSULTANT' | 'ADMIN'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="USER">Usuario</option>
                        <option value="CONSULTANT">Consultor</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        value={editFormData.country}
                        onChange={(e) => setEditFormData({...editFormData, country: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña (opcional)
                      </label>
                      <input
                        type="password"
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Dejar vacío para no cambiar"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData({...editFormData, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Usuario activo
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nombre Completo</h3>
                    <p className="mt-1 text-sm text-gray-900">{user.fullName}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rol</h3>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">País</h3>
                    <p className="mt-1 text-sm text-gray-900">{user.country || 'No especificado'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                    <p className="mt-1 text-sm text-gray-900">{user.phone || 'No especificado'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fecha de Registro</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Última Actualización</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(user.updatedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Membresía Activa */}
            {user.userMemberships.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Membresía Activa</h2>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-purple-900">
                        {user.userMemberships[0].membershipPlan.name}
                      </h3>
                      <p className="text-purple-700">
                        ${(user.userMemberships[0].membershipPlan.priceCents / 100).toFixed(2)} {user.userMemberships[0].membershipPlan.currency}
                      </p>
                    </div>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                      Activa
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas de Actividad */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas de Actividad</h2>
              
              <div className="space-y-4">
                {user.role === 'CONSULTANT' ? (
                  <>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-purple-600 mr-3">🔮</div>
                        <span className="text-purple-800">Consultas Realizadas</span>
                      </div>
                      <span className="font-semibold text-purple-900">{user._count.consultorConsultations}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-green-600 mr-3">💰</div>
                        <span className="text-green-800">Comisiones</span>
                      </div>
                      <span className="font-semibold text-green-900">{user._count.commissions}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-blue-600 mr-3">📞</div>
                        <span className="text-blue-800">Consultas Tomadas</span>
                      </div>
                      <span className="font-semibold text-blue-900">{user._count.userConsultations}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-yellow-600 mr-3">🛒</div>
                        <span className="text-yellow-800">Órdenes de Tienda</span>
                      </div>
                      <span className="font-semibold text-yellow-900">{user._count.orders}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="text-purple-600 mr-3">⭐</div>
                        <span className="text-purple-800">Membresías</span>
                      </div>
                      <span className="font-semibold text-purple-900">{user._count.userMemberships}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
              
              <div className="space-y-3">
                {user.role === 'USER' && (
                  <>
                    <Link
                      href={`/admin/consultations?userId=${user.id}`}
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Ver Consultas
                    </Link>
                    <Link
                      href={`/admin/memberships?userId=${user.id}`}
                      className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Ver Membresías
                    </Link>
                  </>
                )}
                
                {user.role === 'CONSULTANT' && (
                  <Link
                    href={`/admin/commissions?consultorId=${user.id}`}
                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Ver Comisiones
                  </Link>
                )}

                <button
                  onClick={() => {
                    const subject = `Contacto desde Panel Admin - ${user.fullName}`
                    const body = `Hola ${user.fullName},\n\n`
                    window.open(`mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
                  }}
                  className="block w-full text-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Enviar Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}