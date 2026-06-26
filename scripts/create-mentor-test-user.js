const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Función para calcular el arcángel mentor basado en el día de la semana de nacimiento
function calculateMentorArcangel(birthDate) {
  const dayOfWeek = birthDate.getDay(); // 0=Domingo, 1=Lunes, etc.
  
  const arcangelMap = {
    0: 'MIGUEL',    // Domingo
    1: 'JOFIEL',    // Lunes  
    2: 'CHAMUEL',   // Martes
    3: 'GABRIEL',   // Miércoles
    4: 'RAFAEL',    // Jueves
    5: 'URIEL',     // Viernes
    6: 'ZADKIEL'    // Sábado
  };
  
  return arcangelMap[dayOfWeek];
}

async function createTestUser() {
  console.log('🧪 Creando usuario de prueba para el sistema Arcángel Mentor...\n');

  try {
    const testPassword = await bcrypt.hash('test123', 12);
    
    // Usuario nacido un jueves para que tenga a Rafael como mentor
    const birthDate = new Date('1992-04-16'); // Jueves 16 de abril de 1992
    const mentorArcangel = calculateMentorArcangel(birthDate);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'prueba@mentor.com' },
      update: {},
      create: {
        fullName: 'Usuario Prueba Mentor',
        email: 'prueba@mentor.com',
        passwordHash: testPassword,
        role: 'USER',
        isActive: true,
        dateOfBirth: birthDate,
        mentorArcangel: mentorArcangel
      }
    });

    console.log(`✅ Usuario de prueba creado exitosamente:`);
    console.log(`   📧 Email: ${testUser.email}`);
    console.log(`   🔑 Password: test123`);
    console.log(`   📅 Fecha de nacimiento: ${birthDate.toLocaleDateString()}`);
    console.log(`   🔮 Arcángel Mentor: ${mentorArcangel}`);
    console.log(`   👤 Nombre: ${testUser.fullName}`);
    
    // Crear también una consulta de ejemplo del día anterior para probar las limitaciones
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sampleConsultation = await prisma.mentorConsultation.create({
      data: {
        userId: testUser.id,
        arcangel: mentorArcangel,
        question: "¿Cómo puedo mejorar mi salud espiritual?",
        answer: "Mi querido hijo/a, como Rafael, el Arcángel de la Sanación, te digo que la salud espiritual se cultiva a través de la oración diaria, la meditación y el servicio desinteresado a otros. Permite que mi luz verde de sanación fluya a través de ti, sanando no solo tu cuerpo sino también tu alma. Busca momentos de silencio para conectar con lo divino y verás cómo tu espíritu se fortalece.",
        createdAt: yesterday
      }
    });

    console.log(`\n💬 Consulta de ejemplo creada (fecha: ${yesterday.toLocaleDateString()})`);
    console.log(`   ❓ Pregunta: ${sampleConsultation.question}`);
    console.log(`   ✨ Respuesta: ${sampleConsultation.answer.substring(0, 100)}...`);

    console.log('\n🎯 Usuario listo para probar el sistema Arcángel Mentor!');
    console.log('📝 Instrucciones para la prueba:');
    console.log('1. Ve a http://localhost:3000');
    console.log('2. Haz clic en "Iniciar Sesión"');
    console.log('3. Usa las credenciales: prueba@mentor.com / test123');
    console.log('4. En la página principal verás la sección "Tu Arcángel Mentor"');
    console.log('5. Podrás hacer una consulta diaria y ver el historial');

  } catch (error) {
    console.error('❌ Error al crear usuario de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();