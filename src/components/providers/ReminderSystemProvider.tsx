'use client'

import { useReminderSystemInit } from '@/hooks/useReminderSystemInit'

export default function ReminderSystemProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Inicializar sistema de recordatorios de forma lazy
  useReminderSystemInit()

  // Este provider no renderiza nada adicional
  return <>{children}</>
}