import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const cards = await prisma.card.findMany({
      orderBy: [
        { arcangelName: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Error fetching oracle cards:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { code, name, title, description, definition, imageUrl, arcangel, shortMsg, meaning, isActive } = body

    // Validaciones
    if (!code || !name || !description || !arcangel) {
      return NextResponse.json(
        { error: 'Campos requeridos: code, name, description, arcangel' },
        { status: 400 }
      )
    }

    // Verificar que el código no exista
    const existingCard = await prisma.card.findFirst({
      where: { code }
    })

    if (existingCard) {
      return NextResponse.json(
        { error: 'Ya existe una carta con este código' },
        { status: 400 }
      )
    }

    const card = await prisma.card.create({
      data: {
        code,
        name,
        title: title || name,
        description,
        definition: definition || description,
        imageUrl: imageUrl || '/oraculo/arcangeles_cartas/dorso.png',
        shortMsg: shortMsg || '',
        meaning: meaning || description,
        isActive: isActive !== undefined ? isActive : true,
        arcangelName: arcangel
      }
    })

    return NextResponse.json({ card }, { status: 201 })
  } catch (error) {
    console.error('Error creating oracle card:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}