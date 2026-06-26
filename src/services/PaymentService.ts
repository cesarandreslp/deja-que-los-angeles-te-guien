// Servicio de pagos unificado - FASE 5
import { PaymentProvider } from '@/types/store'

interface PaymentRequest {
  orderId: string
  amount: number
  currency: string
  customerEmail: string
  customerName?: string
  paymentMethod?: string
  paymentMethodId?: string
  token?: string
  installments?: number
}

interface PaymentResponse {
  success: boolean
  paymentId?: string
  status?: string
  requiresAction?: boolean
  clientSecret?: string
  error?: string
  pending?: boolean
  processing?: boolean
}

export class PaymentService {
  static async processPayment(
    provider: PaymentProvider,
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      switch (provider) {
        case 'STRIPE':
          return await this.processStripePayment(paymentData)
        
        case 'MERCADOPAGO':
          return await this.processMercadoPagoPayment(paymentData)
        
        default:
          throw new Error(`Proveedor de pago no soportado: ${provider}`)
      }
    } catch (error: any) {
      console.error(`Error processing payment with ${provider}:`, error)
      return {
        success: false,
        error: error.message || 'Error interno del procesador de pagos'
      }
    }
  }

  private static async processStripePayment(
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    const response = await fetch('/api/payments/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Error procesando pago con Stripe'
      }
    }

    return {
      success: result.success,
      paymentId: result.paymentIntent?.id,
      status: result.paymentIntent?.status,
      requiresAction: result.requiresAction,
      clientSecret: result.clientSecret,
      error: result.error
    }
  }

  private static async processMercadoPagoPayment(
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    const response = await fetch('/api/payments/mercadopago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Error procesando pago con MercadoPago'
      }
    }

    return {
      success: result.success,
      paymentId: result.payment?.id,
      status: result.payment?.status,
      pending: result.pending,
      processing: result.processing,
      error: result.error
    }
  }

  static async createPaymentIntent(
    provider: PaymentProvider,
    amount: number,
    currency: string = 'MXN',
    orderId: string
  ): Promise<{ clientSecret?: string; error?: string }> {
    try {
      if (provider === 'STRIPE') {
        const response = await fetch('/api/payments/stripe/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount,
            currency: currency.toLowerCase(),
            orderId
          })
        })

        const result = await response.json()
        
        if (result.success) {
          return { clientSecret: result.clientSecret }
        } else {
          return { error: result.error }
        }
      }

      return { error: 'Proveedor no soporta creación de intent' }

    } catch (error: any) {
      return { error: error.message }
    }
  }

  static getPaymentMethodsForProvider(provider: PaymentProvider) {
    switch (provider) {
      case 'STRIPE':
        return [
          {
            id: 'card',
            name: 'Tarjeta de Crédito/Débito',
            icon: '💳',
            fees: '3.6% + $3 MXN'
          }
        ]
      
      case 'MERCADOPAGO':
        return [
          {
            id: 'visa',
            name: 'Visa',
            icon: '💳',
            fees: '5.79% + IVA'
          },
          {
            id: 'master',
            name: 'Mastercard',
            icon: '💳',
            fees: '5.79% + IVA'
          },
          {
            id: 'amex',
            name: 'American Express',
            icon: '💳',
            fees: '5.79% + IVA'
          },
          {
            id: 'oxxo',
            name: 'OXXO',
            icon: '🏪',
            fees: '$15 MXN'
          },
          {
            id: 'spei',
            name: 'Transferencia SPEI',
            icon: '🏦',
            fees: 'Gratis'
          }
        ]
      
      default:
        return []
    }
  }

  static formatPaymentStatus(status: string, provider: PaymentProvider): {
    label: string
    color: string
    description: string
  } {
    const statusMap: Record<string, any> = {
      // Estados comunes
      'PENDING': {
        label: 'Pendiente',
        color: 'yellow',
        description: 'El pago está siendo procesado'
      },
      'PAID': {
        label: 'Pagado',
        color: 'green',
        description: 'El pago fue exitoso'
      },
      'FAILED': {
        label: 'Fallido',
        color: 'red',
        description: 'El pago no pudo ser procesado'
      },
      'REFUNDED': {
        label: 'Reembolsado',
        color: 'blue',
        description: 'El pago fue reembolsado'
      },

      // Estados específicos de Stripe
      'succeeded': {
        label: 'Exitoso',
        color: 'green',
        description: 'El pago fue procesado exitosamente'
      },
      'requires_action': {
        label: 'Requiere Acción',
        color: 'orange',
        description: 'Requiere autenticación adicional'
      },
      'processing': {
        label: 'Procesando',
        color: 'blue',
        description: 'El pago está siendo procesado'
      },

      // Estados específicos de MercadoPago
      'approved': {
        label: 'Aprobado',
        color: 'green',
        description: 'El pago fue aprobado'
      },
      'rejected': {
        label: 'Rechazado',
        color: 'red',
        description: 'El pago fue rechazado'
      },
      'in_process': {
        label: 'En Proceso',
        color: 'blue',
        description: 'El pago está siendo verificado'
      },
      'cancelled': {
        label: 'Cancelado',
        color: 'gray',
        description: 'El pago fue cancelado'
      }
    }

    return statusMap[status] || {
      label: status,
      color: 'gray',
      description: 'Estado desconocido'
    }
  }

  static calculateFees(amount: number, provider: PaymentProvider, paymentMethod?: string): number {
    switch (provider) {
      case 'STRIPE':
        return (amount * 0.036) + 3 // 3.6% + $3 MXN
      
      case 'MERCADOPAGO':
        if (paymentMethod === 'oxxo') {
          return 15 // $15 MXN fijo
        }
        if (paymentMethod === 'spei') {
          return 0 // Gratis
        }
        return amount * 0.0579 // 5.79% para tarjetas
      
      default:
        return 0
    }
  }
}