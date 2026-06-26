import { NextRequest, NextResponse } from 'next/server';
import PushNotificationService from '@/services/PushNotificationService';

// Esta API debe ser llamada por un cron job cada minuto
export async function POST(request: NextRequest) {
  try {
    // Verificar autorización (opcional: agregar una clave secreta)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'default-cron-secret'}`;
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('🔄 Iniciando procesamiento de recordatorios...');
    
    const result = await PushNotificationService.processReminders();
    
    console.log(`✅ Recordatorios procesados: ${result.processed}, enviados: ${result.sent}, fallidos: ${result.failed}`);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });

  } catch (error) {
    console.error('❌ Error en cron job de recordatorios:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// También permitir GET para testing manual
export async function GET(request: NextRequest) {
  try {
    const result = await PushNotificationService.processReminders();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
      message: 'Procesamiento manual completado'
    });

  } catch (error) {
    console.error('Error en procesamiento manual:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}