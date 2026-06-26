// Sistema de Reviews Angelicales - FASE 7
'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/store'
import { useTheme } from '@/context/ThemeContext'
import {
  StarIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
  UserIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FlagIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface AngelicalReview {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  productId: string
  rating: number
  spiritualRating?: number // Rating espiritual específico
  title: string
  content: string
  angelicalExperience?: {
    energyLevel: number // 1-10
    chakraAlignment: string[]
    manifestationSuccess: boolean
    arcangel?: string
    divineMessage?: string
    transformationStory?: string
  }
  verified: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt?: Date
  images?: string[]
  tags?: string[]
  response?: {
    authorName: string
    content: string
    createdAt: Date
  }
}

interface ReviewsProps {
  productId: string
  angelicalMode?: boolean
  canWrite?: boolean
  userId?: string
  maxReviews?: number
  showAngelicalFeatures?: boolean
}

interface ReviewFormData {
  rating: number
  spiritualRating: number
  title: string
  content: string
  energyLevel: number
  chakraAlignment: string[]
  manifestationSuccess: boolean
  arcangel: string
  divineMessage: string
  transformationStory: string
  images: File[]
}

export default function ProductReviews({
  productId,
  angelicalMode = true,
  canWrite = true,
  userId,
  maxReviews = 20,
  showAngelicalFeatures = true
}: ReviewsProps) {
  const { currentTheme } = useTheme()
  const [reviews, setReviews] = useState<AngelicalReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' | 'spiritual'>('newest')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [reviewForm, setReviewForm] = useState<Partial<ReviewFormData>>({
    rating: 5,
    spiritualRating: 5,
    energyLevel: 8,
    chakraAlignment: [],
    manifestationSuccess: false,
    arcangel: '',
    images: []
  })

  const chakras = [
    { id: 'root', name: 'Raíz', color: '#dc2626' },
    { id: 'sacral', name: 'Sacro', color: '#ea580c' },
    { id: 'solar', name: 'Plexo Solar', color: '#ca8a04' },
    { id: 'heart', name: 'Corazón', color: '#16a34a' },
    { id: 'throat', name: 'Garganta', color: '#2563eb' },
    { id: 'third_eye', name: 'Tercer Ojo', color: '#7c3aed' },
    { id: 'crown', name: 'Corona', color: '#a855f7' }
  ]

  const arcangeles = [
    'San Miguel', 'Rafael', 'Gabriel', 'Uriel', 
    'Chamuel', 'Zadkiel', 'Jofiel', 'Raguel'
  ]

  useEffect(() => {
    loadReviews()
  }, [productId, sortBy, filterRating])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/store/products/${productId}/reviews?sort=${sortBy}&rating=${filterRating || ''}`)
      if (!response.ok) {
        const mockReviews = generateMockReviews()
        setReviews(mockReviews)
      } else {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      const mockReviews = generateMockReviews()
      setReviews(mockReviews)
    } finally {
      setLoading(false)
    }
  }

  const generateMockReviews = (): AngelicalReview[] => {
    const names = ['María González', 'Carlos Ruiz', 'Ana López', 'David Torres', 'Sofía Martín']
    const experiences = [
      {
        energyLevel: 9,
        chakraAlignment: ['heart', 'crown'],
        manifestationSuccess: true,
        arcangel: 'Chamuel',
        divineMessage: 'El amor se multiplicó en mi vida',
        transformationStory: 'Después de usar este producto, encontré paz interior y mi relación familiar mejoró increíblemente.'
      },
      {
        energyLevel: 8,
        chakraAlignment: ['root', 'solar'],
        manifestationSuccess: true,
        arcangel: 'Miguel',
        divineMessage: 'La protección llegó cuando más la necesitaba',
        transformationStory: 'Sentí una protección inmediata, los problemas que me agobiaban se resolvieron de manera milagrosa.'
      },
      {
        energyLevel: 10,
        chakraAlignment: ['third_eye', 'crown'],
        manifestationSuccess: true,
        arcangel: 'Uriel',
        divineMessage: 'La sabiduría divina iluminó mi camino',
        transformationStory: 'Mi intuición se desarrolló tremendamente, ahora tomo decisiones con más claridad y confianza.'
      }
    ]

    const titles = [
      'Producto extraordinario, cambió mi vida',
      'Energía celestial increíble',
      'Los ángeles realmente bendicen este producto',
      'Transformación espiritual profunda',
      'Calidad excepcional y poder angelical'
    ]

    const contents = [
      'Este producto superó todas mis expectativas. La energía que emana es realmente celestial y he notado cambios positivos inmediatos en mi vida.',
      'Llevo usando este producto por 3 meses y los resultados son increíbles. Mi familia nota el cambio positivo en mí.',
      'La calidad es excelente y la conexión espiritual que genera es auténtica. Definitivamente lo recomiendo.',
      'Desde que tengo este producto, mi hogar se siente más protegido y en paz. Los ángeles realmente lo bendicen.',
      'Un producto que realmente funciona. La transformación en mi vida espiritual ha sido notable y hermosa.'
    ]

    return Array.from({ length: 5 }, (_, index) => ({
      id: `review_${index + 1}`,
      userId: `user_${index + 1}`,
      userName: names[index],
      userAvatar: `/avatars/user${index + 1}.jpg`,
      productId,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      spiritualRating: Math.floor(Math.random() * 2) + 4,
      title: titles[index],
      content: contents[index],
      angelicalExperience: experiences[index % experiences.length],
      verified: Math.random() > 0.3,
      helpfulCount: Math.floor(Math.random() * 20) + 1,
      createdAt: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000),
      tags: index === 0 ? ['transformación', 'energía-positiva'] : undefined
    }))
  }

  const submitReview = async () => {
    if (!reviewForm.rating || !reviewForm.title || !reviewForm.content) {
      alert('Por favor completa los campos obligatorios')
      return
    }

    const newReview: AngelicalReview = {
      id: `review_${Date.now()}`,
      userId: userId || 'current_user',
      userName: 'Tu Nombre',
      productId,
      rating: reviewForm.rating,
      spiritualRating: reviewForm.spiritualRating || reviewForm.rating,
      title: reviewForm.title,
      content: reviewForm.content,
      angelicalExperience: showAngelicalFeatures ? {
        energyLevel: reviewForm.energyLevel || 5,
        chakraAlignment: reviewForm.chakraAlignment || [],
        manifestationSuccess: reviewForm.manifestationSuccess || false,
        arcangel: reviewForm.arcangel,
        divineMessage: reviewForm.divineMessage,
        transformationStory: reviewForm.transformationStory
      } : undefined,
      verified: false,
      helpfulCount: 0,
      createdAt: new Date()
    }

    try {
      const response = await fetch(`/api/store/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      })

      if (response.ok) {
        setReviews(prev => [newReview, ...prev])
        setShowWriteReview(false)
        setReviewForm({
          rating: 5,
          spiritualRating: 5,
          energyLevel: 8,
          chakraAlignment: [],
          manifestationSuccess: false,
          arcangel: '',
          images: []
        })
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      // Agregar review localmente como fallback
      setReviews(prev => [newReview, ...prev])
      setShowWriteReview(false)
    }
  }

  const markHelpful = async (reviewId: string, helpful: boolean) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpfulCount: review.helpfulCount + (helpful ? 1 : -1) }
          : review
      )
    )

    try {
      await fetch(`/api/store/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful, userId })
      })
    } catch (error) {
      console.error('Error marking review as helpful:', error)
    }
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const getAverageSpiritualRating = () => {
    if (reviews.length === 0) return 0
    const spiritualReviews = reviews.filter(r => r.spiritualRating)
    if (spiritualReviews.length === 0) return 0
    return spiritualReviews.reduce((sum, review) => sum + (review.spiritualRating || 0), 0) / spiritualReviews.length
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const sortedAndFilteredReviews = reviews
    .filter(review => filterRating ? review.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime()
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime()
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'helpful':
          return b.helpfulCount - a.helpfulCount
        case 'spiritual':
          return (b.spiritualRating || 0) - (a.spiritualRating || 0)
        default:
          return 0
      }
    })
    .slice(0, maxReviews)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: currentTheme.colors.accent }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Reviews Header */}
      <div>
        <h2 
          className="text-2xl font-bold mb-4 flex items-center"
          style={{ color: currentTheme.colors.text }}
        >
          <StarIcon 
            className="h-6 w-6 mr-2"
            style={{ color: currentTheme.colors.accent }}
          />
          {angelicalMode ? 'Testimonios Celestiales' : 'Reseñas'}
        </h2>

        {/* Rating Summary */}
        <div 
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: currentTheme.colors.cardBg,
            borderColor: currentTheme.colors.borderColor
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div 
                className="text-4xl font-bold mb-2"
                style={{ color: currentTheme.colors.accent }}
              >
                {getAverageRating().toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <StarSolidIcon
                    key={star}
                    className="h-6 w-6"
                    style={{
                      color: star <= Math.round(getAverageRating()) 
                        ? currentTheme.colors.accent 
                        : currentTheme.colors.borderColor
                    }}
                  />
                ))}
              </div>
              <p 
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Basado en {reviews.length} {angelicalMode ? 'testimonios' : 'reseñas'}
              </p>

              {/* Spiritual Rating */}
              {angelicalMode && showAngelicalFeatures && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: currentTheme.colors.borderColor }}>
                  <div className="flex items-center justify-center mb-2">
                    <SparklesIcon 
                      className="h-5 w-5 mr-2"
                      style={{ color: currentTheme.colors.accent }}
                    />
                    <span 
                      className="text-lg font-semibold"
                      style={{ color: currentTheme.colors.text }}
                    >
                      Conexión Espiritual
                    </span>
                  </div>
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: currentTheme.colors.accent }}
                  >
                    {getAverageSpiritualRating().toFixed(1)}/10
                  </div>
                  <p 
                    className="text-sm"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Nivel de transformación espiritual
                  </p>
                </div>
              )}
            </div>

            {/* Rating Distribution */}
            <div>
              <h4 
                className="font-semibold mb-3"
                style={{ color: currentTheme.colors.text }}
              >
                Distribución de {angelicalMode ? 'Testimonios' : 'Calificaciones'}
              </h4>
              {Object.entries(getRatingDistribution())
                .reverse()
                .map(([rating, count]) => (
                  <div key={rating} className="flex items-center mb-2">
                    <span 
                      className="text-sm mr-2 w-8"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {rating}★
                    </span>
                    <div 
                      className="flex-1 h-2 rounded-full mr-2"
                      style={{ backgroundColor: currentTheme.colors.borderColor }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: currentTheme.colors.accent,
                          width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span 
                      className="text-sm w-8"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
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
            <option value="newest">Más Recientes</option>
            <option value="oldest">Más Antiguos</option>
            <option value="highest">Mejor Calificados</option>
            <option value="lowest">Menor Calificados</option>
            <option value="helpful">Más Útiles</option>
            {angelicalMode && <option value="spiritual">Más Espirituales</option>}
          </select>

          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: currentTheme.colors.cardBg,
              borderColor: currentTheme.colors.borderColor,
              color: currentTheme.colors.text
            }}
          >
            <option value="">Todas las Calificaciones</option>
            <option value="5">5 Estrellas</option>
            <option value="4">4 Estrellas</option>
            <option value="3">3 Estrellas</option>
            <option value="2">2 Estrellas</option>
            <option value="1">1 Estrella</option>
          </select>
        </div>

        {canWrite && (
          <button
            onClick={() => setShowWriteReview(true)}
            className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 flex items-center"
            style={{
              backgroundColor: currentTheme.colors.accent,
              color: 'white'
            }}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            {angelicalMode ? '✨ Compartir Testimonio' : 'Escribir Reseña'}
          </button>
        )}
      </div>

      {/* Write Review Modal */}
      {showWriteReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg p-6"
            style={{ backgroundColor: currentTheme.colors.cardBg }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 
                className="text-xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                {angelicalMode ? '✨ Compartir tu Experiencia Celestial' : 'Escribir Reseña'}
              </h3>
              <button
                onClick={() => setShowWriteReview(false)}
                className="p-2 rounded-lg hover:bg-opacity-10"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Rating */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Calificación General *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                    >
                      <StarSolidIcon
                        className="h-8 w-8 transition-colors"
                        style={{
                          color: star <= (reviewForm.rating || 0)
                            ? currentTheme.colors.accent
                            : currentTheme.colors.borderColor
                        }}
                      />
                    </button>
                  ))}
                  <span 
                    className="ml-2 font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {reviewForm.rating || 0}/5
                  </span>
                </div>
              </div>

              {/* Spiritual Rating */}
              {angelicalMode && showAngelicalFeatures && (
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: currentTheme.colors.text }}
                  >
                    <SparklesIcon className="h-4 w-4 inline mr-1" />
                    Nivel de Transformación Espiritual (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={reviewForm.spiritualRating || 5}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, spiritualRating: parseInt(e.target.value) }))}
                    className="w-full"
                    style={{ accentColor: currentTheme.colors.accent }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                    <span>Mínima</span>
                    <span className="font-medium" style={{ color: currentTheme.colors.accent }}>
                      {reviewForm.spiritualRating || 5}/10
                    </span>
                    <span>Transformación Total</span>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Título *
                </label>
                <input
                  type="text"
                  value={reviewForm.title || ''}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={angelicalMode ? "Ej: Este producto transformó mi vida espiritual" : "Resumen de tu experiencia"}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: currentTheme.colors.cardBg,
                    borderColor: currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                />
              </div>

              {/* Content */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Tu Experiencia *
                </label>
                <textarea
                  value={reviewForm.content || ''}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={angelicalMode 
                    ? "Comparte cómo este producto bendecido ha impactado tu vida espiritual..."
                    : "Describe tu experiencia con este producto..."
                  }
                  rows={4}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 resize-none"
                  style={{
                    backgroundColor: currentTheme.colors.cardBg,
                    borderColor: currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                />
              </div>

              {/* Angelical Features */}
              {angelicalMode && showAngelicalFeatures && (
                <>
                  {/* Chakra Alignment */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: currentTheme.colors.text }}
                    >
                      <SparklesIcon className="h-4 w-4 inline mr-1" />
                      Chakras que se Alinearon
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {chakras.map(chakra => (
                        <label key={chakra.id} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={reviewForm.chakraAlignment?.includes(chakra.id) || false}
                            onChange={(e) => {
                              const current = reviewForm.chakraAlignment || []
                              if (e.target.checked) {
                                setReviewForm(prev => ({ 
                                  ...prev, 
                                  chakraAlignment: [...current, chakra.id] 
                                }))
                              } else {
                                setReviewForm(prev => ({ 
                                  ...prev, 
                                  chakraAlignment: current.filter(c => c !== chakra.id) 
                                }))
                              }
                            }}
                            className="mr-2"
                            style={{ accentColor: chakra.color }}
                          />
                          <span 
                            className="text-sm"
                            style={{ color: currentTheme.colors.text }}
                          >
                            {chakra.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Arcangel */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: currentTheme.colors.text }}
                    >
                      <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
                      Arcángel que Sentiste Presente
                    </label>
                    <select
                      value={reviewForm.arcangel || ''}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, arcangel: e.target.value }))}
                      className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: currentTheme.colors.cardBg,
                        borderColor: currentTheme.colors.borderColor,
                        color: currentTheme.colors.text
                      }}
                    >
                      <option value="">Seleccionar Arcángel (Opcional)</option>
                      {arcangeles.map(arcangel => (
                        <option key={arcangel} value={arcangel}>
                          {arcangel}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Manifestation Success */}
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewForm.manifestationSuccess || false}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, manifestationSuccess: e.target.checked }))}
                        className="mr-3 h-4 w-4"
                        style={{ accentColor: currentTheme.colors.accent }}
                      />
                      <span 
                        className="font-medium"
                        style={{ color: currentTheme.colors.text }}
                      >
                        ✨ Este producto me ayudó a manifestar mis deseos
                      </span>
                    </label>
                  </div>

                  {/* Divine Message */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: currentTheme.colors.text }}
                    >
                      <SparklesIcon className="h-4 w-4 inline mr-1" />
                      Mensaje que Recibiste (Opcional)
                    </label>
                    <input
                      type="text"
                      value={reviewForm.divineMessage || ''}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, divineMessage: e.target.value }))}
                      placeholder="Ej: El amor se multiplicará en tu vida"
                      className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: currentTheme.colors.cardBg,
                        borderColor: currentTheme.colors.borderColor,
                        color: currentTheme.colors.text
                      }}
                    />
                  </div>

                  {/* Transformation Story */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: currentTheme.colors.text }}
                    >
                      <HeartIcon className="h-4 w-4 inline mr-1" />
                      Historia de Transformación (Opcional)
                    </label>
                    <textarea
                      value={reviewForm.transformationStory || ''}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, transformationStory: e.target.value }))}
                      placeholder="Cuenta cómo tu vida cambió después de usar este producto..."
                      rows={3}
                      className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 resize-none"
                      style={{
                        backgroundColor: currentTheme.colors.cardBg,
                        borderColor: currentTheme.colors.borderColor,
                        color: currentTheme.colors.text
                      }}
                    />
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={submitReview}
                  className="flex-1 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: currentTheme.colors.accent,
                    color: 'white'
                  }}
                >
                  {angelicalMode ? '✨ Compartir Testimonio' : 'Publicar Reseña'}
                </button>
                <button
                  onClick={() => setShowWriteReview(false)}
                  className="px-6 py-3 rounded-lg font-semibold transition-all"
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
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedAndFilteredReviews.length > 0 ? (
          sortedAndFilteredReviews.map(review => (
            <div 
              key={review.id}
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: currentTheme.colors.cardBg,
                borderColor: currentTheme.colors.borderColor
              }}
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: currentTheme.colors.accent }}
                  >
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span 
                        className="font-semibold mr-2"
                        style={{ color: currentTheme.colors.text }}
                      >
                        {review.userName}
                      </span>
                      {review.verified && (
                        <CheckBadgeIcon 
                          className="h-4 w-4"
                          style={{ color: currentTheme.colors.accent }}
                        />
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="flex mr-3">
                        {[1, 2, 3, 4, 5].map(star => (
                          <StarSolidIcon
                            key={star}
                            className="h-4 w-4"
                            style={{
                              color: star <= review.rating 
                                ? currentTheme.colors.accent 
                                : currentTheme.colors.borderColor
                            }}
                          />
                        ))}
                      </div>
                      {angelicalMode && review.spiritualRating && (
                        <div className="flex items-center mr-3">
                          <SparklesIcon 
                            className="h-3 w-3 mr-1"
                            style={{ color: currentTheme.colors.accent }}
                          />
                          <span 
                            className="text-sm font-medium"
                            style={{ color: currentTheme.colors.accent }}
                          >
                            {review.spiritualRating}/10
                          </span>
                        </div>
                      )}
                      <span 
                        className="text-sm"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        <CalendarIcon className="h-3 w-3 inline mr-1" />
                        {review.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Title */}
              <h4 
                className="font-semibold text-lg mb-3"
                style={{ color: currentTheme.colors.text }}
              >
                {review.title}
              </h4>

              {/* Review Content */}
              <p 
                className="mb-4 leading-relaxed"
                style={{ color: currentTheme.colors.text }}
              >
                {review.content}
              </p>

              {/* Angelical Experience */}
              {angelicalMode && review.angelicalExperience && (
                <div 
                  className="p-4 rounded-lg border-l-4 mb-4"
                  style={{
                    backgroundColor: `${currentTheme.colors.accent}08`,
                    borderLeftColor: currentTheme.colors.accent
                  }}
                >
                  <h5 
                    className="font-semibold mb-3 flex items-center"
                    style={{ color: currentTheme.colors.accent }}
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Experiencia Espiritual
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Energy Level */}
                    <div>
                      <span 
                        className="text-sm font-medium block mb-1"
                        style={{ color: currentTheme.colors.text }}
                      >
                        Nivel de Energía:
                      </span>
                      <div className="flex items-center">
                        <div 
                          className="flex-1 h-2 rounded-full mr-2"
                          style={{ backgroundColor: currentTheme.colors.borderColor }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: currentTheme.colors.accent,
                              width: `${review.angelicalExperience.energyLevel * 10}%`
                            }}
                          />
                        </div>
                        <span 
                          className="text-sm font-medium"
                          style={{ color: currentTheme.colors.accent }}
                        >
                          {review.angelicalExperience.energyLevel}/10
                        </span>
                      </div>
                    </div>

                    {/* Manifestation */}
                    {review.angelicalExperience.manifestationSuccess && (
                      <div className="flex items-center">
                        <CheckBadgeIcon 
                          className="h-5 w-5 mr-2"
                          style={{ color: '#10b981' }}
                        />
                        <span 
                          className="text-sm font-medium"
                          style={{ color: '#10b981' }}
                        >
                          Manifestación Exitosa ✨
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Chakras */}
                  {review.angelicalExperience.chakraAlignment.length > 0 && (
                    <div className="mb-4">
                      <span 
                        className="text-sm font-medium block mb-2"
                        style={{ color: currentTheme.colors.text }}
                      >
                        Chakras Alineados:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {review.angelicalExperience.chakraAlignment.map(chakraId => {
                          const chakra = chakras.find(c => c.id === chakraId)
                          return chakra ? (
                            <span
                              key={chakraId}
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: chakra.color }}
                            >
                              {chakra.name}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {/* Arcangel */}
                  {review.angelicalExperience.arcangel && (
                    <div className="mb-4 flex items-center">
                      <ShieldCheckIcon 
                        className="h-4 w-4 mr-2"
                        style={{ color: currentTheme.colors.accent }}
                      />
                      <span 
                        className="text-sm"
                        style={{ color: currentTheme.colors.text }}
                      >
                        Presencia del Arcángel <strong>{review.angelicalExperience.arcangel}</strong>
                      </span>
                    </div>
                  )}

                  {/* Divine Message */}
                  {review.angelicalExperience.divineMessage && (
                    <div 
                      className="p-3 rounded bg-gradient-to-r from-purple-100 to-pink-100 italic text-center"
                      style={{
                        background: `linear-gradient(to right, ${currentTheme.colors.accent}10, ${currentTheme.colors.accent}20)`
                      }}
                    >
                      <p 
                        className="text-sm font-medium"
                        style={{ color: currentTheme.colors.accent }}
                      >
                        "✨ {review.angelicalExperience.divineMessage} ✨"
                      </p>
                    </div>
                  )}

                  {/* Transformation Story */}
                  {review.angelicalExperience.transformationStory && (
                    <div className="mt-4">
                      <h6 
                        className="font-medium mb-2 flex items-center"
                        style={{ color: currentTheme.colors.text }}
                      >
                        <HeartIcon className="h-4 w-4 mr-2" />
                        Historia de Transformación:
                      </h6>
                      <p 
                        className="text-sm italic"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        {review.angelicalExperience.transformationStory}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: currentTheme.colors.borderColor }}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => markHelpful(review.id, true)}
                    className="flex items-center text-sm hover:opacity-75 transition-opacity"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    <HandThumbUpIcon className="h-4 w-4 mr-1" />
                    Útil ({review.helpfulCount})
                  </button>
                  
                  <button
                    className="flex items-center text-sm hover:opacity-75 transition-opacity"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    <FlagIcon className="h-4 w-4 mr-1" />
                    Reportar
                  </button>
                </div>

                {review.verified && (
                  <div className="flex items-center">
                    <CheckBadgeIcon 
                      className="h-4 w-4 mr-1"
                      style={{ color: currentTheme.colors.accent }}
                    />
                    <span 
                      className="text-xs font-medium"
                      style={{ color: currentTheme.colors.accent }}
                    >
                      Compra Verificada
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <StarIcon 
              className="h-16 w-16 mx-auto mb-4 opacity-50"
              style={{ color: currentTheme.colors.textSecondary }}
            />
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: currentTheme.colors.text }}
            >
              {angelicalMode ? 'Aún no hay testimonios celestiales' : 'No hay reseñas aún'}
            </h3>
            <p 
              className="mb-6"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {angelicalMode 
                ? 'Sé el primero en compartir tu experiencia espiritual con este producto bendecido'
                : 'Sé el primero en escribir una reseña de este producto'
              }
            </p>
            {canWrite && (
              <button
                onClick={() => setShowWriteReview(true)}
                className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: currentTheme.colors.accent,
                  color: 'white'
                }}
              >
                {angelicalMode ? '✨ Compartir Mi Testimonio' : 'Escribir Primera Reseña'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}