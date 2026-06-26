import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";

// GET /api/user/membership-status - Verificar el estado de membresía del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar si el usuario tiene membresía activa
    const membership = await prisma.userMembership.findFirst({
      where: { 
        userId: session.user.id,
        status: 'ACTIVE',
        endDate: {
          gte: new Date() // No expirada
        }
      },
      include: { membershipPlan: true }
    });

    return NextResponse.json({
      hasActiveMembreship: !!membership, // Nota: mantiene el typo "Membreship" por compatibilidad
      membership: membership ? {
        id: membership.id,
        planName: membership.membershipPlan?.name,
        status: membership.status,
        startDate: membership.startDate,
        endDate: membership.endDate
      } : null
    });

  } catch (error) {
    console.error('Error checking membership status:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        hasActiveMembreship: false 
      },
      { status: 500 }
    );
  }
}