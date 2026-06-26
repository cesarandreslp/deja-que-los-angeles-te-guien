import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener configuración del blog
export async function GET() {
  try {
    let config = await prisma.blogConfig.findUnique({
      where: { id: 'default' }
    })

    // Si no existe, crear configuración por defecto
    if (!config) {
      config = await prisma.blogConfig.create({
        data: {
          id: 'default',
          blogTitle: 'Blog Angelical',
          blogDescription: 'Sabiduría y guía espiritual de los Arcángeles',
          postsPerPage: 9,
          allowComments: true,
          moderateComments: true,
          enableLikes: true,
          enableSharing: true,
          enableCategories: true,
          enableTags: true,
        }
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración del blog' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar configuración del blog
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores.' },
        { status: 401 }
      )
    }

    const data = await req.json()

    const config = await prisma.blogConfig.upsert({
      where: { id: 'default' },
      update: {
        blogTitle: data.blogTitle,
        blogDescription: data.blogDescription,
        postsPerPage: data.postsPerPage,
        allowComments: data.allowComments,
        moderateComments: data.moderateComments,
        enableLikes: data.enableLikes,
        enableSharing: data.enableSharing,
        enableCategories: data.enableCategories,
        enableTags: data.enableTags,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        socialImage: data.socialImage,
      },
      create: {
        id: 'default',
        blogTitle: data.blogTitle,
        blogDescription: data.blogDescription,
        postsPerPage: data.postsPerPage,
        allowComments: data.allowComments,
        moderateComments: data.moderateComments,
        enableLikes: data.enableLikes,
        enableSharing: data.enableSharing,
        enableCategories: data.enableCategories,
        enableTags: data.enableTags,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        socialImage: data.socialImage,
      }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error al actualizar configuración:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración del blog' },
      { status: 500 }
    )
  }
}
