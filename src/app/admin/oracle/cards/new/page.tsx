'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

const ARCHANGELS = [
  'Miguel', 'Gabriel', 'Rafael', 'Uriel', 'Chamuel', 'Jofiel', 'Zadkiel',
  'Raguel', 'Metatrón', 'Sandalfón', 'Azrael', 'Haniel', 'Raziel',
  'Cassiel', 'Jeremiel', 'Ariel'
]

export default function NewOracleCard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState('/oraculo/arcangeles_cartas/dorso.png')
  
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

  // Verificar autenticación
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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

    // Auto-generar código basado en arcángel y nombre
    if (name === 'arcangel' || name === 'name') {
      const arcangel = name === 'arcangel' ? value : formData.arcangel
      const cardName = name === 'name' ? value : formData.name
      
      if (arcangel && cardName) {
        const code = `${arcangel.toLowerCase()}_${cardName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`
        setFormData(prev => ({ ...prev, code }))
      }
    }

    // Actualizar preview de imagen
    if (name === 'imageUrl' && value) {
      setPreviewImage(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/oracle/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          title: formData.title || formData.name,
          definition: formData.definition || formData.description,
          meaning: formData.meaning || formData.description,
          imageUrl: formData.imageUrl || '/oraculo/arcangeles_cartas/dorso.png'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la carta')
      }

      const data = await response.json()
      
      // Redirigir a la página de edición de la carta recién creada
      router.push(`/admin/oracle/cards/${data.card.id}`)
    } catch (error) {
      console.error('Error creando carta:', error)
      alert(error instanceof Error ? error.message : 'Error al crear la carta')
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
                ➕ Nueva Carta del Oráculo
              </h1>
              <p className="text-purple-200">Crea una nueva carta angelical</p>
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
                      Código (Auto-generado)
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="Se genera automáticamente"
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
              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin/oracle"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      ✨ Crear Carta
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}