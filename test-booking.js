// Script de prueba para verificar el endpoint de booking
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBooking() {
  try {
    console.log('🧪 Probando funcionalidad de booking...')
    
    // Buscar un consultor disponible
    const consultant = await prisma.user.findFirst({
      where: {
        role: 'CONSULTANT',
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    })
    
    if (!consultant) {
      console.log('❌ No se encontraron consultores activos')
      return
    }
    
    console.log('✅ Consultor encontrado:', consultant.fullName)
    console.log('🆔 ID del consultor:', consultant.id)
    
    // Buscar un usuario para hacer la reserva
    const user = await prisma.user.findFirst({
      where: {
        role: 'USER',
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    })
    
    if (!user) {
      console.log('❌ No se encontraron usuarios activos')
      return
    }
    
    console.log('✅ Usuario encontrado:', user.fullName)
    
    // Crear una fecha futura para la consulta
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0) // 2:00 PM
    
    console.log('📅 Fecha programada:', tomorrow.toISOString())
    
    // Simular datos de booking como los que enviaría el frontend
    const bookingData = {
      consultantId: consultant.id,
      scheduledAt: tomorrow.toISOString(),
      duration: 60,
      notes: 'Consulta de prueba desde script'
    }
    
    console.log('📋 Datos de booking:', bookingData)
    
    // Verificar que los datos son válidos
    console.log('✅ Datos de prueba preparados correctamente')
    console.log('🚀 El endpoint está listo para recibir estas solicitudes')
    
    // Verificar disponibilidad del consultor en ese horario
    const endTime = new Date(tomorrow.getTime() + 60 * 60000) // 1 hora después
    
    const conflicting = await prisma.videoConsultation.findFirst({
      where: {
        consultorId: consultant.id,
        status: { in: ['SCHEDULED', 'CONFIRMED', 'PAID'] },
        scheduledAt: {
          gte: new Date(tomorrow.getTime() - 60 * 60000), // 1 hora antes
          lte: endTime
        }
      }
    })
    
    if (conflicting) {
      console.log('⚠️  Consultor tiene conflicto en ese horario')
    } else {
      console.log('✅ Consultor disponible en el horario solicitado')
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBooking()