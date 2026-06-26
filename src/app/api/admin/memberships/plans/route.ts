import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema para validar planes de membresía
const MembershipPlanSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  price: z.number().min(0, 'Precio debe ser positivo'),
  currency: z.string().min(2, 'Moneda requerida (ej. COP, USD)'),
  durationDays: z.number().min(1, 'Duración debe ser mayor a 0'),
  isActive: z.boolean().optional()
})

const UpdateMembershipPlanSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').optional(),
  description: z.string().min(1, 'Descripción requerida').optional(),
  price: z.number().min(0, 'Precio debe ser positivo').optional(),
  currency: z.string().min(2, 'Moneda requerida').optional(),
  durationDays: z.number().min(1, 'Duración debe ser mayor a 0').optional(),
  isActive: z.boolean().optional()
})

// GET /api/admin/memberships/plans - Obtener todos los planes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [plans, totalCount] = await Promise.all([
      prisma.membershipPlan.findMany({
        where,
        include: {
          _count: {
            select: {
              userMemberships: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.membershipPlan.count({ where })
    ])

    // Formatear planes
    const formattedPlans = plans.map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: (plan.priceCents / 100).toFixed(2),
      priceCents: plan.priceCents,
      currency: plan.currency,
      durationDays: plan.durationDays,
      isActive: plan.isActive,
      subscribersCount: plan._count.userMemberships,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    }))

    return NextResponse.json({
      plans: formattedPlans,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error al obtener planes de membresía:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/admin/memberships/plans - Crear nuevo plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = MembershipPlanSchema.parse(body)

    // Convertir precio a centavos
    const priceCents = Math.round(validatedData.price * 100)

    const plan = await prisma.membershipPlan.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        priceCents,
        currency: validatedData.currency.toUpperCase(),
        durationDays: validatedData.durationDays,
        isActive: validatedData.isActive ?? true
      }
    })

    // Formatear respuesta
    const formattedPlan = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: (plan.priceCents / 100).toFixed(2),
      priceCents: plan.priceCents,
      currency: plan.currency,
      durationDays: plan.durationDays,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    }

    return NextResponse.json({
      message: 'Plan de membresía creado exitosamente',
      plan: formattedPlan
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear plan de membresía:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}