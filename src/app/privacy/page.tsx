'use client'

import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  LockClosedIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function PrivacyPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const sections = [
    {
      id: 'introduction',
      title: '1. Introducción',
      icon: <InformationCircleIcon className="h-6 w-6" />,
      content: [
        'En Oráculo Angelical, valoramos profundamente su privacidad y nos comprometemos a proteger su información personal.',
        'Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos su información cuando utiliza nuestros servicios.',
        'Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política.',
        'Nos reservamos el derecho de actualizar esta política periódicamente para reflejar cambios en nuestras prácticas o por razones legales.'
      ]
    },
    {
      id: 'information-collected',
      title: '2. Información que Recopilamos',
      icon: <DocumentTextIcon className="h-6 w-6" />,
      content: [
        'Información de Registro: Nombre completo, correo electrónico, fecha de nacimiento, país, género y número de teléfono.',
        'Información de Perfil: Foto de perfil, preferencias de usuario y configuraciones de cuenta.',
        'Información de Consultas: Detalles de videoconsultas, notas de sesiones y evaluaciones.',
        'Información de Pago: Datos de facturación y métodos de pago (procesados por terceros seguros).',
        'Información de Uso: Páginas visitadas, tiempo de permanencia, interacciones con el contenido.',
        'Información Técnica: Dirección IP, tipo de navegador, dispositivo utilizado y cookies.'
      ]
    },
    {
      id: 'how-we-use',
      title: '3. Cómo Utilizamos su Información',
      icon: <CogIcon className="h-6 w-6" />,
      content: [
        'Proporcionar y mejorar nuestros servicios de orientación espiritual y consultas angelicales.',
        'Procesar pagos y gestionar su cuenta y membresías.',
        'Comunicarnos con usted sobre servicios, actualizaciones y promociones.',
        'Personalizar su experiencia basándose en sus preferencias y uso.',
        'Garantizar la seguridad de la plataforma y prevenir fraudes.',
        'Cumplir con obligaciones legales y regulatorias.',
        'Realizar análisis para mejorar nuestros servicios y desarrollar nuevas funcionalidades.'
      ]
    },
    {
      id: 'information-sharing',
      title: '4. Compartir Información',
      icon: <UserGroupIcon className="h-6 w-6" />,
      content: [
        'No vendemos, alquilamos ni intercambiamos su información personal con terceros para marketing.',
        'Compartimos información con proveedores de servicios que nos ayudan a operar (hosting, pagos, emails).',
        'Los consultores pueden acceder a información relevante para proporcionar servicios de consulta.',
        'Podemos compartir información agregada y anonimizada para análisis estadísticos.',
        'Divulgaremos información si es requerido por ley o para proteger nuestros derechos legales.',
        'En caso de fusión o venta, la información puede transferirse al nuevo propietario con notificación previa.'
      ]
    },
    {
      id: 'data-security',
      title: '5. Seguridad de Datos',
      icon: <LockClosedIcon className="h-6 w-6" />,
      content: [
        'Implementamos medidas técnicas y organizacionales para proteger su información personal.',
        'Utilizamos encriptación SSL/TLS para proteger la transmisión de datos sensibles.',
        'Las contraseñas se almacenan utilizando técnicas de hash seguras.',
        'Restringimos el acceso a información personal solo al personal autorizado.',
        'Realizamos auditorías regulares de seguridad y actualizamos nuestros sistemas.',
        'Sin embargo, ningún método de transmisión por internet es 100% seguro.',
        'Le notificaremos inmediatamente en caso de cualquier violación de seguridad que pueda afectarle.'
      ]
    },
    {
      id: 'data-retention',
      title: '6. Retención de Datos',
      icon: <EyeIcon className="h-6 w-6" />,
      content: [
        'Conservamos su información personal mientras su cuenta esté activa o según sea necesario para proporcionar servicios.',
        'Los datos de consultas se conservan por un período de 7 años para fines de seguimiento y mejora del servicio.',
        'La información de pagos se conserva según los requisitos legales de facturación (generalmente 5 años).',
        'Los datos de marketing se conservan hasta que retire su consentimiento.',
        'Puede solicitar la eliminación de sus datos personales en cualquier momento.',
        'Algunos datos pueden conservarse de forma anonimizada para análisis estadísticos.'
      ]
    },
    {
      id: 'your-rights',
      title: '7. Sus Derechos',
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      content: [
        'Derecho de Acceso: Puede solicitar una copia de toda la información personal que tenemos sobre usted.',
        'Derecho de Rectificación: Puede actualizar o corregir información inexacta o incompleta.',
        'Derecho de Eliminación: Puede solicitar la eliminación de su información personal ("derecho al olvido").',
        'Derecho de Portabilidad: Puede solicitar sus datos en un formato estructurado y legible por máquina.',
        'Derecho de Oposición: Puede oponerse al procesamiento de sus datos para marketing directo.',
        'Derecho de Limitación: Puede solicitar la restricción del procesamiento en ciertas circunstancias.',
        'Para ejercer estos derechos, contáctenos a través de privacy@oraculoangelical.com'
      ]
    },
    {
      id: 'cookies',
      title: '8. Cookies y Tecnologías Similares',
      icon: <CogIcon className="h-6 w-6" />,
      content: [
        'Utilizamos cookies para mejorar su experiencia de navegación y proporcionar funcionalidades.',
        'Cookies Esenciales: Necesarias para el funcionamiento básico del sitio web.',
        'Cookies de Rendimiento: Nos ayudan a entender cómo interactúa con nuestros servicios.',
        'Cookies de Funcionalidad: Recuerdan sus preferencias y configuraciones.',
        'Cookies de Marketing: Utilizadas para mostrar contenido relevante y medir la efectividad de campañas.',
        'Puede gestionar las preferencias de cookies a través de la configuración de su navegador.',
        'Tenga en cuenta que deshabilitar cookies puede afectar la funcionalidad del sitio.'
      ]
    },
    {
      id: 'third-party',
      title: '9. Servicios de Terceros',
      icon: <UserGroupIcon className="h-6 w-6" />,
      content: [
        'Utilizamos servicios de terceros como MercadoPago, Stripe y PayPal para procesar pagos.',
        'Google Analytics para análisis de uso del sitio web (puede optar por no participar).',
        'Servicios de email como Nodemailer para comunicaciones automatizadas.',
        'Servicios de hosting y almacenamiento en la nube para infraestructura.',
        'Estos terceros tienen sus propias políticas de privacidad que rigen el uso de su información.',
        'No somos responsables de las prácticas de privacidad de estos servicios externos.',
        'Le recomendamos revisar las políticas de privacidad de todos los servicios que utiliza.'
      ]
    },
    {
      id: 'international',
      title: '10. Transferencias Internacionales',
      icon: <InformationCircleIcon className="h-6 w-6" />,
      content: [
        'Su información puede ser procesada y almacenada en países fuera de su ubicación.',
        'Nos aseguramos de que cualquier transferencia internacional cumpla con las leyes aplicables.',
        'Implementamos salvaguardas apropiadas como cláusulas contractuales estándar.',
        'Si se encuentra en la Unión Europea, sus datos pueden transferirse a países con decisiones de adecuación.',
        'Tiene derecho a obtener información sobre las salvaguardas implementadas para proteger sus datos.',
        'Cualquier transferencia se realiza únicamente para los propósitos descritos en esta política.'
      ]
    },
    {
      id: 'minors',
      title: '11. Menores de Edad',
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
      content: [
        'Nuestros servicios están dirigidos a personas mayores de 18 años.',
        'No recopilamos intencionalmente información personal de menores de 18 años.',
        'Si descubrimos que hemos recopilado información de un menor, la eliminaremos inmediatamente.',
        'Los padres o tutores deben supervisar el uso de internet de sus hijos.',
        'Si es padre o tutor y cree que su hijo nos ha proporcionado información personal, contáctenos.',
        'Para usuarios entre 16-18 años, requerimos consentimiento parental para el procesamiento de datos.'
      ]
    },
    {
      id: 'changes',
      title: '12. Cambios a Esta Política',
      icon: <DocumentTextIcon className="h-6 w-6" />,
      content: [
        'Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas.',
        'Los cambios importantes serán notificados por email o mediante aviso prominente en nuestro sitio web.',
        'La fecha de "última actualización" al inicio de esta política indica cuándo se realizaron los cambios más recientes.',
        'Su uso continuado de nuestros servicios después de los cambios constituye la aceptación de la nueva política.',
        'Si no está de acuerdo con los cambios, puede cerrar su cuenta y dejar de usar nuestros servicios.',
        'Le recomendamos revisar esta política periódicamente para mantenerse informado sobre cómo protegemos su información.'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-md rounded-full p-6">
                <ShieldCheckIcon className="h-16 w-16 text-green-300" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Política de Privacidad 🔒
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 leading-relaxed mb-8">
              Su privacidad es sagrada para nosotros. Conozca cómo protegemos y utilizamos su información personal
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <p className="text-lg text-blue-200">
                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-MX', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contenido */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Resumen Ejecutivo */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <ShieldCheckIcon className="h-6 w-6 text-green-400" />
              Compromiso con su Privacidad
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <LockClosedIcon className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Protección Total</h3>
                <p className="text-gray-300 text-sm">Encriptación y seguridad de grado empresarial</p>
              </div>
              <div className="text-center">
                <EyeIcon className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Transparencia</h3>
                <p className="text-gray-300 text-sm">Información clara sobre el uso de sus datos</p>
              </div>
              <div className="text-center">
                <UserGroupIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Control Total</h3>
                <p className="text-gray-300 text-sm">Usted decide qué información compartir</p>
              </div>
            </div>
          </motion.div>

          {/* Índice */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Contenidos de la Política</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="text-purple-400">
                    {section.icon}
                  </div>
                  <span className="text-gray-200 hover:text-white transition-colors">
                    {section.title}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Secciones */}
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 scroll-mt-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-400 to-blue-400 rounded-full p-3 text-white">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              </div>
              
              <div className="space-y-4">
                {section.content.map((paragraph, pIndex) => (
                  <div key={pIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-200 leading-relaxed">{paragraph}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Configuración de Privacidad */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-8 mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Gestione su Privacidad 🛡️
            </h2>
            <p className="text-xl text-blue-200 text-center mb-8">
              Tome control de su información personal con nuestras herramientas de privacidad
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <EyeIcon className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Ver Datos</h3>
                <p className="text-gray-300 text-sm mb-4">Acceda a toda su información personal</p>
                <button className="w-full bg-green-500/20 text-green-300 py-2 rounded-lg hover:bg-green-500/30 transition-colors">
                  Solicitar Datos
                </button>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <CogIcon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Actualizar</h3>
                <p className="text-gray-300 text-sm mb-4">Modifique su información personal</p>
                <a 
                  href="/profile"
                  className="block w-full bg-blue-500/20 text-blue-300 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Ir a Perfil
                </a>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <LockClosedIcon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Eliminar</h3>
                <p className="text-gray-300 text-sm mb-4">Solicite la eliminación de sus datos</p>
                <button className="w-full bg-red-500/20 text-red-300 py-2 rounded-lg hover:bg-red-500/30 transition-colors">
                  Eliminar Cuenta
                </button>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <DocumentTextIcon className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Exportar</h3>
                <p className="text-gray-300 text-sm mb-4">Descargue sus datos en formato ZIP</p>
                <button className="w-full bg-yellow-500/20 text-yellow-300 py-2 rounded-lg hover:bg-yellow-500/30 transition-colors">
                  Exportar Datos
                </button>
              </div>
            </div>
          </motion.div>

          {/* Contacto para Privacidad */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-8"
          >
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              ¿Preguntas sobre Privacidad? 🤔
            </h2>
            <p className="text-xl text-blue-200 text-center mb-8">
              Nuestro equipo de privacidad está aquí para ayudarle
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 rounded-2xl p-6">
                <ShieldCheckIcon className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Oficial de Privacidad</h3>
                <p className="text-gray-300">privacy@oraculoangelical.com</p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6">
                <InformationCircleIcon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Soporte GDPR</h3>
                <p className="text-gray-300">gdpr@oraculoangelical.com</p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6">
                <DocumentTextIcon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Legal</h3>
                <p className="text-gray-300">legal@oraculoangelical.com</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-300 text-sm">
                Versión de Política: 2.0 | Cumple con GDPR, LGPD y CCPA | Vigente desde: {new Date().toLocaleDateString('es-MX')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}