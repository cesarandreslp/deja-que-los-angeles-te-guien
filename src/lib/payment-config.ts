import Stripe from 'stripe'
import { MercadoPagoConfig, Payment } from 'mercadopago'

// Configuración de Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
})

// Configuración de MercadoPago
export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
})

// Tipos para las respuestas de pago
export interface PaymentResponse {
  success: boolean
  paymentId: string
  paymentUrl?: string
  status: string
  amount: number
  currency: string
  provider: 'STRIPE' | 'MERCADOPAGO'
  error?: string
}

// Configuración de monedas soportadas
export const SUPPORTED_CURRENCIES = {
  STRIPE: ['USD', 'EUR', 'MXN', 'COP', 'ARS', 'CLP', 'PEN'],
  MERCADOPAGO: ['ARS', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'UYU']
}

// Helper para validar moneda por proveedor
export function isCurrencySupported(provider: 'STRIPE' | 'MERCADOPAGO', currency: string): boolean {
  return SUPPORTED_CURRENCIES[provider].includes(currency.toUpperCase())
}

// Helper para formatear amount para Stripe (en centavos)
export function formatAmountForStripe(amount: number, currency: string): number {
  // Stripe maneja la mayoría de monedas en centavos
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'CLP', 'VND']
  
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount)
  }
  
  return Math.round(amount * 100)
}

// Helper para formatear amount para MercadoPago
export function formatAmountForMercadoPago(amount: number): number {
  // MercadoPago maneja montos decimales directamente
  return Number(amount.toFixed(2))
}

// URLs de callback
export function getPaymentCallbackUrls(subscriptionId: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  return {
    success: `${baseUrl}/memberships/payment/success?subscription=${subscriptionId}`,
    cancel: `${baseUrl}/memberships/payment/cancel?subscription=${subscriptionId}`,
    webhook: `${baseUrl}/api/webhooks/payments`
  }
}