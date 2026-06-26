import cron from 'node-cron'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/services/EmailService'

// Modelo para logs de recordatorios
interface ReminderLog {
  consultationId: string
  type: 'booking_confirmation' | '1_day_before' | '3_hours_before' | '2_hours_before' | '1_hour_before' | '30_minutes_before'
  sentAt: Date
  status: 'sent' | 'failed'
  error?: string
}

class ReminderService {
  private static logs: ReminderLog[] = []

  // Inicializar cron jobs
  static initializeScheduler() {
    console.log('🕐 Iniciando sistema de recordatorios automáticos...')

    // Cada 30 minutos: verificar recordatorios
    cron.schedule('*/30 * * * *', async () => {
      console.log('⏰ Ejecutando verificación de recordatorios...')
      await this.checkAndSendReminders()
    })

    // Cada hora: limpiar logs antiguos (mantener solo últimos 7 días)
    cron.schedule('0 * * * *', async () => {
      await this.cleanOldLogs()
    })

    // Cada 15 minutos: verificar no-shows (FASE 5)
    cron.schedule('*/15 * * * *', async () => {
      console.log('👥 Verificando no-shows...')
      try {
        const { default: AttendanceService } = await import('@/services/AttendanceService')
        await AttendanceService.checkNoShows()
      } catch (error) {
        console.error('❌ Error verificando no-shows:', error)
      }
    })

    console.log('✅ Sistema de recordatorios y asistencia inicializado')
  }

  // Verificar y enviar recordatorios
  static async checkAndSendReminders() {
    try {
      const now = new Date()

      // Obtener consultas que necesitan recordatorios
      const consultations = await prisma.video_consultations.findMany({
        where: {
          status: {
            in: ['PAID', 'CONFIRMED', 'SCHEDULED']
          },
          scheduledAt: {
            gte: now,
            lte: new Date(now.getTime() + 25 * 60 * 60 * 1000) // Próximas 25 horas
          }
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          consultor: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      })

      for (const consultation of consultations) {
        await this.processConsultationReminders(consultation, now)
      }

    } catch (error) {
      console.error('❌ Error en checkAndSendReminders:', error)
    }
  }

  // Procesar recordatorios para una consulta específica
  private static async processConsultationReminders(consultation: any, now: Date) {
    const scheduledTime = new Date(consultation.scheduledAt)
    const timeDiff = scheduledTime.getTime() - now.getTime()
    
    // Convertir a horas y minutos
    const hoursUntil = timeDiff / (1000 * 60 * 60)
    const minutesUntil = timeDiff / (1000 * 60)

    // Definir los tipos de recordatorio a verificar
    const reminders = [
      { type: '1_day_before' as const, threshold: 24, tolerance: 0.5 },
      { type: '3_hours_before' as const, threshold: 3, tolerance: 0.25 },
      { type: '2_hours_before' as const, threshold: 2, tolerance: 0.25 },
      { type: '1_hour_before' as const, threshold: 1, tolerance: 0.25 },
      { type: '30_minutes_before' as const, threshold: 0.5, tolerance: 0.1 }
    ]

    for (const reminder of reminders) {
      // Verificar si es momento de enviar este recordatorio
      const shouldSend = Math.abs(hoursUntil - reminder.threshold) <= reminder.tolerance
      
      if (shouldSend) {
        // Verificar si ya se envió este recordatorio
        const alreadySent = this.logs.some(log => 
          log.consultationId === consultation.id && 
          log.type === reminder.type &&
          log.status === 'sent'
        )

        if (!alreadySent) {
          await this.sendReminder(consultation, reminder.type)
        }
      }
    }
  }

  // Enviar recordatorio específico
  private static async sendReminder(consultation: any, type: ReminderLog['type']) {
    try {
      const reminderData = this.getReminderData(consultation, type)
      
      await EmailService.sendEmail({
        to: consultation.user.email,
        subject: reminderData.subject,
        html: reminderData.html
      })

      // Log exitoso
      this.logs.push({
        consultationId: consultation.id,
        type,
        sentAt: new Date(),
        status: 'sent'
      })

      console.log(`✅ Recordatorio enviado: ${type} para consulta ${consultation.id}`)

    } catch (error) {
      console.error(`❌ Error enviando recordatorio ${type} para consulta ${consultation.id}:`, error)
      
      // Log de error
      this.logs.push({
        consultationId: consultation.id,
        type,
        sentAt: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  // Generar datos del recordatorio según el tipo
  private static getReminderData(consultation: any, type: ReminderLog['type']) {
    const scheduledDate = new Date(consultation.scheduledAt).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const scheduledTime = new Date(consultation.scheduledAt).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })

    const consultorName = consultation.consultor?.fullName || 'Consultor'
    const userName = consultation.user.fullName
    const videoLink = consultation.videoLink || consultation.meetingLink

    const baseData = {
      userName,
      consultorName,
      scheduledDate,
      scheduledTime,
      videoLink,
      consultationId: consultation.id
    }

    switch (type) {
      case 'booking_confirmation':
        return {
          subject: '✅ Confirmación de tu Videoconsulta - Oráculo de los Arcángeles',
          html: this.getBookingConfirmationTemplate(baseData)
        }
      
      case '1_day_before':
        return {
          subject: '🔮 Recordatorio: Tu consulta es mañana - Oráculo de los Arcángeles',
          html: this.getOneDayBeforeTemplate(baseData)
        }
      
      case '3_hours_before':
        return {
          subject: '⏰ Tu consulta es en 3 horas - Oráculo de los Arcángeles',
          html: this.getHoursBeforeTemplate(baseData, '3 horas')
        }
      
      case '2_hours_before':
        return {
          subject: '⏰ Tu consulta es en 2 horas - Oráculo de los Arcángeles',
          html: this.getHoursBeforeTemplate(baseData, '2 horas')
        }
      
      case '1_hour_before':
        return {
          subject: '🚨 Tu consulta es en 1 hora - Oráculo de los Arcángeles',
          html: this.getHoursBeforeTemplate(baseData, '1 hora')
        }
      
      case '30_minutes_before':
        return {
          subject: '🔥 ¡Tu consulta es en 30 minutos! - Oráculo de los Arcángeles',
          html: this.getUrgentReminderTemplate(baseData)
        }
      
      default:
        throw new Error(`Tipo de recordatorio no reconocido: ${type}`)
    }
  }

  // Templates de email
  private static getBookingConfirmationTemplate(data: any) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Videoconsulta</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔮 Videoconsulta Confirmada</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Tu cita ha sido programada exitosamente</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${data.userName}! 👋</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Tu videoconsulta con <strong>${data.consultorName}</strong> ha sido confirmada y pagada exitosamente.
          </p>
          
          <div style="background: #f8f9ff; border: 2px solid #e3e8ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #4c51bf;">📅 Detalles de tu Consulta</h3>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${data.scheduledDate}</p>
            <p style="margin: 5px 0;"><strong>Hora:</strong> ${data.scheduledTime} (Hora de Colombia)</p>
            <p style="margin: 5px 0;"><strong>Consultor:</strong> ${data.consultorName}</p>
            <p style="margin: 5px 0;"><strong>ID de Consulta:</strong> ${data.consultationId}</p>
          </div>
          
          ${data.videoLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.videoLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                🎥 Enlace de Videollamada
              </a>
            </div>
          ` : ''}
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 14px; color: #666;">
            <p><strong>📧 Recordatorios:</strong> Te enviaremos recordatorios 24h, 3h, 2h, 1h y 30min antes de tu consulta.</p>
            <p><strong>⏰ Puntualidad:</strong> Te recomendamos conectarte 5 minutos antes de la hora programada.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static getOneDayBeforeTemplate(data: any) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #333; margin: 0; font-size: 28px;">🔮 Recordatorio de Consulta</h1>
          <p style="color: #555; margin: 10px 0 0 0; font-size: 16px;">Tu consulta es mañana</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${data.userName}! 👋</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Te recordamos que mañana tienes tu videoconsulta con <strong>${data.consultorName}</strong>.
          </p>
          
          <div style="background: #e6fffa; border: 2px solid #81e6d9; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #234e52;">📅 Detalles</h3>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${data.scheduledDate}</p>
            <p style="margin: 5px 0;"><strong>Hora:</strong> ${data.scheduledTime}</p>
          </div>
          
          ${data.videoLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.videoLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                🎥 Acceder a la Videollamada
              </a>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `
  }

  private static getHoursBeforeTemplate(data: any, timeLeft: string) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #8b4513; margin: 0; font-size: 28px;">⏰ Tu consulta es en ${timeLeft}</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${data.userName}! 👋</h2>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Tu videoconsulta con <strong>${data.consultorName}</strong> es en <strong>${timeLeft}</strong>.
          </p>
          
          <div style="background: #fff5f5; border: 2px solid #fed7d7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #c53030;">🕐 Hora: ${data.scheduledTime}</h3>
            <p style="margin: 5px 0;">Te recomendamos conectarte unos minutos antes.</p>
          </div>
          
          ${data.videoLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.videoLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #8b4513; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                🎥 Unirse a la Consulta
              </a>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `
  }

  private static getUrgentReminderTemplate(data: any) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #d63384; margin: 0; font-size: 28px;">🔥 ¡Tu consulta es en 30 minutos!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">¡${data.userName}, es hora! ⏰</h2>
          
          <p style="font-size: 18px; margin-bottom: 25px; color: #d63384; font-weight: bold;">
            Tu videoconsulta con ${data.consultorName} comienza en 30 minutos.
          </p>
          
          <div style="background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #721c24;">🚨 Hora exacta: ${data.scheduledTime}</h3>
            <p style="margin: 5px 0; font-weight: bold;">¡Conéctate ahora para estar listo!</p>
          </div>
          
          ${data.videoLink ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.videoLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #d63384; padding: 20px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 18px; animation: pulse 2s infinite;">
                🎥 ¡CONECTARME AHORA!
              </a>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `
  }

  // Enviar confirmación de booking (llamada desde webhook después del pago)
  static async sendBookingConfirmation(consultationId: string) {
    try {
      const consultation = await prisma.video_consultations.findUnique({
        where: { id: consultationId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          consultor: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      })

      if (consultation) {
        await this.sendReminder(consultation, 'booking_confirmation')
      }
    } catch (error) {
      console.error('❌ Error enviando confirmación de booking:', error)
    }
  }

  // Limpiar logs antiguos
  private static async cleanOldLogs() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    this.logs = this.logs.filter(log => log.sentAt > sevenDaysAgo)
    
    console.log(`🧹 Logs de recordatorios limpiados. Logs actuales: ${this.logs.length}`)
  }

  // Obtener estadísticas de recordatorios
  static getReminderStats() {
    const totalSent = this.logs.filter(log => log.status === 'sent').length
    const totalFailed = this.logs.filter(log => log.status === 'failed').length
    
    return {
      totalSent,
      totalFailed,
      successRate: totalSent + totalFailed > 0 ? (totalSent / (totalSent + totalFailed) * 100).toFixed(2) : '0',
      recentLogs: this.logs.slice(-10) // Últimos 10 logs
    }
  }
}

export default ReminderService