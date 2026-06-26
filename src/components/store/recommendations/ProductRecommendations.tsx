// Sistema de Recomendaciones Angelicales - FASE 7
'use client'

import { useState, useEffect } from 'react'
import { Product, ProductCategory } from '@/types/store'
import { useTheme } from '@/context/ThemeContext'
import ProductCard from '@/components/store/public/ProductCard'
import {
  SparklesIcon,
  StarIcon,
  HeartIcon,
  FireIcon,
  EyeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface RecommendationEngine {
  userId?: string
  currentProduct?: Product
  purchaseHistory?: Product[]
  viewedProducts?: Product[]
  preferences?: {
    category?: string
    priceRange?: { min: number; max: number }
    arcangel?: string
    purpose?: string[]
  }
}

interface AngelicalRecommendation {
  product: Product
  reason: string
  arcangel: string
  energyLevel: number
  compatibility: number
  divineMessage: string
}

interface ProductRecommendationsProps {
  engine: RecommendationEngine
  maxRecommendations?: number
  angelicalMode?: boolean
  showReasons?: boolean
}

export default function ProductRecommendations({
  engine,
  maxRecommendations = 6,
  angelicalMode = true,
  showReasons = true
}: ProductRecommendationsProps) {
  const { currentTheme } = useTheme()
  const [recommendations, setRecommendations] = useState<AngelicalRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'divine' | 'similar' | 'trending' | 'personalized'>('divine')

  useEffect(() => {
    generateRecommendations()
  }, [engine, activeTab])

  const generateRecommendations = async () => {
    setLoading(true)
    try {
      // Simulación de llamada a API de recomendaciones angelicales
      const response = await fetch('/api/store/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...engine,
          type: activeTab,
          angelicalMode,
          maxResults: maxRecommendations
        })
      })
      
      if (!response.ok) {
        // Fallback a recomendaciones mock
        const mockRecommendations = await generateMockRecommendations()
        setRecommendations(mockRecommendations)
      } else {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
      const mockRecommendations = await generateMockRecommendations()
      setRecommendations(mockRecommendations)
    } finally {
      setLoading(false)
    }
  }

  const generateMockRecommendations = async (): Promise<AngelicalRecommendation[]> => {
    // Mock data para demostración
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Cuarzo Rosa del Arcángel Chamuel',
        description: 'Cristal de amor incondicional bendecido por el Arcángel del Amor',
        priceCents: 4500,
        currency: 'COP',
        imageUrls: ['/productos/cuarzo-rosa.jpg'],
        category: ProductCategory.JEWELRY,
        stock: 15,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Vela de Protección San Miguel',
        description: 'Vela azul consagrada para protección angelical total',
        priceCents: 3200,
        currency: 'COP',
        imageUrls: ['/productos/vela-san-miguel.jpg'],
        category: ProductCategory.ACCESSORIES,
        stock: 8,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Incienso Purificación Zadkiel',
        description: 'Incienso violeta para limpiar energías negativas',
        priceCents: 2800,
        currency: 'COP',
        imageUrls: ['/productos/incienso-zadkiel.jpg'],
        category: 'incense',
        stock: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    const angelMessages = [
      'Los ángeles susurran que necesitas este poder en tu vida',
      'Tu vibración energética resuena perfectamente con este producto',
      'El Arcángel te guía hacia esta bendición divina',
      'Tu alma ancestral reconoce la energía de este elemento',
      'Las estrellas se alinean para traerte esta oportunidad celestial',
      'Tu aura necesita la frecuencia que emana este producto sagrado'
    ]

    const reasons = [
      'Basado en tu energía espiritual actual',
      'Complementa tu último pedido angelical',
      'Recomendado por tu Arcángel guardián',
      'Perfecto para tu camino de ascensión',
      'Elevará tu frecuencia vibratoria',
      'Protegerá tu hogar celestial'
    ]

    const arcangeles = ['San Miguel', 'Rafael', 'Gabriel', 'Uriel', 'Chamuel', 'Zadkiel', 'Jofiel']

    return mockProducts.map((product, index) => ({
      product,
      reason: reasons[index % reasons.length],
      arcangel: arcangeles[index % arcangeles.length],
      energyLevel: Math.floor(Math.random() * 3) + 8, // 8-10
      compatibility: Math.floor(Math.random() * 20) + 80, // 80-100%
      divineMessage: angelMessages[index % angelMessages.length]
    }))
  }

  const getTabIcon = (tab: typeof activeTab) => {
    switch (tab) {
      case 'divine':
        return <SparklesIcon className="h-5 w-5" />
      case 'similar':
        return <HeartIcon className="h-5 w-5" />
      case 'trending':
        return <FireIcon className="h-5 w-5" />
      case 'personalized':
        return <StarIcon className="h-5 w-5" />
    }
  }

  const getTabLabel = (tab: typeof activeTab) => {
    switch (tab) {
      case 'divine':
        return angelicalMode ? 'Guía Divina' : 'Recomendado'
      case 'similar':
        return angelicalMode ? 'Energía Similar' : 'Productos Similares'
      case 'trending':
        return angelicalMode ? 'Bendiciones Populares' : 'Tendencias'
      case 'personalized':
        return angelicalMode ? 'Para tu Alma' : 'Personalizado'
    }
  }

  const getEnergyColor = (level: number) => {
    if (level >= 9) return '#10b981' // green-500
    if (level >= 7) return '#f59e0b' // yellow-500
    return '#6366f1' // indigo-500
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <SparklesIcon 
            className="h-8 w-8 mr-3"
            style={{ color: currentTheme.colors.accent }}
          />
          <h2 
            className="text-3xl font-bold"
            style={{ color: currentTheme.colors.text }}
          >
            {angelicalMode ? 'Recomendaciones Angelicales' : 'Recomendaciones'}
          </h2>
          <SparklesIcon 
            className="h-8 w-8 ml-3"
            style={{ color: currentTheme.colors.accent }}
          />
        </div>
        <p 
          className="text-lg"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          {angelicalMode 
            ? 'Los arcángeles han seleccionado especialmente estos productos para ti ✨'
            : 'Productos seleccionados basados en tus preferencias'
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {(['divine', 'similar', 'trending', 'personalized'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab ? 'ring-2 transform scale-105' : ''
            }`}
            style={{
              backgroundColor: activeTab === tab 
                ? `${currentTheme.colors.accent}20` 
                : currentTheme.colors.cardBg,
              color: activeTab === tab 
                ? currentTheme.colors.accent 
                : currentTheme.colors.text,
              borderColor: currentTheme.colors.borderColor,
              border: '1px solid',
              ringColor: currentTheme.colors.accent
            }}
          >
            {getTabIcon(tab)}
            <span className="ml-2">{getTabLabel(tab)}</span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
            style={{ borderColor: currentTheme.colors.accent }}
          />
          <p style={{ color: currentTheme.colors.textSecondary }}>
            {angelicalMode ? 'Los ángeles están consultando tu destino...' : 'Generando recomendaciones...'}
          </p>
        </div>
      ) : (
        <>
          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation, index) => (
              <div 
                key={recommendation.product.id}
                className="relative group"
              >
                {/* Recommendation Badge */}
                {index === 0 && (
                  <div 
                    className="absolute -top-2 -right-2 z-10 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                    style={{ backgroundColor: currentTheme.colors.accent }}
                  >
                    {angelicalMode ? '👑 Elegido Divino' : '🏆 Top Pick'}
                  </div>
                )}

                <ProductCard
                  product={recommendation.product}
                  angelicalMode={angelicalMode}
                  showQuickActions={true}
                />

                {/* Recommendation Details */}
                {showReasons && (
                  <div 
                    className="mt-4 p-4 rounded-lg border"
                    style={{
                      backgroundColor: currentTheme.colors.cardBg,
                      borderColor: currentTheme.colors.borderColor
                    }}
                  >
                    {/* Energy Level */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getEnergyColor(recommendation.energyLevel) }}
                        />
                        <span 
                          className="text-sm font-medium"
                          style={{ color: currentTheme.colors.text }}
                        >
                          {angelicalMode ? 'Energía Celestial' : 'Compatibilidad'}
                        </span>
                      </div>
                      <span 
                        className="text-sm font-bold"
                        style={{ color: currentTheme.colors.accent }}
                      >
                        {angelicalMode 
                          ? `${recommendation.energyLevel}/10 ⚡`
                          : `${recommendation.compatibility}%`
                        }
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="mb-3">
                      <p 
                        className="text-sm"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        📍 {recommendation.reason}
                      </p>
                    </div>

                    {/* Arcangel */}
                    {angelicalMode && (
                      <div className="mb-3 flex items-center">
                        <ShieldCheckIcon 
                          className="h-4 w-4 mr-2"
                          style={{ color: currentTheme.colors.accent }}
                        />
                        <span 
                          className="text-sm font-medium"
                          style={{ color: currentTheme.colors.accent }}
                        >
                          Bendecido por {recommendation.arcangel}
                        </span>
                      </div>
                    )}

                    {/* Divine Message */}
                    {angelicalMode && (
                      <div 
                        className="p-3 rounded border-l-4 bg-opacity-50"
                        style={{
                          backgroundColor: `${currentTheme.colors.accent}10`,
                          borderLeftColor: currentTheme.colors.accent
                        }}
                      >
                        <p 
                          className="text-xs italic"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          "✨ {recommendation.divineMessage} ✨"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {recommendations.length === 0 && (
            <div className="text-center py-12">
              <SparklesIcon 
                className="h-16 w-16 mx-auto mb-4 opacity-50"
                style={{ color: currentTheme.colors.textSecondary }}
              />
              <p 
                className="text-lg mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                {angelicalMode ? 'Los ángeles están preparando tus recomendaciones' : 'No hay recomendaciones disponibles'}
              </p>
              <p style={{ color: currentTheme.colors.textSecondary }}>
                {angelicalMode 
                  ? 'Mientras tanto, explora nuestras bendiciones disponibles'
                  : 'Intenta navegar por nuestros productos para generar recomendaciones'
                }
              </p>
            </div>
          )}

          {/* Action Button */}
          {recommendations.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={() => generateRecommendations()}
                className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: currentTheme.colors.accent,
                  color: 'white'
                }}
              >
                {angelicalMode ? '🔄 Consultar Nuevas Bendiciones' : '🔄 Actualizar Recomendaciones'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}