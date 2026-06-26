-- Migración para agregar tablas de notificaciones PWA
-- Esta migración es aditiva y no destruye datos existentes

-- Crear tabla de suscripciones push
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dhKey" TEXT NOT NULL,
    "authKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- Crear tabla de recordatorios de consultas
CREATE TABLE IF NOT EXISTS "consultation_reminders" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reminderTime" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PUSH_NOTIFICATION',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_reminders_pkey" PRIMARY KEY ("id")
);

-- Los tipos enum se crearán automáticamente al ejecutar prisma generate

-- Crear índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_userId_endpoint_key" 
ON "push_subscriptions"("userId", "endpoint");

-- Crear claves foráneas
ALTER TABLE "push_subscriptions" 
ADD CONSTRAINT "push_subscriptions_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "consultation_reminders" 
ADD CONSTRAINT "consultation_reminders_consultationId_fkey" 
FOREIGN KEY ("consultationId") REFERENCES "video_consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "consultation_reminders" 
ADD CONSTRAINT "consultation_reminders_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS "consultation_reminders_reminderTime_idx" 
ON "consultation_reminders"("reminderTime");

CREATE INDEX IF NOT EXISTS "consultation_reminders_status_idx" 
ON "consultation_reminders"("status");

CREATE INDEX IF NOT EXISTS "consultation_reminders_userId_idx" 
ON "consultation_reminders"("userId");

CREATE INDEX IF NOT EXISTS "push_subscriptions_userId_idx" 
ON "push_subscriptions"("userId");