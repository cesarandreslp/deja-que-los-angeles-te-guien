'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/context/CartContext'
import { useTheme } from '@/context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  TruckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import GuestCheckoutPrompt from '@/components/store/checkout/GuestCheckoutPrompt'
import Link from 'next/link'
import Image from 'next/image'

interface ShippingInfo {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function CarritoCompras() {
  const { data: session } = useSession()
  const { currentTheme } = useTheme()
  const { 
    cartItems, 
    totalItems, 
    totalPrice, 
    updateQuantity: updateCartQuantity, 
    removeFromCart, 
    clearCart: clearCartItems 
  } = useCart()
  
  const [loading, setLoading] = useState(false)
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México'
  })
  const [paymentMethod, setPaymentMethod] = useState('MERCADOPAGO')
  const [notes, setNotes] = useState('')
  const [processingOrder, setProcessingOrder] = useState(false)

  const handleCheckout = () => {
    if (!session) {
      setShowGuestPrompt(true)
    } else {
      setShowCheckout(true)
    }
  }

  // Wrapper para actualizar cantidad con estado de loading
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setUpdatingItems(prev => new Set(prev).add(productId))
    updateCartQuantity(productId, newQuantity)
    // Remover del set después de un delay para mostrar feedback visual
    setTimeout(() => {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }, 300)
  }

  // Wrapper para remover producto con confirmación
  const handleRemoveItem = (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      return
    }
    setUpdatingItems(prev => new Set(prev).add(productId))
    removeFromCart(productId)
    setTimeout(() => {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }, 300)
  }

  // Wrapper para limpiar carrito con confirmación
  const handleClearCart = () => {
    if (!confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
      return
    }
    clearCartItems()
  }

  // Procesar orden (checkout)
  const processOrder = async () => {
    if (!session) {
      alert('Debes iniciar sesión para completar la compra')
      setShowCheckout(false)
      setShowGuestPrompt(true)
      return
    }

    if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
      alert('Por favor completa toda la información de envío')
      return
    }

    if (cartItems.length === 0) {
      alert('Tu carrito está vacío')
      return
    }

    setProcessingOrder(true)

    try {
      // Convertir items del carrito local al formato esperado por la API
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.priceCents || item.priceCents || 0
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: shippingInfo,
          paymentMethod,
          notes
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert('¡Orden creada exitosamente! Te contactaremos pronto para el pago.')
        setShowCheckout(false)
        clearCartItems() // Limpiar carrito local
      } else {
        const error = await response.json()
        alert(error.error || 'Error al procesar la orden')
      }
    } catch (error) {
      console.error('Error al procesar orden:', error)
      alert('Error al procesar la orden')
    } finally {
      setProcessingOrder(false)
    }
  }

  // Formatear precio para mostrar
  const formattedTotal = `$${totalPrice.toFixed(2)}`

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-xl">Cargando carrito...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🛒 Mi Carrito Angelical
          </h1>
          <p className="text-xl text-blue-200">
            {totalItems} productos • Total: {formattedTotal}
          </p>
        </motion.div>

        {/* Carrito vacío */}
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <ShoppingCartIcon className="h-24 w-24 text-white/50 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-gray-300 mb-6">
              Descubre nuestros productos angelicales y agrega algunos a tu carrito
            </p>
            <a
              href="/tienda"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            >
              Explorar Tienda
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items del carrito */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Productos ({totalItems})
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Vaciar Carrito
                  </button>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-xl p-4 flex items-center gap-4"
                    >
                      {/* Imagen del producto */}
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product?.imageUrls && item.product.imageUrls.length > 0 ? (
                          <img
                            src={item.product.imageUrls[0]}
                            alt={item.product?.name || 'Producto'}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-white text-lg">✨</span>
                        )}
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{item.product?.name || 'Producto'}</h3>
                        <p className="text-gray-300 text-sm">
                          {item.product?.category || 'Producto Espiritual'}
                        </p>
                        <p className="text-blue-200 font-semibold">
                          ${((item.product?.priceCents || item.priceCents || 0) / 100).toFixed(2)} c/u
                        </p>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => item.id && handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={!item.id || updatingItems.has(item.id) || item.quantity <= 1}
                          className="p-1 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 transition-colors"
                        >
                          <MinusIcon className="h-4 w-4 text-white" />
                        </button>
                        
                        <span className="text-white font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => item.id && handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={!item.id || updatingItems.has(item.id)}
                          className="p-1 bg-white/10 rounded-full hover:bg-white/20 disabled:opacity-50 transition-colors"
                        >
                          <PlusIcon className="h-4 w-4 text-white" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="text-white font-bold">
                          ${(((item.product?.priceCents || item.priceCents || 0) * item.quantity) / 100).toFixed(2)}
                        </p>
                        <button
                          onClick={() => item.id && handleRemoveItem(item.id)}
                          disabled={!item.id || updatingItems.has(item.id)}
                          className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen y checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-white mb-6">Resumen</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal ({totalItems} productos)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Envío</span>
                    <span>Calculado en checkout</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 flex justify-between text-white font-bold text-xl">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <CreditCardIcon className="h-5 w-5" />
                  Proceder al Checkout
                </button>

                <a
                  href="/tienda"
                  className="block w-full text-center text-blue-200 hover:text-white mt-4 transition-colors"
                >
                  ← Continuar Comprando
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Checkout */}
        <AnimatePresence>
          {showCheckout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCheckout(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">Checkout</h2>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Información de envío */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <TruckIcon className="h-5 w-5" />
                    Información de Envío
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Dirección completa"
                      value={shippingInfo.street}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="text"
                      placeholder="Ciudad"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="text"
                      placeholder="Estado"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="text"
                      placeholder="Código Postal"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                {/* Método de pago */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Método de Pago</h3>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="MERCADOPAGO" className="bg-gray-800">MercadoPago</option>
                    <option value="STRIPE" className="bg-gray-800">Stripe</option>
                    <option value="PAYPAL" className="bg-gray-800">PayPal</option>
                  </select>
                </div>

                {/* Notas */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Notas Adicionales</h3>
                  <textarea
                    placeholder="Instrucciones especiales para tu pedido..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>

                {/* Resumen final */}
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-white font-bold text-xl">
                    <span>Total a Pagar:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={processOrder}
                    disabled={processingOrder}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    {processingOrder ? 'Procesando...' : 'Confirmar Pedido'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest Checkout Prompt */}
        <GuestCheckoutPrompt
          isOpen={showGuestPrompt}
          onClose={() => setShowGuestPrompt(false)}
          cartItemsCount={totalItems}
          totalAmount={`$${totalPrice.toFixed(2)}`}
        />
      </div>
    </div>
  )
}