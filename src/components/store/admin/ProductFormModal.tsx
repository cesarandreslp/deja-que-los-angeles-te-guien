// Modal para crear/editar productos - FASE 3 - CORREGIDO
'use client'

import { useState, useEffect } from 'react'
import { Product, ProductCategory, categoryLabels } from '@/types/store'
import { useTheme } from '@/context/ThemeContext'
import {
  XMarkIcon,
  PhotoIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  TagIcon,
  Squares2X2Icon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import ImageUploader from './ImageUploader'

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  onSave: (product: Partial<Product>) => void
  categories?: ProductCategory[]
}

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSave,
  categories
}: ProductFormModalProps) {
  const { currentTheme } = useTheme()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [] as string[],
    isActive: true,
    featured: false,
    tags: '',
    weight: '',
    dimensions: '',
    sku: '',
    spiritual_properties: '',
    origin: '',
    care_instructions: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: (product.priceCents / 100).toString() || '',
        category: product.category || '',
        stock: product.stock?.toString() || '',
        images: product.imageUrls || [],
        isActive: product.isActive || true,
        featured: false, // Not available in Product type
        tags: product.tags?.join(', ') || '',
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions ? `${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}` : '',
        sku: product.handle || '', // Using handle as sku equivalent
        spiritual_properties: product.metaDescription || '', // Using metaDescription
        origin: product.vendor || '', // Using vendor as origin
        care_instructions: product.productType || '' // Using productType
      })
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        images: [],
        isActive: true,
        featured: false,
        tags: '',
        weight: '',
        dimensions: '',
        sku: `SKU-${Date.now()}`,
        spiritual_properties: '',
        origin: '',
        care_instructions: ''
      })
    }
    setErrors({})
  }, [product, isOpen])
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida'
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0'
    }
    if (!formData.category) newErrors.category = 'La categoría es requerida'
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'El stock no puede ser negativo'
    }
    if (formData.images.length === 0) {
      newErrors.images = 'El producto debe tener al menos una imagen'
    } else if (formData.images.some(img => !img.trim())) {
      newErrors.images = 'Todas las imágenes deben ser válidas'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price), // Enviar precio en pesos, no centavos
        category: formData.category as ProductCategory,
        stock: parseInt(formData.stock),
        imageUrls: formData.images.filter(img => img.trim()),
        isActive: formData.isActive,
        currency: 'COP'
      }
      
      if (product) {
        productData.id = product.id
      }
      
      await onSave(productData)
      onClose()
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }
  

  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: currentTheme.colors.cardBg }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: currentTheme.colors.borderColor }}
        >
          <div className="flex items-center">
            <SparklesIcon 
              className="h-6 w-6 mr-3" 
              style={{ color: currentTheme.colors.accent }}
            />
            <h2 
              className="text-xl font-bold"
              style={{ color: currentTheme.colors.text }}
            >
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon 
              className="h-5 w-5" 
              style={{ color: currentTheme.colors.textSecondary }}
            />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 
                className="text-lg font-semibold flex items-center"
                style={{ color: currentTheme.colors.text }}
              >
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                Información Básica
              </h3>
              
              {/* Name */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.name ? 'border-red-500' : ''}`}
                  style={{
                    borderColor: errors.name ? '#ef4444' : currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                  placeholder="Ej: Cristal de Cuarzo Rosa"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              {/* SKU */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  style={{
                    borderColor: currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                  placeholder="Código único del producto"
                />
              </div>
              
              {/* Description */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.description ? 'border-red-500' : ''}`}
                  style={{
                    borderColor: errors.description ? '#ef4444' : currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                  placeholder="Describe las propiedades y beneficios del producto..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
              
              {/* Spiritual Properties */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Propiedades Espirituales
                </label>
                <textarea
                  value={formData.spiritual_properties}
                  onChange={(e) => setFormData(prev => ({ ...prev, spiritual_properties: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  style={{
                    borderColor: currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                  placeholder="Chakras, energías, beneficios espirituales..."
                />
              </div>
            </div>
            
            {/* Price & Inventory */}
            <div className="space-y-4">
              <h3 
                className="text-lg font-semibold flex items-center"
                style={{ color: currentTheme.colors.text }}
              >
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Precio e Inventario
              </h3>
              
              {/* Price */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Precio *
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.price ? 'border-red-500' : ''}`}
                    style={{
                      borderColor: errors.price ? '#ef4444' : currentTheme.colors.borderColor,
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text
                    }}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              
              {/* Stock */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Stock Disponible *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.stock ? 'border-red-500' : ''}`}
                  style={{
                    borderColor: errors.stock ? '#ef4444' : currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                  placeholder="Cantidad en inventario"
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>
              
              {/* Category */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Categoría *
                </label>
                <div className="relative">
                  <Squares2X2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.category ? 'border-red-500' : ''}`}
                    style={{
                      borderColor: errors.category ? '#ef4444' : currentTheme.colors.borderColor,
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text
                    }}
                  >
                    <option value="">Seleccionar categoría</option>
                    {Object.values(ProductCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              
              {/* Weight & Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Peso (gr)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    style={{
                      borderColor: currentTheme.colors.borderColor,
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text
                    }}
                    placeholder="0.0"
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Dimensiones
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    style={{
                      borderColor: currentTheme.colors.borderColor,
                      backgroundColor: currentTheme.colors.background,
                      color: currentTheme.colors.text
                    }}
                    placeholder="10x5x3 cm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Images */}
          <div>
            <ImageUploader
              images={formData.images}
              onChange={(images) => setFormData(prev => ({ ...prev, images }))}
              maxImages={5}
            />
            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
          </div>
          
          {/* Additional Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Tags (separados por comas)
              </label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  style={{
                    borderColor: currentTheme.colors.borderColor,
                    backgroundColor: currentTheme.colors.background,
                    color: currentTheme.colors.text
                  }}
                  placeholder="energía, chakra, amor, protección"
                />
              </div>
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Origen
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                style={{
                  borderColor: currentTheme.colors.borderColor,
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.text
                }}
                placeholder="Brasil, India, México..."
              />
            </div>
          </div>
          
          {/* Care Instructions */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: currentTheme.colors.text }}
            >
              Instrucciones de Cuidado
            </label>
            <textarea
              value={formData.care_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, care_instructions: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              style={{
                borderColor: currentTheme.colors.borderColor,
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text
              }}
              placeholder="Cómo limpiar, cargar o mantener el producto..."
            />
          </div>
          
          {/* Status Toggles */}
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <span 
                className="text-sm"
                style={{ color: currentTheme.colors.text }}
              >
                Producto activo
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="mr-2 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <span 
                className="text-sm"
                style={{ color: currentTheme.colors.text }}
              >
                Producto destacado
              </span>
            </label>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              style={{ 
                borderColor: currentTheme.colors.borderColor,
                color: currentTheme.colors.textSecondary
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: currentTheme.colors.accent }}
            >
              {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear Producto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}