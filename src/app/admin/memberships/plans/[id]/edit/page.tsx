'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface FormData {
  name: string
  description: string
  price: string
  currency: string
  durationDays: string
  isActive: boolean
}

interface MembershipPlan {
  id: string
  name: string
  description: string
  price: string
  priceCents: number
  currency: string
  durationDays: number
  isActive: boolean
  subscribersCount: number
  createdAt: string
  updatedAt: string
}

const currencies = [
  { value: 'USD', label: 'USD - Dólar Americano' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'MXN', label: 'MXN - Peso Mexicano' },
  { value: 'COP', label: 'COP - Peso Colombiano' },
  { value: 'ARS', label: 'ARS - Peso Argentino' },
  { value: 'CLP', label: 'CLP - Peso Chileno' },
  { value: 'PEN', label: 'PEN - Sol Peruano' }
]

const durationOptions = [
  { value: '30', label: '30 días (1 mes)' },
  { value: '90', label: '90 días (3 meses)' },
  { value: '180', label: '180 días (6 meses)' },
  { value: '365', label: '365 días (1 año)' },
  { value: 'custom', label: 'Personalizado' }
]

export default function EditMembershipPlan() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<MembershipPlan | null>(null)
  const [customDuration, setCustomDuration] = useState('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    durationDays: '30',
    isActive: true
  })

  // Verificar autenticación
  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchPlan()
  }, [session, status, router, planId])

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/admin/memberships/plans/${planId}`)
      if (!response.ok) {
        throw new Error('Plan no encontrado')
      }

      const data = await response.json()
      setPlan(data.plan)

      // Configurar formulario
      const isCustomDuration = !durationOptions.some(opt => opt.value === data.plan.durationDays.toString())
      
      setFormData({
        name: data.plan.name,
        description: data.plan.description,
        price: data.plan.price,
        currency: data.plan.currency,
        durationDays: isCustomDuration ? 'custom' : data.plan.durationDays.toString(),
        isActive: data.plan.isActive
      })

      if (isCustomDuration) {
        setCustomDuration(data.plan.durationDays.toString())
      }

    } catch (error) {
      console.error('Error al cargar plan:', error)
      setError('Error al cargar el plan')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido')
      }
      if (!formData.description.trim()) {
        throw new Error('La descripción es requerida')
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('El precio debe ser mayor a 0')
      }

      const durationDays = formData.durationDays === 'custom' 
        ? parseInt(customDuration) 
        : parseInt(formData.durationDays)

      if (!durationDays || durationDays <= 0) {
        throw new Error('La duración debe ser mayor a 0 días')
      }

      const planData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        currency: formData.currency,
        durationDays: durationDays,
        isActive: formData.isActive
      }

      const response = await fetch(`/api/admin/memberships/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el plan')
      }

      // Redirigir a la lista de planes
      router.push('/admin/memberships')
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Error al actualizar el plan')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/admin/memberships"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver a Membresías
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/memberships"
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Plan de Membresía</h1>
                <p className="text-gray-600">Modifica el plan: {plan?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-red-800">
                  <h3 className="font-medium">Error</h3>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {plan && plan.subscribersCount > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-yellow-800">
                  <h3 className="font-medium">⚠️ Atención</h3>
                  <p className="mt-1 text-sm">
                    Este plan tiene {plan.subscribersCount} suscriptores activos. 
                    Los cambios pueden afectar a los usuarios existentes.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Plan *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ej. Plan Premium"
                  required
                />
              </div>

              <div>
                <label htmlFor="isActive" className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Plan activo</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Los usuarios pueden suscribirse solo a planes activos
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe los beneficios y características de este plan..."
                required
              />
            </div>

            {/* Precio y moneda */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duración */}
            <div>
              <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700 mb-2">
                Duración
              </label>
              <select
                id="durationDays"
                name="durationDays"
                value={formData.durationDays}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {formData.durationDays === 'custom' && (
                <div className="mt-2">
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="Número de días"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
              <h3 className="font-medium text-gray-900 mb-4">Vista Previa del Plan</h3>
              <div className="bg-white rounded-lg shadow-sm p-6 max-w-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {formData.name || 'Nombre del Plan'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.description || 'Descripción del plan...'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      formData.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {formData.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      ${formData.price || '0.00'}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">
                      {formData.currency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Por {formData.durationDays === 'custom' ? customDuration || '0' : formData.durationDays} días
                  </p>
                </div>
              </div>
            </div>

            {/* Información del plan */}
            {plan && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Información del Plan</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Creado:</span>
                    <span className="ml-2 text-blue-900">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Actualizado:</span>
                    <span className="ml-2 text-blue-900">
                      {new Date(plan.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Suscriptores:</span>
                    <span className="ml-2 text-blue-900">{plan.subscribersCount}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">ID del Plan:</span>
                    <span className="ml-2 text-blue-900 font-mono text-xs">{plan.id}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Link
                href="/admin/memberships"
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}