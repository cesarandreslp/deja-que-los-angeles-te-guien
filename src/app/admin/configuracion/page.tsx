'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/context/ThemeContext'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ThemeCustomization from '@/components/admin/ThemeCustomization'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
// Tabs components no longer needed - using custom navigation
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'

interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  fromEmail: string
  fromName: string
  enabled: boolean
}

interface AIConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'local'
  apiKey: string
  model: string
  enabled: boolean
  maxTokens: number
  temperature: number
}

interface AppConfig {
  siteName: string
  siteUrl: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  passwordResetEnabled: boolean
  maxLoginAttempts: number
  sessionTimeout: number
}

interface PaymentConfig {
  // Mercado Pago
  mercadoPagoEnabled: boolean
  mercadoPagoPublicKey: string
  mercadoPagoAccessToken: string
  mercadoPagoWebhookSecret: string
  mercadoPagoSandbox: boolean
  
  // Stripe
  stripeEnabled: boolean
  stripePublishableKey: string
  stripeSecretKey: string
  stripeWebhookSecret: string
  stripeSandbox: boolean
  
  // Configuraciones generales
  defaultCurrency: string
  paymentMethods: string[]
  enableInstallments: boolean
  maxInstallments: number
}

export default function ConfiguracionPage() {
  const { data: session, status } = useSession()
  const { currentTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('theme')

  // Estados para las configuraciones
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Oráculo de los Arcángeles',
    enabled: false
  })

  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4',
    enabled: false,
    maxTokens: 2000,
    temperature: 0.7
  })

  const [appConfig, setAppConfig] = useState<AppConfig>({
    siteName: 'Oráculo de los Arcángeles',
    siteUrl: 'http://localhost:3001',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    passwordResetEnabled: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30
  })

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    // Mercado Pago
    mercadoPagoEnabled: false,
    mercadoPagoPublicKey: '',
    mercadoPagoAccessToken: '',
    mercadoPagoWebhookSecret: '',
    mercadoPagoSandbox: true,
    
    // Stripe
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    stripeSandbox: true,
    
    // Configuraciones generales
    defaultCurrency: 'MXN',
    paymentMethods: ['credit_card', 'debit_card'],
    enableInstallments: true,
    maxInstallments: 12
  })

  // Verificar autenticación y permisos
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      redirect('/login')
    }
    
    // Cargar configuraciones existentes
    loadConfigurations()
  }, [session, status])

  const loadConfigurations = async () => {
    try {
      const response = await fetch('/api/admin/config')
      if (response.ok) {
        const data = await response.json()
        if (data.emailConfig) setEmailConfig(data.emailConfig)
        if (data.aiConfig) setAIConfig(data.aiConfig)
        if (data.appConfig) setAppConfig(data.appConfig)
        if (data.paymentConfig) setPaymentConfig(data.paymentConfig)
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error)
    }
  }

  const saveEmailConfig = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/config/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Configuración de correo guardada exitosamente')
      } else {
        setError(data.error || 'Error al guardar configuración')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const testEmailConfig = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/config/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          config: emailConfig,
          testEmail: session?.user.email 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Email de prueba enviado exitosamente. Revisa tu bandeja de entrada.')
      } else {
        setError(data.error || 'Error al enviar email de prueba')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const saveAIConfig = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/config/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Configuración de IA guardada exitosamente')
      } else {
        setError(data.error || 'Error al guardar configuración')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const testAIConfig = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/config/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Conexión con IA exitosa. Respuesta: ${data.response}`)
      } else {
        setError(data.error || 'Error al probar conexión con IA')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const saveAppConfig = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/config/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appConfig)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Configuración de aplicación guardada exitosamente')
      } else {
        setError(data.error || 'Error al guardar configuración')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const testSpecificEmail = async (emailType: string) => {
    setLoading(true)
    setError('')
    setMessage('')

    const testEmail = session?.user?.email || 'admin@ossinnovation.com'

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          email: testEmail,
          data: {
            userName: session?.user?.name || 'Administrador',
            verificationUrl: `${window.location.origin}/verify-email?token=test-token`,
            resetUrl: `${window.location.origin}/reset-password?token=test-token`,
            subject: 'Email de Prueba desde Panel Admin',
            html: '<h1>¡Hola desde el Panel de Administración!</h1><p>Este es un email de prueba del sistema.</p>'
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Email de ${emailType} enviado exitosamente a ${testEmail}`)
      } else {
        setError(data.error || 'Error al enviar email de prueba')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const savePaymentConfig = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/config/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentConfig)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Configuración de pagos guardada exitosamente')
      } else {
        setError(data.error || 'Error al guardar configuración')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const testPaymentConfig = async (provider: 'mercadopago' | 'stripe') => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/config/payment/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider,
          config: paymentConfig
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Conexión con ${provider === 'mercadopago' ? 'Mercado Pago' : 'Stripe'} exitosa`)
      } else {
        setError(data.error || `Error probando ${provider}`)
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme?.colors.background }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-32 w-32 border-b-2 mb-4"
            style={{ borderBottomColor: currentTheme?.colors.accent }}
          ></div>
          <h2 
            className="text-xl font-semibold mb-2"
            style={{ 
              color: currentTheme?.colors.text,
              fontFamily: currentTheme?.typography.headingFont
            }}
          >
            ⚙️ Cargando Configuración...
          </h2>
          <p style={{ color: currentTheme?.colors.textSecondary }}>
            Preparando panel de configuración
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: currentTheme?.colors.background }}>
      {/* Header Angelical */}
      <div 
        className="shadow-lg border-b"
        style={{ 
          background: currentTheme?.colors.buttonGradient,
          borderBottomColor: currentTheme?.colors.borderColor
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 
                className="text-3xl font-bold flex items-center gap-3 text-white"
                style={{ fontFamily: currentTheme?.typography.headingFont }}
              >
                ⚙️ Configuración Celestial
              </h1>
              <p className="text-white/80">
                Administra las configuraciones sagradas del oráculo
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/admin" className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 hover:scale-105">
                ← Volver al Panel
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {message && (
        <div 
          className="mb-6 border px-4 py-3 rounded-lg shadow-md"
          style={{ 
            backgroundColor: '#10b981' + '10',
            borderColor: '#10b981',
            color: '#10b981'
          }}
        >
          ✅ {message}
        </div>
      )}

      {error && (
        <div 
          className="mb-6 border px-4 py-3 rounded-lg shadow-md"
          style={{ 
            backgroundColor: '#ef4444' + '10',
            borderColor: '#ef4444',
            color: '#ef4444'
          }}
        >
          ❌ {error}
        </div>
      )}

      <div className="space-y-6">
        <div 
          className="grid w-full grid-cols-6 rounded-lg shadow-lg p-2 mb-6"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <button
            onClick={() => setActiveTab('theme')}
            className="px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: activeTab === 'theme' ? currentTheme?.colors.accent : 'transparent',
              color: activeTab === 'theme' ? 'white' : currentTheme?.colors.textSecondary
            }}
          >
            🎨 Tema Angelical
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className="px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: activeTab === 'email' ? currentTheme?.colors.accent : 'transparent',
              color: activeTab === 'email' ? 'white' : currentTheme?.colors.textSecondary
            }}
          >
            📧 Correo Celestial
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className="px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: activeTab === 'ai' ? currentTheme?.colors.accent : 'transparent',
              color: activeTab === 'ai' ? 'white' : currentTheme?.colors.textSecondary
            }}
          >
            🤖 IA Divina
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className="px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: activeTab === 'payment' ? currentTheme?.colors.accent : 'transparent',
              color: activeTab === 'payment' ? 'white' : currentTheme?.colors.textSecondary
            }}
          >
            💰 Pagos Sagrados
          </button>
          <button
            onClick={() => setActiveTab('app')}
            className="px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: activeTab === 'app' ? currentTheme?.colors.accent : 'transparent',
              color: activeTab === 'app' ? 'white' : currentTheme?.colors.textSecondary
            }}
          >
            ⚙️ App Oráculo
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className="px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: activeTab === 'security' ? currentTheme?.colors.accent : 'transparent',
              color: activeTab === 'security' ? 'white' : currentTheme?.colors.textSecondary
            }}
          >
            🔒 Seguridad
          </button>
        </div>

        {/* Configuración de Tema - NUEVA PESTAÑA PRINCIPAL */}
        {activeTab === 'theme' && (
          <div 
            className="rounded-xl shadow-lg p-6"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 
                  className="text-2xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  🎨 Personalización Angelical
                </h3>
                <div 
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ background: currentTheme?.colors.buttonGradient }}
                >
                  Principal
                </div>
              </div>
              <p 
                className="text-sm"
                style={{ color: currentTheme?.colors.textSecondary }}
              >
                Configura los colores y apariencia del oráculo sagrado
              </p>
            </div>
            <div 
              className="rounded-lg p-4 border"
              style={{ 
                backgroundColor: currentTheme?.colors.background,
                borderColor: currentTheme?.colors.borderColor
              }}
            >
              <ThemeCustomization />
            </div>
          </div>
        )}

        {/* Configuración de Correo Electrónico */}
        {activeTab === 'email' && (
          <div 
            className="rounded-xl shadow-lg p-6"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 
                  className="text-2xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  📧 Correo Celestial
                </h3>
                <div 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: emailConfig.enabled ? '#10b981' : '#6b7280',
                    color: 'white'
                  }}
                >
                  {emailConfig.enabled ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              <p 
                className="text-sm"
                style={{ color: currentTheme?.colors.textSecondary }}
              >
                Configura el sistema de correo divino para notificaciones sagradas
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={emailConfig.enabled}
                  onCheckedChange={(checked) => 
                    setEmailConfig(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <label 
                  className="text-sm font-medium"
                  style={{ color: currentTheme?.colors.text }}
                >
                  ✨ Habilitar servicio de correo angelical
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Servidor SMTP"
                  value={emailConfig.smtpHost}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                  placeholder="smtp.gmail.com"
                />
                <Input
                  label="Puerto SMTP"
                  type="number"
                  value={emailConfig.smtpPort}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                  placeholder="587"
                />
                <Input
                  label="Usuario SMTP"
                  value={emailConfig.smtpUser}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                  placeholder="tu-email@gmail.com"
                />
                <Input
                  label="Contraseña SMTP"
                  type="password"
                  value={emailConfig.smtpPassword}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  placeholder="tu-contraseña-app"
                />
                <Input
                  label="Email remitente"
                  value={emailConfig.fromEmail}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                  placeholder="noreply@oraculo.com"
                />
                <Input
                  label="Nombre remitente"
                  value={emailConfig.fromName}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="Oráculo de los Arcángeles"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={saveEmailConfig} loading={loading}>
                  Guardar Configuración
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testEmailConfig} 
                  loading={loading}
                  disabled={!emailConfig.enabled}
                >
                  Probar Conexión
                </Button>
              </div>

              {/* Sección de pruebas específicas de email */}
              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  📨 Pruebas de Templates de Email
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testSpecificEmail('verification')}
                    loading={loading}
                    disabled={!emailConfig.enabled}
                    className="text-xs"
                  >
                    ✅ Verificación
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testSpecificEmail('password-reset')}
                    loading={loading}
                    disabled={!emailConfig.enabled}
                    className="text-xs"
                  >
                    🔑 Reset Password
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testSpecificEmail('welcome')}
                    loading={loading}
                    disabled={!emailConfig.enabled}
                    className="text-xs"
                  >
                    🎉 Bienvenida
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testSpecificEmail('custom')}
                    loading={loading}
                    disabled={!emailConfig.enabled}
                    className="text-xs"
                  >
                    📝 Personalizado
                  </Button>
                </div>
                <p 
                  className="text-sm mt-2"
                  style={{ color: currentTheme?.colors.textSecondary }}
                >
                  Los emails de prueba se enviarán a: <code 
                    className="px-1 rounded"
                    style={{ 
                      backgroundColor: currentTheme?.colors.background,
                      color: currentTheme?.colors.text
                    }}
                  >
                    {session?.user?.email || 'admin@ossinnovation.com'}
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configuración de IA */}
        {activeTab === 'ai' && (
          <div 
            className="rounded-xl shadow-lg p-6"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 
                  className="text-2xl font-bold"
                  style={{ 
                    color: currentTheme?.colors.text,
                    fontFamily: currentTheme?.typography.headingFont
                  }}
                >
                  🤖 Inteligencia Divina
                </h3>
                <div 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: aiConfig.enabled ? '#10b981' : '#6b7280',
                    color: 'white'
                  }}
                >
                  {aiConfig.enabled ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              <p 
                className="text-sm"
                style={{ color: currentTheme?.colors.textSecondary }}
              >
                Configura la inteligencia artificial para consultas angelicales
              </p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={aiConfig.enabled}
                  onCheckedChange={(checked) => 
                    setAIConfig(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <label className="text-sm font-medium">Habilitar servicio de IA</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor de IA
                  </label>
                  <select
                    value={aiConfig.provider}
                    onChange={(e) => setAIConfig(prev => ({ 
                      ...prev, 
                      provider: e.target.value as AIConfig['provider']
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="openai">OpenAI (GPT)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="gemini">Google (Gemini)</option>
                    <option value="local">Modelo Local</option>
                  </select>
                </div>

                <Input
                  label="Modelo"
                  value={aiConfig.model}
                  onChange={(e) => setAIConfig(prev => ({ ...prev, model: e.target.value }))}
                  placeholder={
                    aiConfig.provider === 'openai' ? 'gpt-4' :
                    aiConfig.provider === 'anthropic' ? 'claude-3-sonnet' :
                    aiConfig.provider === 'gemini' ? 'gemini-pro' : 'local-model'
                  }
                />

                <Input
                  label="API Key"
                  type="password"
                  value={aiConfig.apiKey}
                  onChange={(e) => setAIConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="sk-..."
                />

                <Input
                  label="Máximo de tokens"
                  type="number"
                  value={aiConfig.maxTokens}
                  onChange={(e) => setAIConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  placeholder="2000"
                />

                <Input
                  label="Temperatura (0-1)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={aiConfig.temperature}
                  onChange={(e) => setAIConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  placeholder="0.7"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-2">Información de Proveedores:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li><strong>OpenAI:</strong> Excelente para respuestas creativas y conversacionales</li>
                  <li><strong>Anthropic:</strong> Muy bueno para análisis y respuestas seguras</li>
                  <li><strong>Gemini:</strong> Integración nativa con Google, multimodal</li>
                  <li><strong>Local:</strong> Mayor privacidad, requiere configuración adicional</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button onClick={saveAIConfig} loading={loading}>
                  Guardar Configuración
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testAIConfig} 
                  loading={loading}
                  disabled={!aiConfig.enabled}
                >
                  Probar Conexión
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Configuración de Pagos */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            {/* Mercado Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💰 Mercado Pago
                  <Badge variant={paymentConfig.mercadoPagoEnabled ? 'default' : 'secondary'}>
                    {paymentConfig.mercadoPagoEnabled ? 'Activo' : 'Inactivo'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Configuración para pagos con Mercado Pago (América Latina)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={paymentConfig.mercadoPagoEnabled}
                    onCheckedChange={(checked) => 
                      setPaymentConfig(prev => ({ ...prev, mercadoPagoEnabled: checked }))
                    }
                  />
                  <label className="text-sm font-medium">Habilitar Mercado Pago</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Public Key"
                    value={paymentConfig.mercadoPagoPublicKey}
                    onChange={(e) => setPaymentConfig(prev => ({ ...prev, mercadoPagoPublicKey: e.target.value }))}
                    placeholder="APP_USR-..."
                  />
                  <Input
                    label="Access Token"
                    type="password"
                    value={paymentConfig.mercadoPagoAccessToken}
                    onChange={(e) => setPaymentConfig(prev => ({ ...prev, mercadoPagoAccessToken: e.target.value }))}
                    placeholder="APP_USR-..."
                  />
                  <Input
                    label="Webhook Secret"
                    type="password"
                    value={paymentConfig.mercadoPagoWebhookSecret}
                    onChange={(e) => setPaymentConfig(prev => ({ ...prev, mercadoPagoWebhookSecret: e.target.value }))}
                    placeholder="webhook-secret-key"
                  />
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <Switch
                      checked={paymentConfig.mercadoPagoSandbox}
                      onCheckedChange={(checked) => 
                        setPaymentConfig(prev => ({ ...prev, mercadoPagoSandbox: checked }))
                      }
                    />
                    <label className="text-sm font-medium">Modo Sandbox (Pruebas)</label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Información de Mercado Pago:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Ideal para usuarios de América Latina</li>
                    <li>• Soporte para cuotas sin interés</li>
                    <li>• Múltiples métodos de pago locales</li>
                    <li>• Webhooks para confirmación automática</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => testPaymentConfig('mercadopago')} 
                    loading={loading}
                    disabled={!paymentConfig.mercadoPagoEnabled}
                  >
                    Probar Conexión
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stripe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💳 Stripe
                  <Badge variant={paymentConfig.stripeEnabled ? 'default' : 'secondary'}>
                    {paymentConfig.stripeEnabled ? 'Activo' : 'Inactivo'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Configuración para pagos con Stripe (Global)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={paymentConfig.stripeEnabled}
                    onCheckedChange={(checked) => 
                      setPaymentConfig(prev => ({ ...prev, stripeEnabled: checked }))
                    }
                  />
                  <label className="text-sm font-medium">Habilitar Stripe</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Publishable Key"
                    value={paymentConfig.stripePublishableKey}
                    onChange={(e) => setPaymentConfig(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
                    placeholder="pk_test_... o pk_live_..."
                  />
                  <Input
                    label="Secret Key"
                    type="password"
                    value={paymentConfig.stripeSecretKey}
                    onChange={(e) => setPaymentConfig(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                    placeholder="sk_test_... o sk_live_..."
                  />
                  <Input
                    label="Webhook Secret"
                    type="password"
                    value={paymentConfig.stripeWebhookSecret}
                    onChange={(e) => setPaymentConfig(prev => ({ ...prev, stripeWebhookSecret: e.target.value }))}
                    placeholder="whsec_..."
                  />
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <Switch
                      checked={paymentConfig.stripeSandbox}
                      onCheckedChange={(checked) => 
                        setPaymentConfig(prev => ({ ...prev, stripeSandbox: checked }))
                      }
                    />
                    <label className="text-sm font-medium">Modo Test (Pruebas)</label>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-800 mb-2">Información de Stripe:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Cobertura global con múltiples monedas</li>
                    <li>• APIs muy robustas y documentación excelente</li>
                    <li>• Soporte para suscripciones y pagos únicos</li>
                    <li>• Seguridad PCI DSS Nivel 1</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => testPaymentConfig('stripe')} 
                    loading={loading}
                    disabled={!paymentConfig.stripeEnabled}
                  >
                    Probar Conexión
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configuración General de Pagos */}
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Configuración General de Pagos</CardTitle>
                <CardDescription>
                  Configuraciones que aplican a todas las pasarelas de pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moneda por defecto
                    </label>
                    <select
                      value={paymentConfig.defaultCurrency}
                      onChange={(e) => setPaymentConfig(prev => ({ 
                        ...prev, 
                        defaultCurrency: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="USD">USD - Dólar Americano</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="ARS">ARS - Peso Argentino</option>
                      <option value="COP">COP - Peso Colombiano</option>
                      <option value="CLP">CLP - Peso Chileno</option>
                      <option value="BRL">BRL - Real Brasileño</option>
                    </select>
                  </div>

                  <Input
                    label="Máximo de cuotas"
                    type="number"
                    min="1"
                    max="24"
                    value={paymentConfig.maxInstallments}
                    onChange={(e) => setPaymentConfig(prev => ({ ...prev, maxInstallments: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Habilitar cuotas</h4>
                      <p className="text-sm text-gray-600">Permite pagos en cuotas cuando esté disponible</p>
                    </div>
                    <Switch
                      checked={paymentConfig.enableInstallments}
                      onCheckedChange={(checked) => 
                        setPaymentConfig(prev => ({ ...prev, enableInstallments: checked }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Métodos de pago habilitados
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'credit_card', label: 'Tarjetas de Crédito' },
                      { id: 'debit_card', label: 'Tarjetas de Débito' },
                      { id: 'bank_transfer', label: 'Transferencia Bancaria' },
                      { id: 'digital_wallet', label: 'Billeteras Digitales' },
                      { id: 'cash', label: 'Efectivo (OXXO, etc.)' },
                      { id: 'crypto', label: 'Criptomonedas' }
                    ].map((method) => (
                      <label key={method.id} className="flex items-center space-x-2 p-2 border rounded text-sm">
                        <input
                          type="checkbox"
                          checked={paymentConfig.paymentMethods.includes(method.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPaymentConfig(prev => ({
                                ...prev,
                                paymentMethods: [...prev.paymentMethods, method.id]
                              }))
                            } else {
                              setPaymentConfig(prev => ({
                                ...prev,
                                paymentMethods: prev.paymentMethods.filter(m => m !== method.id)
                              }))
                            }
                          }}
                          className="rounded"
                        />
                        <span>{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button onClick={savePaymentConfig} loading={loading}>
                  Guardar Configuración de Pagos
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Configuración de Aplicación */}
        {activeTab === 'app' && (
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Configuración de Aplicación</CardTitle>
              <CardDescription>
                Configuraciones generales del funcionamiento de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del sitio"
                  value={appConfig.siteName}
                  onChange={(e) => setAppConfig(prev => ({ ...prev, siteName: e.target.value }))}
                />
                <Input
                  label="URL del sitio"
                  value={appConfig.siteUrl}
                  onChange={(e) => setAppConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Modo mantenimiento</h4>
                    <p className="text-sm text-gray-600">Desactiva temporalmente la aplicación para mantenimiento</p>
                  </div>
                  <Switch
                    checked={appConfig.maintenanceMode}
                    onCheckedChange={(checked) => 
                      setAppConfig(prev => ({ ...prev, maintenanceMode: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Registro habilitado</h4>
                    <p className="text-sm text-gray-600">Permite que nuevos usuarios se registren</p>
                  </div>
                  <Switch
                    checked={appConfig.registrationEnabled}
                    onCheckedChange={(checked) => 
                      setAppConfig(prev => ({ ...prev, registrationEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Verificación de email requerida</h4>
                    <p className="text-sm text-gray-600">Los usuarios deben verificar su email antes de usar la app</p>
                  </div>
                  <Switch
                    checked={appConfig.emailVerificationRequired}
                    onCheckedChange={(checked) => 
                      setAppConfig(prev => ({ ...prev, emailVerificationRequired: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Recuperación de contraseña</h4>
                    <p className="text-sm text-gray-600">Permite a los usuarios recuperar sus contraseñas</p>
                  </div>
                  <Switch
                    checked={appConfig.passwordResetEnabled}
                    onCheckedChange={(checked) => 
                      setAppConfig(prev => ({ ...prev, passwordResetEnabled: checked }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Máximo intentos de login"
                  type="number"
                  value={appConfig.maxLoginAttempts}
                  onChange={(e) => setAppConfig(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                />
                <Input
                  label="Timeout de sesión (minutos)"
                  type="number"
                  value={appConfig.sessionTimeout}
                  onChange={(e) => setAppConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                />
              </div>

              <Button onClick={saveAppConfig} loading={loading}>
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Configuración de Personalización - DESACTIVADA */}
        {/* NOTA: Panel de personalización desactivado - solo se usa el tema original Oráculo */}

        {/* Configuración de Seguridad */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>🔒 Configuración de Seguridad</CardTitle>
              <CardDescription>
                Herramientas de seguridad y monitoreo del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Logs de Seguridad</h4>
                  <Button variant="outline" className="w-full">
                    Ver Intentos de Login Fallidos
                  </Button>
                  <Button variant="outline" className="w-full">
                    Ver Actividad de Usuarios
                  </Button>
                  <Button variant="outline" className="w-full">
                    Exportar Logs de Seguridad
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Herramientas de Mantenimiento</h4>
                  <Button variant="outline" className="w-full">
                    Limpiar Sesiones Expiradas
                  </Button>
                  <Button variant="outline" className="w-full">
                    Verificar Integridad de BD
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    Backup de Base de Datos
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Zona Peligrosa</h4>
                <p className="text-sm text-yellow-700 mb-4">
                  Estas acciones pueden afectar el funcionamiento de la aplicación
                </p>
                <div className="space-y-2">
                  <Button variant="destructive" size="sm">
                    Reiniciar Configuraciones
                  </Button>
                  <Button variant="destructive" size="sm">
                    Limpiar Cache del Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  )
}