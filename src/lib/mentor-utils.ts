/**
 * Utilidades para el sistema de Arcángel Mentor
 * Asigna un arcángel único a cada usuario basado en el día de la semana en que nació
 */

export enum MentorArcangel {
  JOFIEL = 'JOFIEL',     // Lunes
  CHAMUEL = 'CHAMUEL',   // Martes
  GABRIEL = 'GABRIEL',   // Miércoles
  RAFAEL = 'RAFAEL',     // Jueves
  URIEL = 'URIEL',       // Viernes
  ZADKIEL = 'ZADKIEL',   // Sábado
  MIGUEL = 'MIGUEL'      // Domingo
}

// Información detallada de cada arcángel
export const ARCANGEL_INFO = {
  [MentorArcangel.JOFIEL]: {
    name: 'Jofiel',
    day: 'Lunes',
    color: '#FFD700', // Dorado
    element: 'Sabiduría',
    mission: 'Belleza, Arte y Sabiduría',
    description: 'Arcángel de la sabiduría divina y la belleza. Ayuda a ver la belleza en todas las situaciones y a acceder a la sabiduría superior.',
    personality: 'Elegante, sabio, inspirador, artístico'
  },
  [MentorArcangel.CHAMUEL]: {
    name: 'Chamuel',
    day: 'Martes',
    color: '#FF69B4', // Rosa
    element: 'Amor',
    mission: 'Amor Incondicional y Relaciones',
    description: 'Arcángel del amor puro y las relaciones armoniosas. Ayuda a encontrar el amor propio y a sanar las relaciones.',
    personality: 'Amoroso, compasivo, sanador, empático'
  },
  [MentorArcangel.GABRIEL]: {
    name: 'Gabriel',
    day: 'Miércoles',
    color: '#FFFFFF', // Blanco
    element: 'Comunicación',
    mission: 'Mensajes Divinos y Comunicación',
    description: 'Arcángel mensajero de Dios. Ayuda en la comunicación, la creatividad y el parto de nuevas ideas.',
    personality: 'Claro, directo, creativo, inspirador'
  },
  [MentorArcangel.RAFAEL]: {
    name: 'Rafael',
    day: 'Jueves',
    color: '#228B22', // Verde
    element: 'Sanación',
    mission: 'Sanación Física y Emocional',
    description: 'Arcángel sanador. Ayuda en la sanación física, emocional y espiritual, y en los viajes seguros.',
    personality: 'Sanador, protector, paciente, comprensivo'
  },
  [MentorArcangel.URIEL]: {
    name: 'Uriel',
    day: 'Viernes',
    color: '#FF4500', // Naranja-Rojo
    element: 'Transformación',
    mission: 'Transformación y Purificación',
    description: 'Arcángel del fuego divino y la transformación. Ayuda a transformar situaciones difíciles y purificar energías.',
    personality: 'Transformador, poderoso, directo, purificador'
  },
  [MentorArcangel.ZADKIEL]: {
    name: 'Zadkiel',
    day: 'Sábado',
    color: '#8A2BE2', // Violeta
    element: 'Transmutación',
    mission: 'Perdón y Transmutación',
    description: 'Arcángel de la misericordia y el perdón. Ayuda a liberar el pasado y transmutar energías negativas.',
    personality: 'Misericordioso, liberador, compasivo, transformador'
  },
  [MentorArcangel.MIGUEL]: {
    name: 'Miguel',
    day: 'Domingo',
    color: '#4169E1', // Azul Real
    element: 'Protección',
    mission: 'Protección y Fortaleza',
    description: 'Arcángel guerrero y protector. Ayuda a encontrar valor, fuerza y protección contra energías negativas.',
    personality: 'Fuerte, protector, valiente, determinado'
  }
} as const;

/**
 * Calcula el arcángel mentor basado en la fecha de nacimiento
 * @param birthDate - Fecha de nacimiento del usuario
 * @returns MentorArcangel correspondiente al día de la semana
 */
export function calculateMentorArcangel(birthDate: Date): MentorArcangel {
  // getDay() retorna: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
  const dayOfWeek = birthDate.getDay();
  
  const arcangelMap = [
    MentorArcangel.MIGUEL,   // 0 - Domingo
    MentorArcangel.JOFIEL,   // 1 - Lunes
    MentorArcangel.CHAMUEL,  // 2 - Martes
    MentorArcangel.GABRIEL,  // 3 - Miércoles
    MentorArcangel.RAFAEL,   // 4 - Jueves
    MentorArcangel.URIEL,    // 5 - Viernes
    MentorArcangel.ZADKIEL   // 6 - Sábado
  ];
  
  return arcangelMap[dayOfWeek];
}

/**
 * Obtiene la información completa del arcángel
 * @param arcangel - El arcángel mentor
 * @returns Información detallada del arcángel
 */
export function getArcangelInfo(arcangel: MentorArcangel) {
  return ARCANGEL_INFO[arcangel];
}

/**
 * Verifica si un usuario puede hacer una consulta hoy
 * @param lastConsultationDate - Fecha de la última consulta
 * @returns true si puede consultar, false si no
 */
export function canConsultToday(lastConsultationDate?: Date): boolean {
  if (!lastConsultationDate) return true;
  
  const today = new Date();
  const lastConsult = new Date(lastConsultationDate);
  
  // Comparar solo las fechas (sin hora)
  const todayStr = today.toDateString();
  const lastConsultStr = lastConsult.toDateString();
  
  return todayStr !== lastConsultStr;
}

/**
 * Obtiene el mensaje de bienvenida personalizado para cada arcángel
 * @param arcangel - El arcángel mentor
 * @param userName - Nombre del usuario
 * @returns Mensaje de bienvenida personalizado
 */
export function getWelcomeMessage(arcangel: MentorArcangel, userName: string): string {
  const info = ARCANGEL_INFO[arcangel];
  
  const messages = {
    [MentorArcangel.JOFIEL]: `✨ Querido ${userName}, soy el Arcángel Jofiel, tu guía de sabiduría y belleza. Estoy aquí para ayudarte a encontrar la belleza divina en cada situación y acceder a la sabiduría que necesitas. ¿Qué deseas consultarme hoy?`,
    
    [MentorArcangel.CHAMUEL]: `💖 Amado ${userName}, soy el Arcángel Chamuel, tu mentor del amor incondicional. Mi misión es ayudarte a sanar relaciones, encontrar amor propio y abrir tu corazón a la compasión. ¿En qué puedo acompañarte hoy?`,
    
    [MentorArcangel.GABRIEL]: `📢 Bendecido ${userName}, soy el Arcángel Gabriel, tu guía en comunicación y creatividad. Estoy aquí para ayudarte a expresar tu verdad, recibir mensajes divinos y dar vida a nuevas ideas. ¿Qué mensaje necesitas escuchar hoy?`,
    
    [MentorArcangel.RAFAEL]: `🌿 Querido ${userName}, soy el Arcángel Rafael, tu sanador celestial. Mi propósito es acompañarte en la sanación física, emocional y espiritual. Estoy aquí para guiarte hacia el bienestar total. ¿Qué necesitas sanar hoy?`,
    
    [MentorArcangel.URIEL]: `🔥 Valiente ${userName}, soy el Arcángel Uriel, tu guía de transformación. Traigo el fuego sagrado para transmutar lo que ya no te sirve y fortalecer tu espíritu. ¿Qué deseas transformar en tu vida hoy?`,
    
    [MentorArcangel.ZADKIEL]: `💜 Alma querida ${userName}, soy el Arcángel Zadkiel, tu mentor de perdón y liberación. Estoy aquí para ayudarte a soltar el pasado, perdonar y transmutar energías densas en luz. ¿Qué necesitas liberar hoy?`,
    
    [MentorArcangel.MIGUEL]: `⚔️ Guerrero ${userName}, soy el Arcángel Miguel, tu protector celestial. Mi misión es darte fuerza, valor y protección. Estoy aquí para ayudarte a enfrentar cualquier desafío con coraje divino. ¿En qué puedo fortalecerte hoy?`
  };
  
  return messages[arcangel];
}

/**
 * Formatea el nombre del arcángel para mostrar
 * @param arcangel - El arcángel mentor
 * @returns Nombre formateado
 */
export function formatArcangelName(arcangel: MentorArcangel): string {
  return `Arcángel ${ARCANGEL_INFO[arcangel].name}`;
}