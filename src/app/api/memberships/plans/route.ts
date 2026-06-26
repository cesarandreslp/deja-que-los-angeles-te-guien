import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/memberships/plans - Obtener planes públicos disponibles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get('currency') || 'USD'
    const active = searchParams.get('active') !== 'false' // Por defecto solo activos

    // Construir filtros
    const where: any = {}
    if (active) {
      where.isActive = true
    }

    // Obtener planes
    const plans = await prisma.membershipPlan.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
        currency: true,
        durationDays: true,
        isActive: true,
        _count: {
          select: {
            userMemberships: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { priceCents: 'asc' }
      ]
    })

    // Formatear planes para respuesta pública
    const formattedPlans = plans.map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: (plan.priceCents / 100).toFixed(2),
      currency: plan.currency,
      durationDays: plan.durationDays,
      isActive: plan.isActive,
      subscribersCount: plan._count.userMemberships,
      // Campos calculados útiles para el frontend
      pricePerDay: ((plan.priceCents / 100) / plan.durationDays).toFixed(2),
      durationText: getDurationText(plan.durationDays),
      isPopular: plan._count.userMemberships > 10 // Marcar como popular si tiene más de 10 suscriptores
    }))

    return NextResponse.json({
      plans: formattedPlans,
      meta: {
        total: formattedPlans.length,
        currency: currency,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error al obtener planes públicos:', error)
    return NextResponse.json(
      { error: 'Error al cargar los planes' },
      { status: 500 }
    )
  }
}

// Función auxiliar para convertir días en texto legible
function getDurationText(days: number): string {
  if (days === 30) return '1 mes'
  if (days === 90) return '3 meses'
  if (days === 180) return '6 meses'
  if (days === 365) return '1 año'
  if (days < 30) return `${days} días`
  
  const months = Math.floor(days / 30)
  const remainingDays = days % 30
  
  if (remainingDays === 0) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`
  }
  
  return `${months} ${months === 1 ? 'mes' : 'meses'} y ${remainingDays} días`
}