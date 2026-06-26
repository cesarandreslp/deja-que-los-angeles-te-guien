import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";

// GET /api/mentor/history - Obtener historial de consultas con arcángel mentor
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Obtener consultas del usuario
    const [consultations, total] = await Promise.all([
      prisma.mentor_consultations.findMany({
        where: {
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset,
        select: {
          id: true,
          arcangel: true,
          question: true,
          answer: true,
          createdAt: true
        }
      }),
      prisma.mentor_consultations.count({
        where: {
          userId: session.user.id
        }
      })
    ]);

    // Obtener información del usuario para saber su arcángel mentor
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        mentorArcangel: true,
        dateOfBirth: true
      }
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      consultations,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        totalItems: total
      },
      userInfo: {
        mentorArcangel: user?.mentorArcangel || null,
        hasDateOfBirth: !!user?.dateOfBirth
      }
    });

  } catch (error) {
    console.error('Error fetching mentor history:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}