// Sistema de Wishlist Angelical - FASE 7
'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/store'
import { useTheme } from '@/context/ThemeContext'
import ProductCard from '@/components/store/public/ProductCard'
import {
  HeartIcon,
  SparklesIcon,
  ShareIcon,
  TrashIcon,
  ShoppingCartIcon,
  StarIcon,
  EyeIcon,
  BellIcon,
  GiftIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface WishlistItem {
  id: string
  product: Product
  addedAt: Date
  priority: 'low' | 'medium' | 'high' | 'divine'
  notes?: string
  angelicalMessage?: string
  arcangel?: string
  priceAlert?: {
    enabled: boolean
    targetPrice: number
  }
  stockAlert?: boolean
}

interface WishlistProps {
  userId?: string
  angelicalMode?: boolean
  showNotes?: boolean
  showAlerts?: boolean
  maxItems?: number
}

export default function Wishlist({
  userId,
  angelicalMode = true,
  showNotes = true,
  showAlerts = true,
  maxItems = 50
}: WishlistProps) {
  const { currentTheme } = useTheme()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'dateAdded' | 'priority' | 'price' | 'alphabetical'>('dateAdded')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    loadWishlist()
  }, [userId])

  const loadWishlist = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/store/wishlist/${userId}`)
      if (!response.ok) {
        // Fallback a wishlist mock
        const mockWishlist = generateMockWishlist()
        setWishlistItems(mockWishlist)
      } else {
        const data = await response.json()
        setWishlistItems(data.items || [])
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
      const mockWishlist = generateMockWishlist()
      setWishlistItems(mockWishlist)
    } finally {
      setLoading(false)
    }
  }

  const generateMockWishlist = (): WishlistItem[] => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Cuarzo Rosa del Arcángel Chamuel',
        description: 'Cristal de amor incondicional',
        priceCents: 4500,
        currency: 'COP',
        imageUrls: ['/productos/cuarzo-rosa.jpg'],
        category: 'crystals',
        stock: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Vela de Protección San Miguel',
        description: 'Vela azul consagrada',
        priceCents: 3200,
        currency: 'COP',
        imageUrls: ['/productos/vela-san-miguel.jpg'],
        category: 'candles',
        stock: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Aceite Esencial Jofiel',
        description: 'Para belleza interior',
        priceCents: 5800,
        currency: 'COP',
        imageUrls: ['/productos/aceite-jofiel.jpg'],
        category: 'oils',
        stock: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    const angelicalMessages = [
      'Los ángeles susurran que este producto traerá gran bendición a tu vida',
      'Tu alma vibra en perfecta sintonía con la energía de este elemento',
      'El universo conspira para que este producto llegue a ti en el momento perfecto',
      'Tu aura se ilumina cuando contemplas este regalo celestial'
    ]

    const arcangeles = ['Chamuel', 'Miguel', 'Rafael', 'Jofiel', 'Uriel', 'Gabriel', 'Zadkiel']

    return mockProducts.map((product, index) => ({
      id: `wishlist_${product.id}`,
      product,
      addedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      priority: (['high', 'divine', 'medium'] as const)[index % 3],
      notes: index === 0 ? 'Para mi altar personal de meditación' : undefined,
      angelicalMessage: angelicalMessages[index % angelicalMessages.length],
      arcangel: arcangeles[index % arcangeles.length],
      priceAlert: {
        enabled: index === 1,
        targetPrice: product.priceCents * 0.8
      },
      stockAlert: product.stock === 0
    }))
  }

  const addToWishlist = async (product: Product, priority: WishlistItem['priority'] = 'medium') => {
    const newItem: WishlistItem = {
      id: `wishlist_${product.id}`,
      product,
      addedAt: new Date(),
      priority,
      angelicalMessage: angelicalMode 
        ? 'Los ángeles aprueban esta elección para tu camino espiritual' 
        : undefined,
      arcangel: angelicalMode ? 'Rafael' : undefined,
      priceAlert: { enabled: false, targetPrice: product.priceCents * 0.9 },
      stockAlert: false
    }

    setWishlistItems(prev => [newItem, ...prev].slice(0, maxItems))

    // Llamada a API
    try {
      await fetch('/api/store/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, item: newItem })
      })
    } catch (error) {
      console.error('Error adding to wishlist:', error)
    }
  }

  const removeFromWishlist = async (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId))

    try {
      await fetch(`/api/store/wishlist/${itemId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const updateItemPriority = async (itemId: string, priority: WishlistItem['priority']) => {
    setWishlistItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, priority } : item
      )
    )

    try {
      await fetch(`/api/store/wishlist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      })
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const updateItemNotes = async (itemId: string, notes: string) => {
    setWishlistItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, notes } : item
      )
    )
    setEditingNotes(null)
    setNoteText('')

    try {
      await fetch(`/api/store/wishlist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
    } catch (error) {
      console.error('Error updating notes:', error)
    }
  }

  const togglePriceAlert = async (itemId: string, enabled: boolean, targetPrice?: number) => {
    setWishlistItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              priceAlert: { 
                enabled, 
                targetPrice: targetPrice || item.priceAlert?.targetPrice || item.product.priceCents * 0.9 
              } 
            }
          : item
      )
    )

    try {
      await fetch(`/api/store/wishlist/${itemId}/alerts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceAlert: { enabled, targetPrice } })
      })
    } catch (error) {
      console.error('Error updating price alert:', error)
    }
  }

  const addAllToCart = async () => {
    const availableItems = filteredAndSortedItems.filter(item => 
      item.product.stock > 0 && selectedItems.includes(item.id)
    )

    for (const item of availableItems) {
      try {
        await fetch('/api/store/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            productId: item.product.id,
            quantity: 1
          })
        })
      } catch (error) {
        console.error('Error adding to cart:', error)
      }
    }

    setSelectedItems([])
    // Mostrar notificación de éxito
  }

  const shareWishlist = async () => {
    const wishlistData = {
      items: wishlistItems.map(item => ({
        name: item.product.name,
        price: item.product.priceCents,
        priority: item.priority,
        notes: item.notes
      }))
    }

    try {
      await navigator.share({
        title: angelicalMode ? 'Mi Lista de Deseos Celestial' : 'Mi Lista de Deseos',
        text: angelicalMode 
          ? 'Mira las bendiciones que he elegido para mi camino espiritual ✨'
          : 'Mira los productos que me interesan',
        url: window.location.origin + '/wishlist/shared/' + userId
      })
    } catch (error) {
      // Fallback: copiar al portapapeles
      await navigator.clipboard.writeText(
        window.location.origin + '/wishlist/shared/' + userId
      )
    }
  }

  const getPriorityColor = (priority: WishlistItem['priority']) => {
    switch (priority) {
      case 'divine':
        return '#fbbf24' // yellow-400
      case 'high':
        return '#ef4444' // red-500
      case 'medium':
        return '#f97316' // orange-500
      case 'low':
        return '#6b7280' // gray-500
      default:
        return currentTheme.colors.textSecondary
    }
  }

  const getPriorityLabel = (priority: WishlistItem['priority']) => {
    if (angelicalMode) {
      switch (priority) {
        case 'divine':
          return '✨ Divina'
        case 'high':
          return '🔥 Urgente'
        case 'medium':
          return '⭐ Importante'
        case 'low':
          return '💫 Futura'
      }
    }
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { divine: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'price':
        return a.product.priceCents - b.product.priceCents
      case 'alphabetical':
        return a.product.name.localeCompare(b.product.name)
      case 'dateAdded':
      default:
        return b.addedAt.getTime() - a.addedAt.getTime()
    }
  })

  const filteredAndSortedItems = filterPriority === 'all' 
    ? sortedItems 
    : sortedItems.filter(item => item.priority === filterPriority)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
          style={{ borderColor: currentTheme.colors.accent }}
        />
        <p style={{ color: currentTheme.colors.textSecondary }}>
          {angelicalMode ? 'Los ángeles están organizando tus deseos...' : 'Cargando lista de deseos...'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 
            className="text-3xl font-bold flex items-center"
            style={{ color: currentTheme.colors.text }}
          >
            <HeartSolidIcon 
              className="h-8 w-8 mr-3"
              style={{ color: currentTheme.colors.accent }}
            />
            {angelicalMode ? 'Lista de Deseos Celestial' : 'Lista de Deseos'}
          </h1>
          <p 
            className="text-lg mt-2"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {angelicalMode 
              ? `${wishlistItems.length} bendiciones guardadas para tu alma ✨`
              : `${wishlistItems.length} productos guardados`
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={addAllToCart}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 flex items-center"
                style={{
                  backgroundColor: currentTheme.colors.accent,
                  color: 'white'
                }}
              >
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                Agregar al Carrito ({selectedItems.length})
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: currentTheme.colors.cardBg,
                  color: currentTheme.colors.textSecondary,
                  border: `1px solid ${currentTheme.colors.borderColor}`
                }}
              >
                Cancelar
              </button>
            </div>
          )}

          <button
            onClick={shareWishlist}
            className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 flex items-center"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              color: currentTheme.colors.text,
              border: `1px solid ${currentTheme.colors.borderColor}`
            }}
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Compartir
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.borderColor,
              color: currentTheme.colors.text
            }}
          >
            <option value="dateAdded">Fecha agregado</option>
            <option value="priority">{angelicalMode ? 'Importancia Divina' : 'Prioridad'}</option>
            <option value="price">Precio</option>
            <option value="alphabetical">Alfabético</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.borderColor,
              color: currentTheme.colors.text
            }}
          >
            <option value="all">Todas las prioridades</option>
            <option value="divine">{angelicalMode ? '✨ Divina' : 'Divina'}</option>
            <option value="high">{angelicalMode ? '🔥 Urgente' : 'Alta'}</option>
            <option value="medium">{angelicalMode ? '⭐ Importante' : 'Media'}</option>
            <option value="low">{angelicalMode ? '💫 Futura' : 'Baja'}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedItems(
              selectedItems.length === filteredAndSortedItems.length 
                ? [] 
                : filteredAndSortedItems.map(item => item.id)
            )}
            className="text-sm underline"
            style={{ color: currentTheme.colors.accent }}
          >
            {selectedItems.length === filteredAndSortedItems.length 
              ? 'Deseleccionar todo' 
              : 'Seleccionar todo'
            }
          </button>
        </div>
      </div>

      {/* Wishlist Items */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item) => (
            <div 
              key={item.id}
              className="relative group"
            >
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(prev => [...prev, item.id])
                    } else {
                      setSelectedItems(prev => prev.filter(id => id !== item.id))
                    }
                  }}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: currentTheme.colors.accent }}
                />
              </div>

              {/* Priority Badge */}
              <div 
                className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                style={{ backgroundColor: getPriorityColor(item.priority) }}
              >
                {getPriorityLabel(item.priority)}
              </div>

              <ProductCard
                product={item.product}
                angelicalMode={angelicalMode}
                showQuickActions={false}
              />

              {/* Wishlist Actions */}
              <div 
                className="mt-4 p-4 rounded-lg border space-y-3"
                style={{
                  backgroundColor: currentTheme.colors.cardBg,
                  borderColor: currentTheme.colors.borderColor
                }}
              >
                {/* Added Date */}
                <div 
                  className="text-xs flex items-center"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  <StarIcon className="h-3 w-3 mr-1" />
                  Agregado el {item.addedAt.toLocaleDateString()}
                </div>

                {/* Angel Message */}
                {angelicalMode && item.angelicalMessage && (
                  <div 
                    className="p-2 rounded border-l-4 bg-opacity-50 text-xs italic"
                    style={{
                      backgroundColor: `${currentTheme.colors.accent}10`,
                      borderLeftColor: currentTheme.colors.accent,
                      color: currentTheme.colors.textSecondary
                    }}
                  >
                    "✨ {item.angelicalMessage} ✨"
                    {item.arcangel && (
                      <div className="mt-1 font-medium" style={{ color: currentTheme.colors.accent }}>
                        - {item.arcangel}
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {showNotes && (
                  <div>
                    {editingNotes === item.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder={angelicalMode ? "Escribe por qué este producto llama a tu alma..." : "Agregar nota..."}
                          className="w-full p-2 text-sm rounded border resize-none focus:outline-none focus:ring-2"
                          rows={2}
                          style={{
                            backgroundColor: currentTheme.colors.cardBg,
                            borderColor: currentTheme.colors.borderColor,
                            color: currentTheme.colors.text
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateItemNotes(item.id, noteText)}
                            className="px-3 py-1 text-xs rounded font-medium"
                            style={{
                              backgroundColor: currentTheme.colors.accent,
                              color: 'white'
                            }}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditingNotes(null)
                              setNoteText('')
                            }}
                            className="px-3 py-1 text-xs rounded"
                            style={{
                              backgroundColor: currentTheme.colors.cardBg,
                              color: currentTheme.colors.textSecondary,
                              border: `1px solid ${currentTheme.colors.borderColor}`
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {item.notes ? (
                          <p 
                            className="text-sm p-2 rounded cursor-pointer hover:bg-opacity-50"
                            style={{
                              backgroundColor: `${currentTheme.colors.accent}05`,
                              color: currentTheme.colors.text
                            }}
                            onClick={() => {
                              setEditingNotes(item.id)
                              setNoteText(item.notes || '')
                            }}
                          >
                            📝 {item.notes}
                          </p>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingNotes(item.id)
                              setNoteText('')
                            }}
                            className="text-sm underline"
                            style={{ color: currentTheme.colors.accent }}
                          >
                            + Agregar nota personal
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Alerts */}
                {showAlerts && (
                  <div className="space-y-2">
                    {/* Stock Alert */}
                    {item.product.stock === 0 && (
                      <div 
                        className="flex items-center p-2 rounded text-xs"
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626'
                        }}
                      >
                        <BellIcon className="h-3 w-3 mr-2" />
                        Sin stock - Te notificaremos cuando esté disponible
                      </div>
                    )}

                    {/* Price Alert */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.priceAlert?.enabled || false}
                          onChange={(e) => togglePriceAlert(item.id, e.target.checked)}
                          className="mr-2 h-3 w-3"
                          style={{ accentColor: currentTheme.colors.accent }}
                        />
                        <BellIcon className="h-3 w-3 mr-1" />
                        <span style={{ color: currentTheme.colors.text }}>
                          Alerta de precio
                        </span>
                      </label>
                      {item.priceAlert?.enabled && (
                        <span 
                          className="text-xs font-medium"
                          style={{ color: currentTheme.colors.accent }}
                        >
                          ${(item.priceAlert.targetPrice / 100).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: currentTheme.colors.borderColor }}>
                  <div className="flex items-center gap-2">
                    {/* Priority Selector */}
                    <select
                      value={item.priority}
                      onChange={(e) => updateItemPriority(item.id, e.target.value as any)}
                      className="text-xs px-2 py-1 rounded border focus:outline-none"
                      style={{
                        backgroundColor: currentTheme.colors.cardBg,
                        borderColor: currentTheme.colors.borderColor,
                        color: currentTheme.colors.text
                      }}
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="divine">Divina</option>
                    </select>
                  </div>

                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-1 rounded hover:bg-red-100 transition-colors"
                    style={{ color: '#dc2626' }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <HeartIcon 
            className="h-16 w-16 mx-auto mb-4 opacity-50"
            style={{ color: currentTheme.colors.textSecondary }}
          />
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: currentTheme.colors.text }}
          >
            {angelicalMode ? 'Tu lista celestial está vacía' : 'Tu lista de deseos está vacía'}
          </h3>
          <p 
            className="mb-6"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {angelicalMode 
              ? 'Comienza a coleccionar las bendiciones que tu alma desea ✨'
              : 'Explora nuestros productos y guarda tus favoritos'
            }
          </p>
          <button
            onClick={() => window.location.href = '/tienda'}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: currentTheme.colors.accent,
              color: 'white'
            }}
          >
            {angelicalMode ? '✨ Explorar Bendiciones' : 'Explorar Productos'}
          </button>
        </div>
      )}
    </div>
  )
}