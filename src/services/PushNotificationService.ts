import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

// Configuración de VAPID keys
const vapidKeys = {
  publicKey: 'BOIp1Q3M5cS5prkjbESastnHilFuvPPAmv9w9qcK25IYUoQqI6qIpdErK25HUXKMMp-V_eZlKfJmqJjMI1EA2KY',
  privateKey: 'XmPB7z5W8d9FwWvBurCVFmdehLJxPiQEFufVQketJy4'
};

// Configurar web-push
webpush.setVapidDetails(
  'mailto:support@oraculo-arcangeles.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
}

export class PushNotificationService {
  /**
   * Enviar notificación push a un usuario específico
   */
  static async sendNotificationToUser(
    userId: string, 
    payload: NotificationPayload
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    try {
      // Obtener todas las suscripciones del usuario
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
      });

      if (subscriptions.length === 0) {
        console.log(`No hay suscripciones push para el usuario ${userId}`);
        return { success: true, sent: 0, failed: 0 };
      }

      const results = await Promise.allSettled(
        subscriptions.map(async (subscription: any) => {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey
            }
          };

          const notificationPayload = {
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/badge-72x72.png',
            image: payload.image,
            data: payload.data || {},
            actions: payload.actions || [],
            tag: payload.tag || 'default',
            requireInteraction: payload.requireInteraction || false,
            vibrate: [200, 100, 200],
            timestamp: Date.now()
          };

          return await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(notificationPayload)
          );
        })
      );

      const sent = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      // Limpiar suscripciones inválidas (410 Gone, 404 Not Found)
      const failedResults = results
        .map((result, index) => ({ result, subscription: subscriptions[index] }))
        .filter(({ result }) => result.status === 'rejected');

      for (const { result, subscription } of failedResults) {
        const error = (result as PromiseRejectedResult).reason;
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          // Suscripción inválida, eliminarla
          await prisma.pushSubscription.delete({
            where: { id: subscription.id }
          });
          console.log(`Suscripción inválida eliminada: ${subscription.endpoint}`);
        }
      }

      return { success: true, sent, failed };
    } catch (error) {
      console.error('Error enviando notificación push:', error);
      return { success: false, sent: 0, failed: 1 };
    }
  }

  /**
   * Enviar recordatorio de consulta
   */
  static async sendConsultationReminder(
    consultationId: string,
    userId: string,
    consultantName: string,
    scheduledFor: Date,
    minutesUntil: number
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      title: '⏰ Recordatorio de Consulta',
      body: `Tu consulta con ${consultantName} comenzará en ${minutesUntil} minutos`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        consultationId,
        userId,
        scheduledFor: scheduledFor.toISOString(),
        type: 'consultation-reminder'
      },
      actions: [
        {
          action: 'join',
          title: 'Unirse a la consulta',
          icon: '/icons/action-join.png'
        },
        {
          action: 'dismiss',
          title: 'Cerrar',
          icon: '/icons/action-close.png'
        }
      ],
      tag: `consultation-${consultationId}`,
      requireInteraction: true
    };

    const result = await this.sendNotificationToUser(userId, payload);
    
    if (result.success && result.sent > 0) {
      // Marcar recordatorio como enviado
      await prisma.consultation_reminders.updateMany({
        where: {
          consultationId,
          userId,
          status: 'PENDING'
        },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      });
      return true;
    }

    return false;
  }

  /**
   * Procesar recordatorios pendientes
   */
  static async processReminders(): Promise<{ processed: number; sent: number; failed: number }> {
    try {
      const now = new Date();
      
      // Obtener recordatorios que deben enviarse
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
              consultor: {
                select: { fullName: true }
              }
            }
          },
          user: {
            select: { id: true }
          }
        }
      });

      let sent = 0;
      let failed = 0;

      for (const reminder of pendingReminders) {
        try {
          const consultation = reminder.consultation as any;
          const consultantName = consultation.consultor?.fullName || 'tu consultor';
          const scheduledFor = new Date(consultation.scheduledAt);
          const minutesUntil = Math.max(0, Math.floor((scheduledFor.getTime() - now.getTime()) / (1000 * 60)));

          const success = await this.sendConsultationReminder(
            reminder.consultationId,
            reminder.userId,
            consultantName,
            scheduledFor,
            minutesUntil
          );

          if (success) {
            sent++;
          } else {
            failed++;
            // Marcar como fallido
            await prisma.consultation_reminders.update({
              where: { id: reminder.id },
              data: { status: 'FAILED' }
            });
          }
        } catch (error) {
          console.error(`Error procesando recordatorio ${reminder.id}:`, error);
          failed++;
          await prisma.consultation_reminders.update({
            where: { id: reminder.id },
            data: { status: 'FAILED' }
          });
        }
      }

      return {
        processed: pendingReminders.length,
        sent,
        failed
      };
    } catch (error) {
      console.error('Error procesando recordatorios:', error);
      return { processed: 0, sent: 0, failed: 0 };
    }
  }

  /**
   * Programar recordatorios automáticos para una consulta
   */
  static async scheduleAutomaticReminders(consultationId: string): Promise<boolean> {
    try {
      const consultation = await prisma.video_consultations.findUnique({
        where: { id: consultationId },
        include: {
          user: { select: { id: true } },
          consultor: { select: { id: true } }
        }
      });

      if (!consultation) {
        return false;
      }

      const scheduledFor = new Date(consultation.scheduledAt);
      const reminderTimes = [15, 60]; // 15 minutos y 1 hora antes

      for (const minutes of reminderTimes) {
        const reminderTime = new Date(scheduledFor.getTime() - (minutes * 60 * 1000));
        
        // Solo crear recordatorios futuros
        if (reminderTime > new Date()) {
          // Recordatorio para el usuario
          await prisma.consultation_reminders.create({
            data: {
              consultationId,
              userId: consultation.userId,
              reminderTime,
              message: `Tu consulta comenzará en ${minutes} minutos`,
              type: 'PUSH_NOTIFICATION',
              status: 'PENDING'
            }
          });

          // Recordatorio para el consultor (si existe)
          if (consultation.consultorId) {
            await prisma.consultation_reminders.create({
              data: {
                consultationId,
                userId: consultation.consultorId,
                reminderTime,
                message: `Tu consulta con el cliente comenzará en ${minutes} minutos`,
                type: 'PUSH_NOTIFICATION',
                status: 'PENDING'
              }
            });
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error programando recordatorios automáticos:', error);
      return false;
    }
  }
}

export default PushNotificationService;