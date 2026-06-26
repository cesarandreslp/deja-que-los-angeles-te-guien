'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import RichTextEditor from '@/components/blog/RichTextEditor'
import ImageUpload from '@/components/blog/ImageUpload'
import '@/components/blog/editor-styles.css'
import { 
  ArrowLeftIcon, 
  SaveIcon, 
  Send,
  EyeIcon,
  ImageIcon,
  TagIcon,
  CalendarIcon
} from 'lucide-react'

interface BlogCategory {
  id: string
  name: string
  slug: string
}

interface BlogPost {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  categoryId: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  tags: string[]
  publishedAt?: string
}

export default function BlogPostEditor() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const postId = params?.id as string
  const isEditing = postId && postId !== 'new'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    categoryId: '',
    status: 'DRAFT',
    tags: []
  })
  const [newTag, setNewTag] = useState('')

  // Verificar autenticación
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CONSULTANT')) {
      router.push('/login')
      return
    }
    
    loadData()
  }, [session, status, postId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar categorías
      const categoriesRes = await fetch('/api/admin/blog/categories')
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }
      
      // Si estamos editando, cargar el post
      if (isEditing) {
        const postRes = await fetch(`/api/admin/blog/posts/${postId}`)
        if (postRes.ok) {
          const postData = await postRes.json()
          setPost(postData.post)
        } else {
          router.push('/admin/blog')
        }
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setPost(prev => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !post.tags.includes(newTag.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSave = async (newStatus?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    if (!post.title.trim() || !post.content.trim() || !post.categoryId) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setSaving(true)
      
      const postData = {
        ...post,
        status: newStatus || post.status,
        publishedAt: newStatus === 'PUBLISHED' ? new Date().toISOString() : post.publishedAt
      }

      const url = isEditing 
        ? `/api/admin/blog/posts/${postId}` 
        : '/api/admin/blog/posts'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        if (newStatus === 'PUBLISHED') {
          alert('Publicación publicada exitosamente!')
        } else {
          alert('Publicación guardada exitosamente!')
        }
        router.push('/admin/blog')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar la publicación')
      }
      
    } catch (error) {
      console.error('Error guardando post:', error)
      alert('Error al guardar la publicación')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/blog">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver al Blog
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar Publicación' : 'Nueva Publicación'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modifica tu publicación' : 'Crea una nueva publicación para el blog'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSave('DRAFT')}
            disabled={saving}
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button 
            onClick={() => handleSave('PUBLISHED')}
            disabled={saving}
          >
            <Send className="w-4 h-4 mr-2" />
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título *
                </label>
                <Input
                  value={post.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Escribe el título de tu publicación..."
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug (URL)
                </label>
                <Input
                  value={post.slug}
                  onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-de-la-publicacion"
                />
                <p className="text-xs text-gray-500 mt-1">
                  La URL será: /blog/{post.slug}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Extracto
                </label>
                <Textarea
                  value={post.excerpt}
                  onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Breve descripción de la publicación..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Imagen de portada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Imagen de Portada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={post.coverImage || ''}
                onChange={(url) => setPost(prev => ({ ...prev, coverImage: url }))}
                endpoint="coverImageUploader"
                label="Imagen de Portada"
                description="Sube una imagen para la portada del artículo (máx. 8MB)"
                aspectRatio="video"
              />
              
              {/* Opción alternativa: URL manual */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium mb-2">
                  O ingresa una URL de imagen
                </label>
                <Input
                  value={post.coverImage || ''}
                  onChange={(e) => setPost(prev => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contenido */}
          <Card>
            <CardHeader>
              <CardTitle>Contenido *</CardTitle>
              <CardDescription>
                Usa el editor rico para dar formato a tu publicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={post.content}
                onChange={(html) => setPost(prev => ({ ...prev, content: html }))}
                placeholder="Escribe el contenido de tu publicación aquí... Usa la barra de herramientas para dar formato."
              />
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Publicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <Select
                  value={post.status}
                  onValueChange={(value: string) =>
                    setPost(prev => ({ ...prev, status: value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Borrador</SelectItem>
                    <SelectItem value="PUBLISHED">Publicado</SelectItem>
                    <SelectItem value="ARCHIVED">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {post.publishedAt && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                    Fecha de Publicación
                  </label>
                  <p className="text-sm text-gray-600">
                    {new Date(post.publishedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categoría */}
          <Card>
            <CardHeader>
              <CardTitle>Categoría *</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={post.categoryId}
                onValueChange={(value) => setPost(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue>Selecciona una categoría</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {categories.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  <Link href="/admin/blog/categories/new" className="text-blue-600 hover:underline">
                    Crear primera categoría
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TagIcon className="w-5 h-5" />
                Etiquetas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nueva etiqueta"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} size="sm">
                  Agregar
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vista previa */}
          {post.slug && (
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Ver en el sitio
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}