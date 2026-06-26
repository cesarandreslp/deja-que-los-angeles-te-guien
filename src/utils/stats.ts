import { prisma } from '@/lib/prisma'

export interface AdminStats {
  users: {
    total: number
    active: number
    consultors: number
    admins: number
  }
  oracle: {
    totalReadings: number
    readings1Card: number
    readings3Cards: number
    readings9Cards: number
  }
  consultations: {
    total: number
    scheduled: number
    completed: number
    cancelled: number
    rescheduled: number
    noShow: number
  }
  store: {
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    shippedOrders: number
    deliveredOrders: number
  }
  memberships: {
    totalPlans: number
    activePlans: number
    totalSubscribers: number
    activeSubscribers: number
    totalRevenue: number
  }
  commissions: {
    totalPaid: number
    totalPending: number
    consultorsWithCommissions: number
  }
}

export interface ConsultorStats {
  consultations: {
    total: number
    completed: number
    rescheduled: number
    noShow: number
    avgRating: number
  }
  revenue: {
    totalEarned: number
    thisMonth: number
  }
  commissions: {
    total: number
    paid: number
    pending: number
  }
}

export interface UserStats {
  oracle: {
    totalReadings: number
  }
  consultations: {
    total: number
    completed: number
  }
  store: {
    totalOrders: number
    totalSpent: number
  }
  membership: {
    isActive: boolean
    type: string | null
    expiresAt: Date | null
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  // Estadísticas de usuarios
  const [totalUsers, activeUsers, consultors, admins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'CONSULTANT' } }),
    prisma.user.count({ where: { role: 'ADMIN' } })
  ])

  // Estadísticas de consultas
  const [
    totalConsultations,
    scheduledConsultations,
    completedConsultations,
    cancelledConsultations,
    rescheduledConsultations,
    noShowConsultations
  ] = await Promise.all([
    prisma.video_consultations.count(),
    prisma.video_consultations.count({ where: { status: 'SCHEDULED' } }),
    prisma.video_consultations.count({ where: { status: 'COMPLETED' } }),
    prisma.video_consultations.count({ where: { status: 'CANCELLED' } }),
    prisma.video_consultations.count({ where: { status: 'RESCHEDULED' } }),
    prisma.video_consultations.count({ where: { status: 'NO_SHOW' } })
  ])

  // Estadísticas de tienda
  const [
    totalOrders,
    pendingOrders,
    shippedOrders,
    deliveredOrders
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'SHIPPED' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } })
  ])

  // Revenue total
  const revenueResult = await prisma.order.aggregate({
    where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
    _sum: { totalCents: true }
  })

  // Estadísticas de membresías
  const [
    totalPlans,
    activePlans,
    totalSubscribers,
    activeSubscribers
  ] = await Promise.all([
    prisma.membershipPlan.count(),
    prisma.membershipPlan.count({ where: { isActive: true } }),
    prisma.userMembership.count(),
    prisma.userMembership.count({ where: { status: 'ACTIVE' } })
  ])

  // Revenue de membresías
  const membershipRevenueResult = await prisma.userMembership.findMany({
    where: { 
      status: 'ACTIVE',
      paymentStatus: 'SUCCESS'
    },
    include: {
      membershipPlan: {
        select: {
          priceCents: true
        }
      }
    }
  })

  const membershipRevenue = membershipRevenueResult.reduce((total: number, membership: any) => {
    return total + (membership.membershipPlan?.priceCents || 0)
  }, 0)

  // Estadísticas de comisiones
  const [totalPaidCommissions, totalPendingCommissions, consultorsWithCommissions] = await Promise.all([
    prisma.commissions.aggregate({
      where: { status: 'PAID' },
      _sum: { amountCents: true }
    }),
    prisma.commissions.aggregate({
      where: { status: 'PENDING' },
      _sum: { amountCents: true }
    }),
    prisma.commissions.groupBy({
      by: ['consultorId'],
      _count: true
    })
  ])

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      consultors,
      admins
    },
    oracle: {
      totalReadings: 0, // TODO: Implementar cuando exista el módulo de oráculo
      readings1Card: 0,
      readings3Cards: 0,
      readings9Cards: 0
    },
    consultations: {
      total: totalConsultations,
      scheduled: scheduledConsultations,
      completed: completedConsultations,
      cancelled: cancelledConsultations,
      rescheduled: rescheduledConsultations,
      noShow: noShowConsultations
    },
    store: {
      totalOrders,
      totalRevenue: revenueResult._sum.totalCents || 0,
      pendingOrders,
      shippedOrders,
      deliveredOrders
    },
    memberships: {
      totalPlans,
      activePlans,
      totalSubscribers,
      activeSubscribers,
      totalRevenue: membershipRevenue
    },
    commissions: {
      totalPaid: totalPaidCommissions._sum.amountCents || 0,
      totalPending: totalPendingCommissions._sum.amountCents || 0,
      consultorsWithCommissions: consultorsWithCommissions.length
    }
  }
}

export async function getConsultorStats(consultorId: string): Promise<ConsultorStats> {
  // Estadísticas de consultas
  const [
    totalConsultations,
    completedConsultations,
    rescheduledConsultations,
    noShowConsultations
  ] = await Promise.all([
    prisma.video_consultations.count({ where: { consultorId } }),
    prisma.video_consultations.count({ where: { consultorId, status: 'COMPLETED' } }),
    prisma.video_consultations.count({ where: { consultorId, status: 'RESCHEDULED' } }),
    prisma.video_consultations.count({ where: { consultorId, status: 'NO_SHOW' } })
  ])

  // Rating promedio
  const avgRatingResult = await prisma.video_consultations.aggregate({
    where: { consultorId, status: 'COMPLETED', rating: { not: null } },
    _avg: { rating: true }
  })

  // Revenue del consultor
  const revenueResult = await prisma.video_consultations.aggregate({
    where: { consultorId, status: 'COMPLETED' },
    _sum: { price: true }
  })

  // Revenue del mes actual
  const currentMonth = new Date()
  currentMonth.setDate(1)
  const thisMonthResult = await prisma.video_consultations.aggregate({
    where: {
      consultorId,
      status: 'COMPLETED',
      createdAt: { gte: currentMonth }
    },
    _sum: { price: true }
  })

  // Comisiones
  const [totalCommissions, paidCommissions, pendingCommissions] = await Promise.all([
    prisma.commissions.aggregate({
      where: { consultorId },
      _sum: { amountCents: true }
    }),
    prisma.commissions.aggregate({
      where: { consultorId, status: 'PAID' },
      _sum: { amountCents: true }
    }),
    prisma.commissions.aggregate({
      where: { consultorId, status: 'PENDING' },
      _sum: { amountCents: true }
    })
  ])

  return {
    consultations: {
      total: totalConsultations,
      completed: completedConsultations,
      rescheduled: rescheduledConsultations,
      noShow: noShowConsultations,
      avgRating: avgRatingResult._avg.rating || 0
    },
    revenue: {
      totalEarned: revenueResult._sum.price || 0,
      thisMonth: thisMonthResult._sum.price || 0
    },
    commissions: {
      total: totalCommissions._sum.amountCents || 0,
      paid: paidCommissions._sum.amountCents || 0,
      pending: pendingCommissions._sum.amountCents || 0
    }
  }
}

export async function getUserStats(userId: string): Promise<UserStats> {
  // Estadísticas de consultas
  const [totalConsultations, completedConsultations] = await Promise.all([
    prisma.video_consultations.count({ where: { userId } }),
    prisma.video_consultations.count({ where: { userId, status: 'COMPLETED' } })
  ])

  // Estadísticas de tienda
  const [totalOrders] = await Promise.all([
    prisma.order.count({ where: { userId } })
  ])

  const totalSpentResult = await prisma.order.aggregate({
    where: { userId, status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
    _sum: { totalCents: true }
  })

  // Membresía
  const membership = await prisma.membership.findUnique({
    where: { userId }
  })

  return {
    oracle: {
      totalReadings: 0 // TODO: Implementar cuando exista el módulo de oráculo
    },
    consultations: {
      total: totalConsultations,
      completed: completedConsultations
    },
    store: {
      totalOrders,
      totalSpent: totalSpentResult._sum.totalCents || 0
    },
    membership: {
      isActive: membership?.status === 'ACTIVE' || false,
      type: membership?.type || null,
      expiresAt: membership?.endDate || null
    }
  }
}