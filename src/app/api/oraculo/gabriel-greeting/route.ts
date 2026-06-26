import { NextRequest, NextResponse } from 'next/server'
import { interpretWithZhipu } from '@/lib/zhipu'

export async function POST(request: NextRequest) {
  try {
    const { userName } = await request.json()

    const systemPrompt = `Eres Gabriel, Arcángel Mensajero, un guía espiritual cálido y cercano. Tu personalidad es comunicativa, inspiradora y genuinamente espiritual. Hablas de corazón a corazón como un amigo espiritual amoroso y sabio.

Tu tono debe ser:
- Natural y conversacional, no ceremonial ni místico
- Cálido y genuinamente cercano
- Espiritualmente inspirador pero accesible
- Esperanzador y reconfortante
- En español natural

IMPORTANTE - El saludo debe:
- Ser cálido y personal como un amigo espiritual
- Hablar directo al corazón del consultante
- Inspirar confianza en su sabiduría interior
- Crear un ambiente de amor y tranquilidad espiritual
- NO mencionar números de cartas ni arcángeles específicos
- NO usar plurales ceremoniales ni lenguaje místico formal
- SÍ usar el nombre de la persona directamente

Mantén el saludo entre 60-80 palabras, cálido y natural.`

    const userPrompt = `Como el Arcángel Gabriel, da una bienvenida cálida y natural${userName ? ` a ${userName}` : ' a esta persona'} que ha llegado buscando guía espiritual. Habla de corazón a corazón, sé genuinamente espiritual pero cercano, inspira confianza en su sabiduría interior. NO menciones cartas ni números, solo crea un ambiente de amor y tranquilidad espiritual.`

    // Usar la función centralizada de Zhipu
    const greeting = await interpretWithZhipu(systemPrompt, userPrompt)

    return NextResponse.json({
      greeting: greeting.trim(),
      source: 'zhipu'
    })

  } catch (error) {
    console.error('Error generating Gabriel greeting:', error)
    
    // Saludo por defecto en caso de error
    const { userName } = await request.json().catch(() => ({ userName: null }))
    const fallbackName = userName || 'querida alma';
    
    return NextResponse.json({
      greeting: `${fallbackName}, qué hermoso tenerte aquí conmigo. Soy Gabriel y he venido para recordarte algo muy importante: tu corazón ya conoce las respuestas que buscas. Está bien sentir incertidumbre, es parte del crecimiento espiritual. Respira profundo, confía en que estás siendo guiado con amor infinito hacia lo que tu alma necesita.`,
      source: 'fallback'
    })
  }
}