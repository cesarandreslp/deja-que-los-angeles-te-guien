import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Obtener estadísticas del blog
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CONSULTANT')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener todas las estadísticas en paralelo
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalViews,
      totalLikes,
      totalComments,
      pendingComments,
      totalCategories,
      recentPosts,
      topPosts,
      categoriesStats
    ] = await Promise.all([
      // Conteos básicos de posts
      prisma.blog_posts.count(),
      prisma.blog_posts.count({ where: { status: 'PUBLISHED' } }),
      prisma.blog_posts.count({ where: { status: 'DRAFT' } }),
      prisma.blog_posts.count({ where: { status: 'ARCHIVED' } }),
      
      // Métricas de engagement
      prisma.blog_posts.aggregate({
        _sum: { views: true }
      }).then((result: any) => result._sum.views || 0),
      
      prisma.blog_posts.aggregate({
        _sum: { likes: true }
      }).then((result: any) => result._sum.likes || 0),
      
      // Comentarios
      prisma.blog_comments.count(),
      prisma.blog_comments.count({ where: { isApproved: false } }),
      
      // Categorías
      prisma.blog_categories.count(),
      
      // Posts recientes (últimos 7 días)
      prisma.blog_posts.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Posts más populares (por vistas)
      prisma.blog_posts.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          likes: true,
          publishedAt: true
        },
        orderBy: { views: 'desc' },
        take: 5
      }),
      
      // Estadísticas por categoría
      prisma.blog_categories.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              blog_posts: true
            }
          }
        },
        orderBy: {
          blog_posts: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ])

    // Calcular métricas adicionales
    const avgViewsPerPost = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0
    const avgLikesPerPost = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0
    const avgCommentsPerPost = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0
    const approvalRate = totalComments > 0 ? Math.round(((totalComments - pendingComments) / totalComments) * 100) : 100

    const stats = {
      // Conteos básicos
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalCategories,
      
      // Métricas de engagement
      totalViews,
      totalLikes,
      totalComments,
      pendingComments,
      approvedComments: totalComments - pendingComments,
      
      // Métricas calculadas
      avgViewsPerPost,
      avgLikesPerPost,
      avgCommentsPerPost,
      approvalRate,
      
      // Tendencias
      recentPosts,
      
      // Datos adicionales para gráficos/análisis
      topPosts,
      categoriesStats,
      
      // Porcentajes
      publishedPercentage: totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0,
      draftPercentage: totalPosts > 0 ? Math.round((draftPosts / totalPosts) * 100) : 0,
      
      // Fecha de última actualización
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Error obteniendo estadísticas del blog:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}