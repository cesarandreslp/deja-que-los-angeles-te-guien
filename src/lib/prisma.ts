import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuración optimizada del cliente Prisma
const prismaClientConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['error' as const, 'warn' as const] : ['error' as const],
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientConfig)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Auto-disconnect para evitar conexiones colgadas
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// Función auxiliar para probar la conexión
export async function testPrismaConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { success: true, message: 'Conexión exitosa' }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message,
      code: error.code 
    }
  }
}

// Sistema de reconexión automática con backoff exponencial
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Calcular delay con backoff exponencial
      const delay = baseDelay * Math.pow(2, attempt - 1)
      
      console.warn(`Base de datos: Intento ${attempt} falló, reintentando en ${delay}ms...`, {
        error: error.message,
        code: error.code
      })
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Wrapper para operaciones críticas de base de datos
export const db = {
  // Envolver operaciones comunes con retry automático
  user: {
    create: (data: any) => executeWithRetry(() => prisma.user.create(data)),
    findUnique: (where: any) => executeWithRetry(() => prisma.user.findUnique(where)),
    update: (params: any) => executeWithRetry(() => prisma.user.update(params)),
    delete: (where: any) => executeWithRetry(() => prisma.user.delete(where)),
  },
  card: {
    findMany: (params?: any) => executeWithRetry(() => prisma.card.findMany(params)),
    findUnique: (where: any) => executeWithRetry(() => prisma.card.findUnique(where)),
  },
  reading: {
    create: (data: any) => executeWithRetry(() => prisma.reading.create(data)),
    findMany: (params?: any) => executeWithRetry(() => prisma.reading.findMany(params)),
    findFirst: (params?: any) => executeWithRetry(() => prisma.reading.findFirst(params)),
  }
}