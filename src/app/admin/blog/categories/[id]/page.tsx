'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeftIcon, SaveIcon, FolderIcon } from 'lucide-react'

interface BlogCategory {
  id?: string
  name: string
  slug: string
  description?: string
}

export default function CategoryEditor() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const categoryId = params?.id as string
  const isEditing = categoryId && categoryId !== 'new'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState<BlogCategory>({
    name: '',
    slug: '',
    description: ''
  })

  // Verificar autenticación
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'CONSULTANT')) {
      router.push('/login')
      return
    }
    
    loadData()
  }, [session, status, categoryId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Si estamos editando, cargar la categoría
      if (isEditing) {
        const categoryRes = await fetch(`/api/admin/blog/categories/${categoryId}`)
        if (categoryRes.ok) {
          const categoryData = await categoryRes.json()
          setCategory(categoryData.category)
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

  const generateSlug = (name: string) => {
    return name
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

  const handleNameChange = (name: string) => {
    setCategory(prev => ({
      ...prev,
      name,
      slug: !isEditing ? generateSlug(name) : prev.slug
    }))
  }

  const handleSave = async () => {
    if (!category.name.trim() || !category.slug.trim()) {
      alert('Por favor completa los campos requeridos')
      return
    }

    try {
      setSaving(true)
      
      const url = isEditing 
        ? `/api/admin/blog/categories/${categoryId}` 
        : '/api/admin/blog/categories'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      })

      if (response.ok) {
        alert('Categoría guardada exitosamente!')
        router.push('/admin/blog')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar la categoría')
      }
      
    } catch (error) {
      console.error('Error guardando categoría:', error)
      alert('Error al guardar la categoría')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderIcon className="w-6 h-6 text-purple-600" />
              {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modifica la categoría' : 'Crea una nueva categoría para organizar las publicaciones'}
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          disabled={saving}
        >
          <SaveIcon className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Categoría</CardTitle>
          <CardDescription>
            Las categorías ayudan a organizar las publicaciones del blog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de la Categoría *
            </label>
            <Input
              value={category.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Sabiduría Angelical, Meditación, Arcángeles..."
              className="text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Slug (URL) *
            </label>
            <Input
              value={category.slug}
              onChange={(e) => setCategory(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="sabiduria-angelical"
            />
            <p className="text-xs text-gray-500 mt-1">
              La URL será: /blog/categoria/{category.slug}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Descripción
            </label>
            <Textarea
              value={category.description || ''}
              onChange={(e) => setCategory(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe brevemente esta categoría y qué tipo de contenido incluirá..."
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta descripción se mostrará en la página de la categoría
            </p>
          </div>

          {/* Vista previa */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Vista Previa:</h4>
            <div className="bg-white p-3 rounded border">
              <h3 className="font-semibold text-lg">
                {category.name || 'Nombre de la categoría'}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {category.description || 'Descripción de la categoría...'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                /blog/categoria/{category.slug || 'slug-categoria'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>💡 Consejos para Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Nombres claros:</strong> Usa nombres descriptivos y fáciles de entender</li>
            <li>• <strong>Slugs únicos:</strong> El slug debe ser único y sin espacios (usa guiones)</li>
            <li>• <strong>Categorías amplias:</strong> Crea categorías que puedan albergar múltiples publicaciones</li>
            <li>• <strong>Consistencia:</strong> Mantén un estilo consistente en los nombres</li>
          </ul>
          
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Sugerencias para el Oráculo:</h4>
            <div className="text-sm text-purple-800 space-y-1">
              <p>• <strong>Arcángeles:</strong> Posts sobre cada arcángel y sus mensajes</p>
              <p>• <strong>Sabiduría Angelical:</strong> Enseñanzas y reflexiones espirituales</p>
              <p>• <strong>Meditación:</strong> Guías y técnicas de meditación angelical</p>
              <p>• <strong>Cristales y Energía:</strong> Uso de cristales en la práctica espiritual</p>
              <p>• <strong>Signos y Sincronicidades:</strong> Interpretación de señales divinas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}