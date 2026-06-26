import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/prisma";
import { calculateMentorArcangel } from '@/lib/mentor-utils';

// PUT /api/user/birth-date - Actualizar fecha de nacimiento y asignar arcángel mentor
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { dateOfBirth } = await request.json();

    if (!dateOfBirth) {
      return NextResponse.json(
        { error: 'Fecha de nacimiento requerida' },
        { status: 400 }
      );
    }

    // Validar que la fecha sea válida
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: 'Fecha de nacimiento inválida' },
        { status: 400 }
      );
    }

    // Validar que la fecha no sea futura
    if (birthDate > new Date()) {
      return NextResponse.json(
        { error: 'La fecha de nacimiento no puede ser futura' },
        { status: 400 }
      );
    }

    // Calcular el arcángel mentor
    const mentorArcangel = calculateMentorArcangel(birthDate);

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dateOfBirth: birthDate,
        mentorArcangel
      },
      select: {
        id: true,
        dateOfBirth: true,
        mentorArcangel: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `¡Tu Arcángel Mentor ${mentorArcangel} ha sido asignado!`
    });

  } catch (error) {
    console.error('Error updating birth date:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}