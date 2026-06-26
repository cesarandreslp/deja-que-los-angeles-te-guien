import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
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
      paymentMethods,
      enableInstallments,
      maxInstallments
    } = body

    // Validar que al menos una pasarela esté configurada si está habilitada
    if (mercadoPagoEnabled && (!mercadoPagoPublicKey || !mercadoPagoAccessToken)) {
      return NextResponse.json(
        { error: 'Public Key y Access Token son requeridos para Mercado Pago' },
        { status: 400 }
      )
    }

    if (stripeEnabled && (!stripePublishableKey || !stripeSecretKey)) {
      return NextResponse.json(
        { error: 'Publishable Key y Secret Key son requeridos para Stripe' },
        { status: 400 }
      )
    }

    // Validar rangos
    if (maxInstallments && (maxInstallments < 1 || maxInstallments > 24)) {
      return NextResponse.json(
        { error: 'El máximo de cuotas debe estar entre 1 y 24' },
        { status: 400 }
      )
    }

    // Guardar cada configuración
    const configUpdates = [
      // Mercado Pago
      { category: 'PAYMENT', key: 'mercadoPagoEnabled', value: mercadoPagoEnabled.toString() },
      { category: 'PAYMENT', key: 'mercadoPagoPublicKey', value: mercadoPagoPublicKey || '' },
      { category: 'PAYMENT', key: 'mercadoPagoAccessToken', value: mercadoPagoAccessToken || '' },
      { category: 'PAYMENT', key: 'mercadoPagoWebhookSecret', value: mercadoPagoWebhookSecret || '' },
      { category: 'PAYMENT', key: 'mercadoPagoSandbox', value: mercadoPagoSandbox.toString() },
      
      // Stripe
      { category: 'PAYMENT', key: 'stripeEnabled', value: stripeEnabled.toString() },
      { category: 'PAYMENT', key: 'stripePublishableKey', value: stripePublishableKey || '' },
      { category: 'PAYMENT', key: 'stripeSecretKey', value: stripeSecretKey || '' },
      { category: 'PAYMENT', key: 'stripeWebhookSecret', value: stripeWebhookSecret || '' },
      { category: 'PAYMENT', key: 'stripeSandbox', value: stripeSandbox.toString() },
      
      // General
      { category: 'PAYMENT', key: 'defaultCurrency', value: defaultCurrency || 'MXN' },
      { category: 'PAYMENT', key: 'paymentMethods', value: JSON.stringify(paymentMethods || ['credit_card']) },
      { category: 'PAYMENT', key: 'enableInstallments', value: enableInstallments.toString() },
      { category: 'PAYMENT', key: 'maxInstallments', value: (maxInstallments || 12).toString() }
    ]

    // Usar upsert para crear o actualizar cada configuración
    for (const config of configUpdates) {
      await prisma.system_configs.upsert({
        where: {
          category_key: {
            category: config.category,
            key: config.key
          }
        },
        update: {
          value: config.value,
          updatedAt: new Date()
        },
        create: {
          category: config.category,
          key: config.key,
          value: config.value
        }
      })
    }

    return NextResponse.json({
      message: 'Configuración de pagos guardada exitosamente'
    })

  } catch (error) {
    console.error('Error guardando configuración de pagos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}