'use client'

import { useState } from 'react'
import { useUploadThing } from '@/lib/uploadthing'
import { Button } from '@/components/ui/Button'
import { ImageIcon, Upload, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  endpoint: 'blogImageUploader' | 'coverImageUploader'
  label?: string
  description?: string
  aspectRatio?: 'square' | 'video' | 'wide'
}

export default function ImageUpload({
  value,
  onChange,
  endpoint,
  label = 'Imagen',
  description = 'Sube una imagen',
  aspectRatio = 'video'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { startUpload } = useUploadThing(endpoint)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      const uploadedFiles = await startUpload(Array.from(files))
      
      if (uploadedFiles && uploadedFiles[0]) {
        onChange(uploadedFiles[0].url)
      }
    } catch (error) {
      console.error('Error al subir imagen:', error)
      alert('Error al subir la imagen. Por favor intenta nuevamente.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]'
  }[aspectRatio]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          {label}
        </label>
        <p className="text-xs text-gray-500 mb-3">{description}</p>
      </div>

      {value ? (
        <div className="relative group">
          <div className={`relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${aspectRatioClass}`}>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <label
          className={`relative flex flex-col items-center justify-center ${aspectRatioClass} border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors ${
            uploading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="sr-only"
          />
          <div className="flex flex-col items-center justify-center py-8 px-4">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Subiendo imagen...
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Upload className="w-4 h-4" />
                  <span>Haz clic para subir una imagen</span>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF hasta 4MB
                </p>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  )
}
