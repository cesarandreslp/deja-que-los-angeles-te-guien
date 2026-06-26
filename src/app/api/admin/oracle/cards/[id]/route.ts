import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const card = await prisma.card.findUnique({
      where: { id: params.id }
    })

    if (!card) {
      return NextResponse.json({ error: 'Carta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ card })
  } catch (error) {
    console.error('Error fetching oracle card:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const updateData: any = {}

    // Solo actualizar campos que se proporcionen
    if (body.name !== undefined) updateData.name = body.name
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.definition !== undefined) updateData.definition = body.definition
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
    if (body.arcangel !== undefined) updateData.arcangel = body.arcangel
    if (body.shortMsg !== undefined) updateData.shortMsg = body.shortMsg
    if (body.meaning !== undefined) updateData.meaning = body.meaning
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const card = await prisma.card.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ card })
  } catch (error: any) {
    console.error('Error updating oracle card:', error)
    
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Carta no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.card.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Carta eliminada exitosamente' })
  } catch (error: any) {
    console.error('Error deleting oracle card:', error)
    
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Carta no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}