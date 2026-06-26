'use client'

import { useState, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import {
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ 
  images, 
  onChange, 
maxImages = 5 
}: ImageUploaderProps) {
  const { currentTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const remainingSlots = maxImages - images.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) {
      alert(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Error al subir imagen')
        }

        return result.imageUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...images, ...uploadedUrls])

    } catch (error) {
      console.error('Error uploading images:', error)
      alert(error instanceof Error ? error.message : 'Error al subir imágenes')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const addUrlImage = () => {
    const url = prompt('Ingresa la URL de la imagen:')
    if (url && url.trim()) {
      if (images.length >= maxImages) {
        alert(`Máximo ${maxImages} imágenes permitidas`)
        return
      }
      onChange([...images, url.trim()])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 
          className="text-lg font-semibold flex items-center"
          style={{ color: currentTheme?.colors.text }}
        >
          <PhotoIcon className="h-5 w-5 mr-2" />
          Imágenes del Producto ({images.length}/{maxImages})
        </h3>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
            className="text-sm px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: currentTheme?.colors.accent,
              color: 'white'
            }}
          >
            {uploading ? 'Subiendo...' : '📁 Subir Archivo'}
          </button>
          
          <button
            type="button"
            onClick={addUrlImage}
            disabled={images.length >= maxImages}
            className="text-sm px-3 py-1 border rounded-lg transition-colors disabled:opacity-50"
            style={{ 
              borderColor: currentTheme?.colors.borderColor,
              color: currentTheme?.colors.textSecondary
            }}
          >
            🔗 Agregar URL
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-300'
          }`}
          style={{ 
            borderColor: dragOver ? currentTheme?.colors.accent : currentTheme?.colors.borderColor
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CloudArrowUpIcon 
            className="h-12 w-12 mx-auto mb-4" 
            style={{ color: currentTheme?.colors.textSecondary }}
          />
          <p style={{ color: currentTheme?.colors.text }}>
            Arrastra imágenes aquí o{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="underline hover:no-underline"
              style={{ color: currentTheme?.colors.accent }}
            >
              selecciona archivos
            </button>
          </p>
          <p 
            className="text-sm mt-2"
            style={{ color: currentTheme?.colors.textSecondary }}
          >
            PNG, JPG, WebP hasta 5MB
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative group rounded-lg overflow-hidden border"
              style={{ borderColor: currentTheme?.colors.borderColor }}
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                <img
                  src={image}
                  alt={`Producto ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback si la imagen no carga
                    e.currentTarget.src = '/tienda/placeholder-product.jpg'
                  }}
                />
              </div>
              
              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => window.open(image, '_blank')}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    title="Ver imagen completa"
                  >
                    <EyeIcon className="h-4 w-4 text-gray-700" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Eliminar imagen"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Indicador de imagen principal */}
              {index === 0 && (
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                    Principal
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div 
          className="text-center py-8"
          style={{ color: currentTheme?.colors.textSecondary }}
        >
          <PhotoIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
          <p>No hay imágenes agregadas</p>
        </div>
      )}
    </div>
  )
}