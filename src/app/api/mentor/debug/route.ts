import { NextResponse } from "next/server";
import { calculateMentorArcangel, getArcangelInfo } from '@/lib/mentor-utils';

// GET /api/mentor/debug - Debug tool para verificar cálculo de arcángel mentor
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date'); // formato: YYYY-MM-DD
    
    if (!dateParam) {
      return NextResponse.json({
        error: 'Falta parámetro de fecha',
        usage: 'Usa: /api/mentor/debug?date=1990-05-15',
        example: 'http://localhost:3001/api/mentor/debug?date=1990-05-15'
      });
    }
    
    const birthDate = new Date(dateParam);
    
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json({
        error: 'Fecha inválida',
        usage: 'Usa formato: YYYY-MM-DD',
        example: '1990-05-15'
      });
    }
    
    const dayOfWeek = birthDate.getDay();
    const mentor = calculateMentorArcangel(birthDate);
    const arcangelInfo = getArcangelInfo(mentor);
    
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    return NextResponse.json({
      debug: {
        inputDate: dateParam,
        parsedDate: birthDate.toISOString(),
        dayOfWeekNumber: dayOfWeek,
        dayOfWeekName: dayNames[dayOfWeek],
        calculatedMentor: mentor,
        arcangelInfo: {
          name: arcangelInfo.name,
          day: arcangelInfo.day,
          color: arcangelInfo.color,
          element: arcangelInfo.element,
          mission: arcangelInfo.mission,
          description: arcangelInfo.description
        }
      },
      mapping: {
        0: 'MIGUEL (Domingo)',
        1: 'JOFIEL (Lunes)', 
        2: 'CHAMUEL (Martes)',
        3: 'GABRIEL (Miércoles)',
        4: 'RAFAEL (Jueves)',
        5: 'URIEL (Viernes)',
        6: 'ZADKIEL (Sábado)'
      }
    });
    
  } catch (error) {
    console.error('Error in mentor debug:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}