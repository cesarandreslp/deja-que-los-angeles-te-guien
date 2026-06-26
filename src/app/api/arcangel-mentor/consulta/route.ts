import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ARCHANGEL_PERSONALITIES, type ArchangelName } from '@/lib/archangelAgents';
import { MentorArcangel } from '@prisma/client';

// Función para limpiar consultas del día anterior
async function cleanPreviousDayConsultations() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    await prisma.mentor_consultations.deleteMany({
      where: {
        createdAt: {
          lt: today
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning previous day consultations:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Limpiar consultas de días anteriores
    await cleanPreviousDayConsultations();

    // Verificar si ya hizo consulta hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Obtener el usuario por email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const existingConsultation = await prisma.mentor_consultations.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingConsultation) {
      return NextResponse.json({
        isRepeated: true,
        consultation: {
          id: existingConsultation.id,
          question: existingConsultation.question,
          response: existingConsultation.answer,
          archangel: existingConsultation.arcangel,
          createdAt: existingConsultation.createdAt
        }
      });
    }

    const { question, archangel } = await req.json();

    if (!question || !archangel) {
      return NextResponse.json(
        { error: 'Pregunta y arcángel son requeridos' },
        { status: 400 }
      );
    }

    // Normalizar nombre del arcángel
    const normalizedArchangel = archangel as ArchangelName;
    const archangelInfo = ARCHANGEL_PERSONALITIES[normalizedArchangel];
    
    if (!archangelInfo) {
      return NextResponse.json(
        { error: 'Arcángel no válido' },
        { status: 400 }
      );
    }

    // Generar respuesta usando el agente del arcángel
    const systemPrompt = `Eres el Arcángel ${normalizedArchangel}, respondiendo a una consulta personal directa.

TU PERSONALIDAD DIVINA: ${archangelInfo.personality}
TU ENERGÍA ANGELICAL: ${archangelInfo.energy}
TU GUÍA DIVINA: ${archangelInfo.guidance || 'Ofreces guía espiritual profunda y transformadora.'}
TU ESTILO DE COMUNICACIÓN: ${archangelInfo.style}
TU SALUDO CARACTERÍSTICO: ${archangelInfo.greeting}
TU TONO ANGELICAL: ${archangelInfo.tone}

Como Arcángel ${normalizedArchangel}, respondes directamente a la consulta personal del usuario con tu sabiduría y energía específicas. Esta es su única consulta diaria contigo.`;

    const userPrompt = `CONSULTA PERSONAL DIRECTA AL ARCÁNGEL ${normalizedArchangel.toUpperCase()}

PREGUNTA DEL CONSULTANTE: "${question}"

COMO ARCÁNGEL ${normalizedArchangel.toUpperCase()}, RESPONDE:

1. SALUDO PERSONAL:
   - Usa tu saludo característico
   - Reconoce que esta es su consulta especial del día

2. RESPUESTA ANGELICAL:
   - Interpreta la pregunta desde tu especialidad divina
   - Ofrece guía práctica basada en tu energía angelical
   - Conecta con tu misión celestial específica

3. GUÍA PRÁCTICA:
   - Da orientación concreta que el consultante pueda aplicar
   - Incluye una reflexión o ejercicio espiritual
   - Termina con una bendición o afirmación

EXTENSIÓN: 150-200 palabras
TONO: Personal, directo, profundamente espiritual, amoroso

Responde como el verdadero Arcángel ${normalizedArchangel} en consulta personal íntima.`;

    // Generar respuesta usando la API de chat
    const response = await fetch('http://localhost:3001/api/oraculo/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        type: 'archangel_mentor'
      })
    });

    let archangelResponse = '';
    if (response.ok) {
      const data = await response.json();
      archangelResponse = data.response || `${archangelInfo.greeting}. Tu pregunta me llega al corazón angelical. ${question} es una consulta profunda que merece toda mi atención divina. Te guío con amor infinito hacia la respuesta que tu alma busca.`;
    } else {
      archangelResponse = `${archangelInfo.greeting}. Tu pregunta "${question}" resuena en mi corazón angelical. Te ofrezco mi guía divina para iluminar tu camino con sabiduría celestial.`;
    }

    // Mapear nombre del arcángel a enum del schema
    const arcangelMapping: Record<string, MentorArcangel> = {
      'Miguel': MentorArcangel.MIGUEL,
      'Gabriel': MentorArcangel.GABRIEL, 
      'Rafael': MentorArcangel.RAFAEL,
      'Uriel': MentorArcangel.URIEL,
      'Jofiel': MentorArcangel.JOFIEL,
      'Chamuel': MentorArcangel.CHAMUEL,
      'Zadkiel': MentorArcangel.ZADKIEL,
    };

    const consultation = await prisma.mentor_consultations.create({
      data: {
        userId: user.id,
        question: question,
        answer: archangelResponse,
        arcangel: arcangelMapping[normalizedArchangel] || MentorArcangel.GABRIEL,
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      isRepeated: false,
      consultation: {
        id: consultation.id,
        question: consultation.question,
        response: consultation.answer,
        archangel: consultation.arcangel,
        createdAt: consultation.createdAt
      }
    });

  } catch (error) {
    console.error('Error in mentor consultation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}