import ReminderService from '@/services/ReminderService'

// Inicializar el sistema de recordatorios automáticos
export function initializeReminderSystem() {
  try {
    ReminderService.initializeScheduler()
    console.log('🔮 Sistema de recordatorios del Oráculo inicializado correctamente')
  } catch (error) {
    console.error('❌ Error inicializando sistema de recordatorios:', error)
  }
}

// Auto-inicializar cuando se importa el módulo
if (typeof window === 'undefined') { // Solo en servidor
  initializeReminderSystem()
}

export { ReminderService }