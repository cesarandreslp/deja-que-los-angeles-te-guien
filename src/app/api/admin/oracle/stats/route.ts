import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener estadísticas del oráculo
    const [
      totalCards,
      activeCards,
      totalReadings,
      cardsPerArchangel
    ] = await Promise.all([
      prisma.card.count(),
      prisma.card.count({ where: { isActive: true } }),
      prisma.reading.count(), // Asumiendo que tienes el modelo Reading
      prisma.card.groupBy({
        by: ['arcangelName'],
        _count: {
          arcangelName: true
        }
      })
    ])

    // Contar arcángeles únicos
    const totalArchangels = cardsPerArchangel.length

    // Crear objeto de cartas por arcángel
    const cardsPerArchangelObj = cardsPerArchangel.reduce((acc: { [key: string]: number }, item: any) => {
      acc[item.arcangelName] = item._count.arcangelName
      return acc
    }, {} as { [key: string]: number })

    const stats = {
      totalCards,
      activeCards,
      totalArchangels,
      totalReadings,
      cardsPerArchangel: cardsPerArchangelObj
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching oracle stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}