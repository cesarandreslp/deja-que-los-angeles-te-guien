import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";
import { calculateMentorArcangel, canConsultToday } from '@/lib/mentor-utils';
import { cache, cacheKeys } from '@/lib/cache';

// POST /api/mentor/consult - Realizar consulta con arcángel mentor
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { question } = await request.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Pregunta requerida" },
        { status: 400 }
      );
    }

    if (question.length > 1000) {
      return NextResponse.json(
        { error: "La pregunta no puede exceder 1000 caracteres" },
        { status: 400 }
      );
    }

    // Obtener usuario con información completa
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        fullName: true,
        dateOfBirth: true,
        mentorArcangel: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el usuario tenga fecha de nacimiento
    if (!user.dateOfBirth) {
      return NextResponse.json(
        { 
          error: 'Fecha de nacimiento requerida',
          message: 'Necesitas completar tu fecha de nacimiento para acceder a tu Arcángel Mentor',
          requiresBirthDate: true
        },
        { status: 400 }
      )
    }

    // Calcular arcángel mentor basado en fecha de nacimiento (siempre consistente)
    const calculatedMentor = calculateMentorArcangel(new Date(user.dateOfBirth));
    let mentorArcangel = user.mentorArcangel;

    // Si no tiene mentor guardado O si el guardado es diferente al calculado, actualizarlo
    if (!mentorArcangel || mentorArcangel !== calculatedMentor) {
      mentorArcangel = calculatedMentor;
      
      // Actualizar en la base de datos
      await prisma.user.update({
        where: { id: user.id },
        data: { mentorArcangel }
      });
          } else {
          }

    // Verificar si ya hizo consulta hoy
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const todayConsultation = await prisma.mentor_consultations.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfToday,
          lt: endOfToday
        }
      }
    });



    if (todayConsultation) {
      return NextResponse.json(
        { 
          error: 'Consulta diaria ya realizada',
          message: 'Ya realizaste tu consulta con tu Arcángel Mentor hoy. Solo puedes hacer una consulta por día.',
          hasConsultationToday: true,
          consultation: {
            id: todayConsultation.id,
            question: todayConsultation.question,
            answer: todayConsultation.answer,
            arcangel: todayConsultation.arcangel,
            createdAt: todayConsultation.createdAt
          }
        },
        { status: 409 }
      )
    }

    // Generar respuesta del arcángel usando IA
    const aiResponse = await generateArcangelResponse(mentorArcangel, question, user.fullName);

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'Error generando respuesta del arcángel' },
        { status: 500 }
      );
    }

    // Guardar consulta en la base de datos
    const consultation = await prisma.mentor_consultations.create({
      data: {
        userId: user.id,
        arcangel: mentorArcangel,
        question: question.trim(),
        answer: aiResponse
      }
    });

    // Invalidar caché del mentor después de crear consulta
    cache.invalidate(cacheKeys.userMentor(user.id));

    return NextResponse.json({
      consultation: {
        id: consultation.id,
        question: consultation.question,
        answer: consultation.answer,
        arcangel: consultation.arcangel,
        createdAt: consultation.createdAt
      },
      arcangel: mentorArcangel
    });

  } catch (error) {
    console.error('Error in mentor consultation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para generar respuesta usando IA del arcángel
async function generateArcangelResponse(arcangel: string, question: string, userName: string): Promise<string> {
  try {

    
    // Integración con Zhipu AI
    const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
    

    
    if (!ZHIPU_API_KEY || ZHIPU_API_KEY === 'your-zhipu-api-key') {
      console.log('⚠️ Zhipu API Key not configured properly, using fallback responses');
      return getFallbackResponse(arcangel, question, userName);
    }

    // Obtener información del arcángel para el prompt
    const arcangelInfo = getArcangelInfo(arcangel);
    
    const systemPrompt = `Eres ${arcangelInfo.name}, ${arcangelInfo.mission}. ${arcangelInfo.description}

Tu personalidad es: ${arcangelInfo.personality}
Tu día es: ${arcangelInfo.day}
Tu elemento es: ${arcangelInfo.element}

INSTRUCCIONES IMPORTANTES:
- Responde como el Arcángel ${arcangelInfo.name} hablando directamente a ${userName}
- Sé cálido, sabio y espiritual pero accesible
- Ofrece guía práctica y espiritual específica para la pregunta
- Mantén tu personalidad única como ${arcangelInfo.name}
- Usa un lenguaje cercano pero con autoridad espiritual
- La respuesta debe ser entre 80-150 palabras
- NO uses emojis
- Habla en español natural`;

    const userPrompt = `${userName} te pregunta: "${question}"

Por favor, responde como el Arcángel ${arcangelInfo.name}, ofreciendo guía espiritual específica para esta situación.`;

    // Llamada a Zhipu AI con timeout más generoso y retry
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout (aumentado)
    
    try {
      const zhipuResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ZHIPU_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7, // Reducido para respuestas más consistentes
          max_tokens: 150, // Optimizado para respuestas concisas
          top_p: 0.85
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!zhipuResponse.ok) {
        const errorData = await zhipuResponse.text();
        console.error('❌ Zhipu API Error:', {
          status: zhipuResponse.status,
          statusText: zhipuResponse.statusText,
          error: errorData
        });
        throw new Error(`Zhipu API failed with status ${zhipuResponse.status}`);
      }

      const zhipuData = await zhipuResponse.json();

      
      const aiResponse = zhipuData.choices[0]?.message?.content;

      if (aiResponse && aiResponse.trim()) {
        return aiResponse.trim();
      } else {
        console.error('❌ Empty response from Zhipu AI');
        throw new Error('Empty response from Zhipu AI');
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('⏱️ Zhipu API Timeout after 30 seconds');
      } else {
        console.error('❌ Zhipu API Fetch Error:', fetchError.message);
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('❌ Error generating arcangel response with Zhipu:', error);
    console.log('🔄 USING FALLBACK RESPONSES DUE TO ERROR');
    return getFallbackResponse(arcangel, question, userName);
  }
}

// Función auxiliar para obtener información del arcángel
function getArcangelInfo(arcangel: string) {
  const arcangelMap: Record<string, any> = {
    'JOFIEL': {
      name: 'Jofiel',
      day: 'Lunes',
      element: 'Sabiduría',
      mission: 'Arcángel de la Sabiduría y la Belleza',
      description: 'Arcángel de la sabiduría divina y la belleza espiritual. Ayuda a ver la belleza en todas las cosas y desarrollar la sabiduría interior.',
      personality: 'Sabio, inspirador, estético, iluminador'
    },
    'CHAMUEL': {
      name: 'Chamuel',
      day: 'Martes',
      element: 'Amor',
      mission: 'Arcángel del Amor Incondicional',
      description: 'Arcángel del amor puro y las relaciones armoniosas. Ayuda a sanar heridas emocionales y encontrar el amor verdadero.',
      personality: 'Amoroso, compasivo, sanador, armonizador'
    },
    'GABRIEL': {
      name: 'Gabriel',
      day: 'Miércoles',
      element: 'Comunicación',
      mission: 'Arcángel Mensajero',
      description: 'Arcángel mensajero y de la comunicación divina. Ayuda a expresar la verdad y recibir mensajes del universo.',
      personality: 'Comunicativo, claro, inspirador, revelador'
    },
    'RAFAEL': {
      name: 'Rafael',
      day: 'Jueves',
      element: 'Sanación',
      mission: 'Arcángel Sanador',
      description: 'Arcángel de la sanación física, emocional y espiritual. Ayuda en todos los procesos de curación y bienestar.',
      personality: 'Sanador, compasivo, nutritivo, restaurador'
    },
    'URIEL': {
      name: 'Uriel',
      day: 'Viernes',
      element: 'Transformación',
      mission: 'Arcángel de la Transformación',
      description: 'Arcángel del fuego divino y la transformación. Ayuda a transformar situaciones difíciles y purificar energías.',
      personality: 'Transformador, poderoso, directo, purificador'
    },
    'ZADKIEL': {
      name: 'Zadkiel',
      day: 'Sábado',
      element: 'Transmutación',
      mission: 'Arcángel del Perdón',
      description: 'Arcángel de la misericordia y el perdón. Ayuda a liberar el pasado y transmutar energías negativas.',
      personality: 'Misericordioso, liberador, compasivo, transformador'
    },
    'MIGUEL': {
      name: 'Miguel',
      day: 'Domingo',
      element: 'Protección',
      mission: 'Arcángel Protector',
      description: 'Arcángel guerrero y protector. Ayuda a encontrar valor, fuerza y protección contra energías negativas.',
      personality: 'Fuerte, protector, valiente, determinado'
    }
  };

  return arcangelMap[arcangel] || arcangelMap['MIGUEL'];
}

// Función para respuestas fallback cuando Zhipu no está disponible
function getFallbackResponse(arcangel: string, question: string, userName: string): string {
  console.log('🔄 USING FALLBACK RESPONSE SYSTEM - NOT AI GENERATED');
  
  const responses = {
      'JOFIEL': `Querido ${userName}, desde la luz dorada de la sabiduría te respondo: ${question.toLowerCase().includes('amor') ? 'El amor verdadero comienza con el amor propio. Mírate en el espejo del alma y encuentra la belleza divina que hay en ti.' : 'La sabiduría que buscas ya reside en tu corazón. Medita en silencio y permite que la verdad emerja naturalmente. La belleza de la respuesta se revelará en el momento perfecto.'} ✨`,
      
      'CHAMUEL': `Amado ${userName}, con amor incondicional te guío: ${question.toLowerCase().includes('relacion') || question.toLowerCase().includes('pareja') || question.toLowerCase().includes('amor') ? 'Las relaciones son espejos del alma que reflejan nuestras heridas y fortalezas. Sana primero tu relación contigo mismo, perdona las heridas del pasado y abre tu corazón al amor verdadero. El amor propio es la base de todas las relaciones sanas.' : question.toLowerCase().includes('familia') || question.toLowerCase().includes('conflicto') ? 'Los conflictos familiares son oportunidades para practicar el amor incondicional. Mira más allá de las diferencias y encuentra el corazón herido que necesita compasión. Tu amor puede sanar generaciones.' : 'La situación que vives necesita la medicina del amor. Envía pensamientos de compasión a todos los involucrados, incluyéndote a ti mismo. El amor verdadero disuelve cualquier negatividad.'} 💖`,
      
      'GABRIEL': `Bendecido ${userName}, como mensajero divino te comunico: ${question.toLowerCase().includes('trabajo') || question.toLowerCase().includes('carrera') ? 'Tu propósito divino está llamándote. Escucha la voz de tu alma y expresa tus dones únicos al mundo. La creatividad es tu canal directo con lo divino.' : 'Las respuestas que buscas llegarán a través de signos, sueños y sincronicidades. Mantén tu mente clara y tu corazón abierto a recibir los mensajes del universo.'} 📢`,
      
      'RAFAEL': `Querido ${userName}, con energía sanadora te abrazo: ${question.toLowerCase().includes('salud') || question.toLowerCase().includes('enferm') ? 'La sanación verdadera ocurre en todos los niveles. Cuida tu cuerpo como el templo sagrado que es, libera las emociones que no te sirven y conecta con la fuente de vida que hay en ti.' : 'Todo lo que necesitas sanar está en proceso de transformación. Confía en el poder sanador del amor y permite que la luz verde de la curación ilumine cada célula de tu ser.'} 🌿`,
      
      'URIEL': `Valiente ${userName}, con fuego transformador te fortalezco: ${question.toLowerCase().includes('extrañ') || question.toLowerCase().includes('raro') || question.toLowerCase().includes('paranormal') || question.toLowerCase().includes('espiritu') ? 'Lo que percibes son manifestaciones de energías que buscan comunicarse contigo. Tu sensibilidad espiritual está despertando. No temas, pues mi fuego sagrado te protege. Estas experiencias son señales de que estás en un proceso de transformación espiritual profunda.' : question.toLowerCase().includes('cambio') || question.toLowerCase().includes('decision') ? 'Es tiempo de transformación. Como el fénix que renace de sus cenizas, tú también puedes renacer más fuerte. Abraza el cambio con valor y confía en tu poder interior.' : 'Las situaciones desafiantes que enfrentas son el fuego purificador que forja tu alma. Cada obstáculo es una oportunidad para demostrar tu fortaleza interior y emerger más sabio y poderoso.'} 🔥`,
      
      'ZADKIEL': `Alma querida ${userName}, con misericordia infinita te libero: ${question.toLowerCase().includes('perdon') || question.toLowerCase().includes('pasado') ? 'El perdón no es un regalo para otros, es tu libertad. Libera las cadenas del resentimiento y permite que la llama violeta transmute todo dolor en sabiduría y compasión.' : 'Es hora de soltar lo que ya no te sirve. Permite que la energía violeta de la transmutación transforme cada experiencia difícil en una lección de amor.'} 💜`,
      
      'MIGUEL': `Guerrero ${userName}, con espada de luz te protejo: ${question.toLowerCase().includes('miedo') || question.toLowerCase().includes('protec') ? 'El miedo es solo una ilusión que se disuelve ante la luz de tu verdadero poder. Tú eres más fuerte de lo que imaginas. Levanta tu espada de valor y avanza con fe.' : 'Tienes la fuerza divina dentro de ti. No hay obstáculo que no puedas superar cuando te conectas con tu poder interior. Sé valiente y actúa con determinación.'} ⚔️`
    };

    const selectedResponse = responses[arcangel as keyof typeof responses];
    

    
    return selectedResponse || 
           `${userName}, tu Arcángel Mentor te guía con amor. La respuesta que buscas se encuentra en la sabiduría de tu corazón. Confía en tu intuición y permite que la luz divina ilumine tu camino.`;
}