import { prisma } from '@/lib/prisma'

// Función auxiliar para verificar si un usuario tiene membresía activa
export async function checkUserMembership(userId: string) {
  try {
    const activeMembership = await prisma.userMembership.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date() // No expirada
        }
      },
      include: {
        membershipPlan: {
          select: {
            id: true,
            name: true,
            durationDays: true
          }
        }
      }
    })

    return {
      hasActiveMembership: !!activeMembership,
      membership: activeMembership ? {
        id: activeMembership.id,
        planId: activeMembership.membershipPlan.id,
        planName: activeMembership.membershipPlan.name,
        startDate: activeMembership.startDate,
        endDate: activeMembership.endDate,
        daysRemaining: activeMembership.endDate 
          ? Math.max(0, Math.ceil((new Date(activeMembership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
          : 0
      } : null
    }
  } catch (error) {
    console.error('Error verificando membresía:', error)
    return {
      hasActiveMembership: false,
      membership: null
    }
  }
}

// Función para verificar acceso a características específicas
export async function checkFeatureAccess(
  feature: string | null, 
  resource: string | null, 
  membership: any,
  userId: string
) {
  // Si no se especifica característica, acceso general premium
  if (!feature) {
    return {
      hasAccess: true,
      accessType: 'general-premium'
    }
  }

  switch (feature.toLowerCase()) {
    case 'consultations':
    case 'video-consultations':
      return await checkConsultationAccess(membership, userId)
    
    case 'premium-content':
    case 'exclusive-content':
      return {
        hasAccess: true,
        accessType: 'premium-content',
        message: 'Acceso completo a contenido premium'
      }
    
    case 'exclusive-store':
    case 'store-discounts':
      return {
        hasAccess: true,
        accessType: 'exclusive-store',
        discountPercentage: calculateStoreDiscount(membership.planName),
        message: 'Acceso a descuentos exclusivos en la tienda'
      }
    
    case 'oracle-readings':
    case 'unlimited-oracle':
      return {
        hasAccess: true,
        accessType: 'oracle-readings',
        isUnlimited: true,
        message: 'Lecturas de oráculo ilimitadas'
      }
    
    case 'priority-support':
      return {
        hasAccess: true,
        accessType: 'priority-support',
        responseTime: '24 horas',
        message: 'Soporte prioritario disponible'
      }
    
    default:
      return {
        hasAccess: true,
        accessType: 'general',
        message: 'Acceso premium general concedido'
      }
  }
}

// Función para verificar acceso a consultas
async function checkConsultationAccess(membership: any, userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Contar consultas del mes actual
  const monthlyConsultations = await prisma.video_consultations.count({
    where: {
      userId: userId,
      createdAt: {
        gte: startOfMonth
      }
    }
  })

  // Determinar límite según el plan
  const monthlyLimit = getConsultationLimit(membership.planName, membership.daysRemaining)
  const isUnlimited = monthlyLimit === -1

  return {
    hasAccess: isUnlimited || monthlyConsultations < monthlyLimit,
    accessType: 'consultations',
    monthlyUsage: monthlyConsultations,
    monthlyLimit: isUnlimited ? 'Unlimited' : monthlyLimit,
    remainingThisMonth: isUnlimited ? 'Unlimited' : Math.max(0, monthlyLimit - monthlyConsultations),
    message: isUnlimited 
      ? 'Consultas ilimitadas disponibles'
      : `${Math.max(0, monthlyLimit - monthlyConsultations)} consultas restantes este mes`
  }
}

// Función para obtener límite de consultas
function getConsultationLimit(planName: string, daysRemaining: number): number {
  // Determinar por nombre del plan o duración
  if (planName.toLowerCase().includes('anual') || daysRemaining > 300) {
    return -1 // Ilimitadas
  } else if (planName.toLowerCase().includes('semestral') || daysRemaining > 150) {
    return 20
  } else if (planName.toLowerCase().includes('trimestral') || daysRemaining > 60) {
    return 15
  } else {
    return 10
  }
}

// Función para calcular descuento en tienda
function calculateStoreDiscount(planName: string): number {
  if (planName.toLowerCase().includes('anual')) {
    return 25 // 25% descuento para planes anuales
  } else if (planName.toLowerCase().includes('semestral')) {
    return 20 // 20% descuento para planes semestrales
  } else if (planName.toLowerCase().includes('trimestral')) {
    return 15 // 15% descuento para planes trimestrales
  } else {
    return 10 // 10% descuento para planes mensuales
  }
}

// Función para obtener planes disponibles
export async function getAvailablePlans() {
  try {
    const plans = await prisma.membershipPlan.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        priceCents: true,
        currency: true,
        durationDays: true
      },
      orderBy: {
        priceCents: 'asc'
      },
      take: 3 // Solo los 3 más económicos para la sugerencia
    })

    return plans.map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      price: (plan.priceCents / 100).toFixed(2),
      currency: plan.currency,
      duration: `${plan.durationDays} días`
    }))
  } catch (error) {
    console.error('Error obteniendo planes:', error)
    return []
  }
}