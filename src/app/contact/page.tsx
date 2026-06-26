'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  consultationType: string
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    consultationType: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        setSubmitted(true)
        setForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          consultationType: 'general'
        })
      } else {
        alert('Error al enviar el mensaje. Por favor intenta nuevamente.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar el mensaje. Por favor intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const contactInfo = [
    {
      icon: <EnvelopeIcon className="h-6 w-6" />,
      title: "Email",
      content: "contacto@oraculoangelical.com",
      description: "Respuesta en 24 horas"
    },
    {
      icon: <PhoneIcon className="h-6 w-6" />,
      title: "Teléfono",
      content: "+52 (55) 1234-5678",
      description: "Lun - Vie: 9:00 AM - 6:00 PM"
    },
    {
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
      title: "WhatsApp",
      content: "+52 (55) 8765-4321",
      description: "Disponible 24/7"
    },
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: "Ubicación",
      content: "Ciudad de México, México",
      description: "Consultas presenciales disponibles"
    }
  ]

  const consultationTypes = [
    { value: 'general', label: 'Consulta General' },
    { value: 'spiritual', label: 'Orientación Espiritual' },
    { value: 'healing', label: 'Sanación Energética' },
    { value: 'business', label: 'Consulta de Negocios' },
    { value: 'membership', label: 'Información sobre Membresías' },
    { value: 'technical', label: 'Soporte Técnico' },
    { value: 'other', label: 'Otro' }
  ]

  const faqs = [
    {
      question: "¿Cuánto tiempo toma recibir una respuesta?",
      answer: "Respondemos todos los mensajes dentro de 24 horas. Para consultas urgentes, puedes contactarnos por WhatsApp."
    },
    {
      question: "¿Ofrecen consultas presenciales?",
      answer: "Sí, ofrecemos consultas presenciales en nuestra ubicación en Ciudad de México, así como videoconsultas para cualquier parte del mundo."
    },
    {
      question: "¿Cómo puedo agendar una consulta?",
      answer: "Puedes agendar directamente desde nuestra plataforma o contactarnos para asistencia personalizada en la programación."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos MercadoPago, Stripe, PayPal y transferencias bancarias. También ofrecemos planes de pago para consultas especiales."
    }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              ¡Mensaje Enviado!
            </h2>
            <p className="text-blue-200 mb-6">
              Gracias por contactarnos. Los ángeles han recibido tu mensaje y 
              te responderemos dentro de 24 horas.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Enviar Otro Mensaje
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

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
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Contáctanos 💌
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 leading-relaxed">
              Los ángeles están listos para escucharte. Conéctate con nosotros 
              para recibir la guía divina que tu alma necesita
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Información de Contacto */}
          <div className="lg:col-span-1">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <HeartIcon className="h-6 w-6 text-purple-400" />
                Información de Contacto
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{info.title}</h3>
                      <p className="text-blue-200 font-medium">{info.content}</p>
                      <p className="text-gray-300 text-sm">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Horarios */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ClockIcon className="h-6 w-6 text-blue-400" />
                Horarios de Atención
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Lunes - Viernes</span>
                  <span className="text-white font-semibold">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Sábados</span>
                  <span className="text-white font-semibold">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Domingos</span>
                  <span className="text-white font-semibold">12:00 PM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">WhatsApp</span>
                  <span className="text-green-400 font-semibold">24/7</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/20 rounded-xl">
                <p className="text-blue-200 text-sm">
                  💫 Las consultas de emergencia espiritual están disponibles 
                  las 24 horas a través de WhatsApp
                </p>
              </div>
            </motion.div>
          </div>

          {/* Formulario de Contacto */}
          <div className="lg:col-span-2">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Envíanos un Mensaje ✨
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre y Email */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                {/* Teléfono y Tipo de Consulta */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="+52 (55) 1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Tipo de Consulta *
                    </label>
                    <select
                      name="consultationType"
                      value={form.consultationType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    >
                      {consultationTypes.map((type) => (
                        <option key={type.value} value={type.value} className="bg-gray-800">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Asunto */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                    placeholder="Comparte con nosotros tu consulta o necesidad. Los ángeles están escuchando..."
                  />
                </div>

                {/* Botón de Envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5" />
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* FAQ Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Preguntas Frecuentes ❓
            </h2>
            <p className="text-xl text-blue-200">
              Respuestas a las consultas más comunes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              ¿Necesitas Orientación Inmediata? 🆘
            </h2>
            <p className="text-xl text-blue-200 mb-6">
              Para consultas urgentes o situaciones que requieren atención inmediata
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5518765432"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                WhatsApp 24/7
              </a>
              <a
                href="/book-consultation"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Agendar Consulta
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}