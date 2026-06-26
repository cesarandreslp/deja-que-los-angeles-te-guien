// Context de carrito de compras - FASE 4
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, CartItem } from '@/types/store'

interface CartContextType {
  cartItems: CartItem[]
  totalItems: number
  totalPrice: number
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | null>(null)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Hidratación del carrito desde localStorage
  useEffect(() => {
    setIsHydrated(true)
    try {
      const savedCart = localStorage.getItem('angelical-cart')
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }, [])
  
  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('angelical-cart', JSON.stringify(cartItems))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [cartItems, isHydrated])
  
  // Calcular totales
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)
  
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity)
  }, 0)
  
  // Agregar producto al carrito
  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id)
      
      if (existingItem) {
        // Actualizar cantidad si ya existe
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Agregar nuevo item
        return [...prevItems, {
          id: `cart-${product.id}-${Date.now()}`,
          product,
          quantity,
          addedAt: new Date().toISOString()
        }]
      }
    })
  }
  
  // Remover producto del carrito
  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.product.id !== productId)
    )
  }
  
  // Actualizar cantidad de un producto
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }
  
  // Limpiar carrito
  const clearCart = () => {
    setCartItems([])
  }
  
  // Verificar si un producto está en el carrito
  const isInCart = (productId: string): boolean => {
    return cartItems.some(item => item.product.id === productId)
  }
  
  // Obtener cantidad de un producto en el carrito
  const getItemQuantity = (productId: string): number => {
    const item = cartItems.find(item => item.product.id === productId)
    return item ? item.quantity : 0
  }
  
  const value: CartContextType = {
    cartItems,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  }
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}