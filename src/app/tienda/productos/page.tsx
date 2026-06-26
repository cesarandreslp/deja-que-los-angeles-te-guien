// Products Listing Page - FASE 6 Integración Temática
'use client'

import StoreLayout from '@/components/store/public/StoreLayout'
import ProductGrid from '@/components/store/public/ProductGrid'
import { useTheme } from '@/context/ThemeContext'
import {
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

export default function ProductosPage() {
  const { currentTheme } = useTheme()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <StoreLayout>
      <div 
        className="min-h-screen py-8"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header angelical */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon 
                className="h-8 w-8 mr-3" 
                style={{ color: currentTheme.colors.accent }}
              />
              <h1 
                className="text-4xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                Productos Angelicales
              </h1>
              <SparklesIcon 
                className="h-8 w-8 ml-3" 
                style={{ color: currentTheme.colors.accent }}
              />
            </div>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Descubre nuestra completa colección de productos bendecidos por los arcángeles.
              Cada artículo está infundido con energía celestial para elevar tu espíritu. ✨
            </p>
          </div>

          {/* Barra de herramientas */}
          <div 
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 rounded-lg"
            style={{ backgroundColor: currentTheme.colors.cardBg }}
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-300 ${
                  showFilters ? 'ring-2' : ''
                }`}
                style={{
                  borderColor: showFilters ? currentTheme.colors.accent : currentTheme.colors.borderColor,
                  backgroundColor: showFilters ? `${currentTheme.colors.accent}15` : 'transparent',
                  color: currentTheme.colors.text,
                  outline: showFilters ? `2px solid ${currentTheme.colors.accent}` : 'none'
                }}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filtros
              </button>
              
              <span 
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Ordenar por abundancia angelical
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span 
                className="text-sm mr-3"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Vista:
              </span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: viewMode === 'grid' ? `${currentTheme.colors.accent}15` : 'transparent',
                  color: viewMode === 'grid' ? currentTheme.colors.accent : currentTheme.colors.text,
                  outline: viewMode === 'grid' ? `2px solid ${currentTheme.colors.accent}` : 'none'
                }}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: viewMode === 'list' ? `${currentTheme.colors.accent}15` : 'transparent',
                  color: viewMode === 'list' ? currentTheme.colors.accent : currentTheme.colors.text,
                  outline: viewMode === 'list' ? `2px solid ${currentTheme.colors.accent}` : 'none'
                }}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Product Grid with Angelical Filters */}
          <ProductGrid 
            showFilters={showFilters} 
            viewMode={viewMode}
            angelicalMode={true}
          />

          {/* Mensaje espiritual al final */}
          <div 
            className="mt-12 text-center p-6 rounded-lg border-l-4"
            style={{
              backgroundColor: `${currentTheme.colors.accent}15`,
              borderLeftColor: currentTheme.colors.accent
            }}
          >
            <p 
              className="text-lg italic"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              "Cada producto que elijas resonará con la frecuencia de tu alma.
              Los ángeles guían tu selección hacia lo que más necesita tu ser espiritual." 🙏✨
            </p>
          </div>
        </div>
      </div>
    </StoreLayout>
  )
}