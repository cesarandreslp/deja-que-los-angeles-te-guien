const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Mapeo de código a nombre correcto
const cardNames = {
  // Miguel
  "miguel_proteccion": "Protección",
  "miguel_liberacion_miedos": "Liberación de miedos",
  "miguel_voluntad_divina": "Voluntad divina",
  
  // Rafael
  "rafael_sanacion": "Sanación",
  "rafael_viajes_saludables": "Viajes saludables",
  "rafael_verdad_honestidad": "Verdad y honestidad",
  
  // Gabriel
  "gabriel_claridad": "Claridad",
  "gabriel_escritura_creativa": "Escritura creativa",
  "gabriel_mensajero_dios": "Mensajero de Dios",
  
  // Uriel
  "uriel_paz_interior": "Paz interior",
  "uriel_ideas_brillantes": "Ideas brillantes",
  "uriel_resolucion_problemas": "Resolución de problemas",
  
  // Azrael
  "azrael_consuelo": "Consuelo",
  "azrael_guia_transiciones": "Guía en transiciones",
  "azrael_liberacion_almas": "Liberación de almas",
  
  // Haniel
  "haniel_gracia": "Gracia",
  "haniel_amor_propio": "Amor propio",
  "haniel_intuicion_femenina": "Intuición femenina",
  
  // Chamuel
  "chamuel_encontrar_amor": "Encontrar amor",
  "chamuel_relaciones_armoniosas": "Relaciones armoniosas",
  "chamuel_paz_hogar": "Paz en el hogar",
  
  // Jofiel
  "jofiel_belleza": "Belleza",
  "jofiel_pensamientos_positivos": "Pensamientos positivos",
  "jofiel_prosperidad": "Prosperidad",
  
  // Zadkiel
  "zadkiel_perdon": "Perdón",
  "zadkiel_misericordia": "Misericordia",
  "zadkiel_transformacion": "Transformación espiritual",
  
  // Ariel
  "ariel_abundancia": "Abundancia",
  "ariel_proteccion_animal": "Protección de animales",
  "ariel_conexion_tierra": "Conexión con la Tierra",
  
  // Metatrón
  "metatron_ninos": "Guía de niños",
  "metatron_geometria_sagrada": "Geometría sagrada",
  "metatron_registro_akashico": "Registros akáshicos",
  
  // Sandalfón
  "sandalfon_musica": "Música celestial",
  "sandalfon_oracion": "Oración ascendente",
  "sandalfon_mensajes_ascendentes": "Mensajes al Cielo",
  
  // Jeremiel
  "jeremiel_revision_vida": "Revisión de vida",
  "jeremiel_visiones_profeticas": "Visiones proféticas",
  "jeremiel_claridad_psiquica": "Claridad psíquica",
  
  // Raziel
  "raziel_alquimia": "Alquimia divina",
  "raziel_secretos_divinos": "Secretos divinos",
  "raziel_manifestacion": "Manifestación",
  
  // Raguel
  "raguel_armonia": "Armonía",
  "raguel_justicia": "Justicia divina",
  "raguel_relaciones_justas": "Relaciones justas"
}

async function updateCardNames() {
  try {
    console.log('🔧 Actualizando nombres de cartas...\n')
    
    let updated = 0
    for (const [code, name] of Object.entries(cardNames)) {
      const result = await prisma.card.updateMany({
        where: { code: code },
        data: { name: name }
      })
      
      if (result.count > 0) {
        console.log(`✅ ${code} -> ${name}`)
        updated++
      }
    }
    
    console.log(`\n✨ Total actualizado: ${updated} cartas`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCardNames()
