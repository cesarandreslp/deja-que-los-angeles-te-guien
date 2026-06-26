import { prisma } from '@/lib/prisma'
import { EmailService } from '@/services/EmailService'

// Tipos para el seguimiento de asistencia
export interface AttendanceEvent {
  consultationId: string
  userId: string
  eventType: 'user_joined' | 'consultant_joined' | 'user_left' | 'consultant_left'
  timestamp: Date
  clientInfo?: {
    userAgent: string
    ipAddress: string
    device: string
  }
}

export interface AttendanceReport {
  consultationId: string
  scheduledStart: Date
  scheduledDuration: number
  actualStart?: Date
  actualEnd?: Date
  actualDuration?: number
  userJoinedAt?: Date
  consultorJoinedAt?: Date
  userLeftAt?: Date
  consultorLeftAt?: Date
  attendanceStatus: string
  punctualityScore: {
    user: number    // 0-100
    consultor: number // 0-100
  }
  participationRate: {
    user: number    // 0-100
    consultor: number // 0-100
  }
  notes?: string
}

class AttendanceService {
  
  // Registrar que un usuario se unió a la videollamada
  static async recordUserJoined(consultationId: string, clientInfo?: AttendanceEvent['clientInfo']) {
    try {
      const consultation = await prisma.video_consultations.findUnique({
        where: { id: consultationId },
        include: {
          user: { select: { fullName: true, email: true } },
          consultor: { select: { fullName: true, email: true } }
        }
      })

      if (!consultation) {
        throw new Error('Consulta no encontrada')
      }

      const now = new Date()
      const updatedConsultation = await prisma.video_consultations.update({
        where: { id: consultationId },
        data: {
          userJoinedAt: now,
          attendanceStatus: consultation.consultorJoinedAt ? 'BOTH_JOINED' : 'USER_JOINED',
          actualStartTime: consultation.consultorJoinedAt ? now : null, // Solo si ambos están presentes
          updatedAt: now
        }
      })

      console.log(`👤 Usuario se unió a consulta ${consultationId} a las ${now.toLocaleTimeString()}`)

      // Si ambos están presentes, marcar como iniciada
      if (updatedConsultation.attendanceStatus === 'BOTH_JOINED') {
        await this.markConsultationStarted(consultationId)
      }

      return updatedConsultation

    } catch (error) {
      console.error('❌ Error registrando unión de usuario:', error)
      throw error
    }
  }

  // Registrar que un consultor se unió a la videollamada
  static async recordConsultantJoined(consultationId: string, clientInfo?: AttendanceEvent['clientInfo']) {
    try {
      const consultation = await prisma.video_consultations.findUnique({
        where: { id: consultationId },
        include: {
          user: { select: { fullName: true, email: true } },
          consultor: { select: { fullName: true, email: true } }
        }
      })

      if (!consultation) {
        throw new Error('Consulta no encontrada')
      }

      const now = new Date()
      const updatedConsultation = await prisma.video_consultations.update({
        where: { id: consultationId },
        data: {
          consultorJoinedAt: now,
          attendanceStatus: consultation.userJoinedAt ? 'BOTH_JOINED' : 'CONSULTANT_JOINED',
          actualStartTime: consultation.userJoinedAt ? now : null, // Solo si ambos están presentes
          updatedAt: now
        }
      })

      console.log(`👨‍💼 Consultor se unió a consulta ${consultationId} a las ${now.toLocaleTimeString()}`)

      // Si ambos están presentes, marcar como iniciada
      if (updatedConsultation.attendanceStatus === 'BOTH_JOINED') {
        await this.markConsultationStarted(consultationId)
      }

      return updatedConsultation

    } catch (error) {
      console.error('❌ Error registrando unión de consultor:', error)
      throw error
    }
  }

  // Registrar que un usuario se desconectó
  static async recordUserLeft(consultationId: string) {
    try {
      const consultation = await prisma.video_consultations.findUnique({
        where: { id: consultationId }
      })

      if (!consultation) {
        throw new Error('Consulta no encontrada')
      }

      const now = new Date()
      let newStatus = 'USER_LEFT'
      
      // Determinar el nuevo estado
      if (consultation.attendanceStatus === 'BOTH_JOINED') {
        newStatus = 'USER_LEFT'
      } else if (consultation.attendanceStatus === 'USER_JOINED') {
        newStatus = 'PENDING'
      }

      const updatedConsultation = await prisma.video_consultations.update({
        where: { id: consultationId },
        data: {
          userLeftAt: now,
          attendanceStatus: newStatus as any,
          actualEndTime: consultation.consultorLeftAt ? now : null, // Solo si ambos se han ido
          updatedAt: now
        }
      })

      console.log(`👤 Usuario salió de consulta ${consultationId} a las ${now.toLocaleTimeString()}`)

      // Si ambos se han ido, calcular duración final
      if (updatedConsultation.actualEndTime && updatedConsultation.actualStartTime) {
        await this.calculateFinalDuration(consultationId)
      }

      return updatedConsultation

    } catch (error) {
      console.error('❌ Error registrando salida de usuario:', error)
      throw error
    }
  }

  // Registrar que un consultor se desconectó
  static async recordConsultantLeft(consultationId: string) {
    try {
      const consultation = await prisma.video_consultations.findUnique({
        where: { id: consultationId }
      })

      if (!consultation) {
        throw new Error('Consulta no encontrada')
      }

      const now = new Date()
      let newStatus = 'CONSULTANT_LEFT'
      
      // Determinar el nuevo estado
      if (consultation.attendanceStatus === 'BOTH_JOINED') {
        newStatus = 'CONSULTANT_LEFT'
      } else if (consultation.attendanceStatus === 'CONSULTANT_JOINED') {
        newStatus = 'PENDING'
      }

      const updatedConsultation = await prisma.video_consultations.update({
        where: { id: consultationId },
        data: {
          consultorLeftAt: now,
          attendanceStatus: newStatus as any,
          actualEndTime: consultation.userLeftAt ? now : null, // Solo si ambos se han ido
          updatedAt: now
        }
      })

      console.log(`👨‍💼 Consultor salió de consulta ${consultationId} a las ${now.toLocaleTimeString()}`)

      // Si ambos se han ido, calcular duración final
      if (updatedConsultation.actualEndTime && updatedConsultation.actualStartTime) {
        await this.calculateFinalDuration(consultationId)
      }

      return updatedConsultation

    } catch (error) {
      console.error('❌ Error registrando salida de consultor:', error)
      throw error
    }
  }

  // Marcar consulta como iniciada (cuando ambos están presentes)
  private static async markConsultationStarted(consultationId: string) {
    try {
      const now = new Date()
      
      await prisma.video_consultations.update({
        where: { id: consultationId },
        data: {
          status: 'IN_PROGRESS',
          actualStartTime: now,
          updatedAt: now
        }
      })

      console.log(`🚀 Consulta ${consultationId} iniciada oficialmente a las ${now.toLocaleTimeString()}`)

    } catch (error) {
      console.error('❌ Error marcando consulta como iniciada:', error)
    }
  }

  // Calcular duración final de la consulta
  private static async calculateFinalDuration(consultationId: string) {
    try {
      const consultation = await prisma.video_consultations.findUnique({
        where: { id: consultationId }
      })

      if (!consultation || !consultation.actualStartTime || !consultation.actualEndTime) {
        return
      }

      const durationMs = consultation.actualEndTime.getTime() - consultation.actualStartTime.getTime()
      const durationMinutes = Math.round(durationMs / (1000 * 60))

      await prisma.video_consultations.update({
        where: { id: consultationId },
        data: {
          actualDuration: durationMinutes,
          status: 'COMPLETED',
          attendanceStatus: 'COMPLETED',
          updatedAt: new Date()
        }
      })

      console.log(`⏱️ Consulta ${consultationId} completada. Duración: ${durationMinutes} minutos`)

    } catch (error) {
      console.error('❌ Error calculando duración final:', error)
    }
  }

  // Verificar no-shows (consultas donde nadie se presentó)
  static async checkNoShows() {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
      
      // Buscar consultas que deberían haber comenzado hace más de 15 minutos
      // pero nadie se ha conectado
      const possibleNoShows = await prisma.video_consultations.findMany({
        where: {
          scheduledAt: {
            lte: fifteenMinutesAgo
          },
          attendanceStatus: 'PENDING',
          status: {
            in: ['PAID', 'CONFIRMED', 'SCHEDULED']
          }
        },
        include: {
          user: { select: { fullName: true, email: true } },
          consultor: { select: { fullName: true, email: true } }
        }
      })

      for (const consultation of possibleNoShows) {
        await this.markAsNoShow(consultation.id, 'BOTH_NO_SHOW')
      }

      if (possibleNoShows.length > 0) {
        console.log(`⚠️ Detectados ${possibleNoShows.length} no-shows`)
      }

    } catch (error) {
      console.error('❌ Error verificando no-shows:', error)
    }
  }

  // Marcar consulta como no-show
  static async markAsNoShow(consultationId: string, noShowType: 'USER_NO_SHOW' | 'CONSULTANT_NO_SHOW' | 'BOTH_NO_SHOW') {
    try {
      const consultation = await prisma.video_consultations.update({
        where: { id: consultationId },
        data: {
          status: 'NO_SHOW',
          attendanceStatus: noShowType,
          attendanceNotes: `Marcado como no-show automáticamente el ${new Date().toLocaleString()}`,
          updatedAt: new Date()
        },
        include: {
          user: { select: { fullName: true, email: true } },
          consultor: { select: { fullName: true, email: true } }
        }
      })

      console.log(`❌ Consulta ${consultationId} marcada como ${noShowType}`)

      // Enviar notificación por email
      await this.sendNoShowNotification(consultation, noShowType)

    } catch (error) {
      console.error('❌ Error marcando no-show:', error)
    }
  }

  // Enviar notificación de no-show
  private static async sendNoShowNotification(consultation: any, noShowType: string) {
    try {
      const subject = `⚠️ No-Show Detectado - Consulta ${consultation.id.substring(0, 8)}`
      
      let emailContent = `
        <h2>🚨 No-Show Detectado</h2>
        <p><strong>Consulta:</strong> ${consultation.id}</p>
        <p><strong>Fecha programada:</strong> ${consultation.scheduledAt.toLocaleString()}</p>
        <p><strong>Tipo:</strong> ${noShowType}</p>
        <p><strong>Usuario:</strong> ${consultation.user.fullName} (${consultation.user.email})</p>
        <p><strong>Consultor:</strong> ${consultation.consultor?.fullName || 'No asignado'}</p>
      `

      // Enviar a administradores (por ahora usando un email fijo)
      await EmailService.sendEmail({
        to: process.env.ADMIN_EMAIL || consultation.user.email,
        subject,
        html: emailContent
      })

    } catch (error) {
      console.error('❌ Error enviando notificación de no-show:', error)
    }
  }

  // Generar reporte de asistencia
  static async generateAttendanceReport(consultationId: string): Promise<AttendanceReport> {
    try {
      const consultation = await prisma.video_consultations.findUnique({
        where: { id: consultationId },
        include: {
          user: { select: { fullName: true, email: true } },
          consultor: { select: { fullName: true, email: true } }
        }
      })

      if (!consultation) {
        throw new Error('Consulta no encontrada')
      }

      // Calcular puntualidad (0-100)
      const calculatePunctuality = (joinTime: Date | null, scheduledTime: Date): number => {
        if (!joinTime) return 0
        
        const diffMs = joinTime.getTime() - scheduledTime.getTime()
        const diffMinutes = diffMs / (1000 * 60)
        
        if (diffMinutes <= 0) return 100      // A tiempo o temprano
        if (diffMinutes <= 5) return 80       // Hasta 5 min tarde
        if (diffMinutes <= 10) return 60      // Hasta 10 min tarde
        if (diffMinutes <= 15) return 40      // Hasta 15 min tarde
        return 20                             // Más de 15 min tarde
      }

      // Calcular participación (0-100)
      const calculateParticipation = (joinTime: Date | null, leaveTime: Date | null, totalDuration: number): number => {
        if (!joinTime) return 0
        if (!leaveTime) return 100 // Aún conectado
        
        const participationMs = leaveTime.getTime() - joinTime.getTime()
        const participationMinutes = participationMs / (1000 * 60)
        
        return Math.min(100, Math.round((participationMinutes / totalDuration) * 100))
      }

      const scheduledDuration = consultation.duration
      const actualDuration = consultation.actualDuration || 0

      const report: AttendanceReport = {
        consultationId: consultation.id,
        scheduledStart: consultation.scheduledAt,
        scheduledDuration,
        actualStart: consultation.actualStartTime || undefined,
        actualEnd: consultation.actualEndTime || undefined,
        actualDuration,
        userJoinedAt: consultation.userJoinedAt || undefined,
        consultorJoinedAt: consultation.consultorJoinedAt || undefined,
        userLeftAt: consultation.userLeftAt || undefined,
        consultorLeftAt: consultation.consultorLeftAt || undefined,
        attendanceStatus: consultation.attendanceStatus,
        punctualityScore: {
          user: calculatePunctuality(consultation.userJoinedAt, consultation.scheduledAt),
          consultor: calculatePunctuality(consultation.consultorJoinedAt, consultation.scheduledAt)
        },
        participationRate: {
          user: calculateParticipation(consultation.userJoinedAt, consultation.userLeftAt, actualDuration || scheduledDuration),
          consultor: calculateParticipation(consultation.consultorJoinedAt, consultation.consultorLeftAt, actualDuration || scheduledDuration)
        },
        notes: consultation.attendanceNotes || undefined
      }

      return report

    } catch (error) {
      console.error('❌ Error generando reporte de asistencia:', error)
      throw error
    }
  }

  // Obtener estadísticas generales de asistencia
  static async getAttendanceStats(startDate?: Date, endDate?: Date) {
    try {
      const whereClause: any = {}
      
      if (startDate || endDate) {
        whereClause.scheduledAt = {}
        if (startDate) whereClause.scheduledAt.gte = startDate
        if (endDate) whereClause.scheduledAt.lte = endDate
      }

      const consultations = await prisma.video_consultations.findMany({
        where: whereClause,
        select: {
          id: true,
          attendanceStatus: true,
          status: true,
          actualDuration: true,
          duration: true,
          userJoinedAt: true,
          consultorJoinedAt: true
        }
      })

      const total = consultations.length
      const completed = consultations.filter((c: any) => c.attendanceStatus === 'COMPLETED').length
      const noShows = consultations.filter((c: any) => c.attendanceStatus?.includes('NO_SHOW')).length
      const cancelled = consultations.filter((c: any) => c.status === 'CANCELLED').length

      const attendanceRate = total > 0 ? ((completed / total) * 100).toFixed(2) : '0'
      const noShowRate = total > 0 ? ((noShows / total) * 100).toFixed(2) : '0'

      // Promedio de duración de consultas completadas
      const completedConsultations = consultations.filter((c: any) => c.actualDuration && c.actualDuration > 0)
      const avgDuration = completedConsultations.length > 0 
        ? (completedConsultations.reduce((sum: number, c: any) => sum + (c.actualDuration || 0), 0) / completedConsultations.length).toFixed(1)
        : '0'

      return {
        total,
        completed,
        noShows,
        cancelled,
        attendanceRate: `${attendanceRate}%`,
        noShowRate: `${noShowRate}%`,
        averageDuration: `${avgDuration} min`,
        activeConsultations: consultations.filter((c: any) => c.attendanceStatus === 'BOTH_JOINED').length
      }

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de asistencia:', error)
      throw error
    }
  }
}

export default AttendanceService