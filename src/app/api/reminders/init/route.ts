import { NextResponse } from 'next/server'

let reminderSystemInitialized = false

// GET /api/reminders/init - Inicializar sistema de recordatorios de forma lazy
export async function GET() {
  try {
    // Solo inicializar una vez
    if (reminderSystemInitialized) {
      return NextResponse.json({
        success: true,
        message: 'Sistema de recordatorios ya inicializado',
        status: 'already_running'
      })
    }

    // Importación lazy del servicio
    const { default: ReminderService } = await import('@/services/ReminderService')
    
    // Inicializar en background sin bloquear la respuesta
    setTimeout(() => {
      try {
        ReminderService.initializeScheduler()
        reminderSystemInitialized = true
        console.log('🔮 Sistema de recordatorios inicializado de forma lazy')
      } catch (error) {
        console.error('❌ Error inicializando sistema de recordatorios:', error)
      }
    }, 100) // Delay mínimo para no bloquear

    return NextResponse.json({
      success: true,
      message: 'Sistema de recordatorios inicializándose en background',
      status: 'initializing'
    })

  } catch (error) {
    console.error('❌ Error en API de inicialización de recordatorios:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// POST /api/reminders/init - Forzar reinicialización
export async function POST() {
  try {
    reminderSystemInitialized = false
    
    const { default: ReminderService } = await import('@/services/ReminderService')
    
    // Reinicializar inmediatamente
    ReminderService.initializeScheduler()
    reminderSystemInitialized = true

    return NextResponse.json({
      success: true,
      message: 'Sistema de recordatorios reinicializado exitosamente',
      status: 'reinitialized'
    })

  } catch (error) {
    console.error('❌ Error reinicializando sistema de recordatorios:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}