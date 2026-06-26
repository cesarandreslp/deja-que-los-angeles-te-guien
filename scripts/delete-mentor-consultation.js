const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteUserMentorConsultations() {
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

    // Buscar consultas del mentor
    const consultations = await prisma.mentorConsultation.findMany({
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

    console.log(`\n📋 Consultas encontradas: ${consultations.length}`)
    
    if (consultations.length === 0) {
      console.log('ℹ️ No hay consultas de mentor para eliminar')
      return
    }

    // Mostrar las consultas antes de eliminar
    consultations.forEach((consultation, index) => {
      console.log(`\n${index + 1}. Consulta ID: ${consultation.id}`)
      console.log(`   Arcángel: ${consultation.arcangel}`)
      console.log(`   Pregunta: ${consultation.question.substring(0, 50)}...`)
      console.log(`   Fecha: ${consultation.createdAt.toLocaleString('es-ES')}`)
    })

    // Eliminar todas las consultas del mentor
    const deleteResult = await prisma.mentorConsultation.deleteMany({
      where: {
        userId: user.id
      }
    })

    console.log(`\n✅ Eliminadas ${deleteResult.count} consultas de mentor de ${user.fullName}`)
    console.log('🎯 Ahora podrá realizar una nueva consulta al arcángel mentor')

  } catch (error) {
    console.error('❌ Error eliminando consultas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  deleteUserMentorConsultations()
}

module.exports = { deleteUserMentorConsultations }