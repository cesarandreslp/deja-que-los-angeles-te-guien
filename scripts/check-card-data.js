const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCardData() {
  try {
    console.log('🔍 Verificando datos de cartas en la base de datos...')
    
    const sampleCards = await prisma.card.findMany({
      where: {
        code: {
          in: ['rafael_viajes_saludables', 'raziel_manifestacion', 'jeremiel_visiones_profeticas']
        }
      },
      select: {
        id: true,
        code: true,
        name: true,
        title: true,
        description: true,
        definition: true,
        arcangel: true,
        shortMsg: true
      }
    })

    console.log('\n📊 DATOS DE CARTAS EN LA BASE DE DATOS:')
    sampleCards.forEach((card, index) => {
      console.log(`\n🃏 Carta ${index + 1}:`)
      console.log(`   ID: ${card.id}`)
      console.log(`   Code: ${card.code}`)
      console.log(`   Name: ${card.name}`)
      console.log(`   Title: ${card.title}`)
      console.log(`   Description: ${card.description ? card.description.substring(0, 50) + '...' : null}`)
      console.log(`   Definition: ${card.definition ? card.definition.substring(0, 50) + '...' : null}`)
      console.log(`   Arcangel: ${card.arcangel}`)
      console.log(`   ShortMsg: ${card.shortMsg}`)
    })

    console.log(`\n✅ Total de cartas verificadas: ${sampleCards.length}`)

  } catch (error) {
    console.error('❌ Error verificando cartas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCardData()