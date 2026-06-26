import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug User Info - Starting...')
    
    // Get session
    const session = await getServerSession(authOptions)
    console.log('🔍 Session data:', {
      hasSession: !!session,
      sessionUser: session?.user,
      sessionEmail: session?.user?.email
    })

    if (!session?.user?.email) {
      console.log('❌ No session or email found')
      return NextResponse.json({ 
        error: 'No authenticated session',
        session: session,
        hasSession: !!session,
        hasUser: !!session?.user,
        hasEmail: !!session?.user?.email
      }, { status: 401 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        dateOfBirth: true,
        mentorArcangel: true,
        createdAt: true
      }
    })

    console.log('🔍 User found in database:', {
      found: !!user,
      userId: user?.id,
      email: user?.email,
      fullName: user?.fullName,
      dateOfBirth: user?.dateOfBirth,
      mentorArcangel: user?.mentorArcangel
    })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ 
        error: 'User not found in database',
        sessionEmail: session.user.email
      }, { status: 404 })
    }

    // Get all consultations for this user
    const consultations = await prisma.mentor_consultations.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        question: true,
        answer: true,
        createdAt: true
      }
    })

    console.log('🔍 User consultations:', {
      totalConsultations: consultations.length,
      consultations: consultations.map((c: any) => ({
        id: c.id,
        createdAt: c.createdAt,
        question: c.question.substring(0, 50) + '...'
      }))
    })

    // Calculate today's consultation
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
    
    const todayConsultation = consultations.find((c: any) => 
      c.createdAt >= startOfToday && c.createdAt < endOfToday
    )

    console.log('🔍 Today consultation check:', {
      today: today.toISOString(),
      startOfToday: startOfToday.toISOString(),
      endOfToday: endOfToday.toISOString(),
      todayConsultationFound: !!todayConsultation,
      todayConsultationId: todayConsultation?.id
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth,
        mentorArcangel: user.mentorArcangel
      },
      consultations: {
        total: consultations.length,
        hasToday: !!todayConsultation,
        todayConsultation: todayConsultation ? {
          id: todayConsultation.id,
          createdAt: todayConsultation.createdAt,
          question: todayConsultation.question
        } : null
      },
      session: {
        email: session.user.email,
        name: session.user.name
      }
    })

  } catch (error) {
    console.error('❌ Debug user error:', error)
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}