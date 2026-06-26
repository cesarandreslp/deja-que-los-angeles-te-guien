import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/memberships/plans/[id] - Obtener detalles públicos de un plan específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await prisma.membershipPlan.findUnique({
      where: { 
        id: params.id,
        isActive: true // Solo mostrar planes activos públicamente
      },
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
        currency: true,
        durationDays: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            userMemberships: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado o no disponible' },
        { status: 404 }
      )
    }

    // Formatear plan con información adicional
    const formattedPlan = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: (plan.priceCents / 100).toFixed(2),
      currency: plan.currency,
      durationDays: plan.durationDays,
      subscribersCount: plan._count.userMemberships,
      // Información calculada
      pricePerDay: ((plan.priceCents / 100) / plan.durationDays).toFixed(2),
      durationText: getDurationText(plan.durationDays),
      isPopular: plan._count.userMemberships > 10,
      // Información de disponibilidad
      isAvailable: plan.isActive,
      createdAt: plan.createdAt.toISOString(),
      // Beneficios estimados (esto se puede personalizar según el negocio)
      benefits: generatePlanBenefits(plan.name, plan.durationDays),
      // Información de precio por diferentes períodos
      pricing: {
        total: (plan.priceCents / 100).toFixed(2),
        monthly: plan.durationDays >= 30 ? ((plan.priceCents / 100) / (plan.durationDays / 30)).toFixed(2) : null,
        daily: ((plan.priceCents / 100) / plan.durationDays).toFixed(2)
      }
    }

    return NextResponse.json({
      plan: formattedPlan,
      meta: {
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error al obtener plan:', error)
    return NextResponse.json(
      { error: 'Error al cargar el plan' },
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

// Función para generar beneficios basados en el plan
function generatePlanBenefits(planName: string, durationDays: number): string[] {
  const baseBenefits = [
    'Acceso completo a todas las consultas angelicales',
    'Lecturas de oráculo ilimitadas',
    'Acceso prioritario a consultores especializados',
    'Descuentos exclusivos en la tienda angelical'
  ]

  const premiumBenefits = [
    'Consultas personalizadas por video',
    'Reportes angelicales detallados en PDF',
    'Acceso a webinars exclusivos',
    'Soporte prioritario 24/7'
  ]

  // Agregar beneficios según la duración
  if (durationDays >= 90) {
    baseBenefits.push('Seguimiento personalizado de tu crecimiento espiritual')
  }

  if (durationDays >= 180) {
    baseBenefits.push('Acceso a la comunidad VIP de miembros')
    baseBenefits.push('Consultas grupales mensuales')
  }

  if (durationDays >= 365) {
    baseBenefits.push(...premiumBenefits)
    baseBenefits.push('Certificado de crecimiento espiritual anual')
  }

  return baseBenefits
}