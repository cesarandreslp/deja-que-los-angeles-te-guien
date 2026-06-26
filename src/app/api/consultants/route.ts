import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Obtener consultores activos con estadísticas
    const consultants = await prisma.user.findMany({
      where: {
        role: 'CONSULTANT',
        isActive: true,
        isAvailableForConsultations: true
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        createdAt: true,
        // Campos específicos del consultor
        specialty: true,
        hourlyRate: true,
        bio: true,
        consultantRating: true,
        totalConsultationsCompleted: true,
        _count: {
          select: {
            consultorConsultations: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        }
      },
      orderBy: {
        consultantRating: 'desc' // Ordenar por mejor rating
      }
    })

    // Formatear datos de consultores con información adicional
    const formattedConsultants = consultants.map((consultant: any) => ({
      id: consultant.id,
      fullName: consultant.fullName,
      email: consultant.email,
      profileImage: consultant.profileImage,
      specialty: consultant.specialty || 'Consultor General',
      hourlyRate: consultant.hourlyRate || 6000000, // 60.000 COP por defecto (en centavos)
      rating: consultant.consultantRating || 0.0,
      totalConsultations: consultant.totalConsultationsCompleted || consultant._count.consultorConsultations,
      bio: consultant.bio || 'Consultor experimentado con amplio conocimiento en diversas áreas.',
    }))

    return NextResponse.json(formattedConsultants)
  } catch (error) {
    console.error('Error fetching consultants:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}