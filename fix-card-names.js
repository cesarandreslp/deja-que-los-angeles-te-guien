const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixCardNames() {
  try {
    console.log('🔧 Corrigiendo nombres de cartas...\n')
    
    // Obtener todas las cartas
    const cards = await prisma.card.findMany()
    
    let fixed = 0
    for (const card of cards) {
      // Si el nombre es "Sin nombre" pero tiene title, copiar title a name
      if ((card.name === 'Sin nombre' || !card.name) && card.title) {
        await prisma.card.update({
          where: { id: card.id },
          data: { name: card.title }
        })
        console.log(`✅ Actualizado: ${card.code} -> ${card.title}`)
        fixed++
      }
    }
    
    console.log(`\n✨ Proceso completado: ${fixed} cartas corregidas`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCardNames()
