'use client'

import { useState } from 'react'
import { 
  BellIcon, 
  XMarkIcon,
  CheckIcon,
  CalendarIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Notification {
  id: string
  type: 'consultation' | 'membership' | 'store' | 'system'
  title: string
  message: string
  time: string
  read: boolean
  actionUrl?: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <CalendarIcon className="w-5 h-5" />
      case 'membership':
        return <SparklesIcon className="w-5 h-5" />
      case 'store':
        return <ShoppingBagIcon className="w-5 h-5" />
      case 'system':
        return <ExclamationTriangleIcon className="w-5 h-5" />
      default:
        return <BellIcon className="w-5 h-5" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'from-blue-500 to-cyan-500'
      case 'membership':
        return 'from-purple-500 to-pink-500'
      case 'store':
        return 'from-green-500 to-emerald-500'
      case 'system':
        return 'from-orange-500 to-red-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Notificaciones
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <BellIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No tienes notificaciones
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getColor(notification.type)} flex items-center justify-center text-white`}>
                          {getIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                {notification.time}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onMarkAsRead(notification.id)
                                  }}
                                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                  title="Marcar como leída"
                                >
                                  <CheckIcon className="w-4 h-4 text-green-600" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(notification.id)
                                }}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Eliminar"
                              >
                                <XMarkIcon className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>

                          {/* Action button */}
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="inline-block mt-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              Ver detalles →
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <a
                  href="/user/notifications"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Ver todas las notificaciones
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
