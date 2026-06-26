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
    const { provider, apiKey, model, maxTokens, temperature } = body

    if (!provider || !apiKey || !model) {
      return NextResponse.json(
        { error: 'Proveedor, API Key y modelo son requeridos' },
        { status: 400 }
      )
    }

    let response = ''

    try {
      if (provider === 'openai') {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: 'Responde solo "¡Conexión exitosa con OpenAI!" para confirmar que la API funciona correctamente.'
              }
            ],
            max_tokens: Math.min(maxTokens || 100, 100),
            temperature: temperature || 0.7
          })
        })

        if (!openaiResponse.ok) {
          const error = await openaiResponse.json()
          throw new Error(error.error?.message || 'Error en la API de OpenAI')
        }

        const data = await openaiResponse.json()
        response = data.choices[0]?.message?.content || 'Respuesta vacía'

      } else if (provider === 'anthropic') {
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: Math.min(maxTokens || 100, 100),
            messages: [
              {
                role: 'user',
                content: 'Responde solo "¡Conexión exitosa con Anthropic!" para confirmar que la API funciona correctamente.'
              }
            ]
          })
        })

        if (!anthropicResponse.ok) {
          const error = await anthropicResponse.json()
          throw new Error(error.error?.message || 'Error en la API de Anthropic')
        }

        const data = await anthropicResponse.json()
        response = data.content[0]?.text || 'Respuesta vacía'

      } else if (provider === 'gemini') {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Responde solo "¡Conexión exitosa con Gemini!" para confirmar que la API funciona correctamente.'
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: temperature || 0.7,
              maxOutputTokens: Math.min(maxTokens || 100, 100)
            }
          })
        })

        if (!geminiResponse.ok) {
          const error = await geminiResponse.json()
          throw new Error(error.error?.message || 'Error en la API de Gemini')
        }

        const data = await geminiResponse.json()
        response = data.candidates[0]?.content?.parts[0]?.text || 'Respuesta vacía'

      } else if (provider === 'local') {
        // Para modelos locales, solo simulamos una respuesta exitosa
        response = '¡Conexión simulada con modelo local! (Implementación pendiente)'
      } else {
        throw new Error('Proveedor de IA no soportado')
      }

    } catch (apiError: any) {
      console.error('Error en API de IA:', apiError)
      
      let errorMessage = 'Error desconocido en la API'
      
      if (apiError.message.includes('401') || apiError.message.includes('Unauthorized')) {
        errorMessage = 'API Key inválida o sin permisos'
      } else if (apiError.message.includes('quota') || apiError.message.includes('limit')) {
        errorMessage = 'Límite de cuota excedido'
      } else if (apiError.message.includes('model')) {
        errorMessage = 'Modelo no encontrado o no disponible'
      } else if (apiError.message) {
        errorMessage = apiError.message
      }

      return NextResponse.json(
        { error: `Error probando conexión con IA: ${errorMessage}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Conexión con IA exitosa',
      response: response.trim(),
      provider: provider,
      model: model
    })

  } catch (error: any) {
    console.error('Error general probando IA:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}