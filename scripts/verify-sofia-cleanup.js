const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyCleanup() {
  try {
    console.log('🔍 Verificando limpieza de datos de Sofía Mendoza...')
    
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: {
        email: 'sofia.premium@oraculo.com'
      },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    })

    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }

    console.log('✅ Usuario encontrado:', {
      id: user.id,
      name: user.fullName,
      email: user.email
    })

    // Verificar consultas del mentor
    const mentorConsultations = await prisma.mentorConsultation.count({
      where: { userId: user.id }
    })

    // Verificar lecturas del oráculo
    const oracleReadings = await prisma.reading.count({
      where: { userId: user.id }
    })

    // Verificar mensajes del oráculo
    const oracleMessages = await prisma.message.count({
      where: {
        reading: {
          userId: user.id
        }
      }
    })

    // Verificar conversaciones con arcángeles
    const arcangelConversations = await prisma.arcangelConversation.count({
      where: { userId: user.id }
    })

    console.log('\n📊 RESUMEN DE VERIFICACIÓN:')
    console.log(`🧙‍♂️ Consultas Arcángel Mentor: ${mentorConsultations}`)
    console.log(`🔮 Lecturas del Oráculo: ${oracleReadings}`)
    console.log(`💬 Mensajes del Oráculo: ${oracleMessages}`)
    console.log(`👼 Conversaciones Arcángeles: ${arcangelConversations}`)

    const totalData = mentorConsultations + oracleReadings + oracleMessages + arcangelConversations

    if (totalData === 0) {
      console.log('\n✅ ¡LIMPIEZA COMPLETADA EXITOSAMENTE!')
      console.log('🎉 Sofía Mendoza no tiene datos pendientes')
      console.log('🔹 Puede realizar nuevas consultas y lecturas')
    } else {
      console.log('\n⚠️ ATENCIÓN: Aún quedan datos pendientes')
      console.log('🔹 Revisa si hay otros tipos de datos relacionados')
    }

  } catch (error) {
    console.error('❌ Error verificando limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  verifyCleanup()
}

module.exports = { verifyCleanup }