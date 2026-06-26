import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// PATCH: Moderar comentario (aprobar/rechazar)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CONSULTANT')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { isApproved } = body

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo isApproved debe ser boolean' },
        { status: 400 }
      )
    }

    // Verificar que el comentario existe
    const existingComment = await prisma.blogComment.findUnique({
      where: { id: params.id }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comentario no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el estado del comentario
    const comment = await prisma.blogComment.update({
      where: { id: params.id },
      data: { isApproved },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({ comment })

  } catch (error) {
    console.error('Error moderando comentario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar comentario
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el comentario existe
    const existingComment = await prisma.blogComment.findUnique({
      where: { id: params.id }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comentario no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el comentario
    await prisma.blogComment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Comentario eliminado exitosamente' })

  } catch (error) {
    console.error('Error eliminando comentario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}