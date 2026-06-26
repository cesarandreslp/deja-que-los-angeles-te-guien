'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeftIcon, 
  HeartIcon, 
  ShareIcon, 
  MessageCircleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  SendIcon,
  ClockIcon,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'

interface BlogPostClientProps {
  post: {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string
    coverImage: string | null
    tags: string[]
    views: number
    likes: number
    publishedAt: string
    createdAt: string
    updatedAt: string
    author: {
      id: string
      fullName: string
      email: string
    }
    category: {
      id: string
      name: string
      slug: string
    }
    comments: Array<{
      id: string
      content: string
      createdAt: string
      updatedAt: string
      isApproved: boolean
      user: {
        fullName: string
      }
    }>
  }
  readingTime: number
}

export default function BlogPostClient({ post, readingTime }: BlogPostClientProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [localPost, setLocalPost] = useState(post)

  useEffect(() => {
    // Incrementar vistas
    fetch(`/api/blog/posts/${post.slug}/view`, { method: 'POST' })
      .catch(err => console.error('Error incrementando vista:', err))

    // Verificar si ya dio like
    if (session) {
      fetch(`/api/blog/posts/${post.slug}/like/check`)
        .then(res => res.json())
        .then(data => setLiked(data.liked))
        .catch(err => console.error('Error verificando like:', err))
    }
  }, [post.slug, session])

  const handleLike = async () => {
    if (!session) {
      alert('Debes iniciar sesión para dar like')
      return
    }

    try {
      const response = await fetch(`/api/blog/posts/${post.slug}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setLocalPost(prev => ({ 
          ...prev, 
          likes: prev.likes + (liked ? -1 : 1) 
        }))
        setLiked(!liked)
      }
    } catch (error) {
      console.error('Error dando like:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      alert('Debes iniciar sesión para comentar')
      return
    }
    
    if (!newComment.trim()) return
    
    try {
      setSubmittingComment(true)
      const response = await fetch(`/api/blog/posts/${post.slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })
      
      if (response.ok) {
        setNewComment('')
        alert('Comentario enviado. Será revisado antes de publicarse.')
        // Recargar la página para mostrar comentarios actualizados
        window.location.reload()
      } else {
        alert('Error al enviar comentario')
      }
    } catch (error) {
      console.error('Error enviando comentario:', error)
      alert('Error al enviar comentario')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = `${post.title} - ${post.excerpt}`
    
    let shareUrl = ''
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        alert('URL copiada al portapapeles')
        return
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderMarkdown = (content: string) => {
    // Conversión básica de Markdown a HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 mt-8">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2 mt-4">$1</h3>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(.+)$/gm, '<p class="mb-4">$1</p>')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver al Blog
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-purple-600">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-purple-600">Blog</Link>
          <span className="mx-2">/</span>
          <Link href={`/blog/categoria/${post.category.slug}`} className="hover:text-purple-600">
            {post.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{post.title}</span>
        </nav>

        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
              {post.category.name}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ClockIcon className="w-4 h-4" />
              <span>{readingTime} min de lectura</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {post.author.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{post.author.fullName}</p>
                <p className="text-sm text-gray-500">{formatDate(post.publishedAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <EyeIcon className="w-5 h-5" />
                <span>{localPost.views.toLocaleString()}</span>
              </div>
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  liked 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                }`}
              >
                <HeartIcon className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{localPost.likes}</span>
              </button>
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
                
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Twitter className="w-5 h-5 text-sky-500" />
                      <span>Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      <span>LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 rounded transition-colors border-t mt-1 pt-2"
                    >
                      <ShareIcon className="w-5 h-5 text-gray-600" />
                      <span>Copiar enlace</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {post.coverImage && (
            <div className="relative h-64 md:h-96 w-full mb-8 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          <p className="text-xl text-gray-600 leading-relaxed font-light">
            {post.excerpt}
          </p>
        </div>

        {/* Post Content */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="prose prose-lg max-w-none p-8 md:p-12">
            <div 
              className="text-gray-800 leading-relaxed blog-content"
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(post.content) 
              }}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <MessageCircleIcon className="w-6 h-6 text-purple-600" />
            Comentarios ({post.comments.filter(c => c.isApproved).length})
          </h3>

          {/* Comment Form */}
          {session ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Deja tu comentario</CardTitle>
                <CardDescription>
                  Comparte tus pensamientos sobre esta publicación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe tu comentario aquí..."
                    rows={4}
                    required
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Tu comentario será revisado antes de publicarse
                    </p>
                    <Button type="submit" disabled={submittingComment}>
                      {submittingComment ? (
                        'Enviando...'
                      ) : (
                        <>
                          <SendIcon className="w-4 h-4 mr-2" />
                          Enviar comentario
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="text-center py-8">
                <MessageCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Inicia sesión para dejar un comentario
                </p>
                <Button asChild>
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments
              .filter(comment => comment.isApproved)
              .map((comment) => (
                <Card key={comment.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {comment.user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{comment.user.fullName}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed ml-13">
                      {comment.content}
                    </p>
                  </CardContent>
                </Card>
              ))}

            {post.comments.filter(c => c.isApproved).length === 0 && (
              <Card className="shadow-sm">
                <CardContent className="text-center py-8">
                  <MessageCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Aún no hay comentarios. ¡Sé el primero en comentar!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .blog-content h1, .blog-content h2, .blog-content h3 {
          color: #111827;
          font-weight: 700;
        }
        .blog-content a {
          color: #7c3aed;
          text-decoration: none;
          transition: color 0.2s;
        }
        .blog-content a:hover {
          color: #5b21b6;
          text-decoration: underline;
        }
        .blog-content img {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .blog-content p {
          line-height: 1.8;
        }
      `}</style>
    </div>
  )
}
