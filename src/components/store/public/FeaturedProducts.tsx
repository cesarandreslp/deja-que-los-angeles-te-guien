// Featured Products Section - Showcase popular products
'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/store'
import { useTheme } from '@/context/ThemeContext'
import ProductCard from './ProductCard'
import { ChevronLeftIcon, ChevronRightIcon, FireIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface FeaturedProductsProps {
  title?: string
  subtitle?: string
  products?: Product[]
  showViewAll?: boolean
  className?: string
}

export default function FeaturedProducts({
  title = "Productos Destacados",
  subtitle = "Los más populares de nuestra tienda espiritual",
  products = [],
  showViewAll = true,
  className
}: FeaturedProductsProps) {
  const { theme } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  
  // Mock data for demo (replace with real API call)
  useEffect(() => {
    if (products.length > 0) {
      setFeaturedProducts(products)
    } else {
      // Mock featured products
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Cristal de Cuarzo Rosa - Amor y Sanación',
          description: 'Piedra del amor incondicional y la sanación emocional. Perfecta para meditación.',
          priceCents: 2500,
          currency: 'USD',
          stock: 15,
          category: 'crystals',
          imageUrls: ['/oraculo/productos/cuarzo-rosa.jpg'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Vela Aromática de Lavanda - Relajación',
          description: 'Vela artesanal con aceites esenciales de lavanda para la paz interior.',
          priceCents: 1800,
          currency: 'USD',
          stock: 23,
          category: 'candles',
          imageUrls: ['/oraculo/productos/vela-lavanda.jpg'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Aceite Esencial de Sándalo - Conexión Espiritual',
          description: 'Aceite puro de sándalo para elevar la vibración y conectar con lo divino.',
          priceCents: 4200,
          currency: 'USD',
          stock: 8,
          category: 'oils',
          imageUrls: ['/oraculo/productos/aceite-sandalo.jpg'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Incienso Natural de Copal - Limpieza Energética',
          description: 'Resina sagrada de copal para limpiar y purificar espacios energéticamente.',
          priceCents: 1200,
          currency: 'USD',
          stock: 35,
          category: 'incense',
          imageUrls: ['/oraculo/productos/incienso-copal.jpg'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Libro: "Caminos de Luz" - Guía Espiritual',
          description: 'Manual completo para el despertar espiritual y la conexión angelical.',
          priceCents: 3500,
          currency: 'USD',
          stock: 12,
          category: 'books',
          imageUrls: ['/oraculo/productos/libro-caminos.jpg'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '6',
          name: 'Collar de Amatista - Protección Espiritual',
          description: 'Joya energética con amatista genuina para protección y claridad mental.',
          priceCents: 5800,
          currency: 'USD',
          stock: 6,
          category: 'jewelry',
          imageUrls: ['/oraculo/productos/collar-amatista.jpg'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setFeaturedProducts(mockProducts)
    }
  }, [products])
  
  const itemsPerView = 4
  const maxIndex = Math.max(0, featuredProducts.length - itemsPerView)
  
  const nextProducts = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex))
  }
  
  const prevProducts = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }
  
  return (
    <section className={`py-16 ${theme.background} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FireIcon className={`h-8 w-8 ${theme.accent} mr-2`} />
            <h2 className={`text-3xl lg:text-4xl font-bold ${theme.text}`}>
              {title}
            </h2>
          </div>
          <p className={`text-lg ${theme.textSecondary} max-w-2xl mx-auto`}>
            {subtitle}
          </p>
        </div>
        
        {/* Products Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {featuredProducts.length > itemsPerView && (
            <>
              <button
                onClick={prevProducts}
                disabled={currentIndex === 0}
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full ${theme.card} shadow-lg ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'} transition-all`}
              >
                <ChevronLeftIcon className={`h-6 w-6 ${theme.text}`} />
              </button>
              
              <button
                onClick={nextProducts}
                disabled={currentIndex === maxIndex}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full ${theme.card} shadow-lg ${currentIndex === maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'} transition-all`}
              >
                <ChevronRightIcon className={`h-6 w-6 ${theme.text}`} />
              </button>
            </>
          )}
          
          {/* Products Grid */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {featuredProducts.map(product => (
                <div key={product.id} className="w-1/4 flex-shrink-0 px-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Dots Indicator */}
          {featuredProducts.length > itemsPerView && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? theme.accent : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* View All Button */}
        {showViewAll && (
          <div className="text-center mt-12">
            <Link
              href="/tienda/productos"
              className={`inline-flex items-center px-8 py-3 border-2 ${theme.border} ${theme.text} font-semibold rounded-lg hover:${theme.secondary} transition-colors`}
            >
              Ver Todos los Productos
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}