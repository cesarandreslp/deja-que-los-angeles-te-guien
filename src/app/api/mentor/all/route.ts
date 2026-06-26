import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";

// GET /api/mentor/all - Ver todas las consultas del usuario para debug
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener información del usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    // Obtener TODAS las consultas
    const allConsultations = await prisma.mentor_consultations.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Verificar consultas de hoy
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const todayConsultations = allConsultations.filter((c: any) => 
      c.createdAt >= startOfToday && c.createdAt < endOfToday
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.fullName,
        dateOfBirth: user.dateOfBirth,
        mentorArcangel: user.mentorArcangel
      },
      timeInfo: {
        serverTime: today.toISOString(),
        serverTimeLocal: today.toLocaleString('es-ES'),
        startOfToday: startOfToday.toISOString(),
        endOfToday: endOfToday.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      consultations: {
        total: allConsultations.length,
        today: todayConsultations.length,
        all: allConsultations.map((c: any) => ({
          id: c.id,
          question: c.question,
          answer: c.answer?.substring(0, 100) + '...',
          arcangel: c.arcangel,
          createdAt: c.createdAt.toISOString(),
          createdAtLocal: c.createdAt.toLocaleString('es-ES'),
          isToday: c.createdAt >= startOfToday && c.createdAt < endOfToday
        })),
        todayDetails: todayConsultations.map((c: any) => ({
          id: c.id,
          question: c.question,
          arcangel: c.arcangel,
          createdAt: c.createdAt.toISOString(),
          createdAtLocal: c.createdAt.toLocaleString('es-ES')
        }))
      }
    });

  } catch (error) {
    console.error('Error getting all mentor consultations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}