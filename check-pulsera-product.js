const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProduct() {
  try {
    console.log('🔍 Buscando producto "pulsera gabriel"...\n')
    
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: 'pulsera',
          mode: 'insensitive'
        }
      }
    })
    
    if (products.length === 0) {
      console.log('❌ No se encontró ningún producto con "pulsera" en el nombre')
      return
    }
    
    console.log(`✅ Se encontraron ${products.length} producto(s):\n`)
    
    products.forEach((product, index) => {
      console.log(`--- Producto ${index + 1} ---`)
      console.log(`ID: ${product.id}`)
      console.log(`Nombre: ${product.name}`)
      console.log(`Descripción: ${product.description}`)
      console.log(`Precio: ${product.priceCents} centavos (${product.currency})`)
      console.log(`Stock: ${product.stock}`)
      console.log(`Categoría: ${product.category}`)
      console.log(`isActive: ${product.isActive} ${product.isActive ? '✅' : '❌'}`)
      console.log(`Imágenes: ${JSON.stringify(product.imageUrls)}`)
      console.log(`Creado: ${product.createdAt}`)
      console.log(`Actualizado: ${product.updatedAt}`)
      console.log('\n')
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProduct()
