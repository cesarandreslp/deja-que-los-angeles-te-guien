'use client';

import { useState, useEffect, useCallback } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: any;
}

interface PushSubscriptionInfo {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePWANotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar soporte y permisos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    }
  }, []);

  // Obtener suscripción existente
  useEffect(() => {
    const getExistingSubscription = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const existingSubscription = await registration.pushManager.getSubscription();
          setSubscription(existingSubscription);
        } catch (error) {
          console.error('Error obteniendo suscripción:', error);
        }
      }
    };

    if (isSupported && permission === 'granted') {
      getExistingSubscription();
    }
  }, [isSupported, permission]);

  // Solicitar permisos de notificación
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Las notificaciones no son soportadas en este navegador');
      return false;
    }

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Registrar service worker si no está registrado
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Suscribirse a notificaciones push
  const subscribeToPush = useCallback(async (): Promise<PushSubscriptionInfo | null> => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Clave pública VAPID 
      const vapidPublicKey = 'BOIp1Q3M5cS5prkjbESastnHilFuvPPAmv9w9qcK25IYUoQqI6qIpdErK25HUXKMMp-V_eZlKfJmqJjMI1EA2KY';
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setSubscription(pushSubscription);

      // Convertir la suscripción a formato enviable al servidor
      const subscriptionInfo: PushSubscriptionInfo = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
        }
      };

      // Enviar suscripción al servidor
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionInfo),
      });

      return subscriptionInfo;
    } catch (error) {
      console.error('Error suscribiéndose a push:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  // Mostrar notificación local
  const showNotification = useCallback(async (options: NotificationOptions): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const notificationOptions: any = {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-72x72.png',
        tag: options.tag || 'default',
        requireInteraction: options.requireInteraction || false,
        data: options.data || {},
        vibrate: [200, 100, 200]
      };

      if (options.actions) {
        notificationOptions.actions = options.actions;
      }

      await registration.showNotification(options.title, notificationOptions);

      return true;
    } catch (error) {
      console.error('Error mostrando notificación:', error);
      return false;
    }
  }, [isSupported, permission]);

  // Cancelar suscripción
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      return false;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Notificar al servidor
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      return true;
    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      return false;
    }
  }, [subscription]);

  // Programar recordatorio para consulta
  const scheduleConsultationReminder = useCallback(async (
    consultationId: string,
    scheduledFor: Date,
    consultantName: string,
    reminderMinutes: number = 15
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/schedule-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationId,
          scheduledFor: scheduledFor.toISOString(),
          consultantName,
          reminderMinutes
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error programando recordatorio:', error);
      return false;
    }
  }, []);

  return {
    isSupported,
    permission,
    subscription: !!subscription,
    isLoading,
    requestPermission,
    subscribeToPush,
    showNotification,
    unsubscribe,
    scheduleConsultationReminder
  };
};

// Utilidades para conversión de claves VAPID
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}