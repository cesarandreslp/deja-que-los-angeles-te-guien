import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cards = [
  // ARCÁNGEL MIGUEL - Protección y fuerza
  { code: "miguel_proteccion", name: "Protección", arcangel: "Miguel", shortMsg: "Protección y fuerza", description: "Estás rodeado por mi luz protectora. Libérate del miedo y confía en que estás seguro.", imageUrl: "/oraculo/arcangeles_cartas/miguel_proteccion.png" },
  { code: "miguel_liberacion_miedos", name: "Liberación de miedos", arcangel: "Miguel", shortMsg: "Protección y fuerza", description: "Entrégame tus temores y preocupaciones. Te ayudo a reemplazarlos con fe y confianza.", imageUrl: "/oraculo/arcangeles_cartas/miguel_liberacion_miedos.png" },
  { code: "miguel_voluntad_divina", title: "Voluntad divina", arcangel: "Miguel", shortMsg: "Protección y fuerza", definition: "Confía en el plan divino para tu vida. Estoy guiándote hacia tu propósito superior." },

  // ARCÁNGEL RAFAEL - Sanación y viajes
  { code: "rafael_sanacion", title: "Sanación", arcangel: "Rafael", shortMsg: "Sanación y viajes", definition: "Te envío mi luz verde esmeralda para sanar tu cuerpo, mente y espíritu." },
  { code: "rafael_viajes_saludables", title: "Viajes saludables", arcangel: "Rafael", shortMsg: "Sanación y viajes", definition: "Estoy contigo en tus viajes, asegurando seguridad y bienestar en cada paso." },
  { code: "rafael_verdad_honestidad", title: "Verdad y honestidad", arcangel: "Rafael", shortMsg: "Sanación y viajes", definition: "Habla tu verdad con amor. Te apoyo para ser auténtico y claro." },

  // ARCÁNGEL GABRIEL - Comunicación y creatividad
  { code: "gabriel_claridad", title: "Claridad", arcangel: "Gabriel", shortMsg: "Comunicación y creatividad", definition: "Tus palabras tienen poder. Te ayudo a comunicar tus mensajes con claridad y amor." },
  { code: "gabriel_escritura_creativa", title: "Escritura creativa", arcangel: "Gabriel", shortMsg: "Comunicación y creatividad", definition: "Expresa tu creatividad a través de la escritura. Estoy inspirándote ahora." },
  { code: "gabriel_mensajero_dios", title: "Mensajero de Dios", arcangel: "Gabriel", shortMsg: "Comunicación y creatividad", definition: "Confía en los mensajes que recibes. Soy tu guía para compartir la verdad divina." },

  // ARCÁNGEL URIEL - Sabiduría e iluminación
  { code: "uriel_paz_interior", title: "Paz interior", arcangel: "Uriel", shortMsg: "Sabiduría e iluminación", definition: "Ilumino tu mente con paz. Suelta las preocupaciones y confía en la luz divina." },
  { code: "uriel_ideas_brillantes", title: "Ideas brillantes", arcangel: "Uriel", shortMsg: "Sabiduría e iluminación", definition: "Una idea brillante está llegando a ti. Estoy encendiendo tu chispa de inspiración." },
  { code: "uriel_resolucion_problemas", title: "Resolución de problemas", arcangel: "Uriel", shortMsg: "Sabiduría e iluminación", definition: "Te doy claridad para resolver cualquier desafío. Pregúntame y te guiaré." },

  // ARCÁNGEL AZRAEL - Transición y consuelo
  { code: "azrael_consuelo", title: "Consuelo", arcangel: "Azrael", shortMsg: "Transición y consuelo", definition: "Estoy contigo para consolarte en tu dolor. Tus seres queridos están en paz conmigo." },
  { code: "azrael_guia_transiciones", title: "Guía en transiciones", arcangel: "Azrael", shortMsg: "Transición y consuelo", definition: "Te apoyo en los cambios de tu vida. Todo está en orden divino." },
  { code: "azrael_liberacion_almas", title: "Liberación de almas", arcangel: "Azrael", shortMsg: "Transición y consuelo", definition: "Ayudo a las almas a cruzar al Cielo con amor. Entrégame tus preocupaciones." },

  // ARCÁNGEL HANIEL - Gracia y amor propio
  { code: "haniel_gracia", title: "Gracia", arcangel: "Haniel", shortMsg: "Gracia y amor propio", definition: "Eres un ser de luz lleno de gracia divina. Abraza tu belleza interior." },
  { code: "haniel_amor_propio", title: "Amor propio", arcangel: "Haniel", shortMsg: "Gracia y amor propio", definition: "Ámate a ti mismo como Dios te ama. Te ayudo a sanar tu autoestima." },
  { code: "haniel_intuicion_femenina", title: "Intuición femenina", arcangel: "Haniel", shortMsg: "Gracia y amor propio", definition: "Confía en tu intuición. Mi luz lunar te guía hacia la verdad." },

  // ARCÁNGEL CHAMUEL - Amor y relaciones
  { code: "chamuel_encontrar_amor", title: "Encontrar amor", arcangel: "Chamuel", shortMsg: "Amor y relaciones", definition: "El amor está en camino. Abre tu corazón y confía en mi guía." },
  { code: "chamuel_relaciones_armoniosas", title: "Relaciones armoniosas", arcangel: "Chamuel", shortMsg: "Amor y relaciones", definition: "Te ayudo a sanar y fortalecer tus relaciones con amor y paz." },
  { code: "chamuel_paz_hogar", title: "Paz en el hogar", arcangel: "Chamuel", shortMsg: "Amor y relaciones", definition: "Traigo armonía a tu hogar. Invócame para resolver conflictos con amor." },

  // ARCÁNGEL JOFIEL - Belleza y prosperidad
  { code: "jofiel_belleza", title: "Belleza", arcangel: "Jofiel", shortMsg: "Belleza y prosperidad", definition: "Ve la belleza en todo y en todos. Te ayudo a elevar tus pensamientos." },
  { code: "jofiel_pensamientos_positivos", title: "Pensamientos positivos", arcangel: "Jofiel", shortMsg: "Belleza y prosperidad", definition: "Transforma tu mente con pensamientos positivos. Estoy contigo para inspirarte." },
  { code: "jofiel_prosperidad", title: "Prosperidad", arcangel: "Jofiel", shortMsg: "Belleza y prosperidad", definition: "La abundancia fluye hacia ti. Agradece y abre tu corazón a las bendiciones." },

  // ARCÁNGEL ZADKIEL - Perdón y misericordia
  { code: "zadkiel_perdon", title: "Perdón", arcangel: "Zadkiel", shortMsg: "Perdón y misericordia", definition: "Perdona a los demás y a ti mismo. Te ayudo a liberar el pasado con amor." },
  { code: "zadkiel_misericordia", title: "Misericordia", arcangel: "Zadkiel", shortMsg: "Perdón y misericordia", definition: "La compasión divina está contigo. Ábrete a mi luz de sanación." },
  { code: "zadkiel_transformacion", title: "Transformación espiritual", arcangel: "Zadkiel", shortMsg: "Perdón y misericordia", definition: "Estás creciendo espiritualmente. Te guío hacia la libertad interior." },

  // ARCÁNGEL ARIEL - Naturaleza y abundancia
  { code: "ariel_abundancia", title: "Abundancia", arcangel: "Ariel", shortMsg: "Naturaleza y abundancia", definition: "La Tierra y el Cielo te proveen. Confía en que todo lo que necesitas llega." },
  { code: "ariel_proteccion_animal", title: "Protección animal", arcangel: "Ariel", shortMsg: "Naturaleza y abundancia", definition: "Protejo a los animales que amas. Pídeme ayuda para cuidarlos." },
  { code: "ariel_conexion_tierra", title: "Conexión con la Tierra", arcangel: "Ariel", shortMsg: "Naturaleza y abundancia", definition: "Conéctate con la naturaleza. Te ayudo a encontrar paz en ella." },

  // ARCÁNGEL METATRÓN - Niños y geometría sagrada
  { code: "metatron_ninos", title: "Niños", arcangel: "Metatrón", shortMsg: "Niños y geometría sagrada", definition: "Protego a los niños en tu vida. Confía en que están guiados divinamente." },
  { code: "metatron_geometria_sagrada", title: "Geometría sagrada", arcangel: "Metatrón", shortMsg: "Niños y geometría sagrada", definition: "La geometría sagrada alinea tu energía. Medita en mis patrones divinos." },
  { code: "metatron_registro_akashico", title: "Registro akáshico", arcangel: "Metatrón", shortMsg: "Niños y geometría sagrada", definition: "Te ayudo a acceder a la sabiduría de tu alma. Pregúntame por tu propósito." },

  // ARCÁNGEL SANDALFÓN - Música y oración
  { code: "sandalfon_musica", title: "Música", arcangel: "Sandalfón", shortMsg: "Música y oración", definition: "La música eleva tu espíritu. Canta o escucha para conectar con el Cielo." },
  { code: "sandalfon_oracion", title: "Oración", arcangel: "Sandalfón", shortMsg: "Música y oración", definition: "Tus oraciones son escuchadas. Llevo tus palabras al corazón de Dios." },
  { code: "sandalfon_mensajes_ascendentes", title: "Mensajes ascendentes", arcangel: "Sandalfón", shortMsg: "Música y oración", definition: "Confía en los mensajes que envías al Cielo. Respuestas están en camino." },

  // ARCÁNGEL JEREMIEL - Revisión y visiones
  { code: "jeremiel_revision_vida", title: "Revisión de vida", arcangel: "Jeremiel", shortMsg: "Revisión y visiones", definition: "Te ayudo a reflexionar sobre tu vida con amor y claridad." },
  { code: "jeremiel_visiones_profeticas", title: "Visiones proféticas", arcangel: "Jeremiel", shortMsg: "Revisión y visiones", definition: "Tus sueños y visiones son mensajes divinos. Te guío para entenderlos." },
  { code: "jeremiel_claridad_psiquica", title: "Claridad psíquica", arcangel: "Jeremiel", shortMsg: "Revisión y visiones", definition: "Tu intuición está creciendo. Confía en las señales que recibes." },

  // ARCÁNGEL RAZIEL - Alquimia y secretos divinos
  { code: "raziel_alquimia", title: "Alquimia", arcangel: "Raziel", shortMsg: "Alquimia y secretos divinos", definition: "Transformo tus desafíos en bendiciones. Confía en mi magia divina." },
  { code: "raziel_secretos_divinos", title: "Secretos divinos", arcangel: "Raziel", shortMsg: "Alquimia y secretos divinos", definition: "Te revelo la sabiduría oculta. Pide claridad y te la daré." },
  { code: "raziel_manifestacion", title: "Manifestación", arcangel: "Raziel", shortMsg: "Alquimia y secretos divinos", definition: "Tus pensamientos crean tu realidad. Te guío para manifestar con amor." },

  // ARCÁNGEL RAGUEL - Armonía y justicia
  { code: "raguel_armonia", title: "Armonía", arcangel: "Raguel", shortMsg: "Armonía y justicia", definition: "Traigo paz a tus relaciones. Invócame para resolver conflictos." },
  { code: "raguel_justicia", title: "Justicia", arcangel: "Raguel", shortMsg: "Armonía y justicia", definition: "La justicia divina prevalece. Confía en que todo se alinea para el bien." },
  { code: "raguel_relaciones_justas", title: "Relaciones justas", arcangel: "Raguel", shortMsg: "Armonía y justicia", definition: "Te ayudo a crear relaciones equilibradas y amorosas." }
];

async function main() {
  console.log('🔮 Iniciando seed de cartas del Oráculo Arcangélico...');
  
  let created = 0;
  let updated = 0;
  
  // Primero, crear o verificar que existen los Arcángeles
  const arcangelNames = ['Miguel', 'Rafael', 'Gabriel', 'Uriel', 'Azrael', 'Haniel', 'Chamuel', 'Jofiel', 'Zadkiel', 'Ariel', 'Metatrón', 'Sandalfón', 'Jeremiel', 'Raziel', 'Raguel'];
  
  console.log('📝 Creando registros de Arcángeles...');
  for (const name of arcangelNames) {
    await prisma.archangel.upsert({
      where: { name },
      update: {},
      create: {
        name,
        imageUrl: `/oraculo/arcangeles/${name.toLowerCase()}.png`,
        description: `Arcángel ${name}`,
        isActive: true
      }
    });
  }
  
  // Limpiar cartas existentes del oráculo
  console.log('🧹 Limpiando cartas existentes...');
  await prisma.card.deleteMany({});

  console.log('🎴 Creando cartas del oráculo...');
  for (const c of cards) {
    try {
      // Crear carta con type assertion para resolver el problema de tipos
      await prisma.card.create({
        data: {
          code: c.code,
          name: c.name || 'Sin nombre',
          title: (c as any).title || c.name || 'Sin título',
          description: c.description || (c as any).definition || 'Sin descripción',
          definition: (c as any).definition || c.description || 'Sin definición',
          imageUrl: c.imageUrl || '/oraculo/arcangeles_cartas/dorso.png',
          shortMsg: c.shortMsg || '',
          meaning: c.description || (c as any).definition || 'Sin significado',
          isActive: true,
          // Usar type assertion para resolver el conflicto de tipos
          arcangelName: c.arcangel
        } as any
      });
      created++;
      console.log(`✅ Carta creada: ${c.code} - ${c.name || (c as any).title}`);
    } catch (error) {
      console.error(`❌ Error creando carta ${c.code}:`, error);
    }
  }
  
  console.log(`✅ Seed completado: ${created} cartas creadas, ${updated} cartas actualizadas`);
  console.log(`🎴 Total de cartas en base de datos: ${cards.length}`);
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });