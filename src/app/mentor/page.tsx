'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ArcangelMentorSection from '@/components/ArcangelMentorSection'
import { useTheme } from '@/context/ThemeContext'
import GoldenStarsBackground from '@/components/ui/GoldenStarsBackground'

export default function MentorPage() {
  const { data: session, status } = useSession()
  const { currentTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
        <GoldenStarsBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-6" style={{ borderColor: currentTheme.colors.accent }}></div>
          <div className="space-y-2">
            <p className="text-xl font-medium" style={{ color: currentTheme.colors.text }}>
              Conectando con tu Ángel Mentor
            </p>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              Preparando tu experiencia espiritual...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
      <GoldenStarsBackground />
      <div className="relative z-10">
        <ArcangelMentorSection />
      </div>
    </div>
  )
}