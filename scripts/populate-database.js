const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Datos de las cartas del oráculo
const ORACLE_CARDS = [
  {
    code: "miguel_proteccion",
    name: "Arcángel Miguel - Protección",
    description: "El poderoso Arcángel Miguel te rodea con su luz azul de protección divina. Esta carta indica que estás siendo protegido/a de energías negativas y que tienes la fuerza interior para superar cualquier desafío.",
    imageUrl: "/images/cards/miguel_proteccion.jpg",
    arcangel: "Miguel",
    shortMsg: "Estás protegido/a por la luz divina"
  },
  {
    code: "gabriel_comunicacion",
    name: "Arcángel Gabriel - Comunicación",
    description: "Gabriel, el mensajero divino, te trae claridad en la comunicación. Es momento de expresar tu verdad con amor y escuchar los mensajes que el universo tiene para ti.",
    imageUrl: "/images/cards/gabriel_comunicacion.jpg",
    arcangel: "Gabriel",
    shortMsg: "Abre tu corazón a los mensajes divinos"
  },
  {
    code: "rafael_sanacion",
    name: "Arcángel Rafael - Sanación",
    description: "El Arcángel Rafael extiende sus alas verdes de sanación sobre ti. Tu cuerpo, mente y espíritu están siendo sanados. Confía en el proceso de recuperación.",
    imageUrl: "/images/cards/rafael_sanacion.jpg",
    arcangel: "Rafael",
    shortMsg: "La sanación divina fluye hacia ti"
  },
  {
    code: "uriel_sabiduria",
    name: "Arcángel Uriel - Sabiduría",
    description: "Uriel ilumina tu camino con su llama dorada de sabiduría. Las respuestas que buscas están dentro de ti. Confía en tu intuición y sabiduría interior.",
    imageUrl: "/images/cards/uriel_sabiduria.jpg",
    arcangel: "Uriel",
    shortMsg: "La sabiduría divina te guía"
  },
  {
    code: "chamuel_amor",
    name: "Arcángel Chamuel - Amor",
    description: "Chamuel te envuelve en energía rosa de amor incondicional. Ámate a ti mismo/a y permite que el amor fluya en todas tus relaciones.",
    imageUrl: "/images/cards/chamuel_amor.jpg",
    arcangel: "Chamuel",
    shortMsg: "El amor divino te rodea"
  },
  {
    code: "jofiel_belleza",
    name: "Arcángel Jofiel - Belleza",
    description: "Jofiel te ayuda a ver la belleza en todas las situaciones. Transforma los pensamientos negativos y encuentra la belleza en tu vida.",
    imageUrl: "/images/cards/jofiel_belleza.jpg",
    arcangel: "Jofiel",
    shortMsg: "Ve la belleza en todo lo que te rodea"
  },
  {
    code: "zadkiel_transformacion",
    name: "Arcángel Zadkiel - Transformación",
    description: "Zadkiel te asiste en tu proceso de transformación personal. Libérate del pasado y abraza tu nuevo yo con amor y compasión.",
    imageUrl: "/images/cards/zadkiel_transformacion.jpg",
    arcangel: "Zadkiel",
    shortMsg: "Abraza tu transformación divina"
  },
  // Agregar más cartas...
  {
    code: "miguel_coraje",
    name: "Arcángel Miguel - Coraje",
    description: "Miguel te infunde con valentía divina. No temas seguir tu verdadero camino. Tienes la fuerza para enfrentar cualquier situación.",
    imageUrl: "/images/cards/miguel_coraje.jpg",
    arcangel: "Miguel",
    shortMsg: "Tienes el coraje divino en tu corazón"
  },
  {
    code: "gabriel_anunciacion",
    name: "Arcángel Gabriel - Anunciación",
    description: "Gabriel te trae noticias importantes. Prepárate para recibir bendiciones y nuevas oportunidades que cambiarán tu vida positivamente.",
    imageUrl: "/images/cards/gabriel_anunciacion.jpg",
    arcangel: "Gabriel",
    shortMsg: "Se avecinan buenas noticias"
  },
  {
    code: "rafael_viaje",
    name: "Arcángel Rafael - Viaje Seguro",
    description: "Rafael te acompaña en todos tus viajes, físicos y espirituales. Estás protegido/a en tu camino hacia nuevas experiencias.",
    imageUrl: "/images/cards/rafael_viaje.jpg",
    arcangel: "Rafael",
    shortMsg: "Viaja con protección divina"
  }
];

// Datos de productos para la tienda
const STORE_PRODUCTS = [
  {
    name: "Camiseta Arcángel Miguel",
    description: "Camiseta de alta calidad con la imagen del Arcángel Miguel. Perfecta para sentir su protección durante todo el día.",
    priceCents: 4500000, // $45.000 COP
    currency: "COP",
    stock: 20,
    category: "CLOTHING",
    imageUrls: ["/images/products/camiseta_miguel.jpg"]
  },
  {
    name: "Collar de Protección Angelical",
    description: "Hermoso collar con colgante de alas de ángel. Bendecido con energía angelical para tu protección diaria.",
    priceCents: 8500000, // $85.000 COP
    currency: "COP",
    stock: 15,
    category: "JEWELRY",
    imageUrls: ["/images/products/collar_proteccion.jpg"]
  },
  {
    name: "Esencia Aromática del Arcángel Rafael",
    description: "Esencia especial para sanación y bienestar. Perfecta para meditación y momentos de conexión espiritual.",
    priceCents: 3200000, // $32.000 COP
    currency: "COP",
    stock: 30,
    category: "ESSENCES",
    imageUrls: ["/images/products/esencia_rafael.jpg"]
  },
  {
    name: "Kit de Ritual de Amor Angelical",
    description: "Kit completo para rituales de amor con la guía del Arcángel Chamuel. Incluye velas, incienso y guía de ritual.",
    priceCents: 7500000, // $75.000 COP
    currency: "COP",
    stock: 10,
    category: "RITUALS",
    imageUrls: ["/images/products/kit_amor.jpg"]
  }
];

// Planes de membresía
const MEMBERSHIP_PLANS = [
  {
    name: "Membresía Básica Mensual",
    description: "Acceso básico a consultas y contenido angelical por 30 días",
    priceCents: 2500000, // $25.000 COP
    currency: "COP",
    durationDays: 30
  },
  {
    name: "Membresía Premium Mensual",
    description: "Acceso completo con consultas ilimitadas y contenido exclusivo por 30 días",
    priceCents: 4500000, // $45.000 COP
    currency: "COP",
    durationDays: 30
  },
  {
    name: "Membresía Anual",
    description: "Membresía premium completa por todo un año con descuento especial",
    priceCents: 48000000, // $480.000 COP (20% descuento)
    currency: "COP",
    durationDays: 365
  }
];

async function populateDatabase() {
  console.log('🌟 Iniciando población de la base de datos...\n');

  try {
    // 1. Crear usuario administrador
    console.log('👨‍💼 Creando usuario administrador...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@oraculo.com' },
      update: {},
      create: {
        fullName: 'Administrador Principal',
        email: 'admin@oraculo.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        isActive: true,
        dateOfBirth: new Date('1990-01-01'),
        mentorArcangel: 'MIGUEL'
      }
    });
    console.log(`✅ Admin creado: ${admin.email}`);

    // 2. Crear consultores de ejemplo
    console.log('\n👥 Creando consultores de ejemplo...');
    const consultorPassword = await bcrypt.hash('consultor123', 12);
    
    const consultores = [
      {
        fullName: 'María Luz Angelical',
        email: 'maria@oraculo.com',
        dateOfBirth: new Date('1985-03-15'),
        mentorArcangel: 'GABRIEL'
      },
      {
        fullName: 'Carlos Sanador Divino',
        email: 'carlos@oraculo.com',
        dateOfBirth: new Date('1978-07-22'),
        mentorArcangel: 'RAFAEL'
      },
      {
        fullName: 'Ana Sabiduría Celestial',
        email: 'ana@oraculo.com',
        dateOfBirth: new Date('1992-11-08'),
        mentorArcangel: 'URIEL'
      }
    ];

    for (const consultorData of consultores) {
      const consultor = await prisma.user.upsert({
        where: { email: consultorData.email },
        update: {},
        create: {
          ...consultorData,
          passwordHash: consultorPassword,
          role: 'CONSULTANT',
          isActive: true
        }
      });
      console.log(`✅ Consultor creado: ${consultor.fullName}`);
    }

    // 3. Crear usuarios de ejemplo
    console.log('\n👤 Creando usuarios de ejemplo...');
    const userPassword = await bcrypt.hash('user123', 12);
    
    const usuarios = [
      {
        fullName: 'Usuario Ejemplo 1',
        email: 'usuario1@test.com',
        dateOfBirth: new Date('1995-05-10'), // Miércoles - Gabriel
        mentorArcangel: 'GABRIEL'
      },
      {
        fullName: 'Usuario Ejemplo 2',
        email: 'usuario2@test.com',
        dateOfBirth: new Date('1988-12-25'), // Domingo - Miguel
        mentorArcangel: 'MIGUEL'
      }
    ];

    for (const userData of usuarios) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          passwordHash: userPassword,
          role: 'USER',
          isActive: true
        }
      });
      console.log(`✅ Usuario creado: ${user.fullName}`);
    }

    // 4. Crear cartas del oráculo
    console.log('\n🃏 Creando cartas del oráculo...');
    for (const cardData of ORACLE_CARDS) {
      const card = await prisma.card.upsert({
        where: { code: cardData.code },
        update: cardData,
        create: cardData
      });
      console.log(`✅ Carta creada: ${card.name}`);
    }

    // 5. Crear productos de la tienda
    console.log('\n🛍️ Creando productos de la tienda...');
    for (const productData of STORE_PRODUCTS) {
      const product = await prisma.product.create({
        data: productData
      });
      console.log(`✅ Producto creado: ${product.name}`);
    }

    // 6. Crear planes de membresía
    console.log('\n💎 Creando planes de membresía...');
    for (const planData of MEMBERSHIP_PLANS) {
      const plan = await prisma.membershipPlan.create({
        data: planData
      });
      console.log(`✅ Plan creado: ${plan.name}`);
    }

    // 7. Crear configuraciones del sistema
    console.log('\n⚙️ Creando configuraciones del sistema...');
    const systemConfigs = [
      { category: 'AI', key: 'ZHIPU_API_KEY', value: 'your-zhipu-api-key-here' },
      { category: 'EMAIL', key: 'SMTP_HOST', value: 'smtp.gmail.com' },
      { category: 'EMAIL', key: 'SMTP_PORT', value: '587' },
      { category: 'APP', key: 'ORACLE_DAILY_LIMIT', value: '1' },
      { category: 'APP', key: 'MENTOR_DAILY_LIMIT', value: '1' }
    ];

    for (const configData of systemConfigs) {
      const config = await prisma.systemConfig.upsert({
        where: { category_key: { category: configData.category, key: configData.key } },
        update: { value: configData.value },
        create: configData
      });
      console.log(`✅ Configuración creada: ${config.category}.${config.key}`);
    }

    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    console.log('\n📊 Resumen de datos creados:');
    console.log(`- 1 Administrador`);
    console.log(`- 3 Consultores`);
    console.log(`- 2 Usuarios de ejemplo`);
    console.log(`- ${ORACLE_CARDS.length} Cartas del oráculo`);
    console.log(`- ${STORE_PRODUCTS.length} Productos de la tienda`);
    console.log(`- ${MEMBERSHIP_PLANS.length} Planes de membresía`);
    console.log(`- ${systemConfigs.length} Configuraciones del sistema`);

    console.log('\n🔐 Credenciales de acceso:');
    console.log('Admin: admin@oraculo.com / admin123');
    console.log('Consultor: maria@oraculo.com / consultor123');
    console.log('Usuario: usuario1@test.com / user123');

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateDatabase();