// Página de checkout - COMPLETAMENTE ARREGLADA
'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/store/useCart'
import { useTheme } from '@/context/ThemeContext'
import { formatCurrency } from '@/app/api/store/config'
import { useRouter } from 'next/navigation'
import StoreLayout from '@/components/store/public/StoreLayout'
import Image from 'next/image'
import {
  CreditCardIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  HeartIcon,
  CheckCircleIcon,
  BanknotesIcon,
  GiftIcon
} from '@heroicons/react/24/outline'

interface CheckoutForm {
  // Customer Info
  firstName: string
  lastName: string
  email: string
  phone: string
  
  // Shipping Address
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  
  // Payment Info
  paymentMethod: 'stripe' | 'mercadopago' | 'transfer'
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
  
  // Additional
  notes: string
  subscribeNewsletter: boolean
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const cartItems = cart.items.filter(item => item.product) // Filtrar items válidos
  const { currentTheme } = useTheme()
  const router = useRouter()
  
  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    paymentMethod: 'stripe',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    notes: '',
    subscribeNewsletter: true
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)
  
  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/tienda')
    }
  }, [cartItems, router])
  
  // Calcular costos
  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum
    return sum + (item.product.priceCents * item.quantity)
  }, 0)
  const shipping = subtotal > 5000 ? 0 : 800 // Envío gratis por compras mayores a $50
  const tax = Math.round(subtotal * 0.16) // IVA 16%
  const discount = subtotal > 10000 ? Math.round(subtotal * 0.05) : 0 // 5% descuento por compras >$100
  const total = subtotal + shipping + tax - discount
  
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido'
      if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido'
      if (!formData.email.trim()) newErrors.email = 'Email es requerido'
      if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido'
    }
    
    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Dirección es requerida'
      if (!formData.city.trim()) newErrors.city = 'Ciudad es requerida'
      if (!formData.state.trim()) newErrors.state = 'Estado es requerido'
      if (!formData.zipCode.trim()) newErrors.zipCode = 'Código postal es requerido'
    }
    
    if (step === 3 && formData.paymentMethod !== 'transfer') {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Número de tarjeta es requerido'
      if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Fecha de vencimiento es requerida'
      if (!formData.cvv.trim()) newErrors.cvv = 'CVV es requerido'
      if (!formData.cardName.trim()) newErrors.cardName = 'Nombre en la tarjeta es requerido'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }
  
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }
  
  const handleSubmit = async () => {
    if (!validateStep(3)) return
    
    setLoading(true)
    
    try {
      // Crear orden
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product!.id,
          quantity: item.quantity,
          price: item.product!.priceCents
        })),
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        subtotal,
        shipping,
        tax,
        discount,
        total,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      }
      
      const response = await fetch('/api/store/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Limpiar carrito y redirigir
        clearCart()
        setCurrentStep(4)
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push(`/tienda/orden/${result.order.orderNumber}`)
        }, 3000)
      } else {
        throw new Error(result.error || 'Error al procesar el pedido')
      }
    } catch (error) {
      console.error('Error processing order:', error)
      setErrors({ general: 'Error al procesar el pedido. Inténtalo de nuevo.' })
    } finally {
      setLoading(false)
    }
  }
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <UserIcon 
                className="h-6 w-6 mr-3"
                style={{ color: currentTheme.colors.accent }}
              />
              <h2 
                className="text-xl font-semibold"
                style={{ color: currentTheme.colors.text }}
              >
                Información Personal
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.firstName ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: errors.firstName ? '#ef4444' : currentTheme.colors.borderColor,
                    color: currentTheme.colors.text,
                    '--tw-ring-color': currentTheme.colors.accent
                  } as any}
                  placeholder="Tu nombre"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.lastName ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: errors.lastName ? '#ef4444' : currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                  placeholder="Tu apellido"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Email *
              </label>
              <div className="relative">
                <EnvelopeIcon 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                  style={{ color: currentTheme.colors.textSecondary }}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: errors.email ? '#ef4444' : currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Teléfono *
              </label>
              <div className="relative">
                <PhoneIcon 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                  style={{ color: currentTheme.colors.textSecondary }}
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: errors.phone ? '#ef4444' : currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                  placeholder="+52 55 1234 5678"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <MapPinIcon 
                className="h-6 w-6 mr-3"
                style={{ color: currentTheme.colors.accent }}
              />
              <h2 
                className="text-xl font-semibold"
                style={{ color: currentTheme.colors.text }}
              >
                Dirección de Envío
              </h2>
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Dirección *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  errors.address ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: errors.address ? '#ef4444' : currentTheme.colors.borderColor,
                  color: currentTheme.colors.text
                }}
                placeholder="Calle y número"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.city ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: errors.city ? '#ef4444' : currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                  placeholder="Tu ciudad"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Estado *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.state ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: errors.state ? '#ef4444' : currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                  placeholder="Tu estado"
                />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.zipCode ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: errors.zipCode ? '#ef4444' : currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                  placeholder="12345"
                />
                {errors.zipCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                )}
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  País
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                >
                  <option value="México">México</option>
                  <option value="España">España</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Chile">Chile</option>
                </select>
              </div>
            </div>
            
            {/* Shipping Info */}
            <div 
              className="p-4 rounded-lg border-l-4"
              style={{
                backgroundColor: `${currentTheme.colors.accent}15`,
                borderLeftColor: currentTheme.colors.accent
              }}
            >
              <div className="flex items-center mb-2">
                <TruckIcon 
                  className="h-5 w-5 mr-2"
                  style={{ color: currentTheme.colors.accent }}
                />
                <span 
                  className="font-medium"
                  style={{ color: currentTheme.colors.text }}
                >
                  Información de Envío
                </span>
              </div>
              <p 
                className="text-sm font-medium"
                style={{ color: currentTheme.colors.text }}
              >
                {shipping === 0 
                  ? '🎉 ¡Envío GRATIS Angelical! Has calificado para bendición de envío gratuito'
                  : `💫 Costo de envío celestial: ${formatCurrency(shipping)}`
                }
              </p>
              <p 
                className="text-xs mt-2"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                ⏰ Tiempo de entrega angelical: 3-5 días hábiles<br/>
                📦 Tus productos serán bendecidos antes del envío
              </p>
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <CreditCardIcon 
                className="h-6 w-6 mr-3"
                style={{ color: currentTheme.colors.accent }}
              />
              <h2 
                className="text-xl font-semibold"
                style={{ color: currentTheme.colors.text }}
              >
                Método de Pago
              </h2>
            </div>
            
            {/* Payment Methods */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={formData.paymentMethod === 'stripe'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                  className="mr-3"
                />
                <label 
                  className="font-medium"
                  style={{ color: currentTheme.colors.text }}
                >
                  Tarjeta de Crédito/Débito (Stripe)
                </label>
                <ShieldCheckIcon className="h-5 w-5 ml-2 text-green-500" />
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mercadopago"
                  checked={formData.paymentMethod === 'mercadopago'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                  className="mr-3"
                />
                <label 
                  className="font-medium"
                  style={{ color: currentTheme.colors.text }}
                >
                  MercadoPago
                </label>
                <ShieldCheckIcon className="h-5 w-5 ml-2 text-green-500" />
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={formData.paymentMethod === 'transfer'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                  className="mr-3"
                />
                <label 
                  className="font-medium"
                  style={{ color: currentTheme.colors.text }}
                >
                  Transferencia Bancaria
                </label>
              </div>
            </div>
            
            {/* Card Details */}
            {formData.paymentMethod !== 'transfer' && (
              <div className="space-y-4 p-4 border rounded-lg"
                   style={{ borderColor: currentTheme.colors.borderColor }}
              >
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Número de Tarjeta *
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.borderColor,
                      color: currentTheme.colors.text
                    }}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: currentTheme.colors.text }}
                    >
                      MM/AA *
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{
                        backgroundColor: currentTheme.colors.background,
                        borderColor: currentTheme.colors.borderColor,
                        color: currentTheme.colors.text
                      }}
                      placeholder="12/25"
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                    )}
                  </div>
                  
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{ color: currentTheme.colors.text }}
                    >
                      CVV *
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{
                        backgroundColor: currentTheme.colors.background,
                        borderColor: currentTheme.colors.borderColor,
                        color: currentTheme.colors.text
                      }}
                      placeholder="123"
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Nombre en la Tarjeta *
                  </label>
                  <input
                    type="text"
                    value={formData.cardName}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardName: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.borderColor,
                      color: currentTheme.colors.text
                    }}
                    placeholder="Como aparece en la tarjeta"
                  />
                  {errors.cardName && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Transfer Instructions */}
            {formData.paymentMethod === 'transfer' && (
              <div 
                className="p-4 rounded-lg border-l-4"
                style={{
                  backgroundColor: `${currentTheme.colors.accent}15`,
                  borderLeftColor: currentTheme.colors.accent
                }}
              >
                <h4 
                  className="font-medium mb-3"
                  style={{ color: currentTheme.colors.text }}
                >
                  Datos para Transferencia
                </h4>
                <div 
                  className="text-sm space-y-1"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  <p><strong>Banco:</strong> BBVA México</p>
                  <p><strong>Cuenta:</strong> 1234567890</p>
                  <p><strong>CLABE:</strong> 012345678901234567</p>
                  <p><strong>Beneficiario:</strong> Tienda Angelical S.A. de C.V.</p>
                </div>
                <p 
                  className="text-xs mt-3"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  * Envía tu comprobante de pago por WhatsApp para confirmar tu orden.
                </p>
              </div>
            )}
            
            {/* Notes */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Notas o Instrucciones Especiales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.borderColor,
                  color: currentTheme.colors.text
                }}
                placeholder="Cualquier información adicional para tu pedido..."
              />
            </div>
            
            {/* Newsletter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.subscribeNewsletter}
                onChange={(e) => setFormData(prev => ({ ...prev, subscribeNewsletter: e.target.checked }))}
                className="mr-3"
              />
              <label 
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Quiero recibir mensajes angelicales y ofertas especiales por email
              </label>
            </div>
          </div>
        )
        
      case 4:
        return (
          <div className="text-center space-y-8">
            <div className="flex justify-center relative">
              <div className="absolute inset-0 animate-ping">
                <CheckCircleIcon 
                  className="h-20 w-20 mx-auto"
                  style={{ color: currentTheme.colors.accent + '30' }}
                />
              </div>
              <CheckCircleIcon 
                className="h-20 w-20 relative z-10"
                style={{ color: currentTheme.colors.accent }}
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-6xl mb-4">🎉</div>
              <h2 
                className="text-3xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                ¡Pedido Confirmado Celestialmente! ✨
              </h2>
              <p 
                className="text-lg font-medium"
                style={{ color: currentTheme.colors.accent }}
              >
                Los arcángeles han bendecido tu compra
              </p>
            </div>
            
            <div 
              className="p-8 rounded-2xl border-l-4 shadow-lg"
              style={{
                backgroundColor: `${currentTheme.colors.accent}15`,
                borderLeftColor: currentTheme.colors.accent
              }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="text-4xl mr-3">👼</div>
                <SparklesIcon 
                  className="h-6 w-6 mr-2"
                  style={{ color: currentTheme.colors.accent }}
                />
                <span 
                  className="font-bold text-xl"
                  style={{ color: currentTheme.colors.text }}
                >
                  Mensaje Angelical Divino
                </span>
                <SparklesIcon 
                  className="h-6 w-6 ml-2"
                  style={{ color: currentTheme.colors.accent }}
                />
              </div>
              
              <div className="space-y-4">
                <p 
                  className="text-xl leading-relaxed font-medium"
                  style={{ color: currentTheme.colors.text }}
                >
                  🌟 Los ángeles bendicen tu compra y guían tus pasos hacia la luz divina. 
                  Tu pedido ha sido recibido con amor infinito y será preparado con energía sagrada.
                </p>
                
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: currentTheme.colors.background + '50' }}
                >
                  <p 
                    className="text-lg font-medium mb-2"
                    style={{ color: currentTheme.colors.accent }}
                  >
                    🕊️ Bendición del Arcángel Miguel:
                  </p>
                  <p 
                    className="italic"
                    style={{ color: currentTheme.colors.text }}
                  >
                    "Que estos productos celestiales te brinden protección, sanación y abundancia. 
                    La luz divina los acompaña en su viaje hacia ti."
                  </p>
                </div>
                
                <p 
                  className="text-sm"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  📧 Recibirás un email de confirmación angelical en breves momentos con los detalles 
                  de tu pedido y el seguimiento del envío celestial.
                </p>
              </div>
            </div>
            
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: currentTheme.colors.background }}
            >
              <div className="animate-spin h-6 w-6 mx-auto mb-2" 
                   style={{ color: currentTheme.colors.accent }}>
                ⭐
              </div>
              <p 
                className="text-sm font-medium"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                🌈 Serás redirigido automáticamente al portal de seguimiento celestial...
              </p>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  if (cartItems.length === 0) {
    return null // El useEffect redirigirá
  }
  
  return (
    <StoreLayout>
      <div 
        className="min-h-screen py-8"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl mr-4">🛒</div>
              <div>
                <h1 
                  className="text-4xl font-bold mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  ✨ Checkout Angelical
                </h1>
                <div className="flex items-center justify-center">
                  <SparklesIcon 
                    className="h-5 w-5 mr-2"
                    style={{ color: currentTheme.colors.accent }}
                  />
                  <span 
                    className="text-lg font-medium"
                    style={{ color: currentTheme.colors.accent }}
                  >
                    Proceso de Compra Sagrado
                  </span>
                  <SparklesIcon 
                    className="h-5 w-5 ml-2"
                    style={{ color: currentTheme.colors.accent }}
                  />
                </div>
              </div>
            </div>
            
            <p 
              className="text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              Completa tu compra celestial con la bendición y protección de los arcángeles. 
              Cada paso está guiado por la luz divina.
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? 'text-white'
                        : 'text-gray-400 border border-gray-300'
                    }`}
                    style={{
                      backgroundColor: currentStep >= step ? currentTheme.colors.accent : 'transparent'
                    }}
                  >
                    {step === 4 && currentStep >= 4 ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </div>
                  
                  {step < 4 && (
                    <div
                      className={`w-12 h-0.5 ml-2 ${
                        currentStep > step ? 'opacity-100' : 'opacity-30'
                      }`}
                      style={{
                        backgroundColor: currentStep > step ? currentTheme.colors.accent : '#d1d5db'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div 
                className="p-6 rounded-lg shadow-lg"
                style={{
                  backgroundColor: currentTheme.colors.cardBg,
                  borderColor: currentTheme.colors.borderColor,
                  border: `1px solid ${currentTheme.colors.borderColor}`
                }}
              >
                {renderStepContent()}
                
                {/* Navigation Buttons */}
                {currentStep < 4 && (
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handlePrevStep}
                      disabled={currentStep === 1}
                      className="px-6 py-3 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        borderColor: currentTheme.colors.borderColor,
                        color: currentTheme.colors.textSecondary
                      }}
                    >
                      Anterior
                    </button>
                    
                    {currentStep === 3 ? (
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
                        style={{
                          backgroundColor: currentTheme.colors.accent,
                          color: 'white'
                        }}
                      >
                        {loading ? 'Procesando...' : `Pagar ${formatCurrency(total)}`}
                      </button>
                    ) : (
                      <button
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: currentTheme.colors.accent,
                          color: 'white'
                        }}
                      >
                        Siguiente
                      </button>
                    )}
                  </div>
                )}
                
                {errors.general && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div 
                className="p-6 rounded-lg shadow-lg sticky top-8"
                style={{
                  backgroundColor: currentTheme.colors.cardBg,
                  borderColor: currentTheme.colors.borderColor,
                  border: `1px solid ${currentTheme.colors.borderColor}`
                }}
              >
                <div className="flex items-center mb-6">
                  <HeartIcon 
                    className="h-6 w-6 mr-3"
                    style={{ color: currentTheme.colors.accent }}
                  />
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Resumen del Pedido
                  </h3>
                </div>
                
                {/* Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg" 
                         style={{ backgroundColor: currentTheme.colors.background }}>
                      {item.product!.imageUrls?.[0] && (
                        <div className="flex-shrink-0">
                          <Image
                            src={item.product!.imageUrls[0]}
                            alt={item.product!.name}
                            width={50}
                            height={50}
                            className="rounded-lg object-cover shadow-sm"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-semibold text-sm truncate"
                          style={{ color: currentTheme.colors.text }}
                        >
                          {item.product!.name}
                        </h4>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          ✨ Cantidad: {item.quantity} unidades celestiales
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <span 
                          className="font-bold text-sm"
                          style={{ color: currentTheme.colors.accent }}
                        >
                          {formatCurrency(item.product!.priceCents * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <p 
                            className="text-xs"
                            style={{ color: currentTheme.colors.textSecondary }}
                          >
                            {formatCurrency(item.product!.priceCents)} c/u
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Totals */}
                <div 
                  className="space-y-3 pt-4 border-t"
                  style={{ borderColor: currentTheme.colors.textSecondary + '30' }}
                >
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      💰 Subtotal:
                    </span>
                    <span 
                      className="font-semibold"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      🚚 Envío:
                    </span>
                    <span 
                      className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}
                      style={{ color: shipping === 0 ? '#16a34a' : currentTheme.colors.text }}
                    >
                      {shipping === 0 ? '✨ GRATIS' : formatCurrency(shipping)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span style={{ color: currentTheme.colors.textSecondary }}>
                      📄 IVA (16%):
                    </span>
                    <span 
                      className="font-semibold"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {formatCurrency(tax)}
                    </span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.colors.textSecondary }}>
                        🎁 Descuento (5%):
                      </span>
                      <span 
                        className="font-semibold text-green-600"
                      >
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className="flex justify-between pt-4 border-t"
                    style={{ borderColor: currentTheme.colors.textSecondary + '30' }}
                  >
                    <span 
                      className="font-bold text-xl"
                      style={{ color: currentTheme.colors.text }}
                    >
                      🌟 Total Angelical:
                    </span>
                    <span 
                      className="font-bold text-2xl"
                      style={{ color: currentTheme.colors.accent }}
                    >
                      {formatCurrency(total)}
                    </span>
                  </div>
                  
                  {discount > 0 && (
                    <div 
                      className="text-center p-2 rounded-lg mt-2"
                      style={{ backgroundColor: currentTheme.colors.accent + '15' }}
                    >
                      <p 
                        className="text-sm font-medium"
                        style={{ color: currentTheme.colors.accent }}
                      >
                        🎉 ¡Ahorraste {formatCurrency(discount)} con tu compra angelical!
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Security Badge */}
                <div 
                  className="mt-6 p-3 rounded-lg text-center"
                  style={{ backgroundColor: `${currentTheme.colors.accent}15` }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: currentTheme.colors.text }}
                    >
                      Compra 100% Segura
                    </span>
                  </div>
                  <p 
                    className="text-xs"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Protegido por SSL y encriptación de grado bancario
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  )
}