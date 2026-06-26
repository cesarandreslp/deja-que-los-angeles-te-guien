// Product Card Component - FASE 6 Integración Temática Angelical
'use client'

import { Product } from '@/types/store'
import { useTheme } from '@/context/ThemeContext'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  StarIcon,
  SparklesIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { formatCurrency } from '@/app/api/store/config'

interface ProductCardProps {
  product: Product
  showQuickActions?: boolean
  viewMode?: 'grid' | 'list'
  angelicalMode?: boolean
  className?: string
}

export default function ProductCard({ 
  product, 
  showQuickActions = true, 
  viewMode = 'grid',
  angelicalMode = false,
  className 
}: ProductCardProps) {
  const { currentTheme } = useTheme()
  const { addToCart } = useCart()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    
    try {
      await addToCart(product, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }
  
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock <= 5 && product.stock > 0

  // Función para obtener mensaje angelical del producto
  const getAngelicalMessage = () => {
    const messages = [
      '✨ Bendecido por el Arcángel Miguel',
      '🕊️ Energía de sanación celestial',
      '💖 Amor divino incluido',
      '🌟 Protección angelical garantizada',
      '🙏 Aprobado por los ángeles'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const angelicalMessage = angelicalMode ? getAngelicalMessage() : null
  
  // Renderizado para vista de lista
  if (viewMode === 'list') {
    return (
      <Link href={`/tienda/productos/${product.id}`}>
        <div 
          className={`group flex rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
          style={{ backgroundColor: currentTheme.colors.cardBg }}
        >
          {/* Product Image */}
          <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden">
            <Image
              src={product.imageUrls?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 space-y-1">
              {angelicalMode && (
                <span 
                  className="px-2 py-1 text-xs font-semibold rounded flex items-center"
                  style={{ 
                    backgroundColor: `${currentTheme.colors.accent}20`,
                    color: currentTheme.colors.accent
                  }}
                >
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  Bendecido
                </span>
              )}
              {isOutOfStock && (
                <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                  {angelicalMode ? 'Bendición agotada' : 'Agotado'}
                </span>
              )}
              {isLowStock && !isOutOfStock && (
                <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-semibold rounded">
                  {angelicalMode ? 'Últimas bendiciones' : 'Últimas unidades'}
                </span>
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              {/* Category and Rating */}
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="text-xs uppercase tracking-wide"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {angelicalMode ? `✨ ${product.category}` : product.category}
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className={`h-3 w-3 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span 
                    className="text-xs ml-1"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    4.0
                  </span>
                </div>
              </div>
              
              {/* Product Name */}
              <h3 
                className="font-semibold text-lg mb-2 transition-colors"
                style={{ color: currentTheme.colors.text }}
              >
                {product.name}
              </h3>
              
              {/* Description */}
              <p 
                className="text-sm mb-3 line-clamp-3"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {product.description}
              </p>

              {/* Mensaje angelical */}
              {angelicalMode && angelicalMessage && (
                <div 
                  className="flex items-center mb-3 p-2 rounded text-xs"
                  style={{ 
                    backgroundColor: `${currentTheme.colors.accent}15`,
                    color: currentTheme.colors.accent
                  }}
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  {angelicalMessage}
                </div>
              )}
            </div>
            
            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span 
                  className="font-bold text-xl"
                  style={{ color: currentTheme.colors.text }}
                >
                  {formatCurrency(product.priceCents, product.currency)}
                </span>
                <span 
                  className="text-sm"
                  style={{ color: isLowStock ? '#f59e0b' : currentTheme.colors.textSecondary }}
                >
                  {angelicalMode 
                    ? `${product.stock} bendiciones disponibles`
                    : `${product.stock} en stock`
                  }
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                {showQuickActions && (
                  <button
                    onClick={toggleFavorite}
                    className="p-2 rounded-full border transition-all hover:scale-105"
                    style={{
                      borderColor: currentTheme.colors.borderColor,
                      backgroundColor: currentTheme.colors.background
                    }}
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon 
                        className="h-5 w-5" 
                        style={{ color: currentTheme.colors.textSecondary }}
                      />
                    )}
                  </button>
                )}
                
                {!isOutOfStock && (
                  <button
                    onClick={handleAddToCart}
                    disabled={isLoading}
                    className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{
                      backgroundColor: currentTheme.colors.accent,
                      color: 'white'
                    }}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                    )}
                    {angelicalMode ? 'Bendecir mi carrito' : 'Agregar al carrito'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Renderizado para vista de grid (default)
  return (
    <Link href={`/tienda/productos/${product.id}`}>
      <div 
        className={`group relative rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.imageUrls?.[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {angelicalMode && (
              <span 
                className="px-2 py-1 text-xs font-semibold rounded flex items-center"
                style={{ 
                  backgroundColor: `${currentTheme.colors.accent}20`,
                  color: currentTheme.colors.accent
                }}
              >
                <SparklesIcon className="h-3 w-3 mr-1" />
                Bendecido
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                {angelicalMode ? 'Bendición agotada' : 'Agotado'}
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-semibold rounded">
                {angelicalMode ? 'Últimas bendiciones' : 'Últimas unidades'}
              </span>
            )}
          </div>
          
          {/* Quick Actions */}
          {showQuickActions && (
            <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={toggleFavorite}
                className="p-2 rounded-full shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: currentTheme.colors.background }}
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-4 w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
          )}
          
          {/* Quick Add to Cart */}
          {showQuickActions && !isOutOfStock && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`p-2 rounded-full text-white shadow-md hover:shadow-lg transition-all ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: currentTheme.colors.accent }}
              >
                <ShoppingCartIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <div className="flex items-center justify-between mb-2">
            <span 
              className="text-xs uppercase tracking-wide"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {angelicalMode ? `✨ ${product.category}` : product.category}
            </span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarSolidIcon
                  key={i}
                  className={`h-3 w-3 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              <span 
                className="text-xs ml-1"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                4.0
              </span>
            </div>
          </div>
          
          {/* Product Name */}
          <h3 
            className="font-semibold text-sm mb-2 line-clamp-2 transition-colors"
            style={{ color: currentTheme.colors.text }}
          >
            {product.name}
          </h3>
          
          {/* Description */}
          <p 
            className="text-xs mb-3 line-clamp-2"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {product.description}
          </p>

          {/* Mensaje angelical */}
          {angelicalMode && angelicalMessage && (
            <div 
              className="flex items-center mb-3 p-2 rounded text-xs"
              style={{ 
                backgroundColor: `${currentTheme.colors.accent}15`,
                color: currentTheme.colors.accent
              }}
            >
              <ShieldCheckIcon className="h-3 w-3 mr-1" />
              {angelicalMessage}
            </div>
          )}
          
          {/* Price and Stock */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span 
                className="font-bold text-lg"
                style={{ color: currentTheme.colors.text }}
              >
                {formatCurrency(product.priceCents, product.currency)}
              </span>
              <span 
                className="text-xs"
                style={{ color: isLowStock ? '#f59e0b' : currentTheme.colors.textSecondary }}
              >
                {angelicalMode 
                  ? `${product.stock} bendiciones disponibles`
                  : `${product.stock} en stock`
                }
              </span>
            </div>
            
            {/* Add to Cart Button (Desktop) */}
            {!isOutOfStock && (
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`hidden sm:flex items-center px-3 py-1.5 text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ backgroundColor: currentTheme.colors.accent }}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                ) : (
                  <ShoppingCartIcon className="h-3 w-3 mr-1" />
                )}
                {angelicalMode ? 'Bendecir' : 'Agregar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}