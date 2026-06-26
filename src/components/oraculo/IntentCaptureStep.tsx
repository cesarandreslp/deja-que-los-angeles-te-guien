'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface IntentCaptureStepProps {
  intent: string;
  setIntent: (intent: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function IntentCaptureStep({ intent, setIntent, onNext, onPrevious }: IntentCaptureStepProps) {
  const [isValid, setIsValid] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);

  // Validación mejorada de la intención
  const validateIntent = (text: string): boolean => {
    if (!text || text.trim().length === 0) return false;
    
    // Verificar que tenga al menos una palabra real (al menos 2 caracteres y contiene letras)
    const words = text.trim().split(/\s+/);
    const hasValidWord = words.some(word => 
      word.length >= 2 && /[a-zA-ZÀ-ÿ]/.test(word)
    );
    
    return hasValidWord;
  };

  const handleContinue = () => {
    const valid = validateIntent(intent);
    setIsValid(valid);
    
    if (valid) {
      setShowError(false);
      onNext();
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIntent(e.target.value);
    if (showError && validateIntent(e.target.value)) {
      setShowError(false);
      setIsValid(true);
    }
  };

  const exampleQuestions = [
    "¿Qué necesito saber sobre mi futuro amoroso?",
    "¿Cuál es mi propósito de vida en este momento?",
    "¿Cómo puedo superar los obstáculos actuales?",
    "¿Qué mensaje tienen los ángeles para mí hoy?",
    "¿Debo tomar esa oportunidad laboral?",
    "¿Cómo puedo sanar mi corazón?"
  ];

  return (
    <div className="text-center space-y-8">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent mb-4">
          Comparte tu Intención
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Los Arcángeles escuchan las palabras de tu corazón. Expresa tu pregunta o intención con sinceridad y claridad.
        </p>
      </motion.div>

      {/* Formulario de intención */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Icono y descripción */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Heart className="w-8 h-8 text-pink-400" />
              <span className="text-lg font-medium text-white">Tu consulta sagrada</span>
              <Heart className="w-8 h-8 text-pink-400" />
            </div>

            {/* Campo de texto */}
            <div className="relative">
              <textarea
                value={intent}
                onChange={handleInputChange}
                placeholder="Escribe aquí tu pregunta o intención para los Arcángeles..."
                className={`
                  w-full h-32 p-4 bg-black/30 backdrop-blur-sm border-2 rounded-2xl 
                  text-white placeholder-white/50 resize-none focus:outline-none 
                  transition-all duration-300 font-medium text-lg leading-relaxed
                  ${showError 
                    ? 'border-red-400 focus:border-red-300' 
                    : 'border-white/30 focus:border-cyan-400'
                  }
                `}
                maxLength={500}
              />
              
              {/* Contador de caracteres */}
              <div className="absolute bottom-2 right-2 text-xs text-white/50">
                {intent.length}/500
              </div>
            </div>

            {/* Error de validación */}
            {showError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">
                  Por favor, escribe una pregunta válida con al menos una palabra real. Los Arcángeles necesitan entender tu intención.
                </span>
              </motion.div>
            )}

            {/* Consejos para escribir - Modal hover */}
            <div className="relative">
              <div 
                className="cursor-pointer bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-3 hover:bg-cyan-500/20 transition-all duration-300"
                onMouseEnter={() => setShowTipsModal(true)}
                onMouseLeave={() => setShowTipsModal(false)}
              >
                <h4 className="text-cyan-300 font-medium flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Consejos para tu consulta
                  <span className="ml-2 text-xs text-cyan-400/70">(hover para ver)</span>
                </h4>
              </div>
              
              {/* Modal de consejos */}
              <AnimatePresence>
                {showTipsModal && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-0 right-full mr-4 w-80 bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 rounded-xl p-4 shadow-2xl z-50"
                    onMouseEnter={() => setShowTipsModal(true)}
                    onMouseLeave={() => setShowTipsModal(false)}
                  >
                    <div className="text-cyan-300 font-medium mb-3 text-center">
                      💡 Consejos para tu consulta
                    </div>
                    <ul className="text-white/80 text-sm space-y-2 text-left">
                      <li className="flex items-start">
                        <span className="text-cyan-400 mr-2">•</span>
                        Sé específico pero abierto a la guía divina
                      </li>
                      <li className="flex items-start">
                        <span className="text-cyan-400 mr-2">•</span>
                        Escribe desde el corazón, con sinceridad
                      </li>
                      <li className="flex items-start">
                        <span className="text-cyan-400 mr-2">•</span>
                        Puedes preguntar sobre amor, trabajo, salud o espiritualidad
                      </li>
                      <li className="flex items-start">
                        <span className="text-cyan-400 mr-2">•</span>
                        Los Arcángeles responden con amor y sabiduría
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ejemplos de preguntas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h3 className="text-lg font-medium text-white/80 mb-4">
          ✨ Ejemplos de consultas inspiradoras:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exampleQuestions.map((question, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIntent(question)}
              className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-3 text-left text-white/70 hover:text-white transition-all duration-300 text-sm"
            >
              "{question}"
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Botones de navegación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
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
          whileHover={{ scale: intent.trim() ? 1.05 : 1 }}
          whileTap={{ scale: intent.trim() ? 0.95 : 1 }}
          onClick={handleContinue}
          disabled={!intent.trim()}
          className={`
            font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2
            ${intent.trim() 
              ? 'bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white shadow-fuchsia-500/25 hover:shadow-fuchsia-400/35' 
              : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          <span>Continuar al video de oración</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Mensaje de confianza */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="text-white/60 text-sm"
      >
        🔒 Tu consulta es privada y sagrada. Los Arcángeles guardan tu confianza con amor.
      </motion.div>
    </div>
  );
}