// Store Homepage - FASE 6 Integración Temática Angelical
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Product } from '@/types/store'
import StoreLayout from '@/components/store/public/StoreLayout'
import ProductCard from '@/components/store/public/ProductCard'
import Link from 'next/link'
import Image from 'next/image'
import { 
  StarIcon, 
  ShoppingBagIcon, 
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/solid'
import { 
  ArrowRightIcon,
  GiftIcon,
  TruckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

export default function TiendaHomePage() {
  const { currentTheme } = useTheme()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/store/products?limit=8&sortBy=popularity')
      const data = await response.json()
      if (data.success) {
        setFeaturedProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <StoreLayout>
      {/* Hero Section Angelical */}
      <section 
        className="relative text-white overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${currentTheme.colors.accent} 0%, ${currentTheme.colors.accentSecondary} 100%)`
        }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 2px, transparent 2px), radial-gradient(circle at 80% 50%, #fff 2px, transparent 2px)',
            backgroundSize: '100px 100px'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-8 w-8 text-yellow-300" />
                  <span className="text-yellow-300 font-semibold text-lg tracking-wide">
                    Tienda Angelical Celestial
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Bendiciones
                  <span className="block text-yellow-300">Materializadas</span>
                </h1>
                <p className="text-xl text-white/90 max-w-md leading-relaxed">
                  Cada producto ha sido consagrado por los arcángeles y bendecido con energía celestial 
                  para acompañarte en tu camino de ascensión espiritual. ✨
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/tienda/productos"
                  className="inline-flex items-center px-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-lg"
                >
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  Explorar Bendiciones
                </Link>
                <Link
                  href="/tienda/productos?category=protection"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-gray-900 transition-all hover:scale-105 shadow-lg"
                >
                  🛡️ Protección Angelical
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
              
              {/* Stats Angelicales */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">888+</div>
                  <div className="text-sm text-white/80">Bendiciones</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">12.5K+</div>
                  <div className="text-sm text-white/80">Almas Iluminadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">5.0</div>
                  <div className="flex justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-yellow-300" />
                    ))}
                  </div>
                  <div className="text-xs text-white/80 mt-1">Aprobado por Ángeles</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image Angelical */}
            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/oraculo/tienda-hero.jpg"
                  alt="Productos Angelicales Bendecidos"
                  fill
                  className="object-cover"
                  priority
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, ${currentTheme.colors.accent}80 0%, transparent 50%)`
                  }}
                />
                {/* Partículas de luz angelical */}
                <div className="absolute inset-0">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
                      style={{
                        top: `${Math.random() * 80 + 10}%`,
                        left: `${Math.random() * 80 + 10}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Floating Cards Angelicales */}
              <div 
                className="absolute -top-4 -left-4 rounded-lg p-4 shadow-xl backdrop-blur-sm"
                style={{ backgroundColor: `${currentTheme.colors.cardBg}f0` }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${currentTheme.colors.accent}20` }}
                  >
                    <SparklesIcon 
                      className="h-6 w-6"
                      style={{ color: currentTheme.colors.accent }}
                    />
                  </div>
                  <div>
                    <div 
                      className="font-semibold"
                      style={{ color: currentTheme.colors.text }}
                    >
                      Energía Celestial
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      Consagrados por Arcángeles
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className="absolute -bottom-4 -right-4 rounded-lg p-4 shadow-xl backdrop-blur-sm"
                style={{ backgroundColor: `${currentTheme.colors.cardBg}f0` }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${currentTheme.colors.accent}20` }}
                  >
                    <ShieldCheckIcon 
                      className="h-6 w-6"
                      style={{ color: currentTheme.colors.accent }}
                    />
                  </div>
                  <div>
                    <div 
                      className="font-semibold"
                      style={{ color: currentTheme.colors.text }}
                    >
                      Protección Divina
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      Garantía Angelical 100%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating testimonial */}
              <div 
                className="absolute top-1/2 -right-8 transform -translate-y-1/2 rounded-lg p-3 shadow-xl backdrop-blur-sm max-w-xs"
                style={{ backgroundColor: `${currentTheme.colors.cardBg}f0` }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-3 w-3 text-yellow-400" />
                  ))}
                </div>
                <p 
                  className="text-xs italic"
                  style={{ color: currentTheme.colors.text }}
                >
                  "Los productos llegaron con una energía increíble. Mi vida cambió completamente." ✨
                </p>
                <p 
                  className="text-xs mt-1 font-semibold"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  - María, Cliente Angelical
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section Angelical */}
      <section 
        className="py-16"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon 
                className="h-8 w-8 mr-3"
                style={{ color: currentTheme.colors.accent }}
              />
              <h2 
                className="text-4xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                Categorías de Bendiciones
              </h2>
              <SparklesIcon 
                className="h-8 w-8 ml-3"
                style={{ color: currentTheme.colors.accent }}
              />
            </div>
            <p 
              className="text-lg max-w-3xl mx-auto"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Cada categoría ha sido bendecida por un arcángel diferente. 
              Permite que tu intuición te guíe hacia la energía que tu alma necesita. ✨
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { 
                name: 'Protección Angelical', 
                icon: '�️', 
                href: '/tienda/productos?category=protection',
                arcangel: 'San Miguel',
                description: 'Escudos celestiales'
              },
              { 
                name: 'Amor Divino', 
                icon: '�', 
                href: '/tienda/productos?category=love',
                arcangel: 'Chamuel',
                description: 'Energía del corazón'
              },
              { 
                name: 'Sanación Espiritual', 
                icon: '🕊️', 
                href: '/tienda/productos?category=healing',
                arcangel: 'Rafael',
                description: 'Medicina celestial'
              },
              { 
                name: 'Abundancia Celestial', 
                icon: '🌟', 
                href: '/tienda/productos?category=abundance',
                arcangel: 'Ariel',
                description: 'Prosperidad angelical'
              },
              { 
                name: 'Sabiduría Arcangélica', 
                icon: '📚', 
                href: '/tienda/productos?category=wisdom',
                arcangel: 'Uriel',
                description: 'Conocimiento divino'
              },
              { 
                name: 'Purificación', 
                icon: '�', 
                href: '/tienda/productos?category=energy',
                arcangel: 'Zadkiel',
                description: 'Limpieza energética'
              }
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 group border"
                style={{
                  backgroundColor: currentTheme.colors.cardBg,
                  borderColor: currentTheme.colors.borderColor
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${currentTheme.colors.accent}20` }}
                >
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 
                  className="font-semibold mb-1 transition-colors"
                  style={{ color: currentTheme.colors.text }}
                >
                  {category.name}
                </h3>
                <p 
                  className="text-xs mb-2"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {category.description}
                </p>
                <div 
                  className="text-xs font-medium"
                  style={{ color: currentTheme.colors.accent }}
                >
                  ✨ {category.arcangel}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section 
        className="py-16 border-t"
        style={{ 
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: currentTheme.colors.borderColor
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <TruckIcon className="h-8 w-8" />,
                title: 'Envío Angelical Gratuito',
                description: 'Los ángeles transportan tus pedidos con amor divino sin costo adicional en compras superiores a $50.000'
              },
              {
                icon: <ShieldCheckIcon className="h-8 w-8" />,
                title: 'Garantía Celestial',
                description: 'Si no sientes la energía angelical en 30 días, te devolvemos tu inversión espiritual completa'
              },
              {
                icon: <HeartIcon className="h-8 w-8" />,
                title: 'Bendición Personalizada',
                description: 'Cada producto es bendecido individualmente por nuestros mentores angelicales antes del envío'
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-lg border"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.borderColor
                }}
              >
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{ backgroundColor: `${currentTheme.colors.accent}20` }}
                >
                  <div style={{ color: currentTheme.colors.accent }}>
                    {benefit.icon}
                  </div>
                </div>
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  {benefit.title}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Angelicales */}
      <section 
        className="py-16"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-2">
                <StarIcon 
                  className="h-8 w-8 mr-2 text-yellow-400"
                />
                <h2 
                  className="text-3xl font-bold"
                  style={{ color: currentTheme.colors.text }}
                >
                  Bendiciones Más Solicitadas
                </h2>
              </div>
              <p style={{ color: currentTheme.colors.textSecondary }}>
                Los productos que más transforman vidas en nuestra comunidad angelical ✨
              </p>
            </div>
            <Link
              href="/tienda/productos"
              className="inline-flex items-center px-6 py-3 font-semibold rounded-lg hover:scale-105 transition-all shadow-lg"
              style={{
                backgroundColor: currentTheme.colors.accent,
                color: 'white'
              }}
            >
              Ver Todas las Bendiciones
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="rounded-lg p-4 animate-pulse"
                  style={{ backgroundColor: currentTheme.colors.cardBg }}
                >
                  <div 
                    className="aspect-square rounded-lg mb-4"
                    style={{ backgroundColor: currentTheme.colors.borderColor }}
                  />
                  <div 
                    className="h-4 rounded mb-2"
                    style={{ backgroundColor: currentTheme.colors.borderColor }}
                  />
                  <div 
                    className="h-3 rounded w-2/3"
                    style={{ backgroundColor: currentTheme.colors.borderColor }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  angelicalMode={true}
                />
              ))}
            </div>
          )}

          {/* Mensaje motivacional */}
          <div 
            className="mt-12 text-center p-8 rounded-lg border-l-4"
            style={{
              backgroundColor: `${currentTheme.colors.accent}15`,
              borderLeftColor: currentTheme.colors.accent
            }}
          >
            <SparklesIcon 
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: currentTheme.colors.accent }}
            />
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: currentTheme.colors.text }}
            >
              "Cada Compra es una Inversión en tu Ascensión Espiritual"
            </h3>
            <p 
              className="text-lg italic"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Los arcángeles bendicen cada transacción y acompañan cada producto con energía de amor incondicional. 
              Tu transformación comienza ahora. 🙏✨
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Angelicales */}
      <section 
        className="py-16"
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <HeartIcon 
                className="h-8 w-8 mr-3 text-pink-500"
              />
              <h2 
                className="text-3xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                Testimonios de Almas Transformadas
              </h2>
              <HeartIcon 
                className="h-8 w-8 ml-3 text-pink-500"
              />
            </div>
            <p 
              className="text-lg"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Historias reales de bendiciones recibidas a través de nuestros productos angelicales ✨
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "María de los Ángeles",
                text: "El cuarzo rosa cambió completamente mi energía amorosa. Siento la presencia de Chamuel todos los días. Mi vida se llenó de amor divino.",
                rating: 5,
                product: "🔮 Cuarzo Rosa Bendecido",
                transformation: "Encontró el amor verdadero"
              },
              {
                name: "Carlos Celestial",
                text: "La vela de protección de San Miguel me libró de energías negativas. Ahora vivo en paz total y mi abundancia fluyó naturalmente.",
                rating: 5,
                product: "🕯️ Vela Protección Angelical",
                transformation: "Liberación energética total"
              },
              {
                name: "Ana Serafín",
                text: "Los inciensos de purificación transformaron mi hogar en un templo. Mi familia vive en armonía y prosperidad angelical.",
                rating: 5,
                product: "🌿 Incienso Purificación",
                transformation: "Hogar lleno de bendiciones"
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="rounded-lg p-6 border shadow-lg hover:shadow-xl transition-all"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.borderColor
                }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                  <SparklesIcon className="h-4 w-4 ml-2 text-yellow-400" />
                </div>
                <p 
                  className="mb-4 italic text-lg leading-relaxed"
                  style={{ color: currentTheme.colors.text }}
                >
                  "{testimonial.text}"
                </p>
                <div 
                  className="p-3 rounded-lg mb-4"
                  style={{ backgroundColor: `${currentTheme.colors.accent}15` }}
                >
                  <div 
                    className="text-sm font-medium"
                    style={{ color: currentTheme.colors.accent }}
                  >
                    ✨ Transformación: {testimonial.transformation}
                  </div>
                </div>
                <div>
                  <div 
                    className="font-semibold"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {testimonial.name}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Bendecida con: {testimonial.product}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p 
              className="text-lg italic"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              "Cada testimonio es real. Cada transformación es posible. Tu momento angelical te espera." 🙏
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Angelical */}
      <section 
        className="py-16 text-white relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${currentTheme.colors.accent} 0%, ${currentTheme.colors.accentSecondary} 100%)`
        }}
      >
        {/* Partículas angelicales de fondo */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SparklesIcon className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-4xl font-bold mb-4">
            Conéctate con la Red Angelical
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Recibe mensajes celestiales, ofertas bendecidas y guía espiritual directamente 
            de los arcángeles en tu correo. Tu alma será nutrida semanalmente. ✨
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8">
            <input
              type="email"
              placeholder="Tu email bendecido aquí..."
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <button className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-lg">
              Recibir Bendiciones
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm opacity-90">
            <div className="flex items-center justify-center">
              <GiftIcon className="h-5 w-5 mr-2" />
              Ofertas Exclusivas Semanales
            </div>
            <div className="flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              Guía Espiritual Personalizada
            </div>
            <div className="flex items-center justify-center">
              <HeartIcon className="h-5 w-5 mr-2" />
              Mensajes de los Arcángeles
            </div>
          </div>
          
          <p className="text-xs mt-6 opacity-75">
            🔒 Tu energía personal está protegida. Solo enviamos amor y luz. Cancela cuando desees.
          </p>
        </div>
      </section>
    </StoreLayout>
  )
}