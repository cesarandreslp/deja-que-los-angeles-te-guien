import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener todas las configuraciones
    const configs = await prisma.system_configs.findMany()
    
    // Organizar por categorías
    const emailConfig = configs
      .filter((config: any) => config.category === 'EMAIL')
      .reduce((acc: any, config: any) => {
        acc[config.key] = config.value
        return acc
      }, {} as Record<string, string>)

    const aiConfig = configs
      .filter((config: any) => config.category === 'AI')
      .reduce((acc: any, config: any) => {
        acc[config.key] = config.value
        return acc
      }, {} as Record<string, string>)

    const appConfig = configs
      .filter((config: any) => config.category === 'APP')
      .reduce((acc: any, config: any) => {
        acc[config.key] = config.value
        return acc
      }, {} as Record<string, string>)

    const paymentConfig = configs
      .filter((config: any) => config.category === 'PAYMENT')
      .reduce((acc: any, config: any) => {
        acc[config.key] = config.value
        return acc
      }, {} as Record<string, string>)

    return NextResponse.json({
      emailConfig: {
        smtpHost: emailConfig.smtpHost || '',
        smtpPort: parseInt(emailConfig.smtpPort) || 587,
        smtpUser: emailConfig.smtpUser || '',
        smtpPassword: emailConfig.smtpPassword || '',
        fromEmail: emailConfig.fromEmail || '',
        fromName: emailConfig.fromName || 'Oráculo de los Arcángeles',
        enabled: emailConfig.enabled === 'true'
      },
      aiConfig: {
        provider: aiConfig.provider || 'openai',
        apiKey: aiConfig.apiKey || '',
        model: aiConfig.model || 'gpt-4',
        enabled: aiConfig.enabled === 'true',
        maxTokens: parseInt(aiConfig.maxTokens) || 2000,
        temperature: parseFloat(aiConfig.temperature) || 0.7
      },
      appConfig: {
        siteName: appConfig.siteName || 'Oráculo de los Arcángeles',
        siteUrl: appConfig.siteUrl || 'http://localhost:3001',
        maintenanceMode: appConfig.maintenanceMode === 'true',
        registrationEnabled: appConfig.registrationEnabled !== 'false', // true por defecto
        emailVerificationRequired: appConfig.emailVerificationRequired !== 'false',
        passwordResetEnabled: appConfig.passwordResetEnabled !== 'false',
        maxLoginAttempts: parseInt(appConfig.maxLoginAttempts) || 5,
        sessionTimeout: parseInt(appConfig.sessionTimeout) || 30
      },
      paymentConfig: {
        // Mercado Pago
        mercadoPagoEnabled: paymentConfig.mercadoPagoEnabled === 'true',
        mercadoPagoPublicKey: paymentConfig.mercadoPagoPublicKey || '',
        mercadoPagoAccessToken: paymentConfig.mercadoPagoAccessToken || '',
        mercadoPagoWebhookSecret: paymentConfig.mercadoPagoWebhookSecret || '',
        mercadoPagoSandbox: paymentConfig.mercadoPagoSandbox !== 'false',
        
        // Stripe
        stripeEnabled: paymentConfig.stripeEnabled === 'true',
        stripePublishableKey: paymentConfig.stripePublishableKey || '',
        stripeSecretKey: paymentConfig.stripeSecretKey || '',
        stripeWebhookSecret: paymentConfig.stripeWebhookSecret || '',
        stripeSandbox: paymentConfig.stripeSandbox !== 'false',
        
        // General
        defaultCurrency: paymentConfig.defaultCurrency || 'MXN',
        paymentMethods: paymentConfig.paymentMethods ? JSON.parse(paymentConfig.paymentMethods) : ['credit_card', 'debit_card'],
        enableInstallments: paymentConfig.enableInstallments !== 'false',
        maxInstallments: parseInt(paymentConfig.maxInstallments) || 12
      }
    })
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}