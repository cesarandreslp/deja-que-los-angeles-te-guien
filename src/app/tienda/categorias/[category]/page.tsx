// Página de Productos por Categoría - COMPLETAMENTE ARREGLADA
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Product } from '@/types/store'
import { useTheme } from '@/context/ThemeContext'
import StoreLayout from '@/components/store/public/StoreLayout'
import ProductGrid from '@/components/store/public/ProductGrid'
import Link from 'next/link'
import { ChevronRightIcon, TagIcon, StarIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const categoryInfo = {
  crystals: {
    name: 'Cristales Angelicales',
    description: 'Piedras preciosas y cristales curativos bendecidos para equilibrar tu energía y elevar tu vibración espiritual celestial.',
    icon: '💎',
    color: 'from-blue-500 to-purple-600',
    arcangel: 'Miguel',
    benefits: [
      '✨ Equilibrio energético divino',
      '🛡️ Protección espiritual celestial',
      '🧠 Claridad mental angelical',
      '💜 Sanación emocional profunda'
    ]
  },
  candles: {
    name: 'Velas Rituales',
    description: 'Velas aromáticas y rituales sagradas para crear ambientes celestiales y potenciar tus intenciones divinas.',
    icon: '🕯️',
    color: 'from-orange-500 to-red-500',
    arcangel: 'Gabriel',
    benefits: [
      '🔥 Purificación del espacio sagrado',
      '🧘 Meditación profunda celestial',
      '🌟 Manifestación de deseos divinos',
      '😌 Relajación total angelical'
    ]
  },
  incense: {
    name: 'Inciensos Sagrados',
    description: 'Fragancias naturales y sagradas para limpiar energías negativas y elevar la consciencia hacia lo divino.',
    icon: '🌟',
    color: 'from-purple-500 to-pink-500',
    arcangel: 'Rafael',
    benefits: [
      '💨 Limpieza energética celestial',
      '🙏 Conexión espiritual divina',
      '🧘‍♀️ Estados meditativos profundos',
      '☮️ Paz interior angelical'
    ]
  },
  oils: {
    name: 'Aceites Esenciales',
    description: 'Aceites esenciales puros y bendecidos para aromaterapia, sanación angelical y rituales espirituales.',
    icon: '🫧',
    color: 'from-green-500 to-teal-500',
    arcangel: 'Uriel',
    benefits: [
      '🌿 Aromaterapia sanadora celestial',
      '💚 Bienestar emocional divino',
      '🌙 Relajación profunda angelical',
      '⚡ Vitalidad renovada espiritual'
    ]
  },
  books: {
    name: 'Libros Espirituales',
    description: 'Guías espirituales, textos sagrados y manuales de crecimiento personal para tu evolución angelical.',
    icon: '📚',
    color: 'from-yellow-500 to-orange-500',
    arcangel: 'Metatrón',
    benefits: [
      '📖 Conocimiento ancestral divino',
      '🗝️ Guía espiritual celestial',
      '🌱 Desarrollo personal angelical',
      '💡 Sabiduría eterna universal'
    ]
  },
  jewelry: {
    name: 'Joyería Angelical',
    description: 'Amuletos, talismanes y joyas energéticas bendecidas para protección divina y conexión espiritual.',
    icon: '💍',
    color: 'from-pink-500 to-rose-500',
    arcangel: 'Chamuel',
    benefits: [
      '🛡️ Protección personal divina',
      '💰 Atracción de abundancia celestial',
      '👼 Conexión con lo divino',
      '✨ Belleza espiritual angelical'
    ]
  }
}

export default function CategoryPage() {
  const params = useParams()
  const { currentTheme } = useTheme()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const categorySlug = params.category as string
  const category = categoryInfo[categorySlug as keyof typeof categoryInfo]
  
  useEffect(() => {
    if (categorySlug) {
      fetchCategoryProducts()
    }
  }, [categorySlug])
  
  const fetchCategoryProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/store/products?category=${categorySlug}&limit=50`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data || [])
        setTotalProducts(data.pagination?.total || data.data?.length || 0)
      } else {
        setError('Error al cargar los productos')
      }
    } catch (error) {
      console.error('Error fetching category products:', error)
      setError('Error de conexión al cargar productos')
    } finally {
      setLoading(false)
    }
  }
  
  if (!category) {
    return (
      <StoreLayout>
        <div 
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: currentTheme.colors.background }}
        >
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-8xl mb-6">😇</div>
            <h1 
              className="text-3xl font-bold mb-4"
              style={{ color: currentTheme.colors.text }}
            >
              Categoría Celestial No Encontrada
            </h1>
            <p 
              className="text-lg mb-8"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Esta categoría angelical no existe en nuestro reino espiritual
            </p>
            <Link
              href="/tienda/productos"
              className="inline-flex items-center px-8 py-4 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
              style={{ backgroundColor: currentTheme.colors.accent }}
            >
              ✨ Ver Todos los Productos Angelicales
            </Link>
          </div>
        </div>
      </StoreLayout>
    )
  }
  
  return (
    <StoreLayout>
      {/* Category Hero Section */}
      <section className={`relative bg-gradient-to-r ${category.color} text-white py-20`}>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8 opacity-90">
            <Link href="/tienda" className="hover:text-yellow-300 transition-colors">
              🏪 Tienda Angelical
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <Link href="/tienda/productos" className="hover:text-yellow-300 transition-colors">
              ✨ Productos
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-yellow-300 font-semibold">{category.name}</span>
          </nav>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <span className="text-7xl mr-6 drop-shadow-lg">{category.icon}</span>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold mb-3 drop-shadow-lg">
                    {category.name}
                  </h1>
                  <div className="flex items-center text-yellow-300 text-lg">
                    <TagIcon className="h-6 w-6 mr-2" />
                    <span className="font-semibold">{totalProducts} productos celestiales</span>
                  </div>
                </div>
              </div>
              
              <p className="text-xl leading-relaxed mb-8 opacity-95 font-medium">
                {category.description}
              </p>

              <div className="mb-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">👼</span>
                  <span className="font-bold text-lg">Bajo la protección del Arcángel {category.arcangel}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-4 shadow-lg"></div>
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-white/15 rounded-3xl backdrop-blur-md shadow-2xl"></div>
              <div className="relative p-10 text-center">
                <div className="text-9xl mb-6 drop-shadow-2xl">{category.icon}</div>
                <h3 className="text-3xl font-bold mb-4 drop-shadow-lg">Calidad Premium Celestial</h3>
                <p className="text-lg opacity-95 leading-relaxed">
                  Productos seleccionados cuidadosamente por nuestros maestros espirituales 
                  y bendecidos por la energía angelical
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="font-bold">4.9/5</span>
                  </div>
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-green-400 mr-1" />
                    <span className="font-bold">Garantía</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Category Stats */}
      <section 
        className="py-12 border-b"
        style={{ 
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: currentTheme.colors.textSecondary + '20'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: currentTheme.colors.background }}>
              <div 
                className="text-3xl font-bold mb-2"
                style={{ color: currentTheme.colors.accent }}
              >
                {totalProducts}+
              </div>
              <div 
                className="text-sm font-medium"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Productos Celestiales
              </div>
            </div>
            <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: currentTheme.colors.background }}>
              <div 
                className="text-3xl font-bold mb-2"
                style={{ color: currentTheme.colors.accent }}
              >
                4.9⭐
              </div>
              <div 
                className="text-sm font-medium"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Calificación Divina
              </div>
            </div>
            <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: currentTheme.colors.background }}>
              <div 
                className="text-3xl font-bold mb-2"
                style={{ color: currentTheme.colors.accent }}
              >
                3.2K+
              </div>
              <div 
                className="text-sm font-medium"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Reseñas Angelicales
              </div>
            </div>
            <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: currentTheme.colors.background }}>
              <div 
                className="text-3xl font-bold mb-2"
                style={{ color: currentTheme.colors.accent }}
              >
                24h
              </div>
              <div 
                className="text-sm font-medium"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Envío Express Celestial
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Products Section */}
      <section 
        className="py-16"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 
              className="text-4xl font-bold mb-4"
              style={{ color: currentTheme.colors.text }}
            >
              ✨ Explora Nuestros {category.name}
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Cada producto ha sido cuidadosamente seleccionado y energéticamente purificado
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div 
                className="animate-spin rounded-full h-16 w-16 border-b-4 mb-4"
                style={{ borderColor: currentTheme.colors.accent }}
              ></div>
              <p 
                className="text-lg font-medium"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                🌟 Cargando productos celestiales...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">😇</div>
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ color: currentTheme.colors.text }}
              >
                Error Celestial
              </h3>
              <p 
                className="text-lg mb-8"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {error}
              </p>
              <button
                onClick={fetchCategoryProducts}
                className="px-8 py-4 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: currentTheme.colors.accent }}
              >
                🔄 Reintentar Carga Angelical
              </button>
            </div>
          ) : (
            <ProductGrid
              category={categorySlug}
              initialProducts={products}
              showFilters={true}
            />
          )}
        </div>
      </section>
      
      {/* Category Features */}
      <section 
        className="py-20"
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold mb-6"
              style={{ color: currentTheme.colors.text }}
            >
              🌟 ¿Por qué elegir nuestros {category.name}?
            </h2>
            <p 
              className="text-xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Cada producto es seleccionado con amor infinito y conocimiento ancestral, 
              bendecido por la energía celestial para tu bienestar espiritual
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div 
              className="rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              style={{ backgroundColor: currentTheme.colors.background }}
            >
              <div className="text-6xl mb-6">🌟</div>
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ color: currentTheme.colors.text }}
              >
                Energía Pura Celestial
              </h3>
              <p 
                className="text-lg leading-relaxed"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Todos nuestros productos son limpiados energéticamente, cargados con 
                intenciones positivas y bendecidos antes del envío celestial
              </p>
            </div>
            
            <div 
              className="rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              style={{ backgroundColor: currentTheme.colors.background }}
            >
              <div className="text-6xl mb-6">✨</div>
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ color: currentTheme.colors.text }}
              >
                Autenticidad Divina Garantizada
              </h3>
              <p 
                className="text-lg leading-relaxed"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Certificamos la autenticidad, procedencia y pureza energética de cada 
                uno de nuestros productos espirituales con garantía celestial
              </p>
            </div>
            
            <div 
              className="rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              style={{ backgroundColor: currentTheme.colors.background }}
            >
              <div className="text-6xl mb-6">🙏</div>
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ color: currentTheme.colors.text }}
              >
                Propósito Espiritual Divino
              </h3>
              <p 
                className="text-lg leading-relaxed"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Cada producto viene con una guía completa de uso espiritual, 
                propósito angelical y rituales recomendados para maximizar su poder
              </p>
            </div>
          </div>

          {/* Additional Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <TruckIcon 
                className="h-12 w-12 mb-4"
                style={{ color: currentTheme.colors.accent }}
              />
              <h4 
                className="font-bold text-lg mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Envío Express Celestial
              </h4>
              <p style={{ color: currentTheme.colors.textSecondary }}>
                Entrega rápida y segura en 24-48 horas
              </p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheckIcon 
                className="h-12 w-12 mb-4"
                style={{ color: currentTheme.colors.accent }}
              />
              <h4 
                className="font-bold text-lg mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Garantía Divina
              </h4>
              <p style={{ color: currentTheme.colors.textSecondary }}>
                30 días de garantía celestial completa
              </p>
            </div>
            <div className="flex flex-col items-center">
              <StarIcon 
                className="h-12 w-12 mb-4"
                style={{ color: currentTheme.colors.accent }}
              />
              <h4 
                className="font-bold text-lg mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Calidad Premium
              </h4>
              <p style={{ color: currentTheme.colors.textSecondary }}>
                Solo los mejores productos espirituales
              </p>
            </div>
          </div>
        </div>
      </section>
    </StoreLayout>
  )
}