import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// Config stored in memory (no DB model for blog config)
let blogConfig = {
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
  metaDescription: '',
  metaKeywords: '',
  socialImage: '',
}

export async function GET() {
  return NextResponse.json(blogConfig)
}

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
    blogConfig = { ...blogConfig, ...data }

    return NextResponse.json(blogConfig)
  } catch (error) {
    console.error('Error al actualizar configuración:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración del blog' },
      { status: 500 }
    )
  }
}
