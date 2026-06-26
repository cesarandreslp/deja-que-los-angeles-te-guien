// Componente de procesamiento de pagos - FASE 5
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { PaymentService } from '@/services/PaymentService'
import { PaymentProvider } from '@/types/store'
import { formatCurrency } from '@/app/api/store/config'
import {
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface PaymentProcessorProps {
  orderId: string
  amount: number
  currency: string
  provider: PaymentProvider
  paymentData: any
  onSuccess: (paymentResult: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

export default function PaymentProcessor({
  orderId,
  amount,
  currency,
  provider,
  paymentData,
  onSuccess,
  onError,
  onCancel
}: PaymentProcessorProps) {
  const { currentTheme } = useTheme()
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'pending'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [paymentResult, setPaymentResult] = useState<any>(null)

  useEffect(() => {
    // Auto-iniciar el procesamiento del pago
    if (status === 'idle') {
      processPayment()
    }
  }, [])

  const processPayment = async () => {
    setProcessing(true)
    setStatus('processing')
    setStatusMessage('Procesando tu pago angelical...')

    try {
      const result = await PaymentService.processPayment(provider, {
        orderId,
        amount,
        currency,
        ...paymentData
      })

      setPaymentResult(result)

      if (result.success) {
        if (result.pending || result.processing) {
          setStatus('pending')
          setStatusMessage(
            result.pending 
              ? 'Tu pago está pendiente de aprobación. Recibirás una confirmación pronto.'
              : 'Tu pago está siendo verificado. Esto puede tomar unos minutos.'
          )
        } else {
          setStatus('success')
          setStatusMessage('¡Pago exitoso! Los ángeles bendicen tu compra.')
          setTimeout(() => onSuccess(result), 2000)
        }
      } else if (result.requiresAction) {
        setStatus('pending')
        setStatusMessage('Tu pago requiere autenticación adicional.')
        // Aquí manejarías la acción adicional requerida por Stripe
      } else {
        setStatus('error')
        setStatusMessage(result.error || 'Error procesando el pago')
        setTimeout(() => onError(result.error || 'Error desconocido'), 3000)
      }

    } catch (error: any) {
      setStatus('error')
      setStatusMessage('Error inesperado procesando el pago')
      setTimeout(() => onError(error.message), 3000)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <ClockIcon className="h-16 w-16 animate-pulse" style={{ color: currentTheme.colors.accent }} />
      case 'success':
        return <CheckCircleIcon className="h-16 w-16 text-green-500" />
      case 'pending':
        return <ClockIcon className="h-16 w-16 text-yellow-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
      default:
        return <CreditCardIcon className="h-16 w-16" style={{ color: currentTheme.colors.accent }} />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return currentTheme.colors.accent
      case 'success':
        return '#10b981' // green-500
      case 'pending':
        return '#f59e0b' // yellow-500
      case 'error':
        return '#ef4444' // red-500
      default:
        return currentTheme.colors.text
    }
  }

  const getProviderName = () => {
    switch (provider) {
      case 'STRIPE':
        return 'Stripe'
      case 'MERCADOPAGO':
        return 'MercadoPago'
      default:
        return provider
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <div 
        className="max-w-md w-full p-8 rounded-lg shadow-lg text-center"
        style={{ 
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: currentTheme.colors.borderColor,
          border: `1px solid ${currentTheme.colors.borderColor}`
        }}
      >
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>

        {/* Status Title */}
        <h2 
          className="text-2xl font-bold mb-4"
          style={{ color: getStatusColor() }}
        >
          {status === 'processing' && 'Procesando Pago'}
          {status === 'success' && '¡Pago Exitoso!'}
          {status === 'pending' && 'Pago Pendiente'}
          {status === 'error' && 'Error en el Pago'}
          {status === 'idle' && 'Iniciando Pago'}
        </h2>

        {/* Status Message */}
        <p 
          className="text-lg mb-6"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          {statusMessage}
        </p>

        {/* Payment Details */}
        <div 
          className="p-4 rounded-lg mb-6"
          style={{ backgroundColor: currentTheme.colors.background }}
        >
          <div className="flex justify-between items-center mb-2">
            <span style={{ color: currentTheme.colors.textSecondary }}>
              Monto:
            </span>
            <span 
              className="font-bold text-lg"
              style={{ color: currentTheme.colors.text }}
            >
              {formatCurrency(amount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span style={{ color: currentTheme.colors.textSecondary }}>
              Procesador:
            </span>
            <span style={{ color: currentTheme.colors.text }}>
              {getProviderName()}
            </span>
          </div>

          {paymentResult?.paymentId && (
            <div className="flex justify-between items-center">
              <span style={{ color: currentTheme.colors.textSecondary }}>
                ID de Pago:
              </span>
              <span 
                className="font-mono text-sm"
                style={{ color: currentTheme.colors.text }}
              >
                {paymentResult.paymentId.substring(0, 12)}...
              </span>
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div 
          className="flex items-center justify-center p-3 rounded-lg mb-6"
          style={{ backgroundColor: `${currentTheme.colors.accent}15` }}
        >
          <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
          <span 
            className="text-sm font-medium"
            style={{ color: currentTheme.colors.text }}
          >
            Transacción 100% Segura
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {status === 'error' && (
            <button
              onClick={processPayment}
              disabled={processing}
              className="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                backgroundColor: currentTheme.colors.accent,
                color: 'white'
              }}
            >
              {processing ? 'Reintentando...' : 'Reintentar Pago'}
            </button>
          )}

          {(status === 'error' || status === 'pending') && (
            <button
              onClick={onCancel}
              className="w-full px-6 py-3 border rounded-lg font-medium transition-colors"
              style={{
                borderColor: currentTheme.colors.borderColor,
                color: currentTheme.colors.textSecondary
              }}
            >
              Volver al Checkout
            </button>
          )}
        </div>

        {/* Processing Animation */}
        {status === 'processing' && (
          <div className="mt-6">
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: currentTheme.colors.accent,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Spiritual Message */}
        {status === 'success' && (
          <div 
            className="mt-6 p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: `${currentTheme.colors.accent}15`,
              borderLeftColor: currentTheme.colors.accent
            }}
          >
            <p 
              className="text-sm italic"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              "Los ángeles han bendecido tu transacción. La luz divina acompaña tu compra y 
              guía cada paso hacia la abundancia espiritual." ✨
            </p>
          </div>
        )}
      </div>
    </div>
  )
}