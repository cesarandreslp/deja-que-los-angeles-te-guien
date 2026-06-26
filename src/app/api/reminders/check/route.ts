import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Obtener recordatorios pendientes que deben ejecutarse
    const now = new Date();
    const upcomingTime = new Date(now.getTime() + (20 * 60 * 1000)); // 20 minutos hacia adelante

    const pendingReminders = await prisma.consultation_reminders.findMany({
      where: {
        status: 'PENDING',
        reminderTime: {
          lte: now
        }
      },
      include: {
        consultation: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true }
            },
            consultor: {
              select: { id: true, fullName: true }
            }
          }
        },
        user: {
          select: { id: true }
        }
      }
    });

    const reminders = pendingReminders.map((reminder: any) => ({
      id: reminder.id,
      title: 'Recordatorio de Consulta',
      body: reminder.message,
      data: {
        consultationId: reminder.consultationId,
        userId: reminder.userId,
        type: 'consultation-reminder'
      }
    }));

    return NextResponse.json({ reminders });

  } catch (error) {
    console.error('Error verificando recordatorios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}