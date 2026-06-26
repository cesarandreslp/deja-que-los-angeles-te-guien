import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ liked: false })
    }

    const post = await prisma.blog_posts.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
    }

    // Verificar si el usuario ya dio like
    // Nota: Necesitarás crear una tabla BlogPostLike en Prisma
    // Por ahora, retornamos false
    // TODO: Implementar tabla de likes
    
    return NextResponse.json({ liked: false })
  } catch (error) {
    console.error('Error verificando like:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
