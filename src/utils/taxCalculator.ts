// Tax Calculator Utility - Sistema de Cálculo de Impuestos
// Calcula impuestos, envío y totales para la tienda angelical

import { CartItem } from '@/types/store'

export interface TaxCalculationResult {
  subtotalCents: number
  taxCents: number
  shippingCents: number
  totalCents: number
  taxRate: number
  itemsWithTax: Array<{
    productId: string
    quantity: number
    priceCents: number
    subtotalCents: number
    taxCents: number
    totalCents: number
  }>
}

export interface StoreConfigForCalculation {
  taxEnabled: boolean
  defaultTaxRate: number
  shippingEnabled: boolean
  freeShippingThreshold: number
  standardShippingCents: number
}

/**
 * Calcula el subtotal, impuestos, envío y total de un carrito
 */
export function calculateOrderTotals(
  items: CartItem[],
  config: StoreConfigForCalculation
): TaxCalculationResult {
  // Calcular subtotal (suma de todos los productos)
  const subtotalCents = items.reduce((sum, item) => {
    const price = item.priceCents || item.product?.priceCents || 0
    return sum + (price * item.quantity)
  }, 0)

  // Calcular impuestos si están habilitados
  const taxRate = config.taxEnabled ? config.defaultTaxRate : 0
  const taxCents = Math.round(subtotalCents * taxRate)

  // Calcular envío
  let shippingCents = 0
  if (config.shippingEnabled) {
    // Envío gratis si el subtotal supera el umbral
    if (subtotalCents >= config.freeShippingThreshold) {
      shippingCents = 0
    } else {
      shippingCents = config.standardShippingCents
    }
  }

  // Calcular total
  const totalCents = subtotalCents + taxCents + shippingCents

  // Calcular detalles por item
  const itemsWithTax = items.map(item => {
    const price = item.priceCents || item.product?.priceCents || 0
    const itemSubtotal = price * item.quantity
    const itemTax = Math.round(itemSubtotal * taxRate)
    const itemTotal = itemSubtotal + itemTax

    return {
      productId: item.productId,
      quantity: item.quantity,
      priceCents: price,
      subtotalCents: itemSubtotal,
      taxCents: itemTax,
      totalCents: itemTotal
    }
  })

  return {
    subtotalCents,
    taxCents,
    shippingCents,
    totalCents,
    taxRate,
    itemsWithTax
  }
}

/**
 * Formatea un monto en centavos a formato legible
 */
export function formatCurrency(cents: number, currency: string = 'COP'): string {
  const amount = cents / 100
  
  if (currency === 'COP') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Formatea el porcentaje de impuesto
 */
export function formatTaxRate(taxRate: number): string {
  return `${(taxRate * 100).toFixed(0)}%`
}
