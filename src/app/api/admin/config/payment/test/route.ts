import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { provider, config } = body

    if (!provider || !config) {
      return NextResponse.json(
        { error: 'Proveedor y configuración son requeridos' },
        { status: 400 }
      )
    }

    let testResult = ''

    try {
      if (provider === 'mercadopago') {
        if (!config.mercadoPagoAccessToken) {
          throw new Error('Access Token de Mercado Pago es requerido')
        }

        // Probar conexión con Mercado Pago
        const baseUrl = config.mercadoPagoSandbox 
          ? 'https://api.mercadopago.com/sandbox' 
          : 'https://api.mercadopago.com'

        const response = await fetch(`${baseUrl}/v1/account/me`, {
          headers: {
            'Authorization': `Bearer ${config.mercadoPagoAccessToken}`,
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Error en la API de Mercado Pago')
        }

        const data = await response.json()
        testResult = `Conexión exitosa con Mercado Pago. Usuario ID: ${data.id}, Email: ${data.email}`

      } else if (provider === 'stripe') {
        if (!config.stripeSecretKey) {
          throw new Error('Secret Key de Stripe es requerido')
        }

        // Probar conexión con Stripe
        const response = await fetch('https://api.stripe.com/v1/account', {
          headers: {
            'Authorization': `Bearer ${config.stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Error en la API de Stripe')
        }

        const data = await response.json()
        testResult = `Conexión exitosa con Stripe. Cuenta ID: ${data.id}, País: ${data.country}`

      } else {
        throw new Error('Proveedor de pago no soportado')
      }

    } catch (apiError: any) {
      console.error('Error en API de pago:', apiError)
      
      let errorMessage = 'Error desconocido en la API'
      
      if (apiError.message.includes('401') || apiError.message.includes('Unauthorized')) {
        errorMessage = 'Credenciales inválidas. Verifica las keys de la API'
      } else if (apiError.message.includes('403') || apiError.message.includes('Forbidden')) {
        errorMessage = 'Acceso denegado. Verifica los permisos de la API'
      } else if (apiError.message.includes('quota') || apiError.message.includes('limit')) {
        errorMessage = 'Límite de API excedido'
      } else if (apiError.message) {
        errorMessage = apiError.message
      }

      return NextResponse.json(
        { error: `Error probando conexión: ${errorMessage}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Conexión con pasarela exitosa',
      result: testResult,
      provider: provider
    })

  } catch (error: any) {
    console.error('Error general probando pasarela:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}