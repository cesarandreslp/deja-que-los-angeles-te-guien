// Hero Banner Component - Shopify-style promotional banner
'use client'

import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBagIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline'

interface HeroBannerProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string
  className?: string
}

export default function HeroBanner({
  title = "Bienvenido a la Tienda Angélica",
  subtitle = "Descubre productos espirituales auténticos para tu crecimiento personal",
  ctaText = "Explorar Productos",
  ctaLink = "/tienda/productos",
  backgroundImage = "/oraculo/angel-hero.jpg",
  className
}: HeroBannerProps) {
  const { theme } = useTheme()
  
  return (
    <div className={`relative overflow-hidden ${theme.primary} ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Tienda Angélica"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="flex items-center mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme.accent} text-white`}>
              <SparklesIcon className="h-4 w-4 mr-1" />
              Nueva Colección
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            {title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed">
            {subtitle}
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center text-white">
              <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <span>Productos Auténticos</span>
            </div>
            <div className="flex items-center text-white">
              <ShoppingBagIcon className="h-5 w-5 text-green-400 mr-2" />
              <span>Envío Gratis +$50</span>
            </div>
            <div className="flex items-center text-white">
              <SparklesIcon className="h-5 w-5 text-purple-400 mr-2" />
              <span>Garantía Espiritual</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={ctaLink}
              className={`inline-flex items-center justify-center px-8 py-4 ${theme.accent} text-white font-semibold rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg`}
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              {ctaText}
            </Link>
            
            <Link
              href="/tienda/categorias"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all"
            >
              Ver Categorías
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 text-white/20">
        <SparklesIcon className="h-24 w-24" />
      </div>
      <div className="absolute bottom-10 right-20 text-white/10">
        <StarIcon className="h-16 w-16" />
      </div>
    </div>
  )
}