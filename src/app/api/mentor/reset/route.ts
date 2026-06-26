import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";

// POST /api/mentor/reset - Limpiar consultas del día para debug  
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener información del usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        fullName: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener consultas del día
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const todayConsultations = await prisma.mentor_consultations.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfToday,
          lt: endOfToday
        }
      }
    });

    console.log('🗑️ Resetting mentor consultations for user:', {
      userId: user.id,
      userName: user.fullName,
      consultationsFound: todayConsultations.length,
      consultationIds: todayConsultations.map((c: any) => c.id)
    });

    // Eliminar consultas del día
    const deleteResult = await prisma.mentor_consultations.deleteMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfToday,
          lt: endOfToday
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Consultas del día eliminadas exitosamente',
      deletedCount: deleteResult.count,
      user: {
        id: user.id,
        name: user.fullName
      },
      timeRange: {
        from: startOfToday.toISOString(),
        to: endOfToday.toISOString()
      }
    });

  } catch (error) {
    console.error('Error resetting mentor consultations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}