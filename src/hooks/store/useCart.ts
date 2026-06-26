// Custom hook for cart management - Shopify-like functionality
// Spiritual branding with professional e-commerce features

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Cart, CartItem, Product } from '@/types/store'

const CART_STORAGE_KEY = 'angelical_cart'

interface UseCartReturn {
  cart: Cart
  isLoading: boolean
  error: string | null
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getItemQuantity: (productId: string) => number
  isInCart: (productId: string) => boolean
  syncWithServer: () => Promise<void>
}

export function useCart(): UseCartReturn {
  const { data: session } = useSession()
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    currency: 'COP'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate cart totals
  const calculateTotals = useCallback((items: CartItem[]): { totalItems: number; totalPrice: number } => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => {
      const price = item.priceCents || item.product?.priceCents || 0
      return sum + (price * item.quantity)
    }, 0)
    
    return { totalItems, totalPrice }
  }, [])

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsedCart: Cart = JSON.parse(savedCart)
        const totals = calculateTotals(parsedCart.items)
        setCart({
          ...parsedCart,
          ...totals
        })
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      setError('Error al cargar el carrito')
    }
  }, [calculateTotals])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [cart])

  // Sync with server when user logs in
  useEffect(() => {
    if (session?.user && cart.items.length > 0) {
      syncWithServer()
    }
  }, [session?.user])

  // Add item to cart
  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)

      // Check stock availability
      if (product.stock < quantity) {
        throw new Error(`Solo hay ${product.stock} unidades disponibles`)
      }

      setCart(prevCart => {
        const existingItemIndex = prevCart.items.findIndex(item => item.productId === product.id)
        let newItems: CartItem[]

        if (existingItemIndex >= 0) {
          // Update existing item
          const existingItem = prevCart.items[existingItemIndex]
          const newQuantity = existingItem.quantity + quantity

          // Check total quantity against stock
          if (newQuantity > product.stock) {
            throw new Error(`No puedes agregar más de ${product.stock} unidades`)
          }

          newItems = [...prevCart.items]
          newItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity
          }
        } else {
          // Add new item
          const newItem: CartItem = {
            productId: product.id,
            product,
            quantity,
            priceCents: product.priceCents
          }
          newItems = [...prevCart.items, newItem]
        }

        const totals = calculateTotals(newItems)
        return {
          ...prevCart,
          items: newItems,
          ...totals
        }
      })

      // Show success message (could be handled by a toast notification)
      console.log(`${product.name} agregado al carrito celestial`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al agregar al carrito'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [calculateTotals])

  // Remove item from cart
  const removeFromCart = useCallback(async (productId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      setCart(prevCart => {
        const newItems = prevCart.items.filter(item => item.productId !== productId)
        const totals = calculateTotals(newItems)
        
        return {
          ...prevCart,
          items: newItems,
          ...totals
        }
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar del carrito'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [calculateTotals])

  // Update item quantity
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      setIsLoading(true)
      setError(null)

      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      setCart(prevCart => {
        const itemIndex = prevCart.items.findIndex(item => item.productId === productId)
        if (itemIndex === -1) return prevCart

        const item = prevCart.items[itemIndex]
        const product = item.product

        // Check stock availability
        if (product && quantity > product.stock) {
          throw new Error(`Solo hay ${product.stock} unidades disponibles`)
        }

        const newItems = [...prevCart.items]
        newItems[itemIndex] = {
          ...item,
          quantity
        }

        const totals = calculateTotals(newItems)
        return {
          ...prevCart,
          items: newItems,
          ...totals
        }
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar cantidad'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [calculateTotals, removeFromCart])

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      setCart({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        currency: 'COP'
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al limpiar carrito'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get quantity of specific item in cart
  const getItemQuantity = useCallback((productId: string): number => {
    const item = cart.items.find(item => item.productId === productId)
    return item?.quantity || 0
  }, [cart.items])

  // Check if product is in cart
  const isInCart = useCallback((productId: string): boolean => {
    return cart.items.some(item => item.productId === productId)
  }, [cart.items])

  // Sync cart with server (for logged-in users)
  const syncWithServer = useCallback(async () => {
    if (!session?.user || cart.items.length === 0) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Error al sincronizar carrito')
      }

      const data = await response.json()
      if (data.success) {
        // Update cart with server response if needed
        console.log('Carrito sincronizado con el servidor celestial')
      }

    } catch (error) {
      console.error('Error syncing cart:', error)
      // Don't set error state for sync failures to avoid disrupting UX
    } finally {
      setIsLoading(false)
    }
  }, [session?.user, cart.items])

  return {
    cart,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    syncWithServer
  }
}