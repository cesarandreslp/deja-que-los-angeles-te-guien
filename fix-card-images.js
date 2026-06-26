const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixCardImages() {
  try {
    console.log('🔄 Actualizando imágenes de las cartas...')
    
    // Obtener todas las cartas
    const cards = await prisma.card.findMany()
    
    console.log(`📊 Total de cartas: ${cards.length}`)
    
    let updated = 0
    let errors = 0
    
    for (const card of cards) {
      try {
        // Construir la URL de la imagen basada en el código de la carta
        // El código tiene el formato: arcangel_palabra (ej: miguel_proteccion)
        const imagePath = `/oraculo/arcangeles_cartas/${card.code}.png`
        
        // Solo actualizar si la imagen actual es el dorso
        if (card.imageUrl.includes('dorso.png')) {
          await prisma.card.update({
            where: { id: card.id },
            data: { 
              imageUrl: imagePath,
              // También actualizar el name si está vacío o es "Sin nombre"
              name: card.title || card.name || card.code.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            }
          })
          updated++
          console.log(`✅ Actualizada carta: ${card.code} -> ${imagePath}`)
        }
      } catch (error) {
        errors++
        console.error(`❌ Error actualizando carta ${card.code}:`, error.message)
      }
    }
    
    console.log('\n📈 RESUMEN:')
    console.log(`✅ Cartas actualizadas: ${updated}`)
    console.log(`❌ Errores: ${errors}`)
    console.log(`📊 Total procesadas: ${cards.length}`)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCardImages()
