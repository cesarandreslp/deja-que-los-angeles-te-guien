'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const ARCHANGELS = [
  'Miguel', 'Gabriel', 'Rafael', 'Uriel', 'Chamuel', 'Jofiel', 'Zadkiel',
  'Raguel', 'Metatrón', 'Sandalfón', 'Azrael', 'Haniel', 'Raziel',
  'Cassiel', 'Jeremiel', 'Ariel'
]

interface Card {
  id: string
  code: string
  name: string
  title: string | null
  description: string
  definition: string | null
  imageUrl: string
  arcangel: string
  shortMsg: string | null
  meaning: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function EditOracleCard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const cardId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [fetchingCard, setFetchingCard] = useState(true)
  const [previewImage, setPreviewImage] = useState('/oraculo/arcangeles_cartas/dorso.png')
  const [originalCard, setOriginalCard] = useState<Card | null>(null)
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    title: '',
    description: '',
    definition: '',
    imageUrl: '',
    arcangel: '',
    shortMsg: '',
    meaning: '',
    isActive: true
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Cargar datos de la carta
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin')
      return
    }

    fetchCard()
  }, [session, status, cardId])

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/admin/oracle/cards/${cardId}`)
      
      if (!response.ok) {
        throw new Error('Carta no encontrada')
      }

      const data = await response.json()
      const card = data.card

      setOriginalCard(card)
      setFormData({
        code: card.code || '',
        name: card.name || '',
        title: card.title || '',
        description: card.description || '',
        definition: card.definition || '',
        imageUrl: card.imageUrl || '',
        arcangel: card.arcangel || '',
        shortMsg: card.shortMsg || '',
        meaning: card.meaning || '',
        isActive: card.isActive
      })
      
      setPreviewImage(card.imageUrl || '/oraculo/arcangeles_cartas/dorso.png')
    } catch (error) {
      console.error('Error fetching card:', error)
      alert('Error al cargar la carta')
      router.push('/admin/oracle')
    } finally {
      setFetchingCard(false)
    }
  }

  // Verificar autenticación
  if (status === 'loading' || fetchingCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando carta...</h2>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    router.push('/admin')
    return null
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.code.trim()) newErrors.code = 'El código es requerido'
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida'
    if (!formData.arcangel) newErrors.arcangel = 'Debes seleccionar un arcángel'
    if (!formData.shortMsg.trim()) newErrors.shortMsg = 'El mensaje corto es requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Actualizar preview de imagen
    if (name === 'imageUrl' && value) {
      setPreviewImage(value)
    }
  }

  const hasChanges = () => {
    if (!originalCard) return false
    
    return (
      formData.code !== (originalCard.code || '') ||
      formData.name !== (originalCard.name || '') ||
      formData.title !== (originalCard.title || '') ||
      formData.description !== (originalCard.description || '') ||
      formData.definition !== (originalCard.definition || '') ||
      formData.imageUrl !== (originalCard.imageUrl || '') ||
      formData.arcangel !== (originalCard.arcangel || '') ||
      formData.shortMsg !== (originalCard.shortMsg || '') ||
      formData.meaning !== (originalCard.meaning || '') ||
      formData.isActive !== originalCard.isActive
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!hasChanges()) {
      alert('No hay cambios que guardar')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/oracle/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar la carta')
      }

      alert('Carta actualizada exitosamente')
      router.push('/admin/oracle')
    } catch (error) {
      console.error('Error actualizando carta:', error)
      alert(error instanceof Error ? error.message : 'Error al actualizar la carta')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta carta? Esta acción no se puede deshacer.')) {
      return
    }

    if (!confirm('Esta es tu última oportunidad para cancelar. ¿Realmente quieres eliminar esta carta?')) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/oracle/cards/${cardId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar la carta')
      }

      alert('Carta eliminada exitosamente')
      router.push('/admin/oracle')
    } catch (error) {
      console.error('Error eliminando carta:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar la carta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                ✏️ Editar Carta: {originalCard?.name}
              </h1>
              <p className="text-purple-200">Modifica los datos de la carta angelical</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin/oracle"
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                ← Volver al Oráculo
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info de la carta */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="text-blue-500 text-xl">ℹ️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-blue-800 font-medium">Información de la Carta</h3>
              <div className="text-blue-700 text-sm mt-1">
                <p><strong>ID:</strong> {originalCard?.id}</p>
                <p><strong>Creada:</strong> {originalCard?.createdAt ? new Date(originalCard.createdAt).toLocaleString() : ''}</p>
                <p><strong>Actualizada:</strong> {originalCard?.updatedAt ? new Date(originalCard.updatedAt).toLocaleString() : ''}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Preview de la carta */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>
                <div className="relative h-64 mb-4">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg"
                    onError={() => setPreviewImage('/oraculo/arcangeles_cartas/dorso.png')}
                  />
                </div>
                {formData.name && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">{formData.name}</h4>
                    {formData.arcangel && <p className="text-purple-600 text-sm">📿 {formData.arcangel}</p>}
                    {formData.shortMsg && <p className="text-gray-600 text-sm">{formData.shortMsg}</p>}
                    {formData.code && <p className="text-xs text-gray-400">Código: {formData.code}</p>}
                    <div className="flex items-center mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        formData.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {formData.isActive ? '✅ Activa' : '❌ Inactiva'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información básica */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arcángel <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="arcangel"
                      value={formData.arcangel}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.arcangel ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecciona un arcángel</option>
                      {ARCHANGELS.map(archangel => (
                        <option key={archangel} value={archangel}>{archangel}</option>
                      ))}
                    </select>
                    {errors.arcangel && <p className="text-red-500 text-sm mt-1">{errors.arcangel}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Carta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej: Protección Divina"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="codigo_carta"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.code ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título Alternativo
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Título alternativo (opcional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mensajes</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje Corto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="shortMsg"
                      value={formData.shortMsg}
                      onChange={handleInputChange}
                      placeholder="Mensaje breve que aparece en las cartas"
                      maxLength={100}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.shortMsg ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.shortMsg && <p className="text-red-500 text-sm">{errors.shortMsg}</p>}
                      <p className="text-gray-400 text-sm">{formData.shortMsg.length}/100</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción Completa <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Descripción detallada del mensaje de la carta"
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Definición Alternativa
                    </label>
                    <textarea
                      name="definition"
                      value={formData.definition}
                      onChange={handleInputChange}
                      placeholder="Definición alternativa (opcional)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Significado Legacy
                    </label>
                    <textarea
                      name="meaning"
                      value={formData.meaning}
                      onChange={handleInputChange}
                      placeholder="Significado para compatibilidad (opcional)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Imagen y configuración */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagen y Configuración</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de la Imagen
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="/oraculo/arcangeles_cartas/nombre_carta.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Sube la imagen a /public/oraculo/arcangeles_cartas/ primero
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Carta activa (disponible para lecturas)
                    </label>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  🗑️ Eliminar Carta
                </button>

                <div className="flex space-x-4">
                  <Link
                    href="/admin/oracle"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={loading || !hasChanges()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        💾 Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}