// API configuration and utilities
import { PrismaClient } from '@prisma/client'

// Global Prisma instance
export const prisma = new PrismaClient()

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Common error responses
export const ErrorResponses = {
  UNAUTHORIZED: {
    success: false,
    error: 'No autorizado'
  },
  NOT_FOUND: {
    success: false,
    error: 'Recurso no encontrado'
  },
  BAD_REQUEST: {
    success: false,
    error: 'Solicitud inválida'
  },
  INTERNAL_ERROR: {
    success: false,
    error: 'Error interno del servidor'
  }
}

// Success response helper
export function successResponse<T>(data?: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

// Error response helper
export function errorResponse(error: string, status?: number): ApiResponse {
  return {
    success: false,
    error
  }
}

// Paginated response helper
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginatedApiResponse<T>['pagination']
): PaginatedApiResponse<T> {
  return {
    success: true,
    data,
    pagination
  }
}

// Currency formatting
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// Stock status helper
export function getStockStatus(stock: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (stock === 0) return 'out_of_stock'
  if (stock <= 5) return 'low_stock'
  return 'in_stock'
}

// Price conversion helpers
export function dollarsTocents(dollars: number): number {
  return Math.round(dollars * 100)
}

export function centsToDollars(cents: number): number {
  return cents / 100
}