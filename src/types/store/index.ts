// Types for the Angelical Store - Comprehensive TypeScript definitions
// Following Shopify-like architecture with spiritual branding

// Product-related types
export interface Product {
  id: string
  name: string
  description: string
  priceCents: number
  currency: string
  stock: number
  category: ProductCategory
  imageUrls: string[]
  isActive: boolean
  tags?: string[]
  createdAt: string
  updatedAt: string
  // Shopify-like additional fields
  handle?: string // URL-friendly slug
  vendor?: string // Brand or vendor
  productType?: string // Additional categorization
  metaTitle?: string
  metaDescription?: string
  weight?: number
  dimensions?: ProductDimensions
  _count?: {
    OrderItem: number
  }
}

export interface ProductDimensions {
  length: number
  width: number
  height: number
  unit: 'cm' | 'in'
}

export enum ProductCategory {
  CLOTHING = 'CLOTHING',
  JEWELRY = 'JEWELRY', 
  ESSENCES = 'ESSENCES',
  OILS = 'OILS',
  RITUALS = 'RITUALS',
  ACCESSORIES = 'ACCESSORIES'
}

export const categoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.CLOTHING]: 'Ropa Angelical',
  [ProductCategory.JEWELRY]: 'Joyería Espiritual',
  [ProductCategory.ESSENCES]: 'Esencias Sagradas',
  [ProductCategory.OILS]: 'Aceites Místicos',
  [ProductCategory.RITUALS]: 'Rituales Mágicos',
  [ProductCategory.ACCESSORIES]: 'Accesorios Celestiales'
}

// Cart-related types
export interface CartItem {
  id?: string
  productId: string
  product?: Product
  quantity: number
  priceCents?: number
}

export interface Cart {
  id?: string
  userId?: string
  items: CartItem[]
  totalItems: number
  totalPrice: number
  currency: string
  createdAt?: string
  updatedAt?: string
}

// Order-related types
export interface Order {
  id: string
  userId: string
  subtotalCents: number
  taxCents: number
  shippingCents: number
  totalCents: number
  taxRate: number
  currency: string
  status: OrderStatus
  paymentProvider?: PaymentProvider
  paymentStatus: PaymentStatus
  paymentId?: string
  shippingAddress?: string
  shippingPhone?: string
  shippingNotes?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    fullName: string
    email: string
  }
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  priceCents: number
  taxRate: number
  taxCents: number
  subtotalCents: number
  totalCents: number
  product?: Product
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  MERCADOPAGO = 'MERCADOPAGO'
}

// Customer-related types (for admin)
export interface Customer {
  id: string
  fullName: string
  email: string
  phone?: string
  country?: string
  isActive: boolean
  createdAt: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
}

// Store analytics types
export interface StoreAnalytics {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  topProducts: Array<{
    product: Product
    totalSold: number
    revenue: number
  }>
  recentOrders: Order[]
  monthlyRevenue: Array<{
    month: string
    revenue: number
    orders: number
  }>
}

// Filter and search types
export interface ProductFilters {
  category?: ProductCategory | 'all'
  priceRange?: {
    min: number
    max: number
  }
  inStock?: boolean
  search?: string
  sortBy?: ProductSortOption
  sortOrder?: 'asc' | 'desc'
}

export enum ProductSortOption {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  STOCK = 'stock',
  POPULARITY = 'popularity'
}

// Pagination types
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

// Form types for admin
export interface ProductFormData {
  name: string
  description: string
  priceCents: number
  currency: string
  stock: number
  category: ProductCategory
  imageUrls: string[]
  isActive: boolean
  tags?: string[]
  handle?: string
  vendor?: string
  productType?: string
  metaTitle?: string
  metaDescription?: string
  weight?: number
  dimensions?: ProductDimensions
}

export interface OrderUpdateData {
  status?: OrderStatus
  shippingAddress?: string
  shippingPhone?: string
  shippingNotes?: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Store configuration types
export interface StoreConfig {
  id: string
  taxEnabled: boolean
  defaultTaxRate: number
  taxName: string
  shippingEnabled: boolean
  freeShippingThreshold: number
  standardShippingCents: number
  currency: string
  createdAt: string
  updatedAt: string
}

// Checkout calculation types
export interface CheckoutCalculation {
  subtotalCents: number
  taxCents: number
  shippingCents: number
  totalCents: number
  taxRate: number
  currency: string
}

// Checkout types
export interface CheckoutData {
  items: CartItem[]
  totalAmount: number
  currency: string
  paymentProvider: PaymentProvider
  shippingAddress: ShippingAddress
  customerInfo: CustomerInfo
}

export interface ShippingAddress {
  fullName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export interface CustomerInfo {
  email: string
  fullName: string
  phone?: string
}

// Search and recommendations
export interface SearchResult {
  products: Product[]
  suggestions: string[]
  total: number
}

export interface ProductRecommendation {
  product: Product
  reason: 'related' | 'popular' | 'recent' | 'category'
  score: number
}