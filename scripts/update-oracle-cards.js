const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 45 CARTAS DEL ORÁCULO ARCANGÉLICO COMPLETAS
const ORACLE_CARDS_COMPLETE = [
  // ARIEL (3 cartas)
  {
    code: "ariel_abundancia",
    name: "Arcángel Ariel - Abundancia",
    description: "Ariel, el León de Dios, te conecta con la abundancia natural del universo. Esta carta indica que la prosperidad fluye hacia ti cuando te alineas con la naturaleza y sus ciclos. La abundancia no solo es material, sino también espiritual y emocional.",
    imageUrl: "/oraculo/arcangeles_cartas/ariel_abundancia.png",
    arcangel: "Ariel",
    shortMsg: "La abundancia natural fluye hacia ti"
  },
  {
    code: "ariel_conexion_tierra",
    name: "Arcángel Ariel - Conexión con la Tierra",
    description: "Ariel te invita a reconectar con la Madre Tierra. Pasa tiempo en la naturaleza, camina descalzo sobre la hierba, abraza un árbol. Esta conexión renovará tu energía y te traerá paz interior.",
    imageUrl: "/oraculo/arcangeles_cartas/ariel_conexion_tierra.png",
    arcangel: "Ariel",
    shortMsg: "Reconecta con la sabiduría de la Tierra"
  },
  {
    code: "ariel_proteccion_animal",
    name: "Arcángel Ariel - Protección Animal",
    description: "Ariel extiende su protección sobre todos los animales y te llama a ser guardián de las criaturas de Dios. Los animales pueden traerte mensajes importantes en este momento.",
    imageUrl: "/oraculo/arcangeles_cartas/ariel_proteccion_animal.png",
    arcangel: "Ariel",
    shortMsg: "Los animales traen mensajes divinos"
  },

  // AZRAEL (3 cartas)
  {
    code: "azrael_consuelo",
    name: "Arcángel Azrael - Consuelo",
    description: "Azrael, el ángel del consuelo, está contigo en momentos de pérdida y dolor. Su presencia suave te ayuda a sanar el corazón y encontrar paz en medio de la tristeza. No estás solo/a en tu dolor.",
    imageUrl: "/oraculo/arcangeles_cartas/azrael_consuelo.png",
    arcangel: "Azrael",
    shortMsg: "El consuelo divino alivia tu dolor"
  },
  {
    code: "azrael_guia_transiciones",
    name: "Arcángel Azrael - Guía en Transiciones",
    description: "Azrael te acompaña en los momentos de transición y cambio. Ya sea un final o un nuevo comienzo, él te guía suavemente hacia tu nuevo capítulo con amor y comprensión.",
    imageUrl: "/oraculo/arcangeles_cartas/azrael_guia_transiciones.png",
    arcangel: "Azrael",
    shortMsg: "Las transiciones son bendiciones disfrazadas"
  },
  {
    code: "azrael_liberacion_almas",
    name: "Arcángel Azrael - Liberación de Almas",
    description: "Azrael ayuda a liberar las almas atrapadas en patrones del pasado. Es tiempo de soltar lo que ya no te sirve y permitir que tu alma vuele libre hacia nuevas posibilidades.",
    imageUrl: "/oraculo/arcangeles_cartas/azrael_liberacion_almas.png",
    arcangel: "Azrael",
    shortMsg: "Libera tu alma de las ataduras del pasado"
  },

  // CHAMUEL (3 cartas)
  {
    code: "chamuel_encontrar_amor",
    name: "Arcángel Chamuel - Encontrar el Amor",
    description: "Chamuel, el ángel del amor, te ayuda a encontrar el amor en todas sus formas. Ya sea amor romántico, amistad verdadera o amor propio, él ilumina el camino hacia conexiones auténticas y amorosas.",
    imageUrl: "/oraculo/arcangeles_cartas/chamuel_encontrar_amor.png",
    arcangel: "Chamuel",
    shortMsg: "El amor verdadero está en camino"
  },
  {
    code: "chamuel_paz_hogar",
    name: "Arcángel Chamuel - Paz en el Hogar",
    description: "Chamuel bendice tu hogar con paz y armonía. Los conflictos familiares se resolverán y tu espacio sagrado se llenará de amor y tranquilidad. Tu hogar es tu templo.",
    imageUrl: "/oraculo/arcangeles_cartas/chamuel_paz_hogar.png",
    arcangel: "Chamuel",
    shortMsg: "Tu hogar se llena de paz divina"
  },
  {
    code: "chamuel_relaciones_armoniosas",
    name: "Arcángel Chamuel - Relaciones Armoniosas",
    description: "Chamuel armoniza tus relaciones con amor divino. Las discusiones se resolverán, los malentendidos se aclararán y el amor prevalecerá en todas tus conexiones humanas.",
    imageUrl: "/oraculo/arcangeles_cartas/chamuel_relaciones_armoniosas.png",
    arcangel: "Chamuel",
    shortMsg: "Tus relaciones florecen en armonía"
  },

  // GABRIEL (3 cartas)
  {
    code: "gabriel_claridad",
    name: "Arcángel Gabriel - Claridad",
    description: "Gabriel, el mensajero divino, trae claridad a tu mente confusa. Los mensajes que necesitas escuchar llegarán con perfecta claridad. Abre tu corazón para recibir la guía divina.",
    imageUrl: "/oraculo/arcangeles_cartas/gabriel_claridad.png",
    arcangel: "Gabriel",
    shortMsg: "La claridad divina ilumina tu camino"
  },
  {
    code: "gabriel_escritura_creativa",
    name: "Arcángel Gabriel - Escritura Creativa",
    description: "Gabriel inspira tu creatividad y te llama a expresarte a través de la escritura. Tus palabras tienen poder sanador. Escribe desde el corazón y comparte tu mensaje con el mundo.",
    imageUrl: "/oraculo/arcangeles_cartas/gabriel_escritura_creativa.png",
    arcangel: "Gabriel",
    shortMsg: "Tus palabras tienen poder divino"
  },
  {
    code: "gabriel_mensajero_dios",
    name: "Arcángel Gabriel - Mensajero de Dios",
    description: "Gabriel te trae un mensaje importante de lo divino. Presta atención a las señales, sincronías y mensajes que recibas hoy. Dios te está hablando a través de diversos canales.",
    imageUrl: "/oraculo/arcangeles_cartas/gabriel_mensajero_dios.png",
    arcangel: "Gabriel",
    shortMsg: "Un mensaje divino está llegando a ti"
  },

  // HANIEL (3 cartas)
  {
    code: "haniel_amor_propio",
    name: "Arcángel Haniel - Amor Propio",
    description: "Haniel te enseña a amarte a ti mismo/a con compasión divina. Eres un ser hermoso y perfecto tal como eres. El amor propio es la base de todas las demás formas de amor.",
    imageUrl: "/oraculo/arcangeles_cartas/haniel_amor_propio.png",
    arcangel: "Haniel",
    shortMsg: "Ámate como Dios te ama"
  },
  {
    code: "haniel_gracia",
    name: "Arcángel Haniel - Gracia",
    description: "Haniel te bendice con gracia divina. Muévete por el mundo con elegancia y dignidad. La gracia te abre puertas que parecían cerradas y suaviza todos tus caminos.",
    imageUrl: "/oraculo/arcangeles_cartas/haniel_gracia.png",
    arcangel: "Haniel",
    shortMsg: "La gracia divina te acompaña"
  },
  {
    code: "haniel_intuicion_femenina",
    name: "Arcángel Haniel - Intuición Femenina",
    description: "Haniel despierta tu intuición femenina sagrada. Confía en tus corazonadas y en la sabiduría de tu cuerpo. La energía femenina divina fluye poderosamente a través de ti.",
    imageUrl: "/oraculo/arcangeles_cartas/haniel_intuicion_femenina.png",
    arcangel: "Haniel",
    shortMsg: "Tu intuición es tu guía sagrada"
  },

  // JEREMIEL (3 cartas)
  {
    code: "jeremiel_claridad_psiquica",
    name: "Arcángel Jeremiel - Claridad Psíquica",
    description: "Jeremiel abre tus dones psíquicos y te ayuda a ver más allá del velo. Tus habilidades intuitivas se están fortaleciendo. Confía en las visiones y percepciones que recibas.",
    imageUrl: "/oraculo/arcangeles_cartas/jeremiel_claridad_psiquica.png",
    arcangel: "Jeremiel",
    shortMsg: "Tus dones psíquicos se despiertan"
  },
  {
    code: "jeremiel_revision_vida",
    name: "Arcángel Jeremiel - Revisión de la Vida",
    description: "Jeremiel te invita a hacer una revisión compasiva de tu vida. Observa tus experiencias con amor, aprendiendo de cada momento sin juzgarte. Cada experiencia ha sido perfecta para tu crecimiento.",
    imageUrl: "/oraculo/arcangeles_cartas/jeremiel_revision_vida.png",
    arcangel: "Jeremiel",
    shortMsg: "Cada experiencia ha sido perfecta"
  },
  {
    code: "jeremiel_visiones_profeticas",
    name: "Arcángel Jeremiel - Visiones Proféticas",
    description: "Jeremiel te bendice con visiones del futuro. Presta atención a tus sueños y meditaciones. Estás recibiendo glimpses de posibilidades futuras que te ayudarán a tomar decisiones sabias.",
    imageUrl: "/oraculo/arcangeles_cartas/jeremiel_visiones_profeticas.png",
    arcangel: "Jeremiel",
    shortMsg: "El futuro se revela en visiones"
  },

  // JOFIEL (3 cartas)
  {
    code: "jofiel_belleza",
    name: "Arcángel Jofiel - Belleza",
    description: "Jofiel te ayuda a ver la belleza en todas las situaciones de tu vida. Incluso en los momentos difíciles, hay una belleza oculta esperando ser descubierta. Tu perspectiva se está transformando.",
    imageUrl: "/oraculo/arcangeles_cartas/jofiel_belleza.png",
    arcangel: "Jofiel",
    shortMsg: "Ve la belleza en todo lo que te rodea"
  },
  {
    code: "jofiel_pensamientos_positivos",
    name: "Arcángel Jofiel - Pensamientos Positivos",
    description: "Jofiel purifica tu mente de pensamientos negativos y los reemplaza con ideas hermosas y elevadas. Tus pensamientos crean tu realidad. Elige pensar en belleza, amor y posibilidades infinitas.",
    imageUrl: "/oraculo/arcangeles_cartas/jofiel_pensamientos_positivos.png",
    arcangel: "Jofiel",
    shortMsg: "Tus pensamientos hermosos crean milagros"
  },
  {
    code: "jofiel_prosperidad",
    name: "Arcángel Jofiel - Prosperidad",
    description: "Jofiel te bendice con pensamientos de abundancia y prosperidad. Tu mentalidad de escasez se está transformando en una conciencia de abundancia infinita. Mereces toda la prosperidad del universo.",
    imageUrl: "/oraculo/arcangeles_cartas/jofiel_prosperidad.png",
    arcangel: "Jofiel",
    shortMsg: "La prosperidad es tu derecho divino"
  },

  // METATRON (3 cartas)
  {
    code: "metatron_geometria_sagrada",
    name: "Arcángel Metatrón - Geometría Sagrada",
    description: "Metatrón te conecta con los patrones sagrados del universo. Todo en la creación sigue un orden divino perfecto. Medita en el Cubo de Metatrón para acceder a sabiduría cósmica superior.",
    imageUrl: "/oraculo/arcangeles_cartas/metatron_geometria_sagrada.png",
    arcangel: "Metatrón",
    shortMsg: "Los patrones sagrados se revelan"
  },
  {
    code: "metatron_ninos",
    name: "Arcángel Metatrón - Protección de Niños",
    description: "Metatrón protege a todos los niños, incluyendo tu niño interior. Es tiempo de sanar heridas de la infancia y reconectar con la inocencia y la maravilla de tu corazón joven.",
    imageUrl: "/oraculo/arcangeles_cartas/metatron_ninos.png",
    arcangel: "Metatrón",
    shortMsg: "Tu niño interior está siendo sanado"
  },
  {
    code: "metatron_registro_akashico",
    name: "Arcángel Metatrón - Registro Akáshico",
    description: "Metatrón te da acceso a los registros akáshicos de tu alma. La información que necesitas sobre tu propósito de vida y contratos del alma está disponible. Medita y pide claridad.",
    imageUrl: "/oraculo/arcangeles_cartas/metatron_registro_akashico.png",
    arcangel: "Metatrón",
    shortMsg: "Los registros de tu alma se abren"
  },

  // MIGUEL (3 cartas)
  {
    code: "miguel_liberacion_miedos",
    name: "Arcángel Miguel - Liberación de Miedos",
    description: "Miguel corta las cadenas del miedo que te han mantenido prisionero/a. Con su espada de luz azul, él libera todos los temores que bloquean tu crecimiento. Eres libre para ser quien realmente eres.",
    imageUrl: "/oraculo/arcangeles_cartas/miguel_liberacion_miedos.png",
    arcangel: "Miguel",
    shortMsg: "Eres libre de todos los miedos"
  },
  {
    code: "miguel_proteccion",
    name: "Arcángel Miguel - Protección Divina",
    description: "Miguel te rodea con su luz azul de protección divina. Ningún mal puede tocarte cuando estás bajo su cuidado. Siente su presencia poderosa protegiéndote en todo momento.",
    imageUrl: "/oraculo/arcangeles_cartas/miguel_proteccion.png",
    arcangel: "Miguel",
    shortMsg: "Estás completamente protegido/a"
  },
  {
    code: "miguel_voluntad_divina",
    name: "Arcángel Miguel - Voluntad Divina",
    description: "Miguel te ayuda a alinear tu voluntad personal con la voluntad divina. Cuando sigues el plan de Dios para tu vida, todo fluye con facilidad y gracia. Entrega el control y confía.",
    imageUrl: "/oraculo/arcangeles_cartas/miguel_voluntad_divina.png",
    arcangel: "Miguel",
    shortMsg: "Alinéate con la voluntad divina"
  },

  // RAFAEL (3 cartas)
  {
    code: "rafael_sanacion",
    name: "Arcángel Rafael - Sanación Divina",
    description: "Rafael extiende sus alas verdes de sanación sobre ti. Tu cuerpo, mente y espíritu están siendo sanados en este momento. Confía en el proceso y permite que la sanación fluya a través de ti.",
    imageUrl: "/oraculo/arcangeles_cartas/rafael_sanacion.png",
    arcangel: "Rafael",
    shortMsg: "La sanación divina fluye hacia ti"
  },
  {
    code: "rafael_verdad_honestidad",
    name: "Arcángel Rafael - Verdad y Honestidad",
    description: "Rafael te llama a vivir en total honestidad contigo mismo/a y con otros. La verdad te liberará de cargas innecesarias. Habla tu verdad con amor y vive auténticamente.",
    imageUrl: "/oraculo/arcangeles_cartas/rafael_verdad_honestidad.png",
    arcangel: "Rafael",
    shortMsg: "La verdad te hace libre"
  },
  {
    code: "rafael_viajes_saludables",
    name: "Arcángel Rafael - Viajes Saludables",
    description: "Rafael bendice todos tus viajes, físicos y espirituales, con salud y protección. Cada jornada que emprendas será segura y transformadora. Viaja con confianza y fe.",
    imageUrl: "/oraculo/arcangeles_cartas/rafael_viajes_saludables.png",
    arcangel: "Rafael",
    shortMsg: "Viaja con protección divina"
  },

  // RAGUEL (3 cartas)
  {
    code: "raguel_armonia",
    name: "Arcángel Raguel - Armonía Divina",
    description: "Raguel restaura la armonía en todas las áreas de tu vida. Los conflictos se resuelven, las relaciones se equilibran y la paz prevalece. Tu vida está encontrando su ritmo perfecto.",
    imageUrl: "/oraculo/arcangeles_cartas/raguel_armonia.png",
    arcangel: "Raguel",
    shortMsg: "La armonía divina se restaura"
  },
  {
    code: "raguel_justicia",
    name: "Arcángel Raguel - Justicia Divina",
    description: "Raguel asegura que la justicia divina prevalezca en tu situación. Lo que es justo y correcto se manifestará. Confía en que el universo siempre busca el equilibrio perfecto.",
    imageUrl: "/oraculo/arcangeles_cartas/raguel_justicia.png",
    arcangel: "Raguel",
    shortMsg: "La justicia divina prevalece"
  },
  {
    code: "raguel_relaciones_justas",
    name: "Arcángel Raguel - Relaciones Justas",
    description: "Raguel equilibra tus relaciones con justicia y fairness. Las personas que no te honran se alejarán, mientras que relaciones saludables y equilibradas florecerán en tu vida.",
    imageUrl: "/oraculo/arcangeles_cartas/raguel_relaciones_justas.png",
    arcangel: "Raguel",
    shortMsg: "Tus relaciones se equilibran con justicia"
  },

  // RAZIEL (3 cartas)
  {
    code: "raziel_alquimia",
    name: "Arcángel Raziel - Alquimia Espiritual",
    description: "Raziel te enseña la alquimia espiritual de transformar el plomo de tus experiencias en el oro de la sabiduría. Cada desafío es una oportunidad de crecimiento espiritual.",
    imageUrl: "/oraculo/arcangeles_cartas/raziel_alquimia.png",
    arcangel: "Raziel",
    shortMsg: "Transforma las pruebas en sabiduría"
  },
  {
    code: "raziel_manifestacion",
    name: "Arcángel Raziel - Manifestación",
    description: "Raziel te revela los secretos de la manifestación. Tus deseos más puros están alineándose con la realidad. El universo está conspirando para hacer realidad tus sueños más elevados.",
    imageUrl: "/oraculo/arcangeles_cartas/raziel_manifestacion.png",
    arcangel: "Raziel",
    shortMsg: "Tus deseos se manifiestan ahora"
  },
  {
    code: "raziel_secretos_divinos",
    name: "Arcángel Raziel - Secretos Divinos",
    description: "Raziel te revela secretos divinos y conocimiento esotérico. Estás listo/a para recibir sabiduría más profunda sobre los misterios de la vida. Tu comprensión espiritual se expande.",
    imageUrl: "/oraculo/arcangeles_cartas/raziel_secretos_divinos.png",
    arcangel: "Raziel",
    shortMsg: "Los misterios divinos se revelan"
  },

  // SANDALFÓN (3 cartas)
  {
    code: "sandalfon_mensajes_ascendentes",
    name: "Arcángel Sandalfón - Mensajes Ascendentes",
    description: "Sandalfón lleva tus oraciones directamente al trono de Dios. Cada palabra que has susurrado en oración ha sido escuchada. Las respuestas están en camino hacia ti.",
    imageUrl: "/oraculo/arcangeles_cartas/sandalfon_mensajes_ascendentes.png",
    arcangel: "Sandalfón",
    shortMsg: "Tus oraciones han sido escuchadas"
  },
  {
    code: "sandalfon_musica",
    name: "Arcángel Sandalfón - Música Celestial",
    description: "Sandalfón te bendice con el don de la música celestial. Ya sea creando, escuchando o simplemente apreciando la música, ella será tu canal de sanación y conexión divina.",
    imageUrl: "/oraculo/arcangeles_cartas/sandalfon_musica.png",
    arcangel: "Sandalfón",
    shortMsg: "La música celestial te sana"
  },
  {
    code: "sandalfon_oracion",
    name: "Arcángel Sandalfón - Poder de la Oración",
    description: "Sandalfón amplifica el poder de tus oraciones. Cada pensamiento elevado, cada petición desde el corazón, se vuelve más poderosa con su intervención. Ora con fe y confianza.",
    imageUrl: "/oraculo/arcangeles_cartas/sandalfon_oracion.png",
    arcangel: "Sandalfón",
    shortMsg: "Tus oraciones tienen poder divino"
  },

  // URIEL (3 cartas)
  {
    code: "uriel_ideas_brillantes",
    name: "Arcángel Uriel - Ideas Brillantes",
    description: "Uriel ilumina tu mente con ideas brillantes e innovadoras. Las soluciones creativas que necesitas están fluyendo hacia ti. Tu mente está siendo iluminada con sabiduría divina.",
    imageUrl: "/oraculo/arcangeles_cartas/uriel_ideas_brillantes.png",
    arcangel: "Uriel",
    shortMsg: "Las ideas brillantes fluyen hacia ti"
  },
  {
    code: "uriel_paz_interior",
    name: "Arcángel Uriel - Paz Interior",
    description: "Uriel llena tu corazón con paz interior profunda. Las tormentas emocionales se calman y encuentras serenidad en medio del caos. Tu centro de paz es inquebrantable.",
    imageUrl: "/oraculo/arcangeles_cartas/uriel_paz_interior.png",
    arcangel: "Uriel",
    shortMsg: "La paz interior es tu fortaleza"
  },
  {
    code: "uriel_resolucion_problemas",
    name: "Arcángel Uriel - Resolución de Problemas",
    description: "Uriel te da la sabiduría para resolver cualquier problema que enfrentes. Las respuestas están dentro de ti, iluminadas por su llama dorada de sabiduría. Confía en tu sabiduría interior.",
    imageUrl: "/oraculo/arcangeles_cartas/uriel_resolucion_problemas.png",
    arcangel: "Uriel",
    shortMsg: "Tienes la sabiduría para resolver todo"
  },

  // ZADKIEL (3 cartas)
  {
    code: "zadkiel_misericordia",
    name: "Arcángel Zadkiel - Misericordia Divina",
    description: "Zadkiel te envuelve en misericordia divina. Todos tus errores son perdonados y tu corazón se libera de la culpa. La compasión divina sana todas las heridas del pasado.",
    imageUrl: "/oraculo/arcangeles_cartas/zadkiel_misericordia.png",
    arcangel: "Zadkiel",
    shortMsg: "La misericordia divina te abraza"
  },
  {
    code: "zadkiel_perdon",
    name: "Arcángel Zadkiel - Perdón Liberador",
    description: "Zadkiel te ayuda a perdonar completamente, liberándote de las cadenas del resentimiento. El perdón no es para otros, es tu regalo de libertad para ti mismo/a.",
    imageUrl: "/oraculo/arcangeles_cartas/zadkiel_perdon.png",
    arcangel: "Zadkiel",
    shortMsg: "El perdón te libera completamente"
  },
  {
    code: "zadkiel_transformacion",
    name: "Arcángel Zadkiel - Transformación Alquímica",
    description: "Zadkiel facilita tu transformación más profunda. Como un alquimista divino, él transforma todo dolor en sabiduría, toda oscuridad en luz. Estás renaciendo en una versión más elevada de ti mismo/a.",
    imageUrl: "/oraculo/arcangeles_cartas/zadkiel_transformacion.png",
    arcangel: "Zadkiel",
    shortMsg: "Tu transformación divina está completa"
  }
];

// 15 CARTAS DE CHAT DE ARCÁNGELES
const CHAT_CARDS = [
  {
    code: "ariel_chat",
    name: "Conversación con Arcángel Ariel",
    description: "Conecta directamente con Ariel, el León de Dios, para recibir guía sobre abundancia, naturaleza y manifestación. Ariel te ayuda a conectar con la Madre Tierra y sus bendiciones.",
    imageUrl: "/oraculo/arcangeles-chat/ariel_chat.png",
    arcangel: "Ariel",
    shortMsg: "Conversación directa con el guardián de la naturaleza"
  },
  {
    code: "azrael_chat",
    name: "Conversación con Arcángel Azrael",
    description: "Habla con Azrael, el ángel del consuelo, para recibir sanación emocional y guía en momentos de pérdida, transición y transformación profunda.",
    imageUrl: "/oraculo/arcangeles-chat/azrael_chat.png",
    arcangel: "Azrael",
    shortMsg: "Conversación con el consolador divino"
  },
  {
    code: "chamuel_chat",
    name: "Conversación con Arcángel Chamuel",
    description: "Conecta con Chamuel, el ángel del amor, para recibir guía en relaciones, amor propio, paz familiar y sanación del corazón.",
    imageUrl: "/oraculo/arcangeles-chat/chamuel_chat.png",
    arcangel: "Chamuel",
    shortMsg: "Conversación sobre amor y relaciones"
  },
  {
    code: "gabriel_chat",
    name: "Conversación con Arcángel Gabriel",
    description: "Dialoga con Gabriel, el mensajero divino, para recibir claridad en la comunicación, inspiración creativa y mensajes importantes de lo divino.",
    imageUrl: "/oraculo/arcangeles-chat/gabriel_chat.png",
    arcangel: "Gabriel",
    shortMsg: "Conversación con el mensajero divino"
  },
  {
    code: "haniel_chat",
    name: "Conversación con Arcángel Haniel",
    description: "Conecta con Haniel para despertar tu energía femenina sagrada, intuición, gracia y amor propio. Ella te ayuda a brillar con tu luz única.",
    imageUrl: "/oraculo/arcangeles-chat/haniel_chat.png",
    arcangel: "Haniel",
    shortMsg: "Conversación sobre energía femenina divina"
  },
  {
    code: "jeremiel_chat",
    name: "Conversación con Arcángel Jeremiel",
    description: "Habla con Jeremiel para desarrollar tus dones psíquicos, recibir visiones proféticas y hacer una revisión compasiva de tu vida.",
    imageUrl: "/oraculo/arcangeles-chat/jeremiel_chat.png",
    arcangel: "Jeremiel",
    shortMsg: "Conversación sobre visiones y dones psíquicos"
  },
  {
    code: "jofiel_chat",
    name: "Conversación con Arcángel Jofiel",
    description: "Conecta con Jofiel para transformar pensamientos negativos, ver la belleza en todo y crear una mentalidad de abundancia y positividad.",
    imageUrl: "/oraculo/arcangeles-chat/jofiel_chat.png",
    arcangel: "Jofiel",
    shortMsg: "Conversación sobre belleza y pensamientos positivos"
  },
  {
    code: "metatron_chat",
    name: "Conversación con Arcángel Metatrón",
    description: "Dialoga con Metatrón para acceder a sabiduría cósmica, geometría sagrada, sanación del niño interior y registros akáshicos.",
    imageUrl: "/oraculo/arcangeles-chat/metatron_chat.png",
    arcangel: "Metatrón",
    shortMsg: "Conversación sobre sabiduría cósmica"
  },
  {
    code: "miguel_chat",
    name: "Conversación con Arcángel Miguel",
    description: "Habla con Miguel, el príncipe de los arcángeles, para recibir protección, liberación de miedos y alineación con la voluntad divina.",
    imageUrl: "/oraculo/arcangeles-chat/miguel_chat.png",
    arcangel: "Miguel",
    shortMsg: "Conversación con el protector divino"
  },
  {
    code: "rafael_chat",
    name: "Conversación con Arcángel Rafael",
    description: "Conecta con Rafael, el sanador divino, para recibir sanación física, emocional y espiritual, así como guía para vivir en verdad.",
    imageUrl: "/oraculo/arcangeles-chat/rafael_chat.png",
    arcangel: "Rafael",
    shortMsg: "Conversación sobre sanación y verdad"
  },
  {
    code: "raguel_chat",
    name: "Conversación con Arcángel Raguel",
    description: "Dialoga con Raguel para restaurar justicia, armonía y equilibrio en tu vida y relaciones. Él trae paz donde hay conflicto.",
    imageUrl: "/oraculo/arcangeles-chat/raguel_chat.png",
    arcangel: "Raguel",
    shortMsg: "Conversación sobre justicia y armonía"
  },
  {
    code: "raziel_chat",
    name: "Conversación con Arcángel Raziel",
    description: "Conecta con Raziel para acceder a secretos divinos, alquimia espiritual y el poder de la manifestación consciente.",
    imageUrl: "/oraculo/arcangeles-chat/raziel_chat.png",
    arcangel: "Raziel",
    shortMsg: "Conversación sobre misterios y manifestación"
  },
  {
    code: "sandalfon_chat",
    name: "Conversación con Arcángel Sandalfón",
    description: "Habla con Sandalfón para fortalecer el poder de tus oraciones, conectar con música celestial y enviar mensajes al cielo.",
    imageUrl: "/oraculo/arcangeles-chat/sandalfon_chat.png",
    arcangel: "Sandalfón",
    shortMsg: "Conversación sobre oraciones y música celestial"
  },
  {
    code: "uriel_chat",
    name: "Conversación con Arcángel Uriel",
    description: "Conecta con Uriel para recibir sabiduría, ideas brillantes, paz interior y soluciones creativas a tus desafíos.",
    imageUrl: "/oraculo/arcangeles-chat/uriel_chat.png",
    arcangel: "Uriel",
    shortMsg: "Conversación sobre sabiduría e iluminación"
  },
  {
    code: "zadquiel_chat",
    name: "Conversación con Arcángel Zadquiel",
    description: "Dialoga con Zadquiel para experimentar misericordia divina, perdón liberador y transformación alquímica del alma.",
    imageUrl: "/oraculo/arcangeles-chat/zadquiel_chat.png",
    arcangel: "Zadquiel",
    shortMsg: "Conversación sobre misericordia y transformación"
  }
];

async function updateOracleCards() {
  console.log('🃏 Actualizando cartas del oráculo con las 45 cartas completas + 15 de chat...\n');

  try {
    // Limpiar cartas existentes
    console.log('🧹 Limpiando cartas existentes...');
    await prisma.card.deleteMany({});
    
    let createdCount = 0;

    // Crear las 45 cartas del oráculo principal
    console.log('📚 Creando 45 cartas del oráculo principal...');
    for (const cardData of ORACLE_CARDS_COMPLETE) {
      const card = await prisma.card.create({
        data: cardData
      });
      createdCount++;
      console.log(`✅ ${createdCount}/60 - ${card.name}`);
    }

    // Crear las 15 cartas de chat
    console.log('\n💬 Creando 15 cartas de chat...');
    for (const chatCard of CHAT_CARDS) {
      const card = await prisma.card.create({
        data: chatCard
      });
      createdCount++;
      console.log(`✅ ${createdCount}/60 - ${card.name}`);
    }

    console.log(`\n🎉 ¡Actualización completada!`);
    console.log(`📊 Total de cartas creadas: ${createdCount}`);
    console.log(`- 45 Cartas del Oráculo Principal`);
    console.log(`- 15 Cartas de Chat con Arcángeles`);
    
    // Verificar el total
    const totalCards = await prisma.card.count();
    console.log(`\n✅ Verificación: ${totalCards} cartas en la base de datos`);

  } catch (error) {
    console.error('❌ Error al actualizar las cartas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOracleCards();