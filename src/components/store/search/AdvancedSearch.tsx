// Sistema de Búsqueda Avanzada Angelical - FASE 7
'use client'

import { useState, useEffect, useRef } from 'react'
import { Product } from '@/types/store'
import { useTheme } from '@/context/ThemeContext'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  XMarkIcon,
  StarIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  FireIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface SearchFilter {
  id: string
  label: string
  type: 'checkbox' | 'range' | 'select' | 'radio'
  options?: { value: string; label: string; count?: number }[]
  min?: number
  max?: number
  value?: any
  angelicalLabel?: string
  arcangel?: string
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, any>) => void
  products: Product[]
  angelicalMode?: boolean
  showPredictiveSearch?: boolean
  maxSuggestions?: number
}

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'divine'
  text: string
  data?: any
  icon?: string
  angelMessage?: string
}

export default function AdvancedSearch({
  onSearch,
  products,
  angelicalMode = true,
  showPredictiveSearch = true,
  maxSuggestions = 8
}: AdvancedSearchProps) {
  const { currentTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filtros disponibles
  const searchFilters: SearchFilter[] = [
    {
      id: 'category',
      label: 'Categoría',
      angelicalLabel: 'Reino Celestial',
      type: 'checkbox',
      options: [
        { value: 'crystals', label: 'Cristales', count: 15 },
        { value: 'candles', label: 'Velas', count: 12 },
        { value: 'incense', label: 'Incienso', count: 8 },
        { value: 'oils', label: 'Aceites', count: 6 },
        { value: 'jewelry', label: 'Joyería', count: 10 },
        { value: 'books', label: 'Libros', count: 5 }
      ]
    },
    {
      id: 'priceRange',
      label: 'Rango de Precio',
      angelicalLabel: 'Inversión Espiritual',
      type: 'range',
      min: 0,
      max: 100000
    },
    {
      id: 'arcangel',
      label: 'Arcángel',
      angelicalLabel: 'Guardián Celestial',
      type: 'select',
      options: [
        { value: 'miguel', label: 'San Miguel (Protección)' },
        { value: 'rafael', label: 'Rafael (Sanación)' },
        { value: 'gabriel', label: 'Gabriel (Comunicación)' },
        { value: 'uriel', label: 'Uriel (Sabiduría)' },
        { value: 'chamuel', label: 'Chamuel (Amor)' },
        { value: 'zadkiel', label: 'Zadkiel (Perdón)' },
        { value: 'jofiel', label: 'Jofiel (Belleza)' }
      ]
    },
    {
      id: 'purpose',
      label: 'Propósito',
      angelicalLabel: 'Intención Divina',
      type: 'checkbox',
      options: [
        { value: 'protection', label: 'Protección' },
        { value: 'healing', label: 'Sanación' },
        { value: 'love', label: 'Amor' },
        { value: 'prosperity', label: 'Prosperidad' },
        { value: 'wisdom', label: 'Sabiduría' },
        { value: 'peace', label: 'Paz' }
      ]
    },
    {
      id: 'sortBy',
      label: 'Ordenar por',
      angelicalLabel: 'Orden Divino',
      type: 'radio',
      options: [
        { value: 'relevance', label: 'Relevancia' },
        { value: 'price_asc', label: 'Precio: Menor a Mayor' },
        { value: 'price_desc', label: 'Precio: Mayor a Menor' },
        { value: 'newest', label: 'Más Recientes' },
        { value: 'popular', label: 'Más Populares' },
        { value: 'energy', label: 'Energía Celestial' }
      ]
    }
  ]

  useEffect(() => {
    if (searchQuery.length > 1) {
      generateSuggestions()
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  const generateSuggestions = async () => {
    if (!showPredictiveSearch) return

    setIsSearching(true)
    
    try {
      // Simulación de API de búsqueda predictiva
      const response = await fetch('/api/store/search/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          angelicalMode,
          maxResults: maxSuggestions
        })
      })

      if (!response.ok) {
        // Fallback a sugerencias mock
        const mockSuggestions = generateMockSuggestions()
        setSuggestions(mockSuggestions)
      } else {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      const mockSuggestions = generateMockSuggestions()
      setSuggestions(mockSuggestions)
    } finally {
      setIsSearching(false)
      setShowSuggestions(true)
    }
  }

  const generateMockSuggestions = (): SearchSuggestion[] => {
    const query = searchQuery.toLowerCase()
    const suggestions: SearchSuggestion[] = []

    // Sugerencias de productos
    const productSuggestions = products
      .filter(p => p.name.toLowerCase().includes(query))
      .slice(0, 3)
      .map(p => ({
        type: 'product' as const,
        text: p.name,
        data: p,
        icon: '🔮'
      }))

    // Sugerencias de categoría
    const categoryMatches = searchFilters[0].options?.filter(opt => 
      opt.label.toLowerCase().includes(query)
    ).slice(0, 2).map(opt => ({
      type: 'category' as const,
      text: opt.label,
      data: { category: opt.value },
      icon: '📂'
    })) || []

    // Sugerencias angelicales
    const angelicalSuggestions = angelicalMode ? [
      {
        type: 'divine' as const,
        text: `Bendiciones que contienen "${searchQuery}"`,
        icon: '✨',
        angelMessage: 'Los ángeles te guían hacia estas opciones'
      },
      {
        type: 'divine' as const,
        text: `Protección angelical con "${query}"`,
        icon: '🛡️',
        angelMessage: 'San Miguel recomienda estos productos'
      }
    ] : []

    return [
      ...productSuggestions,
      ...categoryMatches,
      ...angelicalSuggestions
    ].slice(0, maxSuggestions)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Agregar a historial
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5)
      setSearchHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    }

    onSearch(searchQuery, filters)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      setSearchQuery(suggestion.text)
    } else if (suggestion.type === 'category') {
      setFilters(prev => ({ ...prev, category: [suggestion.data.category] }))
    }
    
    setShowSuggestions(false)
    onSearch(searchQuery, filters)
  }

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...filters, [filterId]: value }
    setFilters(newFilters)
    onSearch(searchQuery, newFilters)
  }

  const clearFilter = (filterId: string) => {
    const newFilters = { ...filters }
    delete newFilters[filterId]
    setFilters(newFilters)
    onSearch(searchQuery, newFilters)
  }

  const clearAllFilters = () => {
    setFilters({})
    onSearch(searchQuery, {})
  }

  const renderFilter = (filter: SearchFilter) => {
    const currentValue = filters[filter.id]

    switch (filter.type) {
      case 'checkbox':
        return (
          <div className="space-y-2">
            {filter.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentValue?.includes(option.value) || false}
                  onChange={(e) => {
                    const newValue = currentValue || []
                    if (e.target.checked) {
                      handleFilterChange(filter.id, [...newValue, option.value])
                    } else {
                      handleFilterChange(filter.id, newValue.filter((v: any) => v !== option.value))
                    }
                  }}
                  className="mr-2 rounded"
                  style={{ accentColor: currentTheme.colors.accent }}
                />
                <span 
                  className="text-sm flex-1"
                  style={{ color: currentTheme.colors.text }}
                >
                  {option.label}
                </span>
                {option.count && (
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${currentTheme.colors.accent}20`,
                      color: currentTheme.colors.accent
                    }}
                  >
                    {option.count}
                  </span>
                )}
              </label>
            ))}
          </div>
        )

      case 'range':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span 
                className="text-sm"
                style={{ color: currentTheme.colors.text }}
              >
                ${filter.min?.toLocaleString()} - ${filter.max?.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={currentValue || filter.min}
              onChange={(e) => handleFilterChange(filter.id, parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor: currentTheme.colors.accent }}
            />
            <div className="text-center">
              <span 
                className="text-sm font-medium"
                style={{ color: currentTheme.colors.accent }}
              >
                Hasta ${(currentValue || filter.min)?.toLocaleString()}
              </span>
            </div>
          </div>
        )

      case 'select':
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full p-2 rounded border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.borderColor,
              color: currentTheme.colors.text,
              focusRingColor: currentTheme.colors.accent
            }}
          >
            <option value="">
              {angelicalMode ? 'Todos los Guardianes' : 'Seleccionar...'}
            </option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {filter.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={filter.id}
                  value={option.value}
                  checked={currentValue === option.value}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="mr-2"
                  style={{ accentColor: currentTheme.colors.accent }}
                />
                <span 
                  className="text-sm"
                  style={{ color: currentTheme.colors.text }}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const activeFilterCount = Object.keys(filters).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={angelicalMode 
              ? "✨ Los ángeles te ayudan a encontrar tu bendición perfecta..."
              : "Buscar productos..."
            }
            className="w-full pl-12 pr-24 py-4 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all text-lg"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.borderColor,
              color: currentTheme.colors.text,
              focusBorderColor: currentTheme.colors.accent,
              focusRingColor: `${currentTheme.colors.accent}50`
            }}
          />
          
          <MagnifyingGlassIcon 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6"
            style={{ color: currentTheme.colors.textSecondary }}
          />
          
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {isSearching && (
              <div 
                className="animate-spin rounded-full h-5 w-5 border-b-2"
                style={{ borderColor: currentTheme.colors.accent }}
              />
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all relative ${
                showFilters ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: showFilters 
                  ? `${currentTheme.colors.accent}20` 
                  : currentTheme.colors.cardBg,
                color: showFilters 
                  ? currentTheme.colors.accent 
                  : currentTheme.colors.textSecondary,
                ringColor: currentTheme.colors.accent
              }}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              {activeFilterCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs flex items-center justify-center text-white"
                  style={{ backgroundColor: currentTheme.colors.accent }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: currentTheme.colors.accent,
                color: 'white'
              }}
            >
              {angelicalMode ? '✨ Buscar' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.borderColor
            }}
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-opacity-50 transition-colors border-b last:border-b-0 flex items-center"
                style={{
                  borderColor: currentTheme.colors.borderColor,
                  ':hover': { backgroundColor: `${currentTheme.colors.accent}10` }
                }}
              >
                <span className="mr-3 text-lg">{suggestion.icon}</span>
                <div className="flex-1">
                  <div 
                    className="font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {suggestion.text}
                  </div>
                  {suggestion.angelMessage && (
                    <div 
                      className="text-sm italic mt-1"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      {suggestion.angelMessage}
                    </div>
                  )}
                </div>
                <SparklesIcon 
                  className="h-4 w-4 opacity-50"
                  style={{ color: currentTheme.colors.accent }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([filterId, value]) => {
            const filter = searchFilters.find(f => f.id === filterId)
            if (!filter || !value) return null

            const displayValue = Array.isArray(value) 
              ? value.join(', ') 
              : typeof value === 'string' 
                ? value 
                : value.toString()

            return (
              <div
                key={filterId}
                className="flex items-center px-3 py-1 rounded-full text-sm border"
                style={{
                  backgroundColor: `${currentTheme.colors.accent}20`,
                  borderColor: currentTheme.colors.accent,
                  color: currentTheme.colors.accent
                }}
              >
                <span className="mr-2">
                  {angelicalMode ? filter.angelicalLabel : filter.label}: {displayValue}
                </span>
                <button
                  onClick={() => clearFilter(filterId)}
                  className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            )
          })}
          
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 rounded-full text-sm border hover:bg-opacity-10 transition-colors"
            style={{
              borderColor: currentTheme.colors.textSecondary,
              color: currentTheme.colors.textSecondary
            }}
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div 
          className="rounded-lg border p-6"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-lg font-semibold flex items-center"
              style={{ color: currentTheme.colors.text }}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {angelicalMode ? 'Filtros Celestiales' : 'Filtros Avanzados'}
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 rounded hover:bg-opacity-10 transition-colors"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchFilters.map(filter => (
              <div key={filter.id}>
                <h4 
                  className="font-medium mb-3 flex items-center"
                  style={{ color: currentTheme.colors.text }}
                >
                  {angelicalMode && filter.arcangel && (
                    <ShieldCheckIcon 
                      className="h-4 w-4 mr-2"
                      style={{ color: currentTheme.colors.accent }}
                    />
                  )}
                  {angelicalMode ? filter.angelicalLabel : filter.label}
                </h4>
                {renderFilter(filter)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && searchQuery === '' && (
        <div 
          className="rounded-lg border p-4"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <h4 
            className="font-medium mb-3 flex items-center"
            style={{ color: currentTheme.colors.text }}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            {angelicalMode ? 'Búsquedas Pasadas' : 'Historial de Búsqueda'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((query, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(query)
                  onSearch(query, filters)
                }}
                className="px-3 py-1 rounded-full text-sm border hover:bg-opacity-10 transition-colors"
                style={{
                  borderColor: currentTheme.colors.borderColor,
                  color: currentTheme.colors.textSecondary
                }}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}