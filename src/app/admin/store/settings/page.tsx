// Store Settings Page - Configuración de la tienda angelical
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import {
  CogIcon,
  BanknotesIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { StoreConfig } from '@/types/store'
import { formatCurrency, formatTaxRate } from '@/utils/taxCalculator'

export default function StoreSettingsPage() {
  const { currentTheme } = useTheme()
  const [config, setConfig] = useState<StoreConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    taxEnabled: true,
    defaultTaxRate: 0.19,
    taxName: 'IVA',
    shippingEnabled: true,
    freeShippingThreshold: 5000000,
    standardShippingCents: 500000
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/store/config')
      const data = await response.json()
      
      if (data.success) {
        setConfig(data.data)
        setFormData({
          taxEnabled: data.data.taxEnabled,
          defaultTaxRate: data.data.defaultTaxRate,
          taxName: data.data.taxName,
          shippingEnabled: data.data.shippingEnabled,
          freeShippingThreshold: data.data.freeShippingThreshold,
          standardShippingCents: data.data.standardShippingCents
        })
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      showMessage('error', 'Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/store/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setConfig(data.data)
        showMessage('success', 'Configuración guardada exitosamente')
      } else {
        showMessage('error', data.error || 'Error al guardar configuración')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      showMessage('error', 'Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen p-8"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="max-w-4xl mx-auto text-center py-12">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: currentTheme.colors.accent }}
          />
          <p style={{ color: currentTheme.colors.textSecondary }}>
            Cargando configuración...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen p-8"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <CogIcon 
              className="h-10 w-10 mr-3"
              style={{ color: currentTheme.colors.accent }}
            />
            <h1 
              className="text-4xl font-bold"
              style={{ color: currentTheme.colors.text }}
            >
              Configuración de la Tienda
            </h1>
          </div>
          <p style={{ color: currentTheme.colors.textSecondary }}>
            Configura los impuestos, envíos y otras opciones de la tienda angelical
          </p>
        </div>

        {/* Message */}
        {message && (
          <div 
            className={`p-4 rounded-lg mb-6 flex items-center ${
              message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-600 mr-3" />
            )}
            <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Tax Configuration */}
          <div 
            className="rounded-lg p-6 mb-6"
            style={{ backgroundColor: currentTheme.colors.cardBg }}
          >
            <div className="flex items-center mb-6">
              <BanknotesIcon 
                className="h-6 w-6 mr-3"
                style={{ color: currentTheme.colors.accent }}
              />
              <h2 
                className="text-2xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                Configuración de Impuestos
              </h2>
            </div>

            <div className="space-y-6">
              {/* Tax Enabled */}
              <div className="flex items-center justify-between">
                <div>
                  <label 
                    className="font-semibold block mb-1"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Habilitar Impuestos
                  </label>
                  <p 
                    className="text-sm"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Aplicar impuestos a todos los productos
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.taxEnabled}
                    onChange={(e) => setFormData({ ...formData, taxEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Tax Name */}
              <div>
                <label 
                  className="font-semibold block mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Nombre del Impuesto
                </label>
                <input
                  type="text"
                  value={formData.taxName}
                  onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                  placeholder="IVA"
                  disabled={!formData.taxEnabled}
                />
                <p 
                  className="text-sm mt-1"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Ej: IVA, Impuesto, Tax
                </p>
              </div>

              {/* Tax Rate */}
              <div>
                <label 
                  className="font-semibold block mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Tasa de Impuesto ({formatTaxRate(formData.defaultTaxRate)})
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="0.30"
                    step="0.01"
                    value={formData.defaultTaxRate}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) })}
                    className="flex-1"
                    disabled={!formData.taxEnabled}
                  />
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="1"
                    value={(formData.defaultTaxRate * 100).toFixed(0)}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) / 100 })}
                    className="w-20 px-3 py-2 rounded-lg border text-center"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.borderColor,
                      color: currentTheme.colors.text
                    }}
                    disabled={!formData.taxEnabled}
                  />
                  <span style={{ color: currentTheme.colors.text }}>%</span>
                </div>
                <p 
                  className="text-sm mt-1"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Colombia: 19% (IVA), USA: 6-10% (Sales Tax)
                </p>
              </div>

              {/* Preview */}
              {formData.taxEnabled && (
                <div 
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${currentTheme.colors.accent}15`,
                    borderColor: currentTheme.colors.accent
                  }}
                >
                  <p 
                    className="text-sm font-semibold mb-2"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Vista Previa de Cálculo:
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.colors.textSecondary }}>
                        Subtotal:
                      </span>
                      <span style={{ color: currentTheme.colors.text }}>
                        {formatCurrency(10000000, 'COP')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: currentTheme.colors.textSecondary }}>
                        {formData.taxName} ({formatTaxRate(formData.defaultTaxRate)}):
                      </span>
                      <span style={{ color: currentTheme.colors.text }}>
                        {formatCurrency(Math.round(10000000 * formData.defaultTaxRate), 'COP')}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: currentTheme.colors.borderColor }}>
                      <span style={{ color: currentTheme.colors.text }}>Total:</span>
                      <span style={{ color: currentTheme.colors.accent }}>
                        {formatCurrency(Math.round(10000000 * (1 + formData.defaultTaxRate)), 'COP')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Configuration */}
          <div 
            className="rounded-lg p-6 mb-6"
            style={{ backgroundColor: currentTheme.colors.cardBg }}
          >
            <div className="flex items-center mb-6">
              <TruckIcon 
                className="h-6 w-6 mr-3"
                style={{ color: currentTheme.colors.accent }}
              />
              <h2 
                className="text-2xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                Configuración de Envíos
              </h2>
            </div>

            <div className="space-y-6">
              {/* Shipping Enabled */}
              <div className="flex items-center justify-between">
                <div>
                  <label 
                    className="font-semibold block mb-1"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Habilitar Envíos
                  </label>
                  <p 
                    className="text-sm"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    Cobrar envío en los pedidos
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shippingEnabled}
                    onChange={(e) => setFormData({ ...formData, shippingEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Standard Shipping Cost */}
              <div>
                <label 
                  className="font-semibold block mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Costo de Envío Estándar
                </label>
                <div className="flex items-center space-x-3">
                  <span style={{ color: currentTheme.colors.text }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.standardShippingCents / 100}
                    onChange={(e) => setFormData({ ...formData, standardShippingCents: Math.round(parseFloat(e.target.value) * 100) })}
                    className="flex-1 px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.borderColor,
                      color: currentTheme.colors.text
                    }}
                    placeholder="5000"
                    disabled={!formData.shippingEnabled}
                  />
                  <span style={{ color: currentTheme.colors.textSecondary }}>COP</span>
                </div>
                <p 
                  className="text-sm mt-1"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Costo del envío estándar en Colombia
                </p>
              </div>

              {/* Free Shipping Threshold */}
              <div>
                <label 
                  className="font-semibold block mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Umbral para Envío Gratis
                </label>
                <div className="flex items-center space-x-3">
                  <span style={{ color: currentTheme.colors.text }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.freeShippingThreshold / 100}
                    onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Math.round(parseFloat(e.target.value) * 100) })}
                    className="flex-1 px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.borderColor,
                      color: currentTheme.colors.text
                    }}
                    placeholder="50000"
                    disabled={!formData.shippingEnabled}
                  />
                  <span style={{ color: currentTheme.colors.textSecondary }}>COP</span>
                </div>
                <p 
                  className="text-sm mt-1"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Compras superiores a este monto tienen envío gratis
                </p>
              </div>

              {/* Preview */}
              {formData.shippingEnabled && (
                <div 
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${currentTheme.colors.accent}15`,
                    borderColor: currentTheme.colors.accent
                  }}
                >
                  <p 
                    className="text-sm font-semibold mb-2"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Vista Previa de Envío:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span style={{ color: currentTheme.colors.textSecondary }}>
                        • Compra menor a {formatCurrency(formData.freeShippingThreshold, 'COP')}:
                      </span>
                      <span className="ml-2 font-semibold" style={{ color: currentTheme.colors.text }}>
                        +{formatCurrency(formData.standardShippingCents, 'COP')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span style={{ color: currentTheme.colors.textSecondary }}>
                        • Compra mayor a {formatCurrency(formData.freeShippingThreshold, 'COP')}:
                      </span>
                      <span className="ml-2 font-semibold text-green-600">
                        Envío GRATIS 🎉
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentTheme.colors.accent,
                color: 'white'
              }}
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
