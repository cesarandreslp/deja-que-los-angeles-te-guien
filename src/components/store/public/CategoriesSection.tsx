// Categories Section - Display product categories
'use client'

import { useTheme } from '@/context/ThemeContext'
import Link from 'next/link'
import Image from 'next/image'
import { 
  SparklesIcon, 
  FireIcon, 
  BeakerIcon, 
  BookOpenIcon,
  GemIcon,
  HeartIcon 
} from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
  description: string
  imageUrl: string
  productCount: number
  icon: React.ReactNode
  href: string
}

interface CategoriesSectionProps {
  title?: string
  subtitle?: string
  className?: string
}

export default function CategoriesSection({
  title = "Explora Nuestras Categorías",
  subtitle = "Encuentra productos espirituales para cada momento de tu camino",
  className
}: CategoriesSectionProps) {
  const { theme } = useTheme()
  
  const categories: Category[] = [
    {
      id: 'crystals',
      name: 'Cristales',
      description: 'Piedras preciosas para sanación y equilibrio energético',
      imageUrl: '/oraculo/categorias/cristales.jpg',
      productCount: 45,
      icon: <GemIcon className="h-8 w-8" />,
      href: '/tienda/categorias/cristales'
    },
    {
      id: 'candles',
      name: 'Velas',
      description: 'Velas aromáticas y rituales para crear ambientes sagrados',
      imageUrl: '/oraculo/categorias/velas.jpg',
      productCount: 32,
      icon: <FireIcon className="h-8 w-8" />,
      href: '/tienda/categorias/velas'
    },
    {
      id: 'incense',
      name: 'Inciensos',
      description: 'Fragancias naturales para purificación y meditación',
      imageUrl: '/oraculo/categorias/inciensos.jpg',
      productCount: 28,
      icon: <SparklesIcon className="h-8 w-8" />,
      href: '/tienda/categorias/inciensos'
    },
    {
      id: 'oils',
      name: 'Aceites',
      description: 'Aceites esenciales puros para aromaterapia espiritual',
      imageUrl: '/oraculo/categorias/aceites.jpg',
      productCount: 24,
      icon: <BeakerIcon className="h-8 w-8" />,
      href: '/tienda/categorias/aceites'
    },
    {
      id: 'books',
      name: 'Libros',
      description: 'Guías espirituales y textos sagrados para el conocimiento',
      imageUrl: '/oraculo/categorias/libros.jpg',
      productCount: 18,
      icon: <BookOpenIcon className="h-8 w-8" />,
      href: '/tienda/categorias/libros'
    },
    {
      id: 'jewelry',
      name: 'Joyería',
      description: 'Amuletos y joyas energéticas para protección diaria',
      imageUrl: '/oraculo/categorias/joyeria.jpg',
      productCount: 15,
      icon: <HeartIcon className="h-8 w-8" />,
      href: '/tienda/categorias/joyeria'
    }
  ]
  
  return (
    <section className={`py-16 ${theme.secondary} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`text-3xl lg:text-4xl font-bold ${theme.text} mb-4`}>
            {title}
          </h2>
          <p className={`text-lg ${theme.textSecondary} max-w-3xl mx-auto`}>
            {subtitle}
          </p>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <Link
              key={category.id}
              href={category.href}
              className="group block"
            >
              <div className={`relative overflow-hidden rounded-xl ${theme.card} shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1`}>
                {/* Category Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Icon Overlay */}
                  <div className={`absolute top-4 right-4 p-3 rounded-full ${theme.accent} text-white opacity-90`}>
                    {category.icon}
                  </div>
                </div>
                
                {/* Category Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-xl font-bold ${theme.text} group-hover:${theme.accent} transition-colors`}>
                      {category.name}
                    </h3>
                    <span className={`text-sm ${theme.textSecondary} bg-gray-100 px-2 py-1 rounded-full`}>
                      {category.productCount} productos
                    </span>
                  </div>
                  
                  <p className={`${theme.textSecondary} text-sm leading-relaxed`}>
                    {category.description}
                  </p>
                  
                  {/* View Category Link */}
                  <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-800 transition-colors">
                    Explorar categoría
                    <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className={`inline-block p-6 rounded-lg ${theme.background} shadow-inner`}>
            <p className={`${theme.text} text-lg mb-4`}>
              ¿No encuentras lo que buscas?
            </p>
            <Link
              href="/tienda/contacto"
              className={`inline-flex items-center px-6 py-3 ${theme.accent} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`}
            >
              Contáctanos para Ayuda Personalizada
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}