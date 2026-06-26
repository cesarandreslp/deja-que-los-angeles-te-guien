/**
 * Configuración de Prisma para scripts
 * 
 * Este archivo proporciona una forma alternativa de importar PrismaClient
 * en caso de problemas con la generación del cliente.
 */

import { prisma } from '../src/lib/prisma'

// Exportar la instancia de prisma para uso en scripts
export { prisma }

// Función helper para scripts
export async function connectPrisma() {
  try {
    await prisma.$connect()
    console.log('✅ Conectado a la base de datos')
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error)
    throw error
  }
}

export async function disconnectPrisma() {
  try {
    await prisma.$disconnect()
    console.log('✅ Desconectado de la base de datos')
  } catch (error) {
    console.error('❌ Error desconectando de la base de datos:', error)
  }
}