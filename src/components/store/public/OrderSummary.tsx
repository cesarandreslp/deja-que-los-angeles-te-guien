// Order Summary Component - Desglose de totales con impuestos
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { CartItem } from '@/types/store'
import { formatCurrency, formatTaxRate } from '@/utils/taxCalculator'
import { TruckIcon, BanknotesIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface OrderSummaryProps {
  items: CartItem[]
  showCheckoutButton?: boolean
  onCheckout?: () => void
  isLoading?: boolean
}

interface CalculationResult {
  subtotalCents: number
  taxCents: number
  shippingCents: number
  totalCents: number
  taxRate: number
  currency: string
  taxName: string
  config: {
    taxEnabled: boolean
    shippingEnabled: boolean
    freeShippingThreshold: number
  }
}

export default function OrderSummary({ 
  items, 
  showCheckoutButton = true,
  onCheckout,
  isLoading = false
}: OrderSummaryProps) {
  const { currentTheme } = useTheme()
  const [calculation, setCalculation] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateTotals()
  }, [items])

  const calculateTotals = async () => {
    if (items.length === 0) {
      setCalculation(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/store/checkout/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      })

      const data = await response.json()

      if (data.success) {
        setCalculation(data.data)
      }
    } catch (error) {
      console.error('Error calculating totals:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading || !calculation) {
    return (
      <div 
        className="p-6 rounded-lg shadow-xl animate-pulse"
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        <div 
          className="h-6 rounded mb-4"
          style={{ backgroundColor: currentTheme.colors.borderColor }}
        />
        <div className="space-y-3">
          <div 
            className="h-4 rounded"
            style={{ backgroundColor: currentTheme.colors.borderColor }}
          />
          <div 
            className="h-4 rounded"
            style={{ backgroundColor: currentTheme.colors.borderColor }}
          />
          <div 
            className="h-4 rounded"
            style={{ backgroundColor: currentTheme.colors.borderColor }}
          />
        </div>
      </div>
    )
  }

  const isFreeShipping = calculation.shippingCents === 0 && calculation.config.shippingEnabled
  const amountUntilFreeShipping = calculation.config.freeShippingThreshold - calculation.subtotalCents

  return (
    <div 
      className="p-6 rounded-lg shadow-xl"
      style={{ backgroundColor: currentTheme.colors.cardBg }}
    >
      <h2 
        className="text-xl font-bold mb-6 flex items-center"
        style={{ color: currentTheme.colors.text }}
      >
        <SparklesIcon className="h-6 w-6 mr-2" style={{ color: currentTheme.colors.accent }} />
        Resumen del Pedido Angelical
      </h2>

      <div className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span style={{ color: currentTheme.colors.textSecondary }}>
            Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
          </span>
          <span 
            className="font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            {formatCurrency(calculation.subtotalCents, calculation.currency)}
          </span>
        </div>

        {/* Tax */}
        {calculation.config.taxEnabled && calculation.taxCents > 0 && (
          <div className="flex justify-between">
            <div className="flex items-center">
              <BanknotesIcon 
                className="h-4 w-4 mr-1"
                style={{ color: currentTheme.colors.textSecondary }}
              />
              <span style={{ color: currentTheme.colors.textSecondary }}>
                {calculation.taxName} ({formatTaxRate(calculation.taxRate)})
              </span>
            </div>
            <span 
              className="font-semibold"
              style={{ color: currentTheme.colors.text }}
            >
              {formatCurrency(calculation.taxCents, calculation.currency)}
            </span>
          </div>
        )}

        {/* Shipping */}
        {calculation.config.shippingEnabled && (
          <div className="flex justify-between">
            <div className="flex items-center">
              <TruckIcon 
                className="h-4 w-4 mr-1"
                style={{ color: currentTheme.colors.textSecondary }}
              />
              <span style={{ color: currentTheme.colors.textSecondary }}>
                Envío angelical
              </span>
            </div>
            <span 
              className="font-semibold"
              style={{ color: isFreeShipping ? '#10b981' : currentTheme.colors.text }}
            >
              {isFreeShipping ? '✨ Gratis' : formatCurrency(calculation.shippingCents, calculation.currency)}
            </span>
          </div>
        )}

        {/* Free Shipping Progress */}
        {calculation.config.shippingEnabled && !isFreeShipping && amountUntilFreeShipping > 0 && (
          <div 
            className="p-3 rounded-lg text-sm"
            style={{ 
              backgroundColor: `${currentTheme.colors.accent}15`,
              borderLeft: `4px solid ${currentTheme.colors.accent}`
            }}
          >
            <p style={{ color: currentTheme.colors.text }}>
              🎁 Agrega {formatCurrency(amountUntilFreeShipping, calculation.currency)} más para <strong>envío gratis</strong>
            </p>
          </div>
        )}

        <hr style={{ borderColor: currentTheme.colors.borderColor }} />

        {/* Total */}
        <div className="flex justify-between text-xl font-bold">
          <span style={{ color: currentTheme.colors.text }}>💰 Total Final</span>
          <span style={{ color: currentTheme.colors.accent }}>
            {formatCurrency(calculation.totalCents, calculation.currency)}
          </span>
        </div>

        {/* Tax Breakdown Info */}
        {calculation.config.taxEnabled && calculation.taxCents > 0 && (
          <div 
            className="text-xs p-2 rounded"
            style={{ 
              backgroundColor: `${currentTheme.colors.accent}10`,
              color: currentTheme.colors.textSecondary
            }}
          >
            ℹ️ El {calculation.taxName} ({formatTaxRate(calculation.taxRate)}) ya está incluido en el total
          </div>
        )}
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <button
          onClick={onCheckout}
          disabled={isLoading}
          className="w-full mt-6 flex items-center justify-center px-6 py-4 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          style={{ backgroundColor: currentTheme.colors.accent }}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              🚀 Proceder al Pago
              <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  )
}
