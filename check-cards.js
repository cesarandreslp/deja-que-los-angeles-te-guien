const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkCards() {
  try {
    console.log('🔍 Verificando cartas en la base de datos...\n')
    
    // Contar total de cartas
    const totalCards = await prisma.card.count()
    console.log(`📊 Total de cartas: ${totalCards}\n`)
    
    // Contar por arcángel
    const cardsByArchangel = await prisma.card.groupBy({
      by: ['arcangelName'],
      _count: {
        arcangelName: true
      }
    })
    
    console.log('📈 Cartas por Arcángel:')
    cardsByArchangel.forEach(group => {
      console.log(`   ${group.arcangelName}: ${group._count.arcangelName} cartas`)
    })
    
    // Verificar cartas duplicadas o con problemas
    console.log('\n🔍 Verificando cartas con problemas...')
    const problemCards = await prisma.card.findMany({
      where: {
        OR: [
          { name: { contains: 'Sin nombre' } },
          { name: '' },
          { imageUrl: { contains: 'dorso' } }
        ]
      },
      select: {
        id: true,
        code: true,
        name: true,
        arcangelName: true,
        imageUrl: true
      }
    })
    
    if (problemCards.length > 0) {
      console.log(`⚠️  Encontradas ${problemCards.length} cartas con problemas:`)
      problemCards.forEach(card => {
        console.log(`   - ID: ${card.id}, Código: ${card.code}, Nombre: ${card.name || '(vacío)'}, Arcángel: ${card.arcangelName}`)
      })
    } else {
      console.log('✅ No se encontraron cartas con problemas')
    }
    
    // Listar todas las cartas
    console.log('\n📋 Lista completa de cartas:')
    const allCards = await prisma.card.findMany({
      orderBy: [
        { arcangelName: 'asc' },
        { code: 'asc' }
      ],
      select: {
        code: true,
        name: true,
        arcangelName: true,
        isActive: true
      }
    })
    
    allCards.forEach(card => {
      const status = card.isActive ? '✅' : '⏸️ '
      console.log(`   ${status} ${card.arcangelName.padEnd(15)} | ${card.code.padEnd(30)} | ${card.name}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCards()
