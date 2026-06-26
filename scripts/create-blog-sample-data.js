const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createBlogSampleData() {
  try {
    console.log('🌟 Creando datos de ejemplo para el blog...')

    // Encontrar un usuario admin/consultor para usar como autor
    const admin = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'CONSULTANT' }
        ]
      }
    })

    if (!admin) {
      console.log('❌ No se encontró un usuario administrador o consultor.')
      console.log('   Crea primero un usuario administrador antes de ejecutar este script.')
      return
    }

    console.log(`✅ Usando como autor: ${admin.fullName} (${admin.email})`)

    // Crear categorías de ejemplo
    const categories = [
      {
        name: 'Sabiduría Angelical',
        slug: 'sabiduria-angelical',
        description: 'Enseñanzas y mensajes directos de los arcángeles para guiar tu camino espiritual.'
      },
      {
        name: 'Arcángeles',
        slug: 'arcangeles',
        description: 'Conoce a cada arcángel, sus propósitos y cómo conectar con su energía divina.'
      },
      {
        name: 'Meditación Angelical',
        slug: 'meditacion-angelical',
        description: 'Técnicas de meditación para conectar con la energía angelical y encontrar paz interior.'
      },
      {
        name: 'Cristales y Energía',
        slug: 'cristales-energia',
        description: 'El poder de los cristales y cómo usarlos en tu práctica espiritual angelical.'
      },
      {
        name: 'Signos y Sincronicidades',
        slug: 'signos-sincronicidades',
        description: 'Aprende a interpretar las señales que los ángeles envían en tu vida diaria.'
      }
    ]

    console.log('📁 Creando categorías...')
    const createdCategories = []
    for (const categoryData of categories) {
      const category = await prisma.blogCategory.upsert({
        where: { slug: categoryData.slug },
        update: categoryData,
        create: categoryData
      })
      createdCategories.push(category)
      console.log(`   ✅ ${category.name}`)
    }

    // Crear publicaciones de ejemplo
    const posts = [
      {
        title: 'Bienvenidos al Blog del Oráculo de los Arcángeles',
        slug: 'bienvenidos-blog-oraculo-arcangeles',
        excerpt: 'Descubre un espacio sagrado donde la sabiduría angelical se encuentra con la orientación divina para transformar tu vida.',
        content: `# Bienvenidos al Blog del Oráculo de los Arcángeles

¡Bendiciones y luz divina para todos nuestros queridos lectores!

## Un Espacio Sagrado de Sabiduría

Este blog nace como un canal divino para compartir la **sabiduría eterna de los arcángeles** y brindar orientación espiritual a todas las almas que buscan luz en su camino.

### Lo que encontrarás aquí:

- **Mensajes Angelicales**: Canalizaciones directas de los arcángeles
- **Guías Espirituales**: Consejos prácticos para tu crecimiento espiritual  
- **Meditaciones Guiadas**: Técnicas para conectar con la energía angelical
- **Interpretación de Signos**: Cómo reconocer los mensajes divinos
- **Historias de Transformación**: Testimonios reales de sanación angelical

## Nuestra Misión

Somos un puente entre el reino angelical y el mundo terrenal, dedicados a:

1. **Compartir Sabiduría**: Difundir las enseñanzas de los arcángeles
2. **Guiar Almas**: Ayudar en el despertar espiritual de cada persona
3. **Sanar Corazones**: Brindar consuelo y esperanza divina
4. **Conectar Comunidades**: Crear una familia espiritual unida por el amor angelical

## Comenzando tu Viaje

Si es tu primera vez aquí, te recomendamos:

- 🙏 **Meditar** antes de leer para abrir tu corazón
- 📖 **Reflexionar** sobre cada mensaje recibido  
- 💫 **Aplicar** la sabiduría en tu vida diaria
- 🤝 **Compartir** con otros buscadores espirituales

---

*"Los ángeles caminan entre nosotros, susurrando verdades eternas a quienes tienen oídos para escuchar y corazones para comprender."*

¡Que esta sea la primera de muchas bendiciones que recibas en este espacio sagrado!

Con amor y luz angelical,  
**El Equipo del Oráculo** 🕊️✨`,
        categoryId: createdCategories[0].id, // Sabiduría Angelical
        status: 'PUBLISHED',
        tags: ['bienvenida', 'introducción', 'oráculo', 'arcángeles', 'blog'],
        publishedAt: new Date('2024-01-15')
      },
      {
        title: 'Conoce al Arcángel Miguel: El Guerrero de la Luz',
        slug: 'arcangel-miguel-guerrero-luz',
        excerpt: 'Descubre la poderosa energía protectora del Arcángel Miguel y cómo invocar su presencia para la protección y el coraje.',
        content: `# Conoce al Arcángel Miguel: El Guerrero de la Luz

El **Arcángel Miguel** es una de las figuras más poderosas y reconocidas del reino angelical. Su nombre significa "¿Quién como Dios?" y representa la fuerza divina que protege y libera a las almas de toda negatividad.

## Su Energía y Propósito

Miguel es conocido como el **Príncipe de los Arcángeles** y líder de las huestes celestiales. Su misión principal es:

### 🛡️ Protección Divina
- Protege contra energías negativas
- Defiende de ataques psíquicos
- Crea escudos de luz alrededor de las personas

### ⚔️ Coraje y Fuerza
- Infunde valor en momentos difíciles
- Fortalece la determinación
- Ayuda a enfrentar miedos y desafíos

### 🔥 Purificación Espiritual
- Limpia auras y espacios
- Transmuta energías densas
- Libera de ataduras energéticas

## Cómo Conectar con el Arcángel Miguel

### Oración de Invocación
*"Arcángel Miguel, guerrero de la luz divina, te invoco con humildad y amor. Envuelve mi ser con tu manto de protección azul, líbrame de todo mal y llena mi corazón de coraje celestial. Amén."*

### Meditación con Miguel
1. **Siéntate** en un lugar tranquilo
2. **Visualiza** una luz azul brillante
3. **Siente** la presencia protectora de Miguel
4. **Pide** su guía y protección
5. **Agradece** su presencia divina

### Señales de su Presencia
- Sensación de calor o hormigueo
- Visión de luces azules o doradas
- Sentimiento súbito de paz y seguridad
- Encuentros con plumas azules

## Su Mensaje para Ti

*"Querido hijo de la luz, no temas caminar por senderos oscuros, pues mi espada de luz despeja todo obstáculo. Tu alma está protegida por el amor divino, y mi escudo te acompaña en cada paso. Confía en tu fuerza interior, pues es reflejo de la mía."*

## Ritual de Protección Diaria

**Al despertar:**
- Visualiza el escudo azul de Miguel rodeándote
- Repite: "Arcángel Miguel, protégeme hoy"

**Durante el día:**
- En momentos de duda, invoca su nombre
- Lleva contigo un cristal azul (lapislázuli o sodalita)

**Antes de dormir:**
- Agradece su protección recibida
- Pide que vigile tus sueños

---

*Que la luz del Arcángel Miguel ilumine tu camino y su protección te acompañe siempre.* 

🕊️ Con bendiciones angelicales ✨`,
        categoryId: createdCategories[1].id, // Arcángeles
        status: 'PUBLISHED',
        tags: ['arcángel miguel', 'protección', 'guerrero', 'luz', 'meditación'],
        publishedAt: new Date('2024-01-20')
      },
      {
        title: 'Meditación Angelical: Conectando con tu Ángel Guardian',
        slug: 'meditacion-angelical-angel-guardian',
        excerpt: 'Una guía paso a paso para establecer comunicación con tu ángel guardián a través de la meditación sagrada.',
        content: `# Meditación Angelical: Conectando con tu Ángel Guardián

Cada alma que encarna en esta Tierra viene acompañada de un **ángel guardián**, un ser de luz pura que nos guía, protege y ama incondicionalmente desde el momento de nuestro nacimiento.

## ¿Qué es un Ángel Guardián?

Tu ángel guardián es:
- Un ser de luz asignado específicamente a ti
- Tu compañero espiritual eternal
- Una fuente constante de amor y guía
- Un protector que respeta tu libre albedrío

## Preparación para la Meditación

### Espacio Sagrado
- Encuentra un lugar tranquilo y limpio
- Enciende una vela blanca o dorada
- Coloca cristales como cuarzo blanco o amatista
- Ten agua bendita o sal marina para purificar

### Preparación Personal
- Toma una ducha o baño relajante
- Viste ropa cómoda y de colores claros
- Desconecta dispositivos electrónicos
- Establece la intención de comunicarte con amor

## Meditación Guiada: Encuentro con tu Ángel

### Fase 1: Relajación (5 minutos)
1. **Siéntate cómodamente** con la espalda recta
2. **Respira profundamente** 7 veces
3. **Relaja cada parte** de tu cuerpo
4. **Siente la paz** llenando tu ser

### Fase 2: Protección (3 minutos)
1. **Visualiza una burbuja** de luz dorada rodeándote
2. **Declara**: "Solo energías de luz y amor pueden acercarse"
3. **Siente la protección** divina activándose

### Fase 3: Invocación (5 minutos)
*"Querido ángel guardián, ser de luz que me acompañas, te invito con amor a manifestarte en esta meditación. Abre mi corazón para recibir tu presencia y mis sentidos para percibir tu mensaje."*

### Fase 4: Conexión (10 minutos)
- **Mantén tu mente** en silencio
- **Observa las sensaciones** en tu cuerpo
- **Permite que lleguen** imágenes, palabras o sentimientos
- **No juzgues** lo que recibas

### Fase 5: Comunicación (7 minutos)
1. **Haz una pregunta** sencilla con el corazón
2. **Escucha** la primera respuesta que llegue
3. **Agradece** cada mensaje recibido
4. **Pide una señal** para reconocer su presencia en el día

### Fase 6: Cierre (5 minutos)
1. **Agradece profundamente** a tu ángel
2. **Regresa lentamente** a tu cuerpo físico
3. **Mueve suavemente** dedos y pies
4. **Abre los ojos** cuando te sientas listo

## Señales de Conexión Exitosa

Durante o después de la meditación puedes experimentar:
- **Sensaciones físicas**: Calor, hormigueo, escalofríos sagrados
- **Percepciones visuales**: Luces, colores, formas angelicales
- **Mensajes auditivos**: Palabras, música celestial, susurros amorosos
- **Emociones**: Paz profunda, amor incondicional, gozo divino

## Fortaleciendo la Conexión Diaria

### Rituales Matutinos
- Saluda a tu ángel al despertar
- Pide su guía para el día
- Visualiza su luz acompañándote

### Durante el Día
- Habla mentalmente con tu ángel
- Pide señales cuando necesites orientación
- Agradece las sincronicidades

### Rituales Nocturnos
- Agradece la protección recibida
- Comparte tus experiencias del día
- Pide sueños reveladores

## Mensaje de tu Ángel Guardián

*"Amado hijo de mi corazón, siempre he estado aquí, susurrando amor a tu alma. Mis alas te envuelven en cada momento, mi luz ilumina tu sendero. No busques señales grandiosas, pues mi presencia se revela en la suave brisa, en la flor que sonríe, en la paz que sientes sin razón aparente. Confía en tu intuición, pues soy yo hablando a través de ella."*

---

**Practica esta meditación regularmente** y verás cómo se fortalece tu conexión angelical. 

Recuerda: Los ángeles respetan tu libre albedrío, así que siempre debes invitarlos conscientemente a participar en tu vida.

🕊️ Con amor angelical infinito ✨`,
        categoryId: createdCategories[2].id, // Meditación Angelical
        status: 'PUBLISHED',
        tags: ['meditación', 'ángel guardián', 'conexión', 'guía espiritual', 'práctica'],
        publishedAt: new Date('2024-01-25')
      }
    ]

    console.log('📝 Creando publicaciones de ejemplo...')
    for (const postData of posts) {
      const post = await prisma.blogPost.upsert({
        where: { slug: postData.slug },
        update: { ...postData, authorId: admin.id },
        create: { ...postData, authorId: admin.id }
      })
      console.log(`   ✅ ${post.title}`)
    }

    console.log('\n🎉 ¡Datos de ejemplo del blog creados exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`   📁 ${createdCategories.length} categorías creadas`)
    console.log(`   📝 ${posts.length} publicaciones creadas`)
    console.log(`   👤 Autor: ${admin.fullName}`)
    
    console.log('\n🌐 Próximos pasos:')
    console.log('   1. Ve a http://localhost:3003/admin/blog para ver el panel')
    console.log('   2. Explora las categorías y publicaciones creadas')
    console.log('   3. Crea nuevas publicaciones usando el editor')
    console.log('   4. ¡Comparte la sabiduría angelical!')

  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createBlogSampleData()