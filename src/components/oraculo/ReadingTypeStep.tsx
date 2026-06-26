'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Star, Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReadingTypeStepProps {
  readingType: number;
  setReadingType: (type: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function ReadingTypeStep({ readingType, setReadingType, onNext, onPrevious }: ReadingTypeStepProps) {
  const readingTypes = [
    {
      type: 1,
      title: 'Lectura Directa',
      subtitle: '1 Carta',
      icon: Star,
      description: 'Una respuesta clara y directa del universo. Perfecta para preguntas específicas que requieren una guía inmediata.',
      features: ['Respuesta directa', 'Mensaje claro', 'Guía inmediata'],
      layout: 'Una carta en el centro',
      color: 'from-yellow-400 to-orange-500',
      borderColor: 'border-yellow-400/50'
    },
    {
      type: 3,
      title: 'Lectura Temporal',
      subtitle: '3 Cartas',
      icon: Eye,
      description: 'Explora el flujo del tiempo: Pasado, Presente y Futuro. Ideal para entender el panorama completo de tu situación.',
      features: ['Pasado - Origen', 'Presente - Situación actual', 'Futuro - Tendencia'],
      layout: 'Tres cartas en línea horizontal',
      color: 'from-cyan-400 to-blue-500',
      borderColor: 'border-cyan-400/50'
    },
    {
      type: 9,
      title: 'Lectura Profunda',
      subtitle: '9 Cartas',
      icon: Grid3X3,
      description: 'La lectura más completa. Matriz 3x3 que aborda tres preguntas principales con una visión integral de cada una.',
      features: ['3 preguntas principales', 'Pasado/Presente/Futuro por pregunta', 'Análisis muy detallado'],
      layout: 'Matriz de 3x3 cartas',
      color: 'from-purple-400 to-pink-500',
      borderColor: 'border-purple-400/50'
    }
  ];

  return (
    <div className="text-center space-y-8">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent mb-4">
          Elige tu Tipo de Lectura
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Cada tipo de lectura ofrece una perspectiva única. Selecciona la que resuene más con lo que tu corazón necesita saber.
        </p>
      </motion.div>

      {/* Opciones de lectura */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {readingTypes.map((type, index) => {
          const Icon = type.icon;
          const isSelected = readingType === type.type;
          
          return (
            <motion.div
              key={type.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setReadingType(type.type)}
              className={`
                relative cursor-pointer bg-white/15 backdrop-blur-xl border-2 rounded-3xl p-6 shadow-2xl transition-all duration-500
                ${isSelected 
                  ? `${type.borderColor} bg-white/25 shadow-fuchsia-500/20 shadow-2xl` 
                  : 'border-white/30 hover:border-amber-300/50 hover:bg-white/20 hover:shadow-amber-500/10'
                }
              `}
            >
              {/* Indicador de selección */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-amber-400 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg shadow-fuchsia-500/25"
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1 }}
                    className="text-white font-bold"
                  >
                    ✓
                  </motion.div>
                </motion.div>
              )}

              {/* Icono principal */}
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${type.color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Título y subtítulo */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{type.title}</h3>
                <p className={`text-sm font-medium ${isSelected ? 'text-cyan-300' : 'text-white/70'}`}>
                  {type.subtitle}
                </p>
              </div>

              {/* Descripción */}
              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                {type.description}
              </p>

              {/* Características */}
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide">
                  Características:
                </h4>
                {type.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mr-2" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Layout */}
              <div className="border-t border-white/20 pt-3">
                <p className="text-xs text-white/60">
                  <strong>Disposición:</strong> {type.layout}
                </p>
              </div>

              {/* Overlay de selección */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 rounded-3xl pointer-events-none"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Información adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center justify-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Guía para elegir
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-yellow-300 mb-1">1 Carta</div>
              <div className="text-white/70">Para decisiones rápidas y respuestas directas</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-cyan-300 mb-1">3 Cartas</div>
              <div className="text-white/70">Para entender el contexto temporal completo</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-300 mb-1">9 Cartas</div>
              <div className="text-white/70">Para análisis profundo y múltiples perspectivas</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botones de navegación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="flex items-center justify-center space-x-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevious}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 border border-amber-300/40 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-400/35 transition-all duration-300 flex items-center space-x-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Anterior</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-fuchsia-500/25 hover:from-fuchsia-400 hover:to-pink-500 hover:shadow-fuchsia-400/35 transition-all duration-300 flex items-center space-x-2"
        >
          <span>Selecciona tus cartas</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Confirmación de selección */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="text-white/60 text-sm"
      >
        ✨ Has seleccionado: <strong className="text-cyan-300">
          {readingTypes.find(t => t.type === readingType)?.title}
        </strong> ✨
      </motion.div>
    </div>
  );
}