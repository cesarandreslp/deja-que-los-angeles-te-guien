import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";

// GET /api/oraculo/reading/[id] - Obtener una lectura específica con sus mensajes
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const readingId = params.id;

    if (!readingId) {
      return NextResponse.json(
        { error: 'ID de lectura requerido' },
        { status: 400 }
      )
    }

    // Buscar la lectura y verificar que pertenece al usuario
    const reading = await prisma.reading.findUnique({
      where: {
        id: readingId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!reading) {
      return NextResponse.json(
        { error: 'Lectura no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la lectura pertenece al usuario actual
    if (reading.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta lectura' },
        { status: 403 }
      )
    }

    // Obtener las cartas de la lectura
    const cardIds = reading.selectedIds;
    const cards = await prisma.card.findMany({
      where: {
        id: { in: cardIds }
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        imageUrl: true,
        arcangel: true,
        shortMsg: true
      }
    });

    // Ordenar las cartas según el orden original
    const orderedCards = cardIds.map((id: string) => 
      cards.find((card: any) => card.id === id)
    ).filter(Boolean);

    return NextResponse.json({
      id: reading.id,
      question: reading.question,
      type: reading.type,
      cards: orderedCards,
      messages: reading.messages,
      createdAt: reading.createdAt
    });

  } catch (error) {
    console.error('Error fetching reading:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}