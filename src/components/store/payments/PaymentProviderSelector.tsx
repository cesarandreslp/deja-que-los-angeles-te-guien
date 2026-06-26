// Selector de proveedor de pago - FASE 5
'use client'

import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { PaymentProvider } from '@/types/store'
import { formatCurrency } from '@/app/api/store/config'
import {
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface PaymentProviderSelectorProps {
  amount: number
  currency: string
  onProviderSelect: (provider: PaymentProvider) => void
  selectedProvider?: PaymentProvider
}

export default function PaymentProviderSelector({
  amount,
  currency,
  onProviderSelect,
  selectedProvider
}: PaymentProviderSelectorProps) {
  const { currentTheme } = useTheme()

  const providers = [
    {
      id: 'STRIPE' as PaymentProvider,
      name: 'Stripe',
      description: 'Pagos internacionales seguros',
      features: [
        'Tarjetas de crédito y débito',
        'Encriptación de nivel bancario',
        'Procesamiento instantáneo',
        'Soporte 24/7'
      ],
      fees: {
        percentage: 2.9,
        fixed: 0.30
      },
      logos: ['visa', 'mastercard', 'amex', 'discover'],
      badge: 'Recomendado',
      badgeColor: '#10b981'
    },
    {
      id: 'MERCADOPAGO' as PaymentProvider,
      name: 'MercadoPago',
      description: 'Líder en pagos de Latinoamérica',
      features: [
        'Todos los medios de pago',
        'Cuotas sin interés',
        'Dinero en cuenta',
        'Efectivo y transferencias'
      ],
      fees: {
        percentage: 4.99,
        fixed: 0
      },
      logos: ['visa', 'mastercard', 'amex', 'mercadopago'],
      badge: 'Popular',
      badgeColor: '#3b82f6'
    }
  ]

  const calculateFee = (provider: typeof providers[0]) => {
    const percentageFee = amount * (provider.fees.percentage / 100)
    const totalFee = percentageFee + provider.fees.fixed
    return totalFee
  }

  const calculateTotal = (provider: typeof providers[0]) => {
    return amount + calculateFee(provider)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: currentTheme.colors.text }}
        >
          Elige tu Método de Pago Angelical
        </h2>
        <p 
          className="text-lg"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          Procesadores bendecidos para transacciones seguras ✨
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider) => {
          const isSelected = selectedProvider === provider.id
          const fee = calculateFee(provider)
          const total = calculateTotal(provider)

          return (
            <div
              key={provider.id}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected ? 'ring-4' : ''
              }`}
              style={{
                borderColor: isSelected ? provider.badgeColor : currentTheme.colors.borderColor,
                backgroundColor: isSelected 
                  ? `${provider.badgeColor}15` 
                  : currentTheme.colors.cardBg,
                ringColor: isSelected ? `${provider.badgeColor}50` : 'transparent'
              }}
              onClick={() => onProviderSelect(provider.id)}
            >
              {/* Badge */}
              <div 
                className="absolute -top-3 left-6 px-3 py-1 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: provider.badgeColor }}
              >
                {provider.badge}
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div 
                    className="p-3 rounded-lg mr-3"
                    style={{ backgroundColor: `${provider.badgeColor}20` }}
                  >
                    {provider.id === 'STRIPE' ? (
                      <CreditCardIcon 
                        className="h-6 w-6" 
                        style={{ color: provider.badgeColor }} 
                      />
                    ) : (
                      <BanknotesIcon 
                        className="h-6 w-6" 
                        style={{ color: provider.badgeColor }} 
                      />
                    )}
                  </div>
                  <div>
                    <h3 
                      className="text-xl font-bold"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {provider.name}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      {provider.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircleIcon 
                    className="h-8 w-8" 
                    style={{ color: provider.badgeColor }} 
                  />
                )}
              </div>

              {/* Features */}
              <div className="mb-4">
                <ul className="space-y-2">
                  {provider.features.map((feature, index) => (
                    <li 
                      key={index}
                      className="flex items-center text-sm"
                      style={{ color: currentTheme.colors.textSecondary }}
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full mr-2"
                        style={{ backgroundColor: provider.badgeColor }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing */}
              <div 
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: currentTheme.colors.background }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span 
                    className="text-sm"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Subtotal:
                  </span>
                  <span 
                    className="font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span 
                    className="text-sm"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Comisión ({provider.fees.percentage}%
                    {provider.fees.fixed > 0 && ` + $${provider.fees.fixed}`}):
                  </span>
                  <span 
                    className="font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {formatCurrency(fee)}
                  </span>
                </div>
                <div 
                  className="flex justify-between items-center pt-2 border-t"
                  style={{ borderColor: currentTheme.colors.borderColor }}
                >
                  <span 
                    className="font-semibold"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Total:
                  </span>
                  <span 
                    className="text-lg font-bold"
                    style={{ color: provider.badgeColor }}
                  >
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Logos de tarjetas */}
              <div className="flex justify-center space-x-2 mb-4">
                {provider.logos.map((logo, index) => (
                  <div
                    key={index}
                    className="w-10 h-6 rounded border flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.borderColor,
                      color: currentTheme.colors.textSecondary
                    }}
                  >
                    {logo.toUpperCase()}
                  </div>
                ))}
              </div>

              {/* Security badge */}
              <div 
                className="flex items-center justify-center p-2 rounded-lg"
                style={{ backgroundColor: `${currentTheme.colors.accent}15` }}
              >
                <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-2" />
                <span 
                  className="text-xs font-medium"
                  style={{ color: currentTheme.colors.text }}
                >
                  SSL 256-bit • PCI DSS Level 1
                </span>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div 
                  className="absolute inset-0 rounded-xl border-2 pointer-events-none"
                  style={{ 
                    borderColor: provider.badgeColor,
                    backgroundColor: `${provider.badgeColor}10`
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Spiritual message */}
      <div 
        className="text-center p-4 rounded-lg mt-6"
        style={{ backgroundColor: `${currentTheme.colors.accent}15` }}
      >
        <p 
          className="text-sm italic"
          style={{ color: currentTheme.colors.textSecondary }}
        >
          "Cada transacción es bendecida por los arcángeles guardianes del comercio celestial. 
          Tu elección será guiada por la sabiduría divina." 🙏✨
        </p>
      </div>

      {/* Información adicional */}
      <div 
        className="text-center text-xs mt-4"
        style={{ color: currentTheme.colors.textSecondary }}
      >
        <p>
          * Los precios incluyen todas las comisiones aplicables
        </p>
        <p>
          * Transacciones protegidas por encriptación de nivel bancario
        </p>
        <p>
          * Soporte angelical disponible 24/7 para resolver cualquier inconveniente
        </p>
      </div>
    </div>
  )
}