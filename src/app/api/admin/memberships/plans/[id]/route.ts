import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const MembershipPlanSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  currency: z.string().min(1, 'La moneda es requerida'),
  durationDays: z.number().positive('La duración debe ser mayor a 0'),
  isActive: z.boolean().optional().default(true)
})

// GET /api/admin/memberships/plans/[id] - Obtener plan específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: params.id },
      include: {
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
        { error: 'Plan no encontrado' },
        { status: 404 }
      )
    }

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
      subscribersCount: plan._count.userMemberships,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString()
    }

    return NextResponse.json({ plan: formattedPlan })

  } catch (error) {
    console.error('Error al obtener plan:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/memberships/plans/[id] - Actualizar plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar si el plan existe
    const existingPlan = await prisma.membershipPlan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            userMemberships: {
              where: {
                status: { in: ['ACTIVE', 'PENDING'] }
              }
            }
          }
        }
      }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      )
    }

    // Validar cambios si hay suscriptores activos
    if (existingPlan._count.userMemberships > 0) {
      // No permitir cambios drásticos en precio o duración si hay suscriptores
      const priceChange = Math.abs(validatedData.price - (existingPlan.priceCents / 100))
      const priceChangePercent = (priceChange / (existingPlan.priceCents / 100)) * 100

      if (priceChangePercent > 50) {
        return NextResponse.json(
          { error: 'No se puede cambiar el precio en más del 50% cuando hay suscriptores activos' },
          { status: 400 }
        )
      }

      if (validatedData.durationDays !== existingPlan.durationDays) {
        return NextResponse.json(
          { error: 'No se puede cambiar la duración cuando hay suscriptores activos' },
          { status: 400 }
        )
      }
    }

    // Actualizar plan
    const updatedPlan = await prisma.membershipPlan.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        priceCents: Math.round(validatedData.price * 100),
        currency: validatedData.currency,
        durationDays: validatedData.durationDays,
        isActive: validatedData.isActive
      },
      include: {
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

    // Formatear respuesta
    const formattedPlan = {
      id: updatedPlan.id,
      name: updatedPlan.name,
      description: updatedPlan.description,
      price: (updatedPlan.priceCents / 100).toFixed(2),
      priceCents: updatedPlan.priceCents,
      currency: updatedPlan.currency,
      durationDays: updatedPlan.durationDays,
      isActive: updatedPlan.isActive,
      subscribersCount: updatedPlan._count.userMemberships,
      createdAt: updatedPlan.createdAt.toISOString(),
      updatedAt: updatedPlan.updatedAt.toISOString()
    }

    return NextResponse.json({ 
      plan: formattedPlan,
      message: 'Plan actualizado exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar plan:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/memberships/plans/[id] - Eliminar plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Verificar si el plan existe y tiene suscriptores
    const existingPlan = await prisma.membershipPlan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            userMemberships: {
              where: {
                status: { in: ['ACTIVE', 'PENDING'] }
              }
            }
          }
        }
      }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar planes con suscriptores activos
    if (existingPlan._count.userMemberships > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar el plan. Tiene ${existingPlan._count.userMemberships} suscriptores activos` },
        { status: 400 }
      )
    }

    // Eliminar plan
    await prisma.membershipPlan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'Plan eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar plan:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}