// Modal de confirmación para acciones administrativas - FASE 3
'use client'

import { useTheme } from '@/context/ThemeContext'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  CheckIcon,
  ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline'

interface AdminConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
  itemCount?: number
}

export default function AdminConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  loading = false,
  itemCount
}: AdminConfirmModalProps) {
  const { currentTheme } = useTheme()
  
  if (!isOpen) return null
  
  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: TrashIcon,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          textColor: 'text-red-600'
        }
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          textColor: 'text-yellow-600'
        }
      case 'info':
        return {
          icon: CheckIcon,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          textColor: 'text-blue-600'
        }
      default:
        return {
          icon: ExclamationTriangleIcon,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          textColor: 'text-yellow-600'
        }
    }
  }
  
  const { icon: Icon, iconBg, iconColor, buttonBg, textColor } = getIconAndColors()
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg max-w-md w-full shadow-lg"
        style={{ 
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: currentTheme.colors.borderColor,
          border: `1px solid ${currentTheme.colors.borderColor}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center">
            <div className={`${iconBg} rounded-full p-3 mr-4`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <h2 
              className="text-lg font-semibold"
              style={{ color: currentTheme.colors.text }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <XMarkIcon 
              className="h-5 w-5"
              style={{ color: currentTheme.colors.textSecondary }}
            />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6">
          <div 
            className="mb-6"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {message}
            
            {itemCount && itemCount > 0 && (
              <div 
                className="mt-3 p-3 rounded-lg"
                style={{ backgroundColor: currentTheme.colors.background }}
              >
                <div className="flex items-center">
                  <ArchiveBoxXMarkIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <span 
                    className="font-medium"
                    style={{ color: currentTheme.colors.text }}
                  >
                    {itemCount} elemento{itemCount > 1 ? 's' : ''} seleccionado{itemCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              style={{ 
                borderColor: currentTheme.colors.borderColor,
                color: currentTheme.colors.textSecondary
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 ${buttonBg} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}