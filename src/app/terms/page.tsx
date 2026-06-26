'use client'

import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  ScaleIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

export default function TermsPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const sections = [
    {
      id: 'acceptance',
      title: '1. Aceptación de los Términos',
      icon: <DocumentTextIcon className="h-6 w-6" />,
      content: [
        'Al acceder y utilizar los servicios de Oráculo Angelical, usted acepta estar sujeto a estos Términos y Condiciones.',
        'Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.',
        'Nos reservamos el derecho de actualizar estos términos en cualquier momento sin previo aviso.',
        'El uso continuado del servicio después de cualquier cambio constituye la aceptación de los nuevos términos.'
      ]
    },
    {
      id: 'services',
      title: '2. Descripción de Servicios',
      icon: <InformationCircleIcon className="h-6 w-6" />,
      content: [
        'Oráculo Angelical ofrece servicios de orientación espiritual, consultas angelicales y productos energéticos.',
        'Nuestros servicios incluyen videoconsultas personalizadas, tienda de productos espirituales y planes de membresía.',
        'Los servicios se proporcionan "tal como están" y no garantizamos resultados específicos.',
        'La disponibilidad de servicios puede variar y está sujeta a cambios sin previo aviso.'
      ]
    },
    {
      id: 'account',
      title: '3. Cuentas de Usuario',
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      content: [
        'Debe proporcionar información precisa y completa al crear su cuenta.',
        'Es responsable de mantener la confidencialidad de su contraseña y cuenta.',
        'Debe notificarnos inmediatamente cualquier uso no autorizado de su cuenta.',
        'Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos.'
      ]
    },
    {
      id: 'consultations',
      title: '4. Videoconsultas y Servicios Espirituales',
      icon: <CalendarIcon className="h-6 w-6" />,
      content: [
        'Las videoconsultas deben ser pagadas antes del servicio programado.',
        'Las cancelaciones deben realizarse con al menos 24 horas de anticipación para obtener reembolso completo.',
        'Si el consultor no se presenta, se proporcionará reembolso completo o reprogramación.',
        'Los servicios espirituales son para propósitos de entretenimiento y orientación personal.',
        'No reemplazamos el consejo médico, legal o psicológico profesional.',
        'Los resultados de las consultas espirituales no están garantizados.'
      ]
    },
    {
      id: 'payments',
      title: '5. Pagos y Reembolsos',
      icon: <ScaleIcon className="h-6 w-6" />,
      content: [
        'Aceptamos pagos a través de MercadoPago, Stripe y PayPal.',
        'Todos los precios están expresados en pesos colombianos (COP) salvo que se indique lo contrario.',
        'Los reembolsos se procesan según nuestra política de reembolsos específica para cada servicio.',
        'Las membresías se facturan de forma recurrente según el plan seleccionado.',
        'Los cargos por servicios adicionales se aplicarán según las tarifas vigentes.',
        'Nos reservamos el derecho de cambiar los precios con previo aviso.'
      ]
    },
    {
      id: 'products',
      title: '6. Tienda Angelical',
      icon: <InformationCircleIcon className="h-6 w-6" />,
      content: [
        'Los productos están sujetos a disponibilidad de inventario.',
        'Los precios y descripciones de productos pueden cambiar sin previo aviso.',
        'Los gastos de envío se calculan según la ubicación de entrega.',
        'La entrega de productos físicos está sujeta a los tiempos de procesamiento y envío.',
        'Los productos defectuosos pueden ser cambiados dentro de los primeros 30 días.',
        'No nos hacemos responsables por productos dañados durante el envío por parte del transportista.'
      ]
    },
    {
      id: 'intellectual-property',
      title: '7. Propiedad Intelectual',
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      content: [
        'Todo el contenido del sitio web es propiedad de Oráculo Angelical o sus licenciantes.',
        'Está prohibido copiar, reproducir o distribuir nuestro contenido sin autorización.',
        'Las marcas comerciales y logotipos son propiedad de sus respectivos dueños.',
        'El usuario mantiene la propiedad de cualquier contenido que envíe a la plataforma.',
        'Al enviar contenido, otorga a Oráculo Angelical una licencia para usarlo en relación con el servicio.'
      ]
    },
    {
      id: 'privacy',
      title: '8. Privacidad y Protección de Datos',
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      content: [
        'Su privacidad es importante para nosotros y está protegida por nuestra Política de Privacidad.',
        'Recopilamos y procesamos datos personales de acuerdo con las leyes aplicables.',
        'La información personal se utiliza únicamente para proporcionar y mejorar nuestros servicios.',
        'No vendemos ni compartimos información personal con terceros sin consentimiento.',
        'Implementamos medidas de seguridad para proteger su información personal.'
      ]
    },
    {
      id: 'prohibited',
      title: '9. Usos Prohibidos',
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
      content: [
        'Está prohibido usar el servicio para actividades ilegales o no autorizadas.',
        'No puede intentar obtener acceso no autorizado a ninguna parte del servicio.',
        'Está prohibido interferir o interrumpir el servicio o los servidores conectados.',
        'No puede usar el servicio para transmitir virus, malware o código malicioso.',
        'Está prohibido acosar, abusar o dañar a otros usuarios o al personal.',
        'No puede usar el servicio para spam o comunicaciones comerciales no solicitadas.'
      ]
    },
    {
      id: 'limitation',
      title: '10. Limitación de Responsabilidad',
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
      content: [
        'Los servicios se proporcionan "tal como están" sin garantías de ningún tipo.',
        'No garantizamos que el servicio será ininterrumpido, seguro o libre de errores.',
        'Nuestra responsabilidad máxima no excederá el monto pagado por el servicio específico.',
        'No somos responsables por daños indirectos, incidentales o consecuenciales.',
        'Los servicios espirituales son para entretenimiento y no constituyen asesoramiento profesional.',
        'El usuario asume toda la responsabilidad por las decisiones tomadas basándose en nuestros servicios.'
      ]
    },
    {
      id: 'termination',
      title: '11. Terminación',
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
      content: [
        'Puede terminar su cuenta en cualquier momento eliminando su perfil.',
        'Nos reservamos el derecho de suspender o terminar cuentas que violen estos términos.',
        'La terminación no afecta las obligaciones de pago pendientes.',
        'Algunas disposiciones de estos términos pueden sobrevivir a la terminación de la cuenta.',
        'Los datos personales se manejarán según nuestra Política de Privacidad tras la terminación.'
      ]
    },
    {
      id: 'governing-law',
      title: '12. Ley Aplicable',
      icon: <ScaleIcon className="h-6 w-6" />,
      content: [
        'Estos términos se rigen por las leyes de México.',
        'Cualquier disputa se resolverá en los tribunales competentes de Ciudad de México.',
        'Si alguna disposición es inválida, el resto de los términos permanecerá en vigor.',
        'La falta de ejercicio de un derecho no constituye una renuncia al mismo.',
        'Estos términos constituyen el acuerdo completo entre las partes.'
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
                <DocumentTextIcon className="h-16 w-16 text-purple-300" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Términos y Condiciones ⚖️
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 leading-relaxed mb-8">
              Marco legal que rige el uso de nuestros servicios espirituales y productos angelicales
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
          {/* Introducción */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Bienvenido a Oráculo Angelical
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4">
              Estos Términos y Condiciones ("Términos") rigen su uso de los servicios ofrecidos por 
              Oráculo Angelical, incluyendo nuestro sitio web, aplicaciones móviles, videoconsultas, 
              tienda de productos espirituales y cualquier otro servicio relacionado.
            </p>
            <p className="text-blue-200 font-semibold">
              Al utilizar nuestros servicios, usted acepta cumplir con estos términos. 
              Si no está de acuerdo, por favor no utilice nuestros servicios.
            </p>
          </motion.div>

          {/* Índice */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Índice de Contenidos</h2>
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
                  <p key={pIndex} className="text-gray-200 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Información de Contacto */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-8"
          >
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              ¿Preguntas sobre estos Términos? 🤔
            </h2>
            <p className="text-xl text-blue-200 text-center mb-8">
              Si tiene preguntas sobre estos Términos y Condiciones, no dude en contactarnos
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 rounded-2xl p-6">
                <DocumentTextIcon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Email Legal</h3>
                <p className="text-gray-300">legal@oraculoangelical.com</p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6">
                <InformationCircleIcon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Soporte General</h3>
                <a 
                  href="/contact" 
                  className="text-blue-300 hover:text-blue-200 transition-colors"
                >
                  Formulario de Contacto
                </a>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-6">
                <CalendarIcon className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Horario</h3>
                <p className="text-gray-300">Lun-Vie: 9:00-18:00</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-300 text-sm">
                Versión de Términos: 1.0 | Vigente desde: {new Date().toLocaleDateString('es-MX')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}