const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteAllSofiaData() {
  try {
    console.log('🔍 Buscando usuario: Sofía Mendoza...')
    
    // Buscar el usuario por email
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

    // 1. ELIMINAR CONSULTAS DEL ARCÁNGEL MENTOR
    console.log('\n🧙‍♂️ Buscando consultas del Arcángel Mentor...')
    
    const mentorConsultations = await prisma.mentorConsultation.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        arcangel: true,
        question: true,
        createdAt: true
      }
    })

    console.log(`📋 Consultas de mentor encontradas: ${mentorConsultations.length}`)
    
    if (mentorConsultations.length > 0) {
      // Mostrar las consultas antes de eliminar
      mentorConsultations.forEach((consultation, index) => {
        console.log(`   ${index + 1}. ID: ${consultation.id}`)
        console.log(`      Arcángel: ${consultation.arcangel}`)
        console.log(`      Pregunta: ${consultation.question.substring(0, 50)}...`)
        console.log(`      Fecha: ${consultation.createdAt.toLocaleString('es-ES')}`)
      })

      // Eliminar consultas del mentor
      const deleteMentorResult = await prisma.mentorConsultation.deleteMany({
        where: {
          userId: user.id
        }
      })

      console.log(`✅ Eliminadas ${deleteMentorResult.count} consultas del Arcángel Mentor`)
    } else {
      console.log('ℹ️ No hay consultas del Arcángel Mentor para eliminar')
    }

    // 2. ELIMINAR LECTURAS DEL ORÁCULO
    console.log('\n🔮 Buscando lecturas del Oráculo...')
    
    const oracleReadings = await prisma.reading.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        type: true,
        question: true,
        selectedIds: true,
        createdAt: true,
        messages: {
          select: {
            id: true,
            role: true,
            content: true
          }
        }
      }
    })

    console.log(`📋 Lecturas del oráculo encontradas: ${oracleReadings.length}`)
    
    if (oracleReadings.length > 0) {
      // Mostrar las lecturas antes de eliminar
      oracleReadings.forEach((reading, index) => {
        console.log(`   ${index + 1}. ID: ${reading.id}`)
        console.log(`      Tipo: ${reading.type} cartas`)
        console.log(`      Pregunta: ${reading.question?.substring(0, 50) || 'Sin pregunta'}...`)
        console.log(`      Cartas seleccionadas: ${reading.selectedIds.length}`)
        console.log(`      Mensajes: ${reading.messages.length}`)
        console.log(`      Fecha: ${reading.createdAt.toLocaleString('es-ES')}`)
      })

      // Primero eliminar los mensajes relacionados
      for (const reading of oracleReadings) {
        if (reading.messages.length > 0) {
          const deleteMessagesResult = await prisma.message.deleteMany({
            where: {
              readingId: reading.id
            }
          })
          console.log(`   💬 Eliminados ${deleteMessagesResult.count} mensajes de la lectura ${reading.id}`)
        }
      }

      // Luego eliminar las lecturas
      const deleteReadingsResult = await prisma.reading.deleteMany({
        where: {
          userId: user.id
        }
      })

      console.log(`✅ Eliminadas ${deleteReadingsResult.count} lecturas del Oráculo`)
    } else {
      console.log('ℹ️ No hay lecturas del Oráculo para eliminar')
    }

    // 3. ELIMINAR CONVERSACIONES CON ARCÁNGELES (si existen)
    console.log('\n👼 Buscando conversaciones con Arcángeles...')
    
    const arcangelConversations = await prisma.arcangelConversation.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        arcangel: true,
        question: true,
        createdAt: true
      }
    })

    console.log(`📋 Conversaciones con arcángeles encontradas: ${arcangelConversations.length}`)
    
    if (arcangelConversations.length > 0) {
      // Mostrar las conversaciones antes de eliminar
      arcangelConversations.forEach((conversation, index) => {
        console.log(`   ${index + 1}. ID: ${conversation.id}`)
        console.log(`      Arcángel: ${conversation.arcangel}`)
        console.log(`      Pregunta: ${conversation.question?.substring(0, 50) || 'Sin pregunta'}...`)
        console.log(`      Fecha: ${conversation.createdAt.toLocaleString('es-ES')}`)
      })

      // Eliminar conversaciones con arcángeles
      const deleteConversationsResult = await prisma.arcangelConversation.deleteMany({
        where: {
          userId: user.id
        }
      })

      console.log(`✅ Eliminadas ${deleteConversationsResult.count} conversaciones con Arcángeles`)
    } else {
      console.log('ℹ️ No hay conversaciones con Arcángeles para eliminar')
    }

    console.log('\n🎉 LIMPIEZA COMPLETADA')
    console.log(`🔹 Usuario: ${user.fullName} (${user.email})`)
    console.log('🔹 Todos los datos del oráculo y arcángel mentor han sido eliminados')
    console.log('🔹 El usuario puede realizar nuevas consultas y lecturas')

  } catch (error) {
    console.error('❌ Error eliminando datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  deleteAllSofiaData()
}

module.exports = { deleteAllSofiaData }