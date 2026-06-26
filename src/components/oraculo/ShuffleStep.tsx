'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Sparkles, ChevronLeft, Loader } from 'lucide-react';

interface ShuffleStepProps {
  intent: string;
  readingType: number;
  onNext: () => void;
  onPrevious: () => void;
}

export default function ShuffleStep({ intent, readingType, onNext, onPrevious }: ShuffleStepProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReadingTypeName = () => {
    switch (readingType) {
      case 1: return 'Lectura Directa (1 carta)';
      case 3: return 'Lectura Temporal (3 cartas)';
      case 9: return 'Lectura Profunda (9 cartas)';
      default: return 'Lectura';
    }
  };

  const handleShuffle = async () => {
    setIsShuffling(true);
    setError(null);

    try {
      // Simular tiempo de barajado para efectos visuales
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Ir directamente al siguiente paso después del barajado
      onNext();

    } catch (error) {
      console.error('Error during shuffle:', error);
      setError('Error al barajar las cartas. Por favor, inténtalo de nuevo.');
      setIsShuffling(false);
    }
  };

  const cardPositions = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    rotation: Math.random() * 360,
    x: (Math.random() - 0.5) * 200,
    y: (Math.random() - 0.5) * 100,
    delay: Math.random() * 2
  }));

  return (
    <div className="text-center space-y-8">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-300 via-fuchsia-400 to-pink-300 bg-clip-text text-transparent mb-4 drop-shadow-lg">
          Barajando las Cartas
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Los Arcángeles están seleccionando las cartas perfectas para tu consulta. 
          La energía del universo está alineándose con tu intención.
        </p>
      </motion.div>

      {/* Información de la consulta */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Tu consulta:</h3>
          
          <div className="space-y-3 text-left">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Tipo de lectura:</span>
              <span className="text-amber-300 font-medium">{getReadingTypeName()}</span>
            </div>
            
            <div className="border-t border-white/20 pt-3">
              <span className="text-white/70 block mb-2">Tu intención:</span>
              <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                <p className="text-white italic">"{intent}"</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Área de barajado */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative h-96 max-w-4xl mx-auto"
      >
        {/* Contenedor de cartas */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isShuffling ? (
            // Estado inicial - mazo completo
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              {/* Stack de cartas */}
              <div className="relative">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`
                      absolute w-32 h-44 bg-gradient-to-br from-purple-600 to-blue-800 
                      rounded-xl border border-white/20 shadow-2xl
                    `}
                    style={{
                      transform: `translate(${i * 2}px, ${i * -2}px) rotate(${i * 2}deg)`,
                      zIndex: 5 - i
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-xl blur-xl scale-110" />
            </motion.div>
          ) : (
            // Estado de barajado
            <div className="relative w-full h-full">
              {cardPositions.map((card) => (
                <motion.div
                  key={card.id}
                  className="absolute w-12 h-16 bg-gradient-to-br from-purple-600 to-blue-800 rounded-lg border border-white/20 shadow-lg"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    rotate: 0,
                    scale: 1
                  }}
                  animate={{ 
                    x: [0, card.x, -card.x, card.x * 0.5, 0],
                    y: [0, card.y, -card.y, card.y * 0.5, 0],
                    rotate: [0, card.rotation, -card.rotation, card.rotation * 0.5, 0],
                    scale: [1, 0.8, 1.2, 0.9, 1]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: card.delay,
                    ease: "easeInOut"
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    transformOrigin: 'center center'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white/60 rounded-full" />
                  </div>
                </motion.div>
              ))}
              
              {/* Centro de energía */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 rounded-full blur-2xl"
              />
            </div>
          )}
        </div>

        {/* Efectos de partículas durante el barajado */}
        {isShuffling && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: Math.random() * 400,
                  y: 400,
                  opacity: 0
                }}
                animate={{
                  y: -100,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-300/80" />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Estado y mensaje */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="space-y-4"
      >
        {isShuffling && (
          <div className="flex items-center justify-center space-x-3 text-cyan-300">
            <Loader className="w-5 h-5 animate-spin" />
            <span className="text-lg">Los Arcángeles están seleccionando...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-red-300 max-w-md mx-auto">
            {error}
          </div>
        )}
      </motion.div>

      {/* Botones de acción */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="flex items-center justify-center space-x-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevious}
          disabled={isShuffling}
          className={`
            font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2
            ${isShuffling 
              ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed' 
              : 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
            }
          `}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Anterior</span>
        </motion.button>

        {!isShuffling && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShuffle}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-purple-400 hover:to-pink-500 transition-all duration-300 flex items-center space-x-2"
          >
            <Shuffle className="w-5 h-5" />
            <span>Barajar las cartas</span>
          </motion.button>
        )}
      </motion.div>

      {/* Mensaje de conexión espiritual */}
      {!isShuffling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-white/60 text-sm max-w-md mx-auto"
        >
          🌟 Cada carta que aparezca ha sido elegida especialmente para ti por los Arcángeles. 
          Confía en que el mensaje que recibas es exactamente lo que tu alma necesita escuchar. 🌟
        </motion.div>
      )}
    </div>
  );
}