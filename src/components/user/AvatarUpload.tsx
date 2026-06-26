'use client'

import { useState, useRef } from 'react'
import { CameraIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onUpload: (file: File) => Promise<void>
  onRemove?: () => Promise<void>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  userName: string
}

export default function AvatarUpload({ 
  currentAvatar, 
  onUpload, 
  onRemove,
  size = 'lg',
  userName 
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  }

  const handleFileChange = async (file: File) => {
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }

    // Preview local
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      await onUpload(file)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error al subir la imagen')
      setPreview(currentAvatar || null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleRemove = async () => {
    if (onRemove && confirm('¿Estás seguro de eliminar tu foto de perfil?')) {
      setUploading(true)
      try {
        await onRemove()
        setPreview(null)
      } catch (error) {
        console.error('Error removing avatar:', error)
        alert('Error al eliminar la imagen')
      } finally {
        setUploading(false)
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden group ${
          dragActive ? 'ring-4 ring-purple-500' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {getInitials(userName)}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 p-2 rounded-full hover:scale-110 transform"
          >
            <CameraIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Loading spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
        >
          <CameraIcon className="w-4 h-4" />
          {preview ? 'Cambiar' : 'Subir'} Foto
        </button>

        {preview && onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
          >
            <XMarkIcon className="w-4 h-4" />
            Eliminar
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        className="hidden"
      />

      <p className="mt-2 text-xs text-gray-500 text-center">
        JPG, PNG o GIF (max. 5MB)
      </p>
    </div>
  )
}
