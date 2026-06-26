import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface SubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const subscriptionData: SubscriptionData = await request.json();

    // Validar datos de suscripción
    if (!subscriptionData.endpoint || !subscriptionData.keys?.p256dh || !subscriptionData.keys?.auth) {
      return NextResponse.json(
        { error: 'Datos de suscripción inválidos' },
        { status: 400 }
      );
    }

    // Guardar o actualizar suscripción en la base de datos
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: subscriptionData.endpoint
        }
      },
      update: {
        p256dhKey: subscriptionData.keys.p256dh,
        authKey: subscriptionData.keys.auth,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        endpoint: subscriptionData.endpoint,
        p256dhKey: subscriptionData.keys.p256dh,
        authKey: subscriptionData.keys.auth
      }
    });

    return NextResponse.json({ 
      success: true, 
      subscriptionId: subscription.id 
    });

  } catch (error) {
    console.error('Error guardando suscripción push:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}