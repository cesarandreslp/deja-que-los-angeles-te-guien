import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";
import { cache, cacheKeys, cacheTTL } from '@/lib/cache';

// GET /api/oraculo/cards - Listar todas las cartas (con caché de 5 minutos)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Usar caché para las cartas (5 minutos - las cartas no cambian frecuentemente)
    const cards = await cache.getOrSet(
      cacheKeys.cards(),
      async () => {
        return await prisma.card.findMany({
          where: { isActive: true },
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
      },
      cacheTTL.long // 5 minutos
    );
    
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/oraculo/cards/draw - Barajar y seleccionar cartas
export async function POST(request: Request) {
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

    // Verificar si ya existe una consulta hoy
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingReading = await prisma.reading.findFirst({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    if (existingReading) {
      return NextResponse.json(
        { 
          error: 'Consulta diaria ya realizada',
          message: 'Ya realizaste tu consulta del oráculo hoy. Solo puedes hacer una consulta por día.',
          hasReadingToday: true,
          readingId: existingReading.id
        },
        { status: 409 }
      )
    }

    const body = await request.json();
    const { type = 3, question } = body;
    
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Pregunta inválida" }, { status: 400 });
    }
    
    const all = await prisma.card.findMany({
      where: { isActive: true },
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
    
    // Función para barajar array
    const shuffle = (a: any[]) => {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    
    shuffle(all);
    
    let selected = [];
    if (type === 1) selected = [all[0]];
    else if (type === 3) selected = all.slice(0, 3);
    else if (type === 9) selected = all.slice(0, 9);
    else selected = all.slice(0, 3);

    // 🛡️ FILTRADO DEFENSIVO - Eliminar CUALQUIER campo extra que Prisma pueda agregar
    const safeCards = selected.map((card: any) => ({
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

    // Crear registro de lectura
    const reading = await prisma.reading.create({
      data: {
        userId: session.user.id,
        question,
        type,
        selectedIds: safeCards.map((c: any) => String(c.id))
      }
    });

    return NextResponse.json({ 
      readingId: reading.id, 
      cards: safeCards  // ✅ Cartas filtradas
    });
  } catch (error) {
    console.error('Error drawing cards:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}