'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  UserIcon, 
  EyeIcon, 
  HeartIcon,
  MessageCircleIcon,
  FolderIcon
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  publishedAt: string
  views: number
  likes: number
  tags: string[]
  author: {
    fullName: string
  }
  _count: {
    comments: number
  }
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  posts: BlogPost[]
  _count: {
    blog_posts: number
  }
}

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params?.slug as string

  const [category, setCategory] = useState<BlogCategory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (categorySlug) {
      loadCategory()
    }
  }, [categorySlug])

  const loadCategory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blog/categories/${categorySlug}`)
      
      if (response.ok) {
        const data = await response.json()
        setCategory(data.category)
      }
    } catch (error) {
      console.error('Error cargando categoría:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Categoría no encontrada</h2>
            <p className="text-gray-600 mb-4">
              La categoría que buscas no existe.
            </p>
            <Button asChild>
              <Link href="/blog">Volver al blog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="secondary" asChild className="text-white border-white/30 hover:bg-white/10">
                <Link href="/blog">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Volver al Blog
                </Link>
              </Button>
            </div>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white/20 p-4 rounded-full">
                <FolderIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-xl text-purple-100 mb-4">
                    {category.description}
                  </p>
                )}
                <p className="text-purple-200">
                  {category._count.blog_posts} publicación{category._count.blog_posts !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {category.posts && category.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
                  {post.coverImage && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2 hover:text-purple-600">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        <span>{post.author.fullName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HeartIcon className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircleIcon className="w-4 h-4" />
                          <span>{post._count.comments}</span>
                        </div>
                      </div>
                    </div>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <Button asChild className="w-full">
                      <Link href={`/blog/${post.slug}`}>
                        Leer más →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No hay publicaciones en esta categoría
                </h3>
                <p className="text-gray-500 mb-4">
                  Aún no se han publicado artículos en "{category.name}".
                </p>
                <Button asChild>
                  <Link href="/blog">Ver todas las publicaciones</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}