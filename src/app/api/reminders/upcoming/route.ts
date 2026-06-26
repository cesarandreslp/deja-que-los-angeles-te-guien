import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Obtener consultas próximas (siguiente 1 hora)
    const now = new Date();
    const nextHour = new Date(now.getTime() + (60 * 60 * 1000));

    const upcomingConsultations = await prisma.video_consultations.findMany({
      where: {
        scheduledAt: {
          gte: now,
          lte: nextHour
        },
        status: {
          in: ['CONFIRMED', 'SCHEDULED']
        }
      },
      include: {
        user: {
          select: { id: true, fullName: true }
        },
        consultor: {
          select: { id: true, fullName: true }
        }
      }
    });

    const upcoming = upcomingConsultations.map((consultation: any) => ({
      id: consultation.id,
      scheduledFor: consultation.scheduledFor,
      consultantName: consultation.consultant.name,
      userName: consultation.user.name,
      userId: consultation.userId,
      consultantId: consultation.consultantId
    }));

    return NextResponse.json({ upcoming });

  } catch (error) {
    console.error('Error obteniendo consultas próximas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}