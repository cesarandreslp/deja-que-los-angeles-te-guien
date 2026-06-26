// Formulario de método de pago - FASE 5 
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { PaymentProvider } from '@/types/store'
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

type PaymentMethod = 'card' | 'account_money' | 'bank_transfer' | 'cash'

interface PaymentFormProps {
  provider: PaymentProvider
  amount: number
  onPaymentData: (data: any) => void
  onValidChange: (isValid: boolean) => void
}

export default function PaymentForm({
  provider,
  amount,
  onPaymentData,
  onValidChange
}: PaymentFormProps) {
  const { currentTheme } = useTheme()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [formData, setFormData] = useState({
    // Datos de tarjeta
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    
    // Datos de MercadoPago
    installments: 1,
    
    // Datos del comprador
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Dirección
    street: '',
    streetNumber: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'AR'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const paymentMethods: PaymentMethod[] = provider === 'STRIPE' 
    ? ['card']
    : ['card', 'account_money', 'bank_transfer', 'cash']

  useEffect(() => {
    const isValid = validateForm()
    onValidChange(isValid)
    onPaymentData({
      provider,
      paymentMethod,
      ...formData
    })
  }, [formData, paymentMethod, provider])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar datos básicos
    if (!formData.email) newErrors.email = 'Email requerido'
    if (!formData.firstName) newErrors.firstName = 'Nombre requerido'
    if (!formData.lastName) newErrors.lastName = 'Apellido requerido'

    // Validar tarjeta si es necesario
    if (paymentMethod === 'card') {
      if (!formData.cardNumber) newErrors.cardNumber = 'Número de tarjeta requerido'
      else if (formData.cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'Número de tarjeta inválido'
      }
      
      if (!formData.expiryMonth || !formData.expiryYear) {
        newErrors.expiry = 'Fecha de vencimiento requerida'
      }
      
      if (!formData.cvv) newErrors.cvv = 'CVV requerido'
      else if (formData.cvv.length < 3) newErrors.cvv = 'CVV inválido'
      
      if (!formData.cardholderName) newErrors.cardholderName = 'Nombre del titular requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value

    // Formatear número de tarjeta
    if (field === 'cardNumber') {
      processedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()
      if (processedValue.length > 19) processedValue = processedValue.substring(0, 19)
    }

    // Formatear CVV
    if (field === 'cvv') {
      processedValue = value.replace(/\D/g, '').substring(0, 4)
    }

    // Formatear teléfono
    if (field === 'phone') {
      processedValue = value.replace(/\D/g, '').substring(0, 15)
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }))
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'card':
        return <CreditCardIcon className="h-5 w-5" />
      case 'account_money':
        return <BanknotesIcon className="h-5 w-5" />
      case 'bank_transfer':
        return <BanknotesIcon className="h-5 w-5" />
      case 'cash':
        return <DevicePhoneMobileIcon className="h-5 w-5" />
      default:
        return <CreditCardIcon className="h-5 w-5" />
    }
  }

  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case 'card':
        return 'Tarjeta de Crédito/Débito'
      case 'account_money':
        return 'Dinero en Cuenta'
      case 'bank_transfer':
        return 'Transferencia Bancaria'
      case 'cash':
        return 'Efectivo'
      default:
        return method
    }
  }

  const installmentOptions = [1, 3, 6, 12, 18, 24]

  return (
    <div className="space-y-6">
      {/* Selección de método de pago */}
      {paymentMethods.length > 1 && (
        <div>
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Método de Pago
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.map((method) => (
              <label
                key={method}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                  paymentMethod === method ? 'ring-2' : ''
                }`}
                style={{
                  borderColor: paymentMethod === method 
                    ? currentTheme.colors.accent 
                    : currentTheme.colors.borderColor,
                  backgroundColor: paymentMethod === method 
                    ? `${currentTheme.colors.accent}15` 
                    : currentTheme.colors.cardBg
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="sr-only"
                />
                <div className="flex items-center flex-grow">
                  <div 
                    className="mr-3"
                    style={{ color: currentTheme.colors.accent }}
                  >
                    {getPaymentMethodIcon(method)}
                  </div>
                  <span 
                    className="font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {getPaymentMethodName(method)}
                  </span>
                </div>
                {paymentMethod === method && (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentTheme.colors.accent }}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de tarjeta */}
      {paymentMethod === 'card' && (
        <div>
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: currentTheme.colors.text }}
          >
            Datos de la Tarjeta
          </h3>
          <div className="space-y-4">
            {/* Número de tarjeta */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Número de Tarjeta
              </label>
              <div className="relative">
                <input
                  type={showCardNumber ? 'text' : 'password'}
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: errors.cardNumber ? '#ef4444' : currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.cardBg,
                    color: currentTheme.colors.text
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {showCardNumber ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>

            {/* Vencimiento y CVV */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Mes
                </label>
                <select
                  value={formData.expiryMonth}
                  onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                  className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.expiry ? '#ef4444' : currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.cardBg,
                    color: currentTheme.colors.text
                  }}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Año
                </label>
                <select
                  value={formData.expiryYear}
                  onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                  className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.expiry ? '#ef4444' : currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.cardBg,
                    color: currentTheme.colors.text
                  }}
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  CVV
                </label>
                <input
                  type="password"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  placeholder="123"
                  className="w-full px-3 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.cvv ? '#ef4444' : currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.cardBg,
                    color: currentTheme.colors.text
                  }}
                />
              </div>
            </div>
            {errors.expiry && (
              <p className="text-red-500 text-sm">{errors.expiry}</p>
            )}
            {errors.cvv && (
              <p className="text-red-500 text-sm">{errors.cvv}</p>
            )}

            {/* Titular de la tarjeta */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Nombre del Titular
              </label>
              <input
                type="text"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                placeholder="Juan Pérez"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.cardholderName ? '#ef4444' : currentTheme.colors.borderColor,
                  backgroundColor: currentTheme.colors.cardBg,
                  color: currentTheme.colors.text
                }}
              />
              {errors.cardholderName && (
                <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cuotas para MercadoPago */}
      {provider === 'MERCADOPAGO' && paymentMethod === 'card' && (
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Cuotas
          </label>
          <select
            value={formData.installments}
            onChange={(e) => handleInputChange('installments', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              borderColor: currentTheme.colors.borderColor,
              backgroundColor: currentTheme.colors.cardBg,
              color: currentTheme.colors.text
            }}
          >
            {installmentOptions.map((installment) => (
              <option key={installment} value={installment}>
                {installment === 1 
                  ? `1 cuota sin interés` 
                  : `${installment} cuotas de $${(amount / installment).toFixed(2)}`
                }
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Datos del comprador */}
      <div>
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: currentTheme.colors.text }}
        >
          Datos del Comprador
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Nombre
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                borderColor: errors.firstName ? '#ef4444' : currentTheme.colors.borderColor,
                backgroundColor: currentTheme.colors.cardBg,
                color: currentTheme.colors.text
              }}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Apellido
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                borderColor: errors.lastName ? '#ef4444' : currentTheme.colors.borderColor,
                backgroundColor: currentTheme.colors.cardBg,
                color: currentTheme.colors.text
              }}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                borderColor: errors.email ? '#ef4444' : currentTheme.colors.borderColor,
                backgroundColor: currentTheme.colors.cardBg,
                color: currentTheme.colors.text
              }}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Certificado de seguridad */}
      <div 
        className="flex items-center justify-center p-4 rounded-lg border"
        style={{
          backgroundColor: `${currentTheme.colors.accent}15`,
          borderColor: currentTheme.colors.accent
        }}
      >
        <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-3" />
        <div>
          <p 
            className="font-semibold"
            style={{ color: currentTheme.colors.text }}
          >
            Pago 100% Seguro
          </p>
          <p 
            className="text-sm"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Protegido por encriptación SSL y bendecido por los ángeles ✨
          </p>
        </div>
      </div>
    </div>
  )
}