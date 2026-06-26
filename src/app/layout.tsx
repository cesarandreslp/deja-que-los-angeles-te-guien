import './globals.css'
import '@/styles/theme-globals.css'
import type { Metadata } from 'next'
import React from 'react'
import SessionProvider from '@/components/providers/SessionProvider'
import ClientProviders from '@/components/providers/ClientProviders'
import MainNavbar from '@/components/MainNavbar'
import ThemedFooter from '@/components/ThemedFooter'
import ReminderSystemProvider from '@/components/providers/ReminderSystemProvider'
import { ThemeProvider } from '@/context/ThemeContext'
import { CartProvider } from '@/context/CartContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'
import HydrationGuard from '@/components/HydrationGuard'
import FloatingAngelButton from '@/components/ui/FloatingAngelButton'
// Sistema de recordatorios se inicializa de forma lazy para no afectar performance

export const metadata: Metadata = {
  title: 'Deja que los ángeles te guíen',
  description: 'Plataforma espiritual para consultas angelicales, videollamadas con consultores y guía divina personalizada',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Deja que los ángeles te guíen'
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' }
    ]
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <CartProvider>
            <SessionProvider>
              <HydrationGuard>
                <ClientProviders>
                  <ReminderSystemProvider>
                    <div className="main-container new-theme-enabled">
                      <GoldenStarsBackground />
                      <MainNavbar />
                      <main className="flex-1">
                        {children}
                      </main>
                      <ThemedFooter />
                      <FloatingAngelButton />
                    </div>
                  </ReminderSystemProvider>
                </ClientProviders>
              </HydrationGuard>
            </SessionProvider>
          </CartProvider>
        </ThemeProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              // Solo registrar en producción (detectar por hostname)
              const isProduction = window.location.hostname !== 'localhost';
              
              if (isProduction) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registrado con éxito:', registration.scope);
                    })
                    .catch(function(err) {
                      console.log('SW registro falló:', err);
                    });
                });
              } else {
                // En desarrollo, desregistrar service workers existentes
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let registration of registrations) {
                    registration.unregister();
                    console.log('SW desregistrado para desarrollo');
                  }
                });
              }
            }
          `
        }} />
      </body>
    </html>
  )
}