import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { checkUserMembership, checkFeatureAccess, getAvailablePlans } from '@/lib/membership-utils'

// GET /api/memberships/verify-access - Verificar acceso premium
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          hasAccess: false,
          error: 'No autenticado',
          message: 'Debe iniciar sesión para verificar el acceso'
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const feature = searchParams.get('feature') // ej: 'consultations', 'premium-content', 'exclusive-store'
    const resource = searchParams.get('resource') // ID del recurso específico

    // Verificar membresía del usuario
    const membershipCheck = await checkUserMembership(session.user.id)

    if (!membershipCheck.hasActiveMembership) {
      return NextResponse.json({
        hasAccess: false,
        isPremium: false,
        message: 'Se requiere una membresía activa para acceder a este contenido',
        suggestions: [
          'Suscríbete a un plan de membresía',
          'Reactiva tu membresía si tenías una anteriormente'
        ],
        availablePlans: await getAvailablePlans()
      })
    }

    // Verificar acceso específico por característica
    const accessDetails = await checkFeatureAccess(
      feature, 
      resource, 
      membershipCheck.membership!,
      session.user.id
    )

    return NextResponse.json({
      hasAccess: accessDetails.hasAccess,
      isPremium: true,
      membership: membershipCheck.membership,
      feature: feature,
      accessDetails: accessDetails,
      message: accessDetails.hasAccess 
        ? 'Acceso concedido'
        : accessDetails.message || 'Acceso denegado'
    })

  } catch (error) {
    console.error('Error verificando acceso:', error)
    return NextResponse.json(
      { 
        hasAccess: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

