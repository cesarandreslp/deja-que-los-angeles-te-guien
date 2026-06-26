import { prisma } from '@/lib/prisma'

export async function getSystemConfig(category: string, key: string, defaultValue: any = null) {
  try {
    const config = await prisma.system_configs.findUnique({
      where: {
        category_key: {
          category,
          key
        }
      }
    })
    
    if (!config) return defaultValue
    
    // Convertir valores según el tipo esperado
    if (typeof defaultValue === 'boolean') {
      return config.value === 'true'
    }
    
    if (typeof defaultValue === 'number') {
      return parseInt(config.value) || defaultValue
    }
    
    return config.value || defaultValue
  } catch (error) {
    console.error(`Error obteniendo configuración ${category}.${key}:`, error)
    return defaultValue
  }
}

export async function isMaintenanceMode(): Promise<boolean> {
  return await getSystemConfig('APP', 'maintenanceMode', false)
}

export async function isRegistrationEnabled(): Promise<boolean> {
  return await getSystemConfig('APP', 'registrationEnabled', true)
}

export async function isEmailVerificationRequired(): Promise<boolean> {
  return await getSystemConfig('APP', 'emailVerificationRequired', true)
}

export async function isPasswordResetEnabled(): Promise<boolean> {
  return await getSystemConfig('APP', 'passwordResetEnabled', true)
}

export async function getMaxLoginAttempts(): Promise<number> {
  return await getSystemConfig('APP', 'maxLoginAttempts', 5)
}

export async function getSessionTimeout(): Promise<number> {
  return await getSystemConfig('APP', 'sessionTimeout', 30)
}

export async function getEmailConfig() {
  const [host, port, user, password, fromEmail, fromName, enabled] = await Promise.all([
    getSystemConfig('EMAIL', 'smtpHost', ''),
    getSystemConfig('EMAIL', 'smtpPort', 587),
    getSystemConfig('EMAIL', 'smtpUser', ''),
    getSystemConfig('EMAIL', 'smtpPassword', ''),
    getSystemConfig('EMAIL', 'fromEmail', ''),
    getSystemConfig('EMAIL', 'fromName', 'Oráculo de los Arcángeles'),
    getSystemConfig('EMAIL', 'enabled', false)
  ])

  return {
    smtpHost: host,
    smtpPort: port,
    smtpUser: user,
    smtpPassword: password,
    fromEmail,
    fromName,
    enabled
  }
}

export async function getAIConfig() {
  const [provider, apiKey, model, enabled, maxTokens, temperature] = await Promise.all([
    getSystemConfig('AI', 'provider', 'openai'),
    getSystemConfig('AI', 'apiKey', ''),
    getSystemConfig('AI', 'model', 'gpt-4'),
    getSystemConfig('AI', 'enabled', false),
    getSystemConfig('AI', 'maxTokens', 2000),
    getSystemConfig('AI', 'temperature', 0.7)
  ])

  return {
    provider,
    apiKey,
    model,
    enabled,
    maxTokens,
    temperature
  }
}

export async function getPaymentConfig() {
  const [
    // Mercado Pago
    mercadoPagoEnabled, mercadoPagoPublicKey, mercadoPagoAccessToken, 
    mercadoPagoWebhookSecret, mercadoPagoSandbox,
    // Stripe
    stripeEnabled, stripePublishableKey, stripeSecretKey, 
    stripeWebhookSecret, stripeSandbox,
    // General
    defaultCurrency, paymentMethods, enableInstallments, maxInstallments
  ] = await Promise.all([
    // Mercado Pago
    getSystemConfig('PAYMENT', 'mercadoPagoEnabled', false),
    getSystemConfig('PAYMENT', 'mercadoPagoPublicKey', ''),
    getSystemConfig('PAYMENT', 'mercadoPagoAccessToken', ''),
    getSystemConfig('PAYMENT', 'mercadoPagoWebhookSecret', ''),
    getSystemConfig('PAYMENT', 'mercadoPagoSandbox', true),
    // Stripe
    getSystemConfig('PAYMENT', 'stripeEnabled', false),
    getSystemConfig('PAYMENT', 'stripePublishableKey', ''),
    getSystemConfig('PAYMENT', 'stripeSecretKey', ''),
    getSystemConfig('PAYMENT', 'stripeWebhookSecret', ''),
    getSystemConfig('PAYMENT', 'stripeSandbox', true),
    // General
    getSystemConfig('PAYMENT', 'defaultCurrency', 'MXN'),
    getSystemConfig('PAYMENT', 'paymentMethods', '["credit_card", "debit_card"]'),
    getSystemConfig('PAYMENT', 'enableInstallments', true),
    getSystemConfig('PAYMENT', 'maxInstallments', 12)
  ])

  return {
    // Mercado Pago
    mercadoPagoEnabled,
    mercadoPagoPublicKey,
    mercadoPagoAccessToken,
    mercadoPagoWebhookSecret,
    mercadoPagoSandbox,
    // Stripe
    stripeEnabled,
    stripePublishableKey,
    stripeSecretKey,
    stripeWebhookSecret,
    stripeSandbox,
    // General
    defaultCurrency,
    paymentMethods: JSON.parse(paymentMethods),
    enableInstallments,
    maxInstallments
  }
}