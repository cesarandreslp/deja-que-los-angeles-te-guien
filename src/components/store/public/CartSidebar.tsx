// Componente de carrito lateral - FASE 4
'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useTheme } from '@/context/ThemeContext'
import { formatCurrency } from '@/app/api/store/config'
import Link from 'next/link'
import Image from 'next/image'
import {
  XMarkIcon,
  ShoppingBagIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart()
  const { currentTheme } = useTheme()
  const [isClearing, setIsClearing] = useState(false)
  
  const handleClearCart = async () => {
    setIsClearing(true)
    setTimeout(() => {
      clearCart()
      setIsClearing(false)
    }, 500)
  }
  
  const spiritualMessages = [
    "Los ángeles bendicen tu elección ✨",
    "Que la luz divina acompañe tu compra 🕊️",
    "Tu alma ha elegido el camino correcto 💫",
    "Los arcángeles celebran tu decisión 🌟"
  ]
  
  const randomMessage = spiritualMessages[Math.floor(Math.random() * spiritualMessages.length)]
  
  if (!isOpen) return null
  
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: currentTheme.colors.borderColor }}
        >
          <div className="flex items-center">
            <ShoppingBagIcon 
              className="h-6 w-6 mr-3"
              style={{ color: currentTheme.colors.accent }}
            />
            <h2 
              className="text-xl font-bold"
              style={{ color: currentTheme.colors.text }}
            >
              Tu Carrito Sagrado
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon 
              className="h-6 w-6"
              style={{ color: currentTheme.colors.textSecondary }}
            />
          </button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingBagIcon 
                className="h-16 w-16 mb-4 opacity-30"
                style={{ color: currentTheme.colors.textSecondary }}
              />
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Tu carrito está vacío
              </h3>
              <p 
                className="mb-6"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Descubre nuestros productos espirituales y deja que los ángeles guíen tu elección
              </p>
              <Link
                href="/tienda"
                onClick={onClose}
                className="px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: currentTheme.colors.accent,
                  color: 'white'
                }}
              >
                Explorar Tienda
              </Link>
            </div>
          ) : (
            <>
              {/* Spiritual Message */}
              <div 
                className="mb-6 p-4 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: `${currentTheme.colors.accent}15`,
                  borderLeftColor: currentTheme.colors.accent
                }}
              >
                <div className="flex items-center mb-2">
                  <SparklesIcon 
                    className="h-5 w-5 mr-2"
                    style={{ color: currentTheme.colors.accent }}
                  />
                  <span 
                    className="font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Mensaje Angelical
                  </span>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {randomMessage}
                </p>
              </div>
              
              {/* Items List */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: currentTheme.colors.cardBg,
                      borderColor: currentTheme.colors.borderColor
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div 
                            className="w-15 h-15 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: currentTheme.colors.background }}
                          >
                            <SparklesIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-medium truncate mb-1"
                          style={{ color: currentTheme.colors.text }}
                        >
                          {item.product.name}
                        </h4>
                        
                        <p 
                          className="text-sm mb-2"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          {formatCurrency(item.product.price)}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            
                            <span 
                              className="w-8 text-center font-medium"
                              style={{ color: currentTheme.colors.text }}
                            >
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Item Total */}
                    <div className="mt-3 pt-3 border-t flex justify-between items-center"
                         style={{ borderColor: currentTheme.colors.borderColor }}
                    >
                      <span 
                        className="text-sm"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        Subtotal:
                      </span>
                      <span 
                        className="font-semibold"
                        style={{ color: currentTheme.colors.text }}
                      >
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Clear Cart Button */}
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="w-full mb-4 px-4 py-2 text-sm border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                {isClearing ? 'Limpiando...' : 'Limpiar Carrito'}
              </button>
            </>
          )}
        </div>
        
        {/* Footer */}
        {cartItems.length > 0 && (
          <div 
            className="p-6 border-t"
            style={{ borderColor: currentTheme.colors.borderColor }}
          >
            {/* Total */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <HeartIcon 
                  className="h-5 w-5 mr-2"
                  style={{ color: currentTheme.colors.accent }}
                />
                <span 
                  className="text-lg font-semibold"
                  style={{ color: currentTheme.colors.text }}
                >
                  Total:
                </span>
              </div>
              <span 
                className="text-xl font-bold"
                style={{ color: currentTheme.colors.accent }}
              >
                {formatCurrency(totalPrice)}
              </span>
            </div>
            
            {/* Items Count */}
            <p 
              className="text-sm mb-4 text-center"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {totalItems} producto{totalItems !== 1 ? 's' : ''} en tu carrito sagrado
            </p>
            
            {/* Checkout Button */}
            <Link
              href="/tienda/checkout"
              onClick={onClose}
              className="w-full block text-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              style={{
                backgroundColor: currentTheme.colors.accent,
                color: 'white'
              }}
            >
              Proceder al Checkout Sagrado
            </Link>
            
            {/* Continue Shopping */}
            <Link
              href="/tienda"
              onClick={onClose}
              className="w-full block text-center px-6 py-2 mt-3 rounded-lg border transition-colors"
              style={{
                borderColor: currentTheme.colors.borderColor,
                color: currentTheme.colors.textSecondary
              }}
            >
              Continuar Comprando
            </Link>
          </div>
        )}
      </div>
    </>
  )
}