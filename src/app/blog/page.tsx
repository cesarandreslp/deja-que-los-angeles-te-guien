'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/context/ThemeContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  SearchIcon, 
  CalendarIcon, 
  UserIcon, 
  EyeIcon, 
  HeartIcon,
  MessageCircleIcon,
  BookOpenIcon,
  SparklesIcon
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
  category: {
    name: string
    slug: string
  }
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
  _count: {
    posts: number
  }
}

export default function BlogPage() {
  const { currentTheme } = useTheme()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadBlogData()
  }, [currentPage, selectedCategory, searchTerm])

  const loadBlogData = async () => {
    try {
      setLoading(true)
      
      // Construir parámetros de búsqueda
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '6'
      })
      
      if (selectedCategory) {
        params.append('categoryId', selectedCategory)
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      // Cargar posts
      const postsRes = await fetch(`/api/blog/posts?${params}`)
      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData.posts || [])
        setTotalPages(postsData.pagination?.pages || 1)
      }
      
      // Cargar categorías (solo la primera vez)
      if (categories.length === 0) {
        const categoriesRes = await fetch('/api/blog/categories')
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.categories || [])
        }
      }
      
    } catch (error) {
      console.error('Error cargando datos del blog:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadBlogData()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{backgroundColor: currentTheme.colors.background}}
    >
      {/* Hero Section */}
      <div 
        className="relative z-10"
        style={{
          background: currentTheme.colors.buttonGradient,
          color: currentTheme.colors.text
        }}
      >
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div 
                className="p-4 rounded-full border-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderColor: currentTheme.colors.text
                }}
              >
                <BookOpenIcon 
                  className="w-12 h-12" 
                  style={{color: currentTheme.colors.text}} 
                />
              </div>
            </div>
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{
                fontFamily: currentTheme.typography.headingFont,
                color: currentTheme.colors.text
              }}
            >
              Blog del Oráculo de los Arcángeles
            </h1>
            <p 
              className="text-xl md:text-2xl mb-8"
              style={{
                color: currentTheme.colors.textSecondary,
                fontFamily: currentTheme.typography.bodyFont
              }}
            >
              Descubre la sabiduría angelical y encuentra guía espiritual
            </p>
            <div 
              className="flex items-center justify-center gap-2"
              style={{
                color: currentTheme.colors.textSecondary,
                fontFamily: currentTheme.typography.bodyFont
              }}
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Conecta con la luz divina a través de nuestras publicaciones</span>
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Búsqueda */}
            <div 
              className="rounded-2xl shadow-xl p-6 backdrop-blur-sm border"
              style={{
                backgroundColor: currentTheme.colors.cardBg,
                borderColor: currentTheme.colors.borderColor,
                boxShadow: `0 10px 25px ${currentTheme.colors.shadowColor}`
              }}
            >
              <h3 
                className="flex items-center gap-2 font-semibold mb-4"
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.typography.bodyFont
                }}
              >
                <SearchIcon className="w-5 h-5" />
                Buscar
              </h3>
              <form onSubmit={handleSearch} className="space-y-2">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar publicaciones..."
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.borderColor,
                    color: currentTheme.colors.text
                  }}
                />
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    background: currentTheme.colors.buttonGradient,
                    color: currentTheme.colors.text,
                    fontFamily: currentTheme.typography.bodyFont
                  }}
                >
                  Buscar
                </button>
              </form>
            </div>

            {/* Categorías */}
            <div 
              className="rounded-2xl shadow-xl p-6 backdrop-blur-sm border"
              style={{
                backgroundColor: currentTheme.colors.cardBg,
                borderColor: currentTheme.colors.borderColor,
                boxShadow: `0 10px 25px ${currentTheme.colors.shadowColor}`
              }}
            >
              <h3 
                className="font-semibold mb-4"
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.typography.bodyFont
                }}
              >
                Categorías
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory('')
                    setCurrentPage(1)
                  }}
                  className="w-full text-left p-2 rounded transition-all duration-300"
                  style={{
                    backgroundColor: !selectedCategory ? currentTheme.colors.accent + '20' : 'transparent',
                    color: !selectedCategory ? currentTheme.colors.accent : currentTheme.colors.text,
                    fontFamily: currentTheme.typography.bodyFont
                  }}
                >
                  Todas las categorías
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setCurrentPage(1)
                    }}
                    className="w-full text-left p-2 rounded transition-all duration-300 flex justify-between items-center"
                    style={{
                      backgroundColor: selectedCategory === category.id ? currentTheme.colors.accent + '20' : 'transparent',
                      color: selectedCategory === category.id ? currentTheme.colors.accent : currentTheme.colors.text,
                      fontFamily: currentTheme.typography.bodyFont
                    }}
                  >
                    <span>{category.name}</span>
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: currentTheme.colors.borderColor,
                        color: currentTheme.colors.textSecondary
                      }}
                    >
                      {category._count.blog_posts}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Últimas publicaciones populares */}
            <div 
              className="rounded-2xl shadow-xl p-6 backdrop-blur-sm border"
              style={{
                backgroundColor: currentTheme.colors.cardBg,
                borderColor: currentTheme.colors.borderColor,
                boxShadow: `0 10px 25px ${currentTheme.colors.shadowColor}`
              }}
            >
              <h3 
                className="font-semibold mb-4"
                style={{
                  color: currentTheme.colors.text,
                  fontFamily: currentTheme.typography.bodyFont
                }}
              >
                📈 Más Populares
              </h3>
              <div className="space-y-3">
                {posts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="block p-2 rounded transition-all duration-300 hover:bg-opacity-20"
                    style={{
                      backgroundColor: 'transparent'
                    }}
                  >
                    <h4 
                      className="font-medium text-sm line-clamp-2 mb-1"
                      style={{
                        color: currentTheme.colors.text,
                        fontFamily: currentTheme.typography.bodyFont
                      }}
                    >
                      {post.title}
                    </h4>
                    <div 
                      className="flex items-center gap-2 text-xs"
                      style={{
                        color: currentTheme.colors.textSecondary,
                        fontFamily: currentTheme.typography.bodyFont
                      }}
                    >
                      <EyeIcon className="w-3 h-3" />
                      <span>{post.views}</span>
                      <HeartIcon className="w-3 h-3" />
                      <span>{post.likes}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div 
                  className="animate-spin rounded-full h-12 w-12 border-b-2"
                  style={{borderColor: currentTheme.colors.accent}}
                ></div>
              </div>
            ) : (
              <>
                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {posts.map((post) => (
                    <div 
                      key={post.id} 
                      className="rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 overflow-hidden"
                      style={{
                        backgroundColor: currentTheme.colors.cardBg,
                        borderColor: currentTheme.colors.borderColor,
                        boxShadow: `0 10px 25px ${currentTheme.colors.shadowColor}`
                      }}
                    >
                      {post.coverImage && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span 
                            className="px-2 py-1 text-xs rounded"
                            style={{
                              backgroundColor: currentTheme.colors.accent + '20',
                              color: currentTheme.colors.accent,
                              fontFamily: currentTheme.typography.bodyFont
                            }}
                          >
                            {post.category.name}
                          </span>
                          <span 
                            className="text-xs"
                            style={{
                              color: currentTheme.colors.textSecondary,
                              fontFamily: currentTheme.typography.bodyFont
                            }}
                          >
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        <h3 
                          className="text-xl font-bold line-clamp-2 mb-3 transition-colors duration-300"
                          style={{
                            color: currentTheme.colors.text,
                            fontFamily: currentTheme.typography.headingFont
                          }}
                        >
                          <Link 
                            href={`/blog/${post.slug}`}
                            style={{color: currentTheme.colors.text}}
                            className="hover:opacity-70"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <p 
                          className="line-clamp-3 mb-4"
                          style={{
                            color: currentTheme.colors.textSecondary,
                            fontFamily: currentTheme.typography.bodyFont
                          }}
                        >
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="px-6 pb-6">
                        <div 
                          className="flex items-center justify-between text-sm mb-4"
                          style={{
                            color: currentTheme.colors.textSecondary,
                            fontFamily: currentTheme.typography.bodyFont
                          }}
                        >
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
                              <span 
                                key={index} 
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: currentTheme.colors.borderColor,
                                  color: currentTheme.colors.textSecondary,
                                  fontFamily: currentTheme.typography.bodyFont
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <Link
                          href={`/blog/${post.slug}`}
                          className="w-full inline-block text-center py-3 px-6 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                          style={{
                            background: currentTheme.colors.buttonGradient,
                            color: currentTheme.colors.text,
                            fontFamily: currentTheme.typography.bodyFont
                          }}
                        >
                          Leer más →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {posts.length === 0 && !loading && (
                  <Card>
                    <CardContent className="text-center py-16">
                      <div className="mb-4">
                        <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No se encontraron publicaciones
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || selectedCategory 
                          ? 'Intenta cambiar los filtros de búsqueda'
                          : 'Aún no hay publicaciones disponibles'
                        }
                      </p>
                      {(searchTerm || selectedCategory) && (
                        <Button
                          onClick={() => {
                            setSearchTerm('')
                            setSelectedCategory('')
                            setCurrentPage(1)
                          }}
                        >
                          Ver todas las publicaciones
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="secondary"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      ← Anterior
                    </Button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "secondary"}
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="secondary"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Background de partículas */}
      <GoldenStarsBackground />
    </div>
  )
}