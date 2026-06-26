'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Smartphone, CheckCircle, XCircle, Settings } from 'lucide-react';
import { usePWANotifications } from '@/hooks/usePWANotifications';
import { useTheme } from '@/context/ThemeContext';

interface PWANotificationSettingsProps {
  className?: string;
}

const PWANotificationSettings: React.FC<PWANotificationSettingsProps> = ({ className = '' }) => {
  const { currentTheme } = useTheme();
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    subscribeToPush,
    showNotification,
    unsubscribe
  } = usePWANotifications();

  const [showSettings, setShowSettings] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // Verificar si está instalado como PWA
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  
  useEffect(() => {
    // Detectar si la app está instalada como PWA
    const checkPWAInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafariStandalone = isIOS && (window.navigator as any).standalone;
      
      setIsPWAInstalled(isStandalone || isSafariStandalone);
    };

    checkPWAInstalled();
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Error habilitando notificaciones:', error);
    }
  };

  const handleTestNotification = async () => {
    const success = await showNotification({
      title: '🔔 Notificación de Prueba',
      body: 'Las notificaciones están funcionando correctamente. Recibirás recordatorios 15 minutos antes de tus consultas.',
      requireInteraction: true,
      actions: [
        { action: 'ok', title: 'Entendido' }
      ]
    });
    
    if (success) {
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    }
  };

  const getNotificationStatus = () => {
    if (!isSupported) return { status: 'not-supported', color: 'text-gray-500', bg: 'bg-gray-100' };
    if (permission === 'denied') return { status: 'denied', color: 'text-red-600', bg: 'bg-red-50' };
    if (permission === 'granted' && subscription) return { status: 'active', color: 'text-green-600', bg: 'bg-green-50' };
    return { status: 'available', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  };

  const statusInfo = getNotificationStatus();

  if (!isSupported) {
    return (
      <div 
        className={`p-4 rounded-lg border ${className}`}
        style={{ 
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: `${currentTheme.colors.accent}20`
        }}
      >
        <div className="flex items-center space-x-3">
          <Bell className="h-5 w-5" style={{ color: currentTheme.colors.textSecondary }} />
          <div>
            <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
              Notificaciones no disponibles
            </p>
            <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
              Tu navegador no soporta notificaciones push
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Estado actual */}
      <div 
        className="p-4 rounded-lg border"
        style={{ 
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: `${currentTheme.colors.accent}20`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {permission === 'granted' && subscription ? (
              <BellRing className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
            ) : (
              <Bell className="h-5 w-5" style={{ color: currentTheme.colors.accent }} />
            )}
            <div>
              <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                {permission === 'granted' && subscription ? 'Notificaciones Activas' :
                 permission === 'denied' ? 'Notificaciones Bloqueadas' :
                 'Notificaciones Disponibles'}
              </p>
              <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                {permission === 'granted' && subscription ? 'Recibirás recordatorios de tus consultas' :
                 permission === 'denied' ? 'Las notificaciones están bloqueadas en tu navegador' :
                 'Habilita las notificaciones para recibir recordatorios'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 rounded-full transition-colors hover:opacity-70"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* PWA Installation Status */}
        {isPWAInstalled && (
          <div className="mt-3 flex items-center space-x-2 text-xs text-green-600">
            <Smartphone className="h-4 w-4" />
            <span>App instalada como PWA</span>
          </div>
        )}
      </div>

      {/* Panel de configuración expandible */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div 
              className="p-4 rounded-lg border space-y-4"
              style={{ 
                backgroundColor: currentTheme.colors.cardBg,
                borderColor: `${currentTheme.colors.accent}20`
              }}
            >
              <h4 className="font-medium" style={{ color: currentTheme.colors.text }}>
                Configuración de Notificaciones
              </h4>
              
              {/* Controles basados en el estado */}
              <div className="space-y-3">
                {permission !== 'granted' && (
                  <button
                    onClick={handleEnableNotifications}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    style={{ background: currentTheme.colors.buttonGradient }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Habilitando...</span>
                      </>
                    ) : (
                      <>
                        <BellRing className="h-4 w-4" />
                        <span>Habilitar Notificaciones</span>
                      </>
                    )}
                  </button>
                )}

                {permission === 'granted' && subscription && (
                  <div className="space-y-2">
                    <button
                      onClick={handleTestNotification}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Probar Notificación</span>
                    </button>
                    
                    <button
                      onClick={unsubscribe}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Desactivar Notificaciones</span>
                    </button>
                  </div>
                )}

                {permission === 'denied' && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      Las notificaciones están bloqueadas. Para habilitarlas:
                    </p>
                    <ol className="mt-2 text-xs text-red-700 list-decimal list-inside space-y-1">
                      <li>Haz clic en el ícono de candado en la barra de direcciones</li>
                      <li>Cambia los permisos de notificaciones a "Permitir"</li>
                      <li>Recarga la página</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="pt-3 border-t border-gray-100">
                <h5 className="text-sm font-medium text-gray-700 mb-2">¿Cómo funcionan los recordatorios?</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Recibirás una notificación 15 minutos antes de cada consulta</li>
                  <li>• Las notificaciones funcionan incluso si tienes la app cerrada</li>
                  <li>• Puedes hacer clic en la notificación para abrir directamente tu consulta</li>
                  {isPWAInstalled && <li>• ✅ Optimizado para app instalada</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmación de prueba */}
      <AnimatePresence>
        {testNotificationSent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">Notificación de prueba enviada</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PWANotificationSettings;