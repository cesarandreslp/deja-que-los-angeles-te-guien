'use client'

import { motion } from 'framer-motion'
import { 
  HeartIcon, 
  StarIcon, 
  SparklesIcon, 
  UserGroupIcon,
  EyeIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline'

export default function AboutPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const values = [
    {
      icon: <HeartIcon className="h-8 w-8" />,
      title: "Amor Incondicional",
      description: "Creemos en el poder transformador del amor angelical y su capacidad de sanar todas las heridas del alma."
    },
    {
      icon: <StarIcon className="h-8 w-8" />,
      title: "Sabiduría Divina",
      description: "Canalizamos la sabiduría ancestral de los ángeles para guiarte hacia tu verdadero propósito de vida."
    },
    {
      icon: <SparklesIcon className="h-8 w-8" />,
      title: "Transformación Espiritual",
      description: "Facilitamos procesos de transformación profunda que despiertan tu conciencia superior."
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: "Comunidad Sagrada",
      description: "Creamos un espacio seguro donde las almas afines pueden conectarse y crecer juntas."
    }
  ]

  const team = [
    {
      name: "Maestra Luminosa",
      role: "Fundadora y Oráculo Principal",
      description: "Con más de 20 años de experiencia canalizando mensajes angelicales, ha guiado a miles de personas hacia su despertar espiritual.",
      image: "✨"
    },
    {
      name: "Ángel Sanador",
      role: "Especialista en Sanación Energética",
      description: "Maestro Reiki y sanador cuántico, especializado en limpiezas áuricas y activaciones de códigos de luz.",
      image: "🌟"
    },
    {
      name: "Guardián de Cristales",
      role: "Experto en Gemoterapia",
      description: "Conocedor profundo de las propiedades energéticas de cristales y gemas sagradas para la sanación integral.",
      image: "💎"
    },
    {
      name: "Mensajera Celestial",
      role: "Consultora Angelical",
      description: "Medium especializada en comunicación con seres de luz y guías espirituales para orientación personal.",
      image: "👼"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Sobre Nosotros ✨
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 leading-relaxed">
              Somos un santuario digital donde la sabiduría angelical se encuentra 
              con la tecnología moderna para iluminar tu camino espiritual
            </p>
          </motion.div>
        </div>
      </section>

      {/* Misión Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeInUp}>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8">
                <div className="flex items-center mb-6">
                  <EyeIcon className="h-12 w-12 text-purple-400 mr-4" />
                  <h2 className="text-3xl font-bold text-white">Nuestra Misión</h2>
                </div>
                <p className="text-gray-200 text-lg leading-relaxed mb-6">
                  Conectar a las personas con la sabiduría divina de los ángeles, 
                  ofreciendo herramientas espirituales, consultas personalizadas 
                  y productos energéticos que faciliten el crecimiento personal 
                  y la transformación del alma.
                </p>
                <p className="text-blue-200 font-semibold">
                  "Cada alma merece conocer su propósito divino y vivir en armonía 
                  con el universo"
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8">
                <div className="flex items-center mb-6">
                  <HandRaisedIcon className="h-12 w-12 text-blue-400 mr-4" />
                  <h2 className="text-3xl font-bold text-white">Nuestra Visión</h2>
                </div>
                <p className="text-gray-200 text-lg leading-relaxed mb-6">
                  Ser el puente más confiable entre el mundo terrenal y el reino 
                  angelical, creando una comunidad global de seres despiertos que 
                  vibren en amor, luz y sabiduría divina.
                </p>
                <p className="text-blue-200 font-semibold">
                  "Un mundo donde cada persona viva conectada con su esencia divina 
                  y propósito sagrado"
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nuestros Valores Sagrados 🙏
            </h2>
            <p className="text-xl text-blue-200">
              Los principios divinos que guían cada una de nuestras acciones
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full text-white mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-300 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Historia Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Nuestra Historia 📖
              </h2>
              <p className="text-xl text-blue-200">
                El despertar de un sueño celestial
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8"
            >
              <div className="prose prose-lg text-gray-200 max-w-none">
                <p className="text-lg leading-relaxed mb-6">
                  En el año 2018, durante una profunda meditación bajo la luna llena, 
                  la Maestra Luminosa recibió una visión celestial: crear un espacio 
                  sagrado donde las personas pudieran acceder fácilmente a la sabiduría 
                  angelical desde cualquier lugar del mundo.
                </p>
                
                <p className="text-lg leading-relaxed mb-6">
                  Los ángeles le mostraron cómo la tecnología podría servir como un 
                  puente divino, conectando corazones sedientos de luz con la infinita 
                  sabiduría del reino celestial. Así nació Oráculo Angelical, como 
                  respuesta a un llamado divino.
                </p>
                
                <p className="text-lg leading-relaxed mb-6">
                  Desde entonces, hemos guiado a más de 10,000 almas en su despertar 
                  espiritual, ofreciendo consultas personalizadas, productos energéticos 
                  y experiencias transformadoras que han cambiado vidas en todo el mundo.
                </p>
                
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 mt-8">
                  <p className="text-blue-200 font-semibold text-center italic">
                    "No es casualidad que hayas llegado hasta aquí. Los ángeles han 
                    guiado tus pasos para que encuentres exactamente lo que tu alma necesita."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Equipo Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nuestro Equipo Celestial 👥
            </h2>
            <p className="text-xl text-blue-200">
              Guías espirituales dedicados a tu crecimiento y transformación
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-purple-300 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{member.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Estadísticas Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { number: "10,000+", label: "Almas Guiadas" },
              { number: "5,000+", label: "Consultas Realizadas" },
              { number: "2,500+", label: "Productos Energéticos" },
              { number: "98%", label: "Satisfacción Cliente" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <p className="text-blue-200 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                ¿Listo para Comenzar tu Viaje Espiritual? ✨
              </h2>
              <p className="text-xl text-blue-200 mb-8">
                Los ángeles están esperando para guiarte hacia tu más alto potencial
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/book-consultation"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Agendar Consulta
                </a>
                <a
                  href="/memberships"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Ver Membresías
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}