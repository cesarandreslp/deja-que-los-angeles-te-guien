'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'

interface User {
  id: string
  email: string
  fullName: string
  role: 'USER' | 'CONSULTANT' | 'ADMIN'
  isActive: boolean
  country?: string
  phone?: string
  createdAt: string
  updatedAt: string
  _count: {
    userConsultations: number
    consultorConsultations: number
    orders: number
    userMemberships: number
  }
}

interface UserStats {
  role: string
  isActive: boolean
  _count: {
    id: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentTheme } = useTheme()

  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'USER' as 'USER' | 'CONSULTANT' | 'ADMIN',
    country: '',
    phone: '',
    isActive: true
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchUsers()
  }, [session, status, router, currentPage, roleFilter, activeFilter, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (roleFilter) params.append('role', roleFilter)
      if (activeFilter) params.append('isActive', activeFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar usuarios')
      }

      setUsers(data.users)
      setStats(data.stats)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createFormData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario')
      }

      // Resetear formulario y cerrar modal
      setCreateFormData({
        email: '',
        fullName: '',
        password: '',
        role: 'USER',
        country: '',
        phone: '',
        isActive: true
      })
      setShowCreateModal(false)
      
      // Recargar usuarios
      fetchUsers()
      
      alert('Usuario creado exitosamente')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al crear usuario')
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar usuario')
      }

      fetchUsers()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar usuario')
    }
  }

  // Calcular estadísticas resumidas
  const summaryStats = stats.reduce((acc, stat) => {
    const key = `${stat.role}_${stat.isActive ? 'active' : 'inactive'}`
    acc[key] = stat._count.id
    return acc
  }, {} as Record<string, number>)

  const totalUsers = Object.values(summaryStats).reduce((sum: number, count: number) => sum + count, 0)
  const activeUsers = (summaryStats.USER_active || 0) + (summaryStats.CONSULTANT_active || 0) + (summaryStats.ADMIN_active || 0)
  const consultants = (summaryStats.CONSULTANT_active || 0) + (summaryStats.CONSULTANT_inactive || 0)
  const admins = (summaryStats.ADMIN_active || 0) + (summaryStats.ADMIN_inactive || 0)

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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme?.colors.background }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-32 w-32 border-b-2 mb-4"
            style={{ borderBottomColor: currentTheme?.colors.accent }}
          ></div>
          <h2 
            className="text-xl font-semibold mb-2"
            style={{ 
              color: currentTheme?.colors.text,
              fontFamily: currentTheme?.typography.headingFont
            }}
          >
            👥 Cargando Usuarios...
          </h2>
          <p style={{ color: currentTheme?.colors.textSecondary }}>
            Obteniendo información de usuarios
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme?.colors.background }}
      >
        <div 
          className="border rounded-xl p-6 max-w-md shadow-lg"
          style={{ 
            backgroundColor: currentTheme?.colors.cardBg,
            borderColor: currentTheme?.colors.borderColor
          }}
        >
          <h3 
            className="font-medium mb-2 text-red-600"
            style={{ fontFamily: currentTheme?.typography.headingFont }}
          >
            ❌ Error
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105"
            style={{ background: currentTheme?.colors.buttonGradient }}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: currentTheme?.colors.background }}>
      {/* Header */}
      <div 
        className="shadow-lg border-b"
        style={{ 
          background: currentTheme?.colors.buttonGradient,
          borderBottomColor: currentTheme?.colors.borderColor
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 
                className="text-3xl font-bold text-white"
                style={{ fontFamily: currentTheme?.typography.headingFont }}
              >
                👥 Gestión de Usuarios
              </h1>
              <p className="text-white/80">
                Administrar usuarios del sistema
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                ← Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 py-4">
            <Link href="/admin" className="hover:bg-gray-700 px-3 py-2 rounded-md">
              Dashboard
            </Link>
            <Link href="/admin/users" className="bg-gray-900 px-3 py-2 rounded-md font-medium">
              Usuarios
            </Link>
            <Link href="/admin/consultations" className="hover:bg-gray-700 px-3 py-2 rounded-md">
              Consultas
            </Link>
            <Link href="/admin/store" className="hover:bg-gray-700 px-3 py-2 rounded-md">
              Tienda
            </Link>
            <Link href="/admin/memberships" className="hover:bg-gray-700 px-3 py-2 rounded-md">
              Membresías
            </Link>
            <Link href="/admin/commissions" className="hover:bg-gray-700 px-3 py-2 rounded-md">
              Comisiones
            </Link>
            <Link href="/admin/configuracion" className="hover:bg-gray-700 px-3 py-2 rounded-md">
              Configuración
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="rounded-xl shadow-lg p-6 border hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <div className="flex items-center">
              <div 
                className="rounded-lg p-3 mr-4 shadow-lg"
                style={{ background: currentTheme?.colors.buttonGradient }}
              >
                <div className="text-white text-2xl">👥</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Total Usuarios
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.accent,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  {totalUsers}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  {activeUsers} activos
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-lg p-6 border hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-lg p-3 mr-4 shadow-lg">
                <div className="text-white text-2xl">🔮</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Consultores
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.accent,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  {consultants}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  {summaryStats.CONSULTANT_active || 0} activos
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-lg p-6 border hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <div className="flex items-center">
              <div className="bg-red-500 rounded-lg p-3 mr-4 shadow-lg">
                <div className="text-white text-2xl">👨‍💼</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Administradores
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.accent,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  {admins}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  {summaryStats.ADMIN_active || 0} activos
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-lg p-6 border hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <div className="flex items-center">
              <div className="bg-green-500 rounded-lg p-3 mr-4 shadow-lg">
                <div className="text-white text-2xl">👤</div>
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  Usuarios Regulares
                </h3>
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.accent,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  {(summaryStats.USER_active || 0) + (summaryStats.USER_inactive || 0)}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  {summaryStats.USER_active || 0} activos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div 
          className="rounded-xl shadow-lg p-6 mb-6 border"
          style={{ 
            backgroundColor: currentTheme?.colors.cardBg,
            borderColor: currentTheme?.colors.borderColor
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                />
              </div>

              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                >
                  <option value="">Todos los roles</option>
                  <option value="USER">👤 Usuarios</option>
                  <option value="CONSULTANT">🔮 Consultores</option>
                  <option value="ADMIN">👨‍💼 Administradores</option>
                </select>
              </div>

              <div>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                >
                  <option value="">Todos los estados</option>
                  <option value="true">✅ Activos</option>
                  <option value="false">❌ Inactivos</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105"
              style={{ background: currentTheme?.colors.buttonGradient }}
            >
              ➕ Crear Usuario
            </button>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div 
          className="shadow-xl rounded-xl overflow-hidden border"
          style={{ 
            backgroundColor: currentTheme?.colors.cardBg,
            borderColor: currentTheme?.colors.borderColor
          }}
        >
          <table className="min-w-full divide-y" style={{ borderColor: currentTheme?.colors.borderColor }}>
            <thead style={{ background: currentTheme?.colors.buttonGradient }}>
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={{ fontFamily: currentTheme?.typography.headingFont }}
                >
                  👤 Usuario
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={{ fontFamily: currentTheme?.typography.headingFont }}
                >
                  🎭 Rol
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={{ fontFamily: currentTheme?.typography.headingFont }}
                >
                  ⚡ Estado
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={{ fontFamily: currentTheme?.typography.headingFont }}
                >
                  📅 Registro
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={{ fontFamily: currentTheme?.typography.headingFont }}
                >
                  🔧 Acciones
                </th>
              </tr>
            </thead>
            <tbody 
              className="divide-y"
              style={{ 
                backgroundColor: currentTheme?.colors.cardBg,
                borderColor: currentTheme?.colors.borderColor
              }}
            >
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="transition-all duration-200 hover:shadow-lg"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = currentTheme?.colors.accent + '20'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div 
                        className="text-sm font-medium"
                        style={{ 
                          color: currentTheme?.colors.text,
                          fontFamily: currentTheme?.typography.headingFont
                        }}
                      >
                        {user.fullName}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: currentTheme?.colors.textSecondary }}
                      >
                        {user.email}
                      </div>
                      {user.country && (
                        <div 
                          className="text-xs"
                          style={{ color: currentTheme?.colors.textSecondary }}
                        >
                          🌍 {user.country}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
                      style={{ fontFamily: currentTheme?.typography.headingFont }}
                    >
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                      style={{ fontFamily: currentTheme?.typography.headingFont }}
                    >
                      {user.isActive ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: currentTheme?.colors.textSecondary }}>
                    📅 {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                        user.isActive 
                          ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {user.isActive ? '❌ Desactivar' : '✅ Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div 
            className="text-center py-12"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 
              className="text-lg font-medium mb-2"
              style={{ 
                color: currentTheme?.colors.text,
                fontFamily: currentTheme?.typography.headingFont
              }}
            >
              No se encontraron usuarios
            </h3>
            <p>Intenta con otros filtros de búsqueda</p>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: currentTheme?.colors.cardBg,
                  borderColor: currentTheme?.colors.borderColor,
                  color: currentTheme?.colors.text
                }}
              >
                ⬅️ Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    currentPage === page ? 'text-white' : ''
                  }`}
                  style={
                    currentPage === page
                      ? {
                          background: currentTheme?.colors.buttonGradient,
                          borderColor: currentTheme?.colors.accent
                        }
                      : {
                          backgroundColor: currentTheme?.colors.cardBg,
                          borderColor: currentTheme?.colors.borderColor,
                          color: currentTheme?.colors.text
                        }
                  }
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: currentTheme?.colors.cardBg,
                  borderColor: currentTheme?.colors.borderColor,
                  color: currentTheme?.colors.text
                }}
              >
                Siguiente ➡️
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Modal de crear usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            style={{ 
              backgroundColor: currentTheme?.colors.cardBg,
              borderColor: currentTheme?.colors.borderColor
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ 
                color: currentTheme?.colors.text,
                fontFamily: currentTheme?.typography.headingFont
              }}
            >
              ➕ Crear Nuevo Usuario
            </h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: currentTheme?.colors.text }}
                >
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={createFormData.fullName}
                  onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: currentTheme?.colors.text }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: currentTheme?.colors.text }}
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: currentTheme?.colors.text }}
                >
                  Rol
                </label>
                <select
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value as 'USER' | 'CONSULTANT' | 'ADMIN' })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                >
                  <option value="USER">Usuario</option>
                  <option value="CONSULTANT">Consultor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: currentTheme?.colors.text }}
                >
                  País (opcional)
                </label>
                <input
                  type="text"
                  value={createFormData.country}
                  onChange={(e) => setCreateFormData({ ...createFormData, country: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={createFormData.isActive}
                  onChange={(e) => setCreateFormData({ ...createFormData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label 
                  htmlFor="isActive"
                  className="text-sm font-medium"
                  style={{ color: currentTheme?.colors.text }}
                >
                  Usuario activo
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ background: currentTheme?.colors.buttonGradient }}
                >
                  ✅ Crear Usuario
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: currentTheme?.colors.background,
                    borderColor: currentTheme?.colors.borderColor,
                    color: currentTheme?.colors.text
                  }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
