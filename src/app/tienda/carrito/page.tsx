// Shopping Cart Page - COMPLETAMENTE ARREGLADO
'use client'

import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useCart } from '@/hooks/store/useCart'
import StoreLayout from '@/components/store/public/StoreLayout'
import OrderSummary from '@/components/store/public/OrderSummary'
import Image from 'next/image'
import Link from 'next/link'
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '@/app/api/store/config'

export default function CarritoPage() {
  const { currentTheme } = useTheme()
  const { cart, updateQuantity, removeFromCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setIsLoading(true)
    try {
      await updateQuantity(productId, newQuantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setIsLoading(true)
    try {
      await removeFromCart(productId)
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Usando las propiedades correctas del cart
  const totalItems = cart.items.length
  const totalPrice = cart.items.reduce((sum, item) => {
    if (!item.product) return sum
    return sum + (item.product.priceCents * item.quantity)
  }, 0)
  const shippingThreshold = 5000 // $50 in cents
  const isEligibleForFreeShipping = totalPrice >= shippingThreshold
  const amountForFreeShipping = Math.max(0, shippingThreshold - totalPrice)

  if (cart.items.length === 0) {
    return (
      <StoreLayout>
        <div 
          className="min-h-screen py-16"
          style={{ backgroundColor: currentTheme.colors.background }}
        >
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <ShoppingBagIcon 
                className="h-24 w-24 mx-auto mb-4"
                style={{ color: currentTheme.colors.textSecondary }}
              />
              <h1 
                className="text-3xl font-bold mb-4"
                style={{ color: currentTheme.colors.text }}
              >
                🌟 Tu Carrito Angelical está Vacío
              </h1>
              <p 
                className="text-lg mb-8"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Descubre nuestros productos espirituales y comienza tu viaje de transformación celestial
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                href="/tienda/productos"
                className="inline-flex items-center px-8 py-4 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: currentTheme.colors.accent }}
              >
                ✨ Explorar Productos Angelicales
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                {[
                  { name: 'Cristales', href: '/tienda/categorias/crystals', icon: '💎' },
                  { name: 'Velas', href: '/tienda/categorias/candles', icon: '🕯️' },
                  { name: 'Inciensos', href: '/tienda/categorias/incense', icon: '🌟' }
                ].map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="p-6 rounded-lg text-center hover:shadow-lg transition-all"
                    style={{ backgroundColor: currentTheme.colors.cardBg }}
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <div 
                      className="font-semibold"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {category.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </StoreLayout>
    )
  }

  return (
    <StoreLayout>
      <div 
        className="min-h-screen py-8"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: currentTheme.colors.text }}
            >
              🛒 Carrito Angelical de Compras
            </h1>
            <p style={{ color: currentTheme.colors.textSecondary }}>
              {totalItems} {totalItems === 1 ? 'producto celestial' : 'productos celestiales'} en tu carrito
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Shipping Banner */}
              {!isEligibleForFreeShipping && (
                <div 
                  className="p-4 rounded-lg border-l-4 border-green-500"
                  style={{ backgroundColor: currentTheme.colors.cardBg }}
                >
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-green-500 mr-2" />
                    <p 
                      className="text-sm"
                      style={{ color: currentTheme.colors.text }}
                    >
                      ✨ Agrega {formatCurrency(amountForFreeShipping)} más para obtener <strong>envío gratis angelical</strong>
                    </p>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (totalPrice / shippingThreshold) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {isEligibleForFreeShipping && (
                <div 
                  className="p-4 rounded-lg border-l-4 border-green-500"
                  style={{ backgroundColor: currentTheme.colors.cardBg }}
                >
                  <div className="flex items-center text-green-600">
                    <TruckIcon className="h-5 w-5 mr-2" />
                    <p className="font-semibold">🎉 ¡Felicitaciones! Tienes envío gratis angelical</p>
                  </div>
                </div>
              )}

              {/* Cart Items List */}
              <div className="space-y-4">
                {cart.items.filter(item => item.product).map((item) => (
                  <div 
                    key={item.id} 
                    className="p-6 rounded-lg shadow-lg"
                    style={{ backgroundColor: currentTheme.colors.cardBg }}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={item.product!.imageUrls?.[0] || '/placeholder-product.jpg'}
                            alt={item.product!.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/tienda/productos/${item.product!.id}`}
                          className="font-semibold hover:opacity-75 transition-colors"
                          style={{ color: currentTheme.colors.text }}
                        >
                          {item.product!.name}
                        </Link>
                        <p 
                          className="text-sm mt-1"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          Categoría: {item.product!.category}
                        </p>
                        <p 
                          className="font-bold mt-2"
                          style={{ color: currentTheme.colors.text }}
                        >
                          {formatCurrency(item.product!.priceCents, item.product!.currency)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.product!.id, item.quantity - 1)}
                          disabled={isLoading || item.quantity <= 1}
                          className="p-2 rounded-full hover:opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          style={{ 
                            backgroundColor: currentTheme.colors.accent + '20',
                            color: currentTheme.colors.text 
                          }}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        
                        <span 
                          className="font-bold text-xl min-w-[3rem] text-center px-2"
                          style={{ color: currentTheme.colors.text }}
                        >
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.product!.id, item.quantity + 1)}
                          disabled={isLoading || item.quantity >= (item.product!.stock || 999)}
                          className="p-2 rounded-full hover:opacity-75 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          style={{ 
                            backgroundColor: currentTheme.colors.accent + '20',
                            color: currentTheme.colors.text 
                          }}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p 
                          className="font-bold text-lg"
                          style={{ color: currentTheme.colors.text }}
                        >
                          {formatCurrency(item.product!.priceCents * item.quantity, item.product!.currency)}
                        </p>
                        {item.quantity > 1 && (
                          <p 
                            className="text-sm"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            {formatCurrency(item.product!.priceCents)} c/u
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.product!.id)}
                        disabled={isLoading}
                        className="p-2 hover:text-red-500 transition-colors disabled:opacity-50 rounded-full"
                        style={{ color: currentTheme.colors.textSecondary }}
                        title="Remover producto"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Stock Warning */}
                    {item.product!.stock && item.product!.stock < 5 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        ⚠️ <strong>Stock limitado:</strong> Solo quedan {item.product!.stock} unidades disponibles
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="pt-6">
                <Link
                  href="/tienda/productos"
                  className="inline-flex items-center hover:opacity-75 transition-colors"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  <ArrowRightIcon className="h-4 w-4 mr-2 rotate-180" />
                  ✨ Continuar comprando productos angelicales
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <OrderSummary 
                  items={cart.items}
                  showCheckoutButton={true}
                  onCheckout={() => window.location.href = '/tienda/checkout'}
                  isLoading={isLoading}
                />

                {/* Security Features */}
                <div 
                  className="p-4 rounded-lg space-y-3"
                  style={{ backgroundColor: currentTheme.colors.cardBg }}
                >
                  <div className="flex items-center text-sm">
                    <ShieldCheckIcon 
                      className="h-4 w-4 mr-2"
                      style={{ color: currentTheme.colors.textSecondary }}
                    />
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      🔐 Pago 100% seguro y protegido
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <TruckIcon 
                      className="h-4 w-4 mr-2"
                      style={{ color: currentTheme.colors.textSecondary }}
                    />
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      📦 Envío angelical en 2-5 días hábiles
                    </span>
                  </div>

                  {/* Payment Methods */}
                  <div className="pt-3 border-t" style={{ borderColor: currentTheme.colors.borderColor }}>
                    <p 
                      className="text-sm mb-3 font-semibold"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      💳 Métodos de pago celestiales:
                    </p>
                    <div className="flex space-x-2">
                      {[
                        { icon: '💳', name: 'Tarjetas' },
                        { icon: '🏦', name: 'Bancos' },
                        { icon: '📱', name: 'Digital' },
                        { icon: '💰', name: 'Efectivo' }
                      ].map((method, index) => (
                        <div 
                          key={index} 
                          className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
                          title={method.name}
                        >
                          {method.icon}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  )
}