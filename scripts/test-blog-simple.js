const { PrismaClient } = require('@prisma/client')

async function testBlog() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Probando conexión y creando datos de prueba...')
    
    // Crear categoría de prueba
    const category = await prisma.blogCategory.upsert({
      where: { slug: 'angeles' },
      update: {},
      create: {
        name: 'Ángeles',
        slug: 'angeles',
        description: 'Contenido sobre los arcángeles'
      }
    })
    
    // Buscar o crear un usuario admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@oraculo.com' },
      update: {},
      create: {
        email: 'admin@oraculo.com',
        fullName: 'Admin Oráculo',
        role: 'ADMIN'
      }
    })
    
    // Crear post de prueba
    const post = await prisma.blogPost.upsert({
      where: { slug: 'bienvenida-blog-angelical' },
      update: {},
      create: {
        title: 'Bienvenida al Blog Angelical',
        slug: 'bienvenida-blog-angelical',
        excerpt: 'Descubre los mensajes de los arcángeles en nuestro nuevo blog.',
        content: '# Bienvenida al Blog Angelical\n\nEste es nuestro espacio sagrado donde compartimos mensajes angelicales.',
        status: 'PUBLISHED',
        categoryId: category.id,
        authorId: admin.id,
        tags: ['ángeles', 'espiritualidad'],
        views: 100,
        likes: 25,
        publishedAt: new Date()
      }
    })
    
    console.log('✅ Datos de prueba creados:')
    console.log(`  - Categoría: ${category.name}`)
    console.log(`  - Post: ${post.title}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testBlog()