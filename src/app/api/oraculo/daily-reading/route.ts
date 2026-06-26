import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";

// GET /api/oraculo/daily-reading - Obtener la lectura del día actual
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

    if (!membership) {
      return NextResponse.json(
        { 
          error: 'Membresía requerida',
          message: 'Necesitas una membresía activa para usar el oráculo',
          requiresMembership: true
        },
        { status: 403 }
      )
    }

    // Obtener fecha de hoy (solo fecha, sin hora)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Buscar lectura del día
    const todayReading = await prisma.reading.findFirst({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!todayReading) {
      return NextResponse.json({ 
        hasReadingToday: false,
        canCreateNew: true 
      });
    }

    // Obtener las cartas de la lectura
    const cardIds = todayReading.selectedIds;
    const cards = await prisma.card.findMany({
      where: {
        id: { in: cardIds }
      },
      select: {
        id: true,
        code: true,
        name: true,
        title: true,
        description: true,
        definition: true,
        imageUrl: true,
        arcangel: true,
        shortMsg: true
      }
    });

    // Ordenar las cartas según el orden original
    const orderedCards = cardIds.map((id: string) => 
      cards.find((card: any) => card.id === id)
    ).filter(Boolean);

    // 🛡️ FILTRADO DEFENSIVO - Asegurar que NO hay campos extra
    const safeCards = orderedCards.map((card: any) => ({
      id: card.id,
      code: card.code,
      name: card.name,
      title: card.title || card.name,
      description: card.description,
      definition: card.definition || card.description,
      imageUrl: card.imageUrl,
      arcangel: card.arcangel,
      shortMsg: card.shortMsg
    }));

    return NextResponse.json({
      hasReadingToday: true,
      canCreateNew: false,
      reading: {
        id: todayReading.id,
        question: todayReading.question,
        type: todayReading.type,
        cards: safeCards,  // ✅ Cartas filtradas
        messages: todayReading.messages,
        createdAt: todayReading.createdAt
      }
    });

  } catch (error) {
    console.error('Error checking daily reading:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}