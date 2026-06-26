// API utility functions for store operations
// Centralized database operations following Shopify patterns

import { PrismaClient } from '@prisma/client'
import { Product, ProductFilters, PaginatedResponse, OrderStatus, PaymentStatus } from '@/types/store'

const prisma = new PrismaClient()

// Product operations
export class ProductService {
  static async getProducts(filters: ProductFilters = {}, page: number = 1, limit: number = 12): Promise<PaginatedResponse<Product>> {
    try {
      const offset = (page - 1) * limit
      
      // Build where clause
      const where: any = {
        isActive: true
      }
      
      if (filters.category && filters.category !== 'all') {
        where.category = filters.category
      }
      
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
      
      if (filters.priceRange) {
        where.priceCents = {
          gte: filters.priceRange.min,
          lte: filters.priceRange.max
        }
      }
      
      if (filters.inStock) {
        where.stock = { gt: 0 }
      }
      
      // Build orderBy
      const orderBy: any = {}
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'name':
            orderBy.name = filters.sortOrder || 'asc'
            break
          case 'price':
            orderBy.priceCents = filters.sortOrder || 'asc'
            break
          case 'stock':
            orderBy.stock = filters.sortOrder || 'desc'
            break
          case 'popularity':
            orderBy.orderItems = { _count: filters.sortOrder || 'desc' }
            break
          default:
            orderBy.createdAt = filters.sortOrder || 'desc'
        }
      } else {
        orderBy.createdAt = 'desc'
      }
      
      // Execute queries
      const [products, total] = await Promise.all([
        prisma.products.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
          include: {
            _count: {
              select: { orderItems: true }
            }
          }
        }),
        prisma.products.count({ where })
      ])
      
      const totalPages = Math.ceil(total / limit)
      
      return {
        data: products.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          currency: p.currency,
          stock: p.stock,
          category: p.category as any,
          imageUrls: p.imageUrls,
          isActive: p.isActive,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          _count: {
            OrderItem: p._count?.orderItems || 0
          }
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      console.error('Error in ProductService.getProducts:', error)
      throw new Error('Error al obtener productos')
    }
  }
  
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await prisma.products.findUnique({
        where: { id },
        include: {
          _count: {
            select: { orderItems: true }
          }
        }
      })
      
      if (!product) return null
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        currency: product.currency,
        stock: product.stock,
        category: product.category as any,
        imageUrls: product.imageUrls,
        isActive: product.isActive,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        _count: {
          OrderItem: product._count?.orderItems || 0
        }
      }
    } catch (error) {
      console.error('Error in ProductService.getProductById:', error)
      throw new Error('Error al obtener producto')
    }
  }
  
  static async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const product = await prisma.products.findUnique({
        where: { id: productId },
        select: { category: true }
      })
      
      if (!product) return []
      
      const relatedProducts = await prisma.products.findMany({
        where: {
          category: product.category,
          id: { not: productId },
          isActive: true
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orderItems: true }
          }
        }
      })
      
      return relatedProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        currency: p.currency,
        stock: p.stock,
        category: p.category as any,
        imageUrls: p.imageUrls,
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        _count: {
          OrderItem: p._count?.orderItems || 0
        }
      }))
    } catch (error) {
      console.error('Error in ProductService.getRelatedProducts:', error)
      return []
    }
  }
  
  static async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    try {
      const products = await prisma.products.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orderItems: true }
          }
        }
      })
      
      return products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        currency: p.currency,
        stock: p.stock,
        category: p.category as any,
        imageUrls: p.imageUrls,
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        _count: {
          OrderItem: p._count?.orderItems || 0
        }
      }))
    } catch (error) {
      console.error('Error in ProductService.searchProducts:', error)
      return []
    }
  }
}

// Order operations
export class OrderService {
  static async getOrders(page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit
      
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    imageUrls: true
                  }
                }
              }
            }
          }
        }),
        prisma.order.count()
      ])
      
      return {
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    } catch (error) {
      console.error('Error in OrderService.getOrders:', error)
      throw new Error('Error al obtener pedidos')
    }
  }
  
  static async getOrderById(id: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          orderItems: {
            include: {
              product: true
            }
          }
        }
      })
      
      return order
    } catch (error) {
      console.error('Error in OrderService.getOrderById:', error)
      throw new Error('Error al obtener pedido')
    }
  }
}

// Analytics operations
export class AnalyticsService {
  static async getStoreAnalytics() {
    try {
      const [
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        topProducts,
        recentOrders
      ] = await Promise.all([
        // Total revenue
        prisma.order.aggregate({
          where: { paymentStatus: 'SUCCESS' },
          _sum: { totalCents: true }
        }),
        // Total orders
        prisma.order.count(),
        // Total products
        prisma.products.count({ where: { isActive: true } }),
        // Total customers
        prisma.user.count({ where: { role: 'USER' } }),
        // Top products
        prisma.order_items.groupBy({
          by: ['productId'],
          _sum: { quantity: true, priceCents: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5
        }),
        // Recent orders
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { fullName: true, email: true } },
            orderItems: {
              include: { product: { select: { name: true } } }
            }
          }
        })
      ])
      
      // Get product details for top products
      const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          if (!item.productId) return null
          const product = await prisma.products.findUnique({
            where: { id: item.productId }
          })
          return {
            product: product as any,
            totalSold: item._sum.quantity || 0,
            revenue: item._sum.priceCents || 0
          }
        })
      ).then(results => results.filter(Boolean))
      
      return {
        totalRevenue: totalRevenue._sum.totalCents || 0,
        totalOrders,
        totalProducts,
        totalCustomers,
        topProducts: topProductsWithDetails,
        recentOrders,
        monthlyRevenue: [] // TODO: Implement monthly revenue calculation
      }
    } catch (error) {
      console.error('Error in AnalyticsService.getStoreAnalytics:', error)
      throw new Error('Error al obtener analíticas')
    }
  }
}