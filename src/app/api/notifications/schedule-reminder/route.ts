import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ScheduleReminderData {
  consultationId: string;
  scheduledFor: string;
  consultantName: string;
  reminderMinutes?: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const {
      consultationId,
      scheduledFor,
      consultantName,
      reminderMinutes = 15
    }: ScheduleReminderData = await request.json();

    // Validar datos
    if (!consultationId || !scheduledFor || !consultantName) {
      return NextResponse.json(
        { error: 'Datos de recordatorio incompletos' },
        { status: 400 }
      );
    }

    // Verificar que la consulta existe y pertenece al usuario
    const consultation = await prisma.video_consultations.findFirst({
      where: {
        id: consultationId,
        OR: [
          { userId: session.user.id },
          { consultantId: session.user.id }
        ]
      }
    });

    if (!consultation) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      );
    }

    const scheduledDateTime = new Date(scheduledFor);
    const reminderDateTime = new Date(scheduledDateTime.getTime() - (reminderMinutes * 60 * 1000));

    // Crear recordatorio en la base de datos
    const reminder = await prisma.consultation_reminders.create({
      data: {
        consultationId,
        userId: session.user.id,
        reminderTime: reminderDateTime,
        message: `Tu consulta con ${consultantName} comenzará en ${reminderMinutes} minutos`,
        type: 'PUSH_NOTIFICATION',
        status: 'PENDING'
      }
    });

    return NextResponse.json({ 
      success: true, 
      reminderId: reminder.id,
      reminderTime: reminderDateTime.toISOString()
    });

  } catch (error) {
    console.error('Error programando recordatorio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}