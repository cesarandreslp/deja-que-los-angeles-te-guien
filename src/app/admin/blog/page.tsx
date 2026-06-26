'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  EyeIcon,
  MessageCircleIcon,
  FolderIcon,
  SettingsIcon,
  BookOpenIcon,
  UsersIcon
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  views: number
  likes: number
  publishedAt?: string
  createdAt: string
  blog_categories: {
    name: string
    slug: string
  }
  User: {
    fullName: string
  }
  _count: {
    blog_comments: number
  }
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  _count: {
    blog_posts: number
  }
}

interface BlogComment {
  id: string
  content: string
  isApproved: boolean
  createdAt: string
  User: {
    fullName: string
    email: string
  }
  blog_posts: {
    title: string
    slug: string
  }
}

export default function BlogAdminPage() {
  const { data: session, status } = useSession()
  const { currentTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [comments, setComments] = useState<BlogComment[]>([])
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalComments: 0,
    pendingComments: 0
  })

  // Verificar autenticación y permisos
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CONSULTANT')) {
      redirect('/login')
    }
    
    loadBlogData()
  }, [session, status])

  const loadBlogData = async () => {
    try {
      setLoading(true)
      
      // Cargar posts
      const postsRes = await fetch('/api/admin/blog/posts')
      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData.posts || [])
      }
      
      // Cargar categorías
      const categoriesRes = await fetch('/api/admin/blog/categories')
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }
      
      // Cargar comentarios
      const commentsRes = await fetch('/api/admin/blog/comments')
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData.comments || [])
      }
      
      // Cargar estadísticas
      const statsRes = await fetch('/api/admin/blog/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats || stats)
      }
      
    } catch (error) {
      console.error('Error cargando datos del blog:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return
    
    try {
      const response = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('Error eliminando post:', error)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
    
    try {
      const response = await fetch(`/api/admin/blog/categories/${categoryId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId))
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error)
    }
  }

  const handleApproveComment = async (commentId: string, approve: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approve })
      })
      
      if (response.ok) {
        setComments(comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, isApproved: approve }
            : comment
        ))
      }
    } catch (error) {
      console.error('Error moderando comentario:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: currentTheme?.colors.background }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-32 w-32 border-b-2 mb-4"
            style={{ borderBottomColor: currentTheme?.colors.accent }}
          ></div>
          <h2 
            className="text-xl font-semibold mb-2"
            style={{ 
              color: currentTheme?.colors.text,
              fontFamily: currentTheme?.typography.headingFont
            }}
          >
            📖 Cargando Blog...
          </h2>
          <p style={{ color: currentTheme?.colors.textSecondary }}>
            Preparando contenido angelical
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: currentTheme?.colors.background }}>
      {/* Header */}
      <div 
        className="shadow-lg border-b mb-8"
        style={{ 
          background: currentTheme?.colors.buttonGradient,
          borderBottomColor: currentTheme?.colors.borderColor
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 
                className="text-3xl font-bold flex items-center gap-3 text-white"
                style={{ fontFamily: currentTheme?.typography.headingFont }}
              >
                📖 Blog del Oráculo
              </h1>
              <p className="text-white/80">
                Administra publicaciones espirituales, categorías sagradas y comentarios divinos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div 
          className="rounded-xl shadow-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: currentTheme?.colors.accent }}
          >
            {stats.totalPosts}
          </div>
          <p 
            className="text-sm"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            📝 Total Posts
          </p>
        </div>
        
        <div 
          className="rounded-xl shadow-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <div className="text-2xl font-bold text-green-600">{stats.publishedPosts}</div>
          <p 
            className="text-sm"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            ✅ Publicados
          </p>
        </div>
        
        <div 
          className="rounded-xl shadow-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <div className="text-2xl font-bold text-yellow-600">{stats.draftPosts}</div>
          <p 
            className="text-sm"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            📄 Borradores
          </p>
        </div>
        
        <div 
          className="rounded-xl shadow-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: currentTheme?.colors.accentSecondary }}
          >
            {stats.totalViews}
          </div>
          <p 
            className="text-sm"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            👁️ Visualizaciones
          </p>
        </div>
        
        <div 
          className="rounded-xl shadow-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <div 
            className="text-2xl font-bold"
            style={{ color: currentTheme?.colors.accent }}
          >
            {stats.totalComments}
          </div>
          <p 
            className="text-sm"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            💬 Comentarios
          </p>
        </div>
        
        <div 
          className="rounded-xl shadow-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <div className="text-2xl font-bold text-red-600">{stats.pendingComments}</div>
          <p 
            className="text-sm"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            ⏳ Pendientes
          </p>
        </div>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <div 
          className="grid w-full grid-cols-4 rounded-xl p-1 shadow-lg"
          style={{ backgroundColor: currentTheme?.colors.cardBg }}
        >
          <button 
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ 
              backgroundColor: currentTheme?.colors.accent,
              color: 'white'
            }}
          >
            📝 Entradas
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            📁 Categorías
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            💬 Comentarios
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            ⚙️ Configuración
          </button>
        </div>

        {/* Tab de Entradas */}
        <div>
          <div 
            className="rounded-xl shadow-lg"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="p-6 border-b" style={{ borderBottomColor: currentTheme?.colors.borderColor }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 
                    className="text-xl font-semibold"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.headingFont
                    }}
                  >
                    ✨ Publicaciones del Blog Angelical
                  </h3>
                  <p style={{ color: currentTheme?.colors.textSecondary }}>
                    Administra todas las entradas espirituales del blog
                  </p>
                </div>
                <Link
                  href="/admin/blog/posts/new"
                  className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                  style={{ background: currentTheme?.colors.buttonGradient }}
                >
                  <PlusIcon className="w-4 h-4" />
                  Nueva Publicación
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{post.title}</h3>
                        <Badge variant={
                          post.status === 'PUBLISHED' ? 'default' :
                          post.status === 'DRAFT' ? 'secondary' : 'error'
                        }>
                          {post.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📁 {post.blog_categories.name}</span>
                        <span>👤 {post.User.fullName}</span>
                        <span>👁 {post.views} vistas</span>
                        <span>❤️ {post.likes} likes</span>
                        <span>💬 {post._count.blog_comments} comentarios</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/blog/posts/${post.id}`}>
                          <EditIcon className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {posts.length === 0 && (
                  <div 
                    className="text-center py-8"
                    style={{ color: currentTheme?.colors.textSecondary }}
                  >
                    No hay publicaciones angelicales aún. 
                    <Link 
                      href="/admin/blog/posts/new" 
                      className="hover:underline ml-1"
                      style={{ color: currentTheme?.colors.accent }}
                    >
                      Crea la primera
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab de Categorías */}
        <div>
          <div 
            className="rounded-xl shadow-lg"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="p-6 border-b" style={{ borderBottomColor: currentTheme?.colors.borderColor }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 
                    className="text-xl font-semibold"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.headingFont
                    }}
                  >
                    📁 Categorías Angelicales
                  </h3>
                  <p style={{ color: currentTheme?.colors.textSecondary }}>
                    Organiza tus publicaciones por categorías espirituales
                  </p>
                </div>
                <Link
                  href="/admin/blog/categories/new"
                  className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                  style={{ background: currentTheme?.colors.buttonGradient }}
                >
                  <PlusIcon className="w-4 h-4" />
                  Nueva Categoría
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{category.name}</h3>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/blog/categories/${category.id}`}>
                            <EditIcon className="w-3 h-3" />
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <TrashIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <p className="text-xs text-gray-500">
                      {category._count.blog_posts} publicación(es)
                    </p>
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div 
                    className="col-span-full text-center py-8"
                    style={{ color: currentTheme?.colors.textSecondary }}
                  >
                    No hay categorías angelicales aún.
                    <Link 
                      href="/admin/blog/categories/new" 
                      className="hover:underline ml-1"
                      style={{ color: currentTheme?.colors.accent }}
                    >
                      Crea la primera
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab de Comentarios */}
        <div>
          <div 
            className="rounded-xl shadow-lg"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="p-6 border-b" style={{ borderBottomColor: currentTheme?.colors.borderColor }}>
              <h3 
                className="text-xl font-semibold"
                style={{ 
                  color: currentTheme?.colors.text,
                  fontFamily: currentTheme?.typography.headingFont
                }}
              >
                💬 Comentarios Espirituales
              </h3>
              <p style={{ color: currentTheme?.colors.textSecondary }}>
                Modera los comentarios de los lectores del blog angelical
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{comment.User.fullName}</p>
                        <p className="text-sm text-gray-600">{comment.User.email}</p>
                        <p className="text-xs text-gray-500">
                          en "{comment.blog_posts.title}" • {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={comment.isApproved ? 'default' : 'secondary'}>
                        {comment.isApproved ? 'Aprobado' : 'Pendiente'}
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">{comment.content}</p>
                    <div className="flex gap-2">
                      {!comment.isApproved && (
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveComment(comment.id, true)}
                        >
                          Aprobar
                        </Button>
                      )}
                      {comment.isApproved && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproveComment(comment.id, false)}
                        >
                          Rechazar
                        </Button>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/blog/${comment.blog_posts.slug}#comment-${comment.id}`} target="_blank">
                          Ver en Post
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <div 
                    className="text-center py-8"
                    style={{ color: currentTheme?.colors.textSecondary }}
                  >
                    No hay comentarios angelicales aún.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab de Configuración */}
        <div>
          <div 
            className="rounded-xl shadow-lg"
            style={{ backgroundColor: currentTheme?.colors.cardBg }}
          >
            <div className="p-6 border-b" style={{ borderBottomColor: currentTheme?.colors.borderColor }}>
              <h3 
                className="text-xl font-semibold"
                style={{ 
                  color: currentTheme?.colors.text,
                  fontFamily: currentTheme?.typography.headingFont
                }}
              >
                ⚙️ Configuración del Blog Angelical
              </h3>
              <p style={{ color: currentTheme?.colors.textSecondary }}>
                Ajusta las configuraciones del blog espiritual
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.bodyFont
                    }}
                  >
                    📝 Título del Blog
                  </label>
                  <input
                    type="text"
                    placeholder="Blog del Oráculo de los Arcángeles"
                    defaultValue="Blog del Oráculo de los Arcángeles"
                    className="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:scale-105"
                    style={{ 
                      borderColor: currentTheme?.colors.borderColor,
                      backgroundColor: currentTheme?.colors.background,
                      color: currentTheme?.colors.text,
                      outlineColor: currentTheme?.colors.accent
                    }}
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.bodyFont
                    }}
                  >
                    📖 Descripción
                  </label>
                  <input
                    type="text"
                    placeholder="Sabiduría angelical y guía espiritual"
                    defaultValue="Descubre la sabiduría angelical y encuentra guía espiritual en nuestro blog"
                    className="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:scale-105"
                    style={{ 
                      borderColor: currentTheme?.colors.borderColor,
                      backgroundColor: currentTheme?.colors.background,
                      color: currentTheme?.colors.text,
                      outlineColor: currentTheme?.colors.accent
                    }}
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ 
                      color: currentTheme?.colors.text,
                      fontFamily: currentTheme?.typography.bodyFont
                    }}
                  >
                    📊 Posts por página
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    defaultValue="10"
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:scale-105"
                    style={{ 
                      borderColor: currentTheme?.colors.borderColor,
                      backgroundColor: currentTheme?.colors.background,
                      color: currentTheme?.colors.text,
                      outlineColor: currentTheme?.colors.accent
                    }}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="enable-comments" 
                    defaultChecked 
                    className="w-4 h-4 rounded"
                    style={{ accentColor: currentTheme?.colors.accent }}
                  />
                  <label 
                    htmlFor="enable-comments" 
                    className="text-sm"
                    style={{ color: currentTheme?.colors.text }}
                  >
                    💬 Permitir comentarios en las publicaciones
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="moderate-comments" 
                    defaultChecked 
                    className="w-4 h-4 rounded"
                    style={{ accentColor: currentTheme?.colors.accent }}
                  />
                  <label 
                    htmlFor="moderate-comments" 
                    className="text-sm"
                    style={{ color: currentTheme?.colors.text }}
                  >
                    🔍 Moderar comentarios antes de publicar
                  </label>
                </div>
                
                <button
                  className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                  style={{ background: currentTheme?.colors.buttonGradient }}
                >
                  ✨ Guardar Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
      </div>
    </div>
  )
}