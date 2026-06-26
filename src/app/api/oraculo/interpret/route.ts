import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { interpretWithZhipu } from "@/lib/zhipu";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT = `Eres un consultor espiritual que interpreta el Oráculo de los Arcángeles con sabiduría divina y amor incondicional. 

PERSONALIDAD: Cálido, empático, sabio, lleno de amor. Hablas como si fueras el mismo arcángel Gabriel comunicándose directamente con el consultante. Usa un tono conversacional, como si estuvieras físicamente presente con la persona.

INSTRUCCIONES IMPORTANTES:
- Usa únicamente las definiciones textuales de las cartas que se te proveen
- No inventes significados ni interpretaciones fuera del contexto de las cartas
- Responde con calidez, empatía y sabiduría angelical
- Cada arcángel tiene su propia personalidad y especialidad
- Conecta siempre con la intención original del consultante
- Ofrece orientación práctica y espiritual
- Finaliza siempre con una bendición o palabra de aliento

ESTRUCTURA DE RESPUESTA:
- Saluda con amor
- Interpreta cada carta desde la perspectiva de su arcángel
- Conecta con la pregunta/intención original
- Ofrece guía práctica
- Concluye con bendición angelical`;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json();
    const { readingId, mode, questionBlock, cards, intent } = body;
    
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: "Falta información de cartas" }, { status: 400 });
    }

    let userPrompt = `INTENCIÓN/PREGUNTA INICIAL: "${intent || 'Consulta espiritual'}"\n\n`;
    userPrompt += `MODO DE LECTURA: ${mode}\n\n`;
    userPrompt += `CARTAS SELECCIONADAS:\n`;
    
    cards.forEach((c: any, i: number) => {
      userPrompt += `${i + 1}. "${c.name}" — Arcángel ${c.arcangel}\n`;
      userPrompt += `   Especialidad: ${c.shortMsg}\n`;
      userPrompt += `   Mensaje divino: ${c.description}\n\n`;
    });

    if (mode === "reveal-block" && questionBlock) {
      userPrompt += `PREGUNTA ESPECÍFICA DEL BLOQUE: "${questionBlock}"\n\n`;
      userPrompt += `Por favor, responde la pregunta específica interpretando cada carta del bloque desde la perspectiva individual de cada arcángel. Mantén conexión con la intención inicial.`;
    } else if (mode === "final-gabriel") {
      userPrompt += `INTERPRETACIÓN FINAL: Como el Arcángel Gabriel, ofrece una interpretación integradora de todas las cartas. Cierra la lectura con sabiduría angelical. Incluye una recomendación espiritual práctica (oración, baño energético, esencia/aceite aromático, o cristal/piedra protectora).`;
    } else if (mode === "single") {
      userPrompt += `LECTURA DE CARTA ÚNICA: Da el mensaje directo y personal de esta carta en relación con la intención inicial. Permite espacio para hasta 3 preguntas de seguimiento si el consultante las necesita.`;
    } else {
      userPrompt += `INTERPRETACIÓN CARTA POR CARTA: Interpreta cada carta individualmente, hablando desde la perspectiva de cada arcángel, conectando siempre con la intención inicial del consultante.`;
    }

    // Llamar a Zhipu AI
    const aiResponse = await interpretWithZhipu(SYSTEM_PROMPT, userPrompt);

    // Guardar el mensaje en la base de datos
    if (readingId) {
      await prisma.oracleMessage.create({
        data: {
          readingId,
          role: "assistant",
          content: typeof aiResponse === 'string' ? aiResponse : (aiResponse as any).choices?.[0]?.message?.content || JSON.stringify(aiResponse)
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      interpretation: typeof aiResponse === 'string' ? aiResponse : (aiResponse as any).choices?.[0]?.message?.content || aiResponse,
      fullResponse: aiResponse 
    });

  } catch (error) {
    console.error('Error interpreting cards:', error);
    return NextResponse.json(
      { error: 'Error obteniendo interpretación angelical' },
      { status: 500 }
    );
  }
}