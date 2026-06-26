// Individual Product Page - COMPLETAMENTE ARREGLADA
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { useCart } from '@/hooks/store/useCart'
import { Product } from '@/types/store'
import StoreLayout from '@/components/store/public/StoreLayout'
import ProductCard from '@/components/store/public/ProductCard'
import Image from 'next/image'
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  ShareIcon,
  StarIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  SparklesIcon,
  BoltIcon,
  GiftIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { formatCurrency } from '@/app/api/store/config'
import Link from 'next/link'

export default function ProductPage() {
  const params = useParams()
  const { currentTheme } = useTheme()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/store/products/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setProduct(data.product)
        setRelatedProducts(data.relatedProducts || [])
      } else {
        setError('Producto no encontrado')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product || addingToCart) return
    
    try {
      setAddingToCart(true)
      await addToCart(product, quantity)
      // Show success message - could add toast notification here
    } catch (error) {
      console.error('Error adding to cart:', error)
      setError('Error al agregar al carrito')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <StoreLayout>
        <div className="min-h-screen flex items-center justify-center" 
             style={{ backgroundColor: currentTheme.colors.background }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" 
                 style={{ borderColor: currentTheme.colors.accent }}></div>
            <p className="mt-4" style={{ color: currentTheme.colors.textSecondary }}>
              ✨ Cargando producto angelical...
            </p>
          </div>
        </div>
      </StoreLayout>
    )
  }

  if (error || !product) {
    return (
      <StoreLayout>
        <div className="min-h-screen flex items-center justify-center" 
             style={{ backgroundColor: currentTheme.colors.background }}>
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">😇</div>
            <h1 className="text-2xl font-bold mb-2" 
                style={{ color: currentTheme.colors.text }}>
              Producto No Encontrado
            </h1>
            <p className="mb-6" style={{ color: currentTheme.colors.textSecondary }}>
              {error || 'Este producto angelical no está disponible en este momento'}
            </p>
            <Link 
              href="/tienda/productos" 
              className="inline-block px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
              style={{ 
                backgroundColor: currentTheme.colors.accent,
                color: 'white'
              }}
            >
              🏪 Ver Todos los Productos
            </Link>
          </div>
        </div>
      </StoreLayout>
    )
  }

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock <= 5 && product.stock > 0

  return (
    <StoreLayout>
      <div className="min-h-screen py-8" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Angelical */}
          <nav className="flex items-center space-x-2 mb-8 p-4 rounded-lg shadow-sm" 
               style={{ backgroundColor: currentTheme.colors.cardBg }}>
            <Link 
              href="/tienda" 
              className="transition-colors duration-200 hover:opacity-80"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              🏪 Tienda
            </Link>
            <span style={{ color: currentTheme.colors.textSecondary }}>✨</span>
            <Link 
              href="/tienda/productos" 
              className="transition-colors duration-200 hover:opacity-80"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              🛍️ Productos
            </Link>
            <span style={{ color: currentTheme.colors.textSecondary }}>✨</span>
            <span className="font-medium" style={{ color: currentTheme.colors.text }}>
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images Angelical */}
            <div className="space-y-4">
              {/* Main Image with Divine Frame */}
              <div className="aspect-square overflow-hidden rounded-2xl shadow-2xl relative group" 
                   style={{ backgroundColor: currentTheme.colors.cardBg }}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 rounded-2xl z-10"></div>
                <Image
                  src={product.imageUrls?.[selectedImage] || '/placeholder-product.jpg'}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail Images with Celestial Selection */}
              {product.imageUrls && product.imageUrls.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105"
                      style={{
                        borderColor: selectedImage === index 
                          ? currentTheme.colors.accent 
                          : 'transparent',
                        boxShadow: selectedImage === index 
                          ? `0 0 0 1px ${currentTheme.colors.accent}` 
                          : 'none'
                      }}
                    >
                      <Image
                        src={url}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Angelical */}
            <div className="space-y-6">
              {/* Category with Arcangel Protection */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span 
                    className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg"
                    style={{ backgroundColor: currentTheme.colors.accent }}
                  >
                    ✨ {product.category}
                  </span>
                  <div className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                    Protegido por Arcángel Miguel
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                    style={{ backgroundColor: currentTheme.colors.cardBg }}
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6" style={{ color: currentTheme.colors.textSecondary }} />
                    )}
                  </button>
                  <button 
                    className="p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
                    style={{ backgroundColor: currentTheme.colors.cardBg }}
                  >
                    <ShareIcon className="h-6 w-6" style={{ color: currentTheme.colors.textSecondary }} />
                  </button>
                </div>
              </div>

              {/* Product Name with Divine Energy */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>
                  {product.name}
                </h1>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  🌟 Producto bendecido con energía angelical
                </p>
              </div>

              {/* Celestial Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="font-semibold" style={{ color: currentTheme.colors.text }}>
                  4.0
                </span>
                <span style={{ color: currentTheme.colors.textSecondary }}>
                  (127 experiencias angelicales)
                </span>
              </div>

              {/* Divine Pricing */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl font-bold" style={{ color: currentTheme.colors.text }}>
                    {formatCurrency(product.priceCents, product.currency)}
                  </div>
                  <div className="text-sm px-2 py-1 rounded-full" 
                       style={{ 
                         backgroundColor: currentTheme.colors.accent + '20',
                         color: currentTheme.colors.accent 
                       }}>
                    💫 Precio Divino
                  </div>
                </div>
                <div className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  ✨ Bendecido por los arcángeles • Envío angelical gratuito en pedidos superiores a $50
                </div>
              </div>

              {/* Divine Stock Status */}
              <div className="p-4 rounded-lg shadow-sm" style={{ backgroundColor: currentTheme.colors.cardBg }}>
                {isOutOfStock ? (
                  <div className="flex items-center text-red-600">
                    <span className="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                    <span className="font-medium">😇 Temporalmente en el reino celestial</span>
                  </div>
                ) : isLowStock ? (
                  <div className="flex items-center text-yellow-600">
                    <span className="w-3 h-3 bg-yellow-600 rounded-full mr-2 animate-pulse"></span>
                    <span className="font-medium">⚡ Solo quedan {product.stock} bendiciones angelicales</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <CheckIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">✅ Disponible en el santuario ({product.stock} unidades bendecidas)</span>
                  </div>
                )}
              </div>

              {/* Divine Quantity Selector */}
              {!isOutOfStock && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold" style={{ color: currentTheme.colors.text }}>
                      ✨ Cantidad Angelical:
                    </span>
                    <div className="flex items-center rounded-lg shadow-lg" 
                         style={{ backgroundColor: currentTheme.colors.cardBg }}>
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="px-4 py-2 rounded-l-lg font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          color: currentTheme.colors.text,
                          backgroundColor: quantity <= 1 ? currentTheme.colors.cardBg : 'transparent'
                        }}
                      >
                        ➖
                      </button>
                      <span className="px-6 py-2 font-bold min-w-[4rem] text-center text-lg"
                            style={{ color: currentTheme.colors.text }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="px-4 py-2 rounded-r-lg font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          color: currentTheme.colors.text,
                          backgroundColor: quantity >= product.stock ? currentTheme.colors.cardBg : 'transparent'
                        }}
                      >
                        ➕
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Angelical Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full flex items-center justify-center px-8 py-4 font-bold rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: currentTheme.colors.accent,
                      color: 'white'
                    }}
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    {addingToCart ? '🙏 Bendiciendo...' : '🛒 Agregar al Carrito Angelical'}
                  </button>
                </div>
              )}

              {/* Angelical Features */}
              <div className="space-y-3 p-4 rounded-lg" 
                   style={{ backgroundColor: currentTheme.colors.cardBg }}>
                <h3 className="font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
                  🌟 Beneficios Angelicales
                </h3>
                <div className="flex items-center space-x-3">
                  <TruckIcon className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
                  <span className="text-sm" style={{ color: currentTheme.colors.text }}>
                    🚚 Envío angelical gratuito en pedidos superiores a $50
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
                  <span className="text-sm" style={{ color: currentTheme.colors.text }}>
                    🛡️ Garantía divina de autenticidad y calidad celestial
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
                  <span className="text-sm" style={{ color: currentTheme.colors.text }}>
                    ⚡ Productos consagrados y cargados con energía angelical
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">😇</span>
                  <span className="text-sm" style={{ color: currentTheme.colors.text }}>
                    Bendecido por Arcángel Miguel para tu protección espiritual
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Angelical Product Details Tabs */}
          <div className="mb-16">
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: currentTheme.colors.cardBg }}>
              <nav className="flex space-x-1 mb-6 p-1 rounded-lg" 
                   style={{ backgroundColor: currentTheme.colors.background }}>
                {[
                  { id: 'description', label: '📖 Descripción Angelical', icon: '📖' },
                  { id: 'properties', label: '✨ Propiedades Místicas', icon: '✨' },
                  { id: 'care', label: '🛡️ Cuidados Sagrados', icon: '🛡️' },
                  { id: 'reviews', label: '💫 Experiencias (127)', icon: '💫' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 py-3 px-4 font-medium text-sm rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: activeTab === tab.id 
                        ? currentTheme.colors.accent 
                        : 'transparent',
                      color: activeTab === tab.id 
                        ? 'white' 
                        : currentTheme.colors.textSecondary,
                      borderColor: activeTab === tab.id 
                        ? currentTheme.colors.accent 
                        : 'transparent'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="py-8 px-6 rounded-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
              {activeTab === 'description' && (
                <div className="prose max-w-none" style={{ color: currentTheme.colors.text }}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    📖 <span className="ml-2">Descripción Angelical</span>
                  </h3>
                  <p className="text-lg leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <div className="p-4 rounded-lg mb-4" 
                       style={{ backgroundColor: currentTheme.colors.accent + '10' }}>
                    <p style={{ color: currentTheme.colors.text }}>
                      ✨ Este producto ha sido cuidadosamente seleccionado por nuestros expertos angelicales
                      para asegurar la más alta calidad energética y autenticidad divina. Cada pieza es única y bendecida,
                      puede variar ligeramente en color, forma y tamaño, lo que añade a su belleza celestial natural.
                    </p>
                  </div>
                  <div className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                    🙏 Bendecido con amor por Arcángel Miguel
                  </div>
                </div>
              )}

              {activeTab === 'properties' && (
                <div className="space-y-4" style={{ color: currentTheme.colors.text }}>
                  <h3 className="text-xl font-semibold flex items-center">
                    ✨ <span className="ml-2">Propiedades Místicas Angelicales</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                      <h4 className="font-semibold mb-2">🌟 Energías Divinas</h4>
                      <ul className="space-y-2 text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                        <li>• Equilibra las energías del ambiente sagrado</li>
                        <li>• Promueve la paz interior y la armonía celestial</li>
                        <li>• Amplifica las intenciones y oraciones positivas</li>
                        <li>• Protege contra energías negativas y sombras</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.background }}>
                      <h4 className="font-semibold mb-2">😇 Bendiciones Especiales</h4>
                      <ul className="space-y-2 text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                        <li>• Consagrado por rituales angelicales</li>
                        <li>• Cargado con energía de cristales sagrados</li>
                        <li>• Imbuido con esencias florales divinas</li>
                        <li>• Protegido por sello angelical</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="space-y-4" style={{ color: currentTheme.colors.text }}>
                  <h3 className="text-xl font-semibold flex items-center">
                    🛡️ <span className="ml-2">Cuidados Sagrados</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">✨ Cuidado Físico</h4>
                      <ul className="space-y-2 text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                        <li>• Limpiar suavemente con un paño bendecido y seco</li>
                        <li>• Evitar la exposición directa al sol prolongada</li>
                        <li>• Mantener alejado de químicos y perfumes</li>
                        <li>• Guardar en bolsa de terciopelo sagrado</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">🌙 Cuidado Energético</h4>
                      <ul className="space-y-2 text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                        <li>• Recarga energética bajo la luz lunar llena</li>
                        <li>• Limpieza con humo de salvia blanca</li>
                        <li>• Mantener en un altar o lugar sagrado</li>
                        <li>• Renovar bendiciones mensualmente</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center" 
                        style={{ color: currentTheme.colors.text }}>
                      💫 <span className="ml-2">Experiencias Angelicales</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-semibold" style={{ color: currentTheme.colors.text }}>
                        4.8 de 5
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      {
                        id: 1,
                        name: "María Elena ✨",
                        rating: 5,
                        comment: "Esta pieza angelical transformó completamente mi hogar. La energía divina se siente inmediatamente y ha traído una paz profunda a mi familia. ¡Bendiciones infinitas!",
                        date: "Hace 2 días",
                        verified: true
                      },
                      {
                        id: 2,
                        name: "Carlos Antonio 🙏",
                        rating: 5,
                        comment: "Increíble la calidad espiritual de este producto. Llegó perfectamente empacado con su certificado angelical. Mi altar nunca se había sentido tan sagrado.",
                        date: "Hace 1 semana",
                        verified: true
                      },
                      {
                        id: 3,
                        name: "Luz Esperanza 😇",
                        rating: 4,
                        comment: "Hermoso producto con una energía muy elevada. El proceso de purificación que incluye es excelente. Solo desearía que viniera con más instrucciones de cuidado angelical.",
                        date: "Hace 2 semanas",
                        verified: true
                      }
                    ].map((review) => (
                      <div key={review.id} 
                           className="p-6 rounded-lg shadow-lg" 
                           style={{ backgroundColor: currentTheme.colors.cardBg }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold" style={{ color: currentTheme.colors.text }}>
                                {review.name}
                              </h4>
                              {review.verified && (
                                <span className="text-xs px-2 py-1 rounded-full" 
                                      style={{ 
                                        backgroundColor: currentTheme.colors.accent + '20',
                                        color: currentTheme.colors.accent 
                                      }}>
                                  ✅ Verificado
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <StarSolidIcon 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                            {review.date}
                          </span>
                        </div>
                        <p style={{ color: currentTheme.colors.text }}>
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Angelical Products */}
          {relatedProducts.length > 0 && (
            <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: currentTheme.colors.cardBg }}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center" 
                    style={{ color: currentTheme.colors.text }}>
                  ✨ <span className="ml-2">Productos Angelicales Relacionados</span>
                </h2>
                <Link
                  href={`/tienda/categorias/${product.category}`}
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
                  style={{ 
                    backgroundColor: currentTheme.colors.accent,
                    color: 'white'
                  }}
                >
                  🔮 Ver Más Tesoros
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  )
}