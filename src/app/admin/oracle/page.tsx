'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'
import Image from 'next/image'

interface Card {
  id: string
  code: string
  name: string
  arcangel: string
  shortMsg: string
  description: string
  imageUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface OracleStats {
  totalCards: number
  activeCards: number
  totalArchangels: number
  totalReadings: number
  cardsPerArchangel: { [key: string]: number }
}

export default function AdminOracleDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentTheme } = useTheme()
  const [cards, setCards] = useState<Card[]>([])
  const [stats, setStats] = useState<OracleStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterArchangel, setFilterArchangel] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [cardsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/oracle/cards'),
        fetch('/api/admin/oracle/stats')
      ])

      if (!cardsResponse.ok || !statsResponse.ok) {
        throw new Error('Error al cargar datos del oráculo')
      }

      const cardsData = await cardsResponse.json()
      const statsData = await statsResponse.json()

      setCards(cardsData.cards || [])
      setStats(statsData.stats || null)
    } catch (error) {
      console.error('Error fetching oracle data:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const toggleCardStatus = async (cardId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/oracle/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar carta')
      }

      await fetchData() // Refrescar datos
    } catch (error) {
      console.error('Error toggling card status:', error)
      alert('Error al actualizar el estado de la carta')
    }
  }

  const deleteCard = async (cardId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta carta? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/oracle/cards/${cardId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar carta')
      }

      await fetchData() // Refrescar datos
    } catch (error) {
      console.error('Error deleting card:', error)
      alert('Error al eliminar la carta')
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
            🔮 Cargando Oráculo...
          </h2>
          <p style={{ color: currentTheme?.colors.textSecondary }}>
            Conectando con los arcángeles
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
            onClick={fetchData}
            className="px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105"
            style={{ background: currentTheme?.colors.buttonGradient }}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Filtrar cartas
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.arcangel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesArchangel = !filterArchangel || card.arcangel === filterArchangel
    return matchesSearch && matchesArchangel
  })

  // Obtener lista única de arcángeles
  const uniqueArchangels: string[] = []
  cards.forEach(card => {
    if (card.arcangel && !uniqueArchangels.includes(card.arcangel)) {
      uniqueArchangels.push(card.arcangel)
    }
  })
  const archangels = uniqueArchangels.sort()

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
                className="text-3xl font-bold flex items-center gap-3 text-white"
                style={{ fontFamily: currentTheme?.typography.headingFont }}
              >
                🔮 Gestión del Oráculo
              </h1>
              <p className="text-white/80">
                Administra las cartas y arcángeles del sistema
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                ← Volver al Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: currentTheme?.colors.cardBg }}
            >
              <div className="flex items-center">
                <div 
                  className="rounded-xl p-3 mr-4 shadow-md"
                  style={{ backgroundColor: currentTheme?.colors.accent }}
                >
                  <div className="text-white text-2xl">🃏</div>
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.headingFont
                    }}
                  >
                    Total Cartas
                  </h3>
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: currentTheme?.colors.text }}
                  >
                    {stats.totalCards}
                  </p>
                  <p style={{ color: currentTheme?.colors.textSecondary }}>
                    {stats.activeCards} activas
                  </p>
                </div>
              </div>
            </div>
            
            <div 
              className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: currentTheme?.colors.cardBg }}
            >
              <div className="flex items-center">
                <div 
                  className="rounded-xl p-3 mr-4 shadow-md"
                  style={{ backgroundColor: currentTheme?.colors.accentSecondary }}
                >
                  <div className="text-white text-2xl">👼</div>
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.headingFont
                    }}
                  >
                    Arcángeles
                  </h3>
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: currentTheme?.colors.text }}
                  >
                    {stats.totalArchangels}
                  </p>
                  <p style={{ color: currentTheme?.colors.textSecondary }}>
                    3 cartas c/u
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: currentTheme?.colors.cardBg }}
            >
              <div className="flex items-center">
                <div 
                  className="rounded-xl p-3 mr-4 shadow-md"
                  style={{ backgroundColor: currentTheme?.colors.accent }}
                >
                  <div className="text-white text-2xl">📖</div>
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.headingFont
                    }}
                  >
                    Lecturas
                  </h3>
                  <p 
                    className="text-3xl font-bold"
                    style={{ color: currentTheme?.colors.text }}
                  >
                    {stats.totalReadings}
                  </p>
                  <p style={{ color: currentTheme?.colors.textSecondary }}>
                    realizadas
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl shadow-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: currentTheme?.colors.cardBg }}
            >
              <div className="flex items-center">
                <div 
                  className="rounded-xl p-3 mr-4 shadow-md"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <div className="text-white text-2xl">⚡</div>
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.headingFont
                    }}
                  >
                    Estado
                  </h3>
                  <p className="text-2xl font-bold text-green-600">Activo</p>
                  <p style={{ color: currentTheme?.colors.textSecondary }}>
                    Sistema operativo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <Link
                href="/admin/oracle/cards/new"
                className="px-6 py-3 text-white rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-lg"
                style={{ background: currentTheme?.colors.buttonGradient }}
              >
                ➕ Nueva Carta
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 text-white rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-lg"
                style={{ backgroundColor: currentTheme?.colors.accentSecondary }}
              >
                🔄 Actualizar
              </button>
            </div>
          </div>

          {/* Filters */}
          <div 
            className="rounded-xl shadow-lg p-6 mb-6"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.bodyFont
                  }}
                >
                  🔍 Buscar
                </label>
                <input
                  type="text"
                  placeholder="Buscar por nombre, arcángel o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:scale-105"
                  style={{ 
                    borderColor: currentTheme?.colors.borderColor,
                    backgroundColor: currentTheme?.colors.background,
                    color: currentTheme?.colors.text
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.bodyFont
                  }}
                >
                  👼 Arcángel
                </label>
                <select
                  value={filterArchangel}
                  onChange={(e) => setFilterArchangel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:scale-105"
                  style={{ 
                    borderColor: currentTheme?.colors.borderColor,
                    backgroundColor: currentTheme?.colors.background,
                    color: currentTheme?.colors.text
                  }}
                >
                  <option value="">Todos los arcángeles</option>
                  {archangels.map(archangel => (
                    <option key={archangel} value={archangel}>{archangel}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterArchangel('')
                  }}
                  className="px-4 py-2 text-white rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: currentTheme?.colors.textSecondary }}
                >
                  ✨ Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCards.map((card) => (
              <div 
                key={card.id} 
                className="rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: currentTheme?.colors.cardBg }}
              >
                <div className="relative h-48">
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/oraculo/arcangeles_cartas/dorso.png'
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      card.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {card.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 
                      className="font-semibold truncate"
                      style={{ 
                        color: currentTheme?.colors.text,
                        fontFamily: currentTheme?.typography.headingFont
                      }}
                    >
                      {card.name}
                    </h3>
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        color: currentTheme?.colors.textSecondary,
                        backgroundColor: currentTheme?.colors.background
                      }}
                    >
                      {card.code}
                    </span>
                  </div>
                  
                  <p 
                    className="text-sm font-medium mb-2"
                    style={{ color: currentTheme?.colors.accent }}
                  >
                    📿 {card.arcangel}
                  </p>
                  <p 
                    className="text-sm line-clamp-2 mb-4"
                    style={{ color: currentTheme?.colors.textSecondary }}
                  >
                    {card.shortMsg}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/oracle/cards/${card.id}`}
                      className="flex-1 px-3 py-2 text-white rounded-lg text-sm transition-all duration-200 hover:scale-105 text-center shadow-md"
                      style={{ backgroundColor: currentTheme?.colors.accent }}
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      onClick={() => toggleCardStatus(card.id, card.isActive)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 shadow-md text-white ${
                        card.isActive
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {card.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm transition-all duration-200 hover:scale-105 shadow-md hover:bg-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 
                className="text-lg font-medium mb-2"
                style={{ 
                  color: currentTheme?.colors.text,
                  fontFamily: currentTheme?.typography.headingFont
                }}
              >
                No se encontraron cartas
              </h3>
              <p 
                className="mb-4"
                style={{ color: currentTheme?.colors.textSecondary }}
              >
                Intenta ajustar los filtros de búsqueda
              </p>
              <Link
                href="/admin/oracle/cards/new"
                className="px-6 py-3 text-white rounded-xl transition-all duration-200 hover:scale-105 inline-flex items-center gap-2 shadow-lg"
                style={{ background: currentTheme?.colors.buttonGradient }}
              >
                ➕ Crear Nueva Carta
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}