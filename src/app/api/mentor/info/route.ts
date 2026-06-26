import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";
import { calculateMentorArcangel, getArcangelInfo, canConsultToday } from '@/lib/mentor-utils';
import { cache, cacheKeys, cacheTTL } from '@/lib/cache';

// GET /api/mentor/info - Obtener información del arcángel mentor del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Usar caché para la información del mentor (30 segundos)
    const cacheKey = cacheKeys.userMentor(session.user.id);
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Obtener información del usuario con sus consultas en una sola query
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        fullName: true,
        dateOfBirth: true,
        mentorArcangel: true,
        mentor_consultations: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            id: true,
            question: true,
            answer: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si no tiene fecha de nacimiento, no puede tener arcángel mentor
    if (!user.dateOfBirth) {
      return NextResponse.json({
        hasDateOfBirth: false,
        mentorArcangel: null,
        arcangelInfo: null,
        canConsultToday: false,
        lastConsultation: null,
        requiresBirthDate: true,
        message: 'Necesitas completar tu fecha de nacimiento para conocer a tu Arcángel Mentor'
      });
    }

    // Calcular arcángel mentor basado en fecha de nacimiento (siempre consistente)
    // IMPORTANTE: Parsear fecha como componentes UTC para evitar problemas de zona horaria
    const birthDateStr = user.dateOfBirth.toISOString().split('T')[0]; // "1983-11-26"
    const [year, month, day] = birthDateStr.split('-').map(Number);
    const correctBirthDate = new Date(Date.UTC(year, month - 1, day)); // Crear fecha UTC correcta
    const calculatedMentor = calculateMentorArcangel(correctBirthDate);
    let mentorArcangel = user.mentorArcangel;

    // Si no tiene mentor guardado O si el guardado es diferente al calculado, actualizarlo
    if (!mentorArcangel || mentorArcangel !== calculatedMentor) {
      mentorArcangel = calculatedMentor;
      
      // Actualizar en la base de datos
      await prisma.user.update({
        where: { id: user.id },
        data: { mentorArcangel }
      });
    }

    // La última consulta ya viene en la query anterior
    const lastConsultation = user.mentor_consultations[0] || null;

    // Verificar si puede consultar hoy (verificación simple)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Verificar si la última consulta fue hoy
    const todayConsultation = lastConsultation && 
      lastConsultation.createdAt >= startOfToday ? lastConsultation : null;

    const arcangelInfo = getArcangelInfo(mentorArcangel as any);

    const responseData = {
      arcangel: mentorArcangel,
      arcangelInfo,
      canConsult: !todayConsultation,
      hasConsultationToday: !!todayConsultation,
      lastConsultation,
      todayConsultation: todayConsultation ? {
        id: todayConsultation.id,
        question: todayConsultation.question,
        answer: todayConsultation.answer,
        createdAt: todayConsultation.createdAt
      } : null,
      user: {
        name: user.fullName || 'Usuario'
      },
      requiresBirthDate: false
    };

    // Guardar en caché (30 segundos)
    cache.set(cacheKey, responseData, cacheTTL.short);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching mentor info:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}