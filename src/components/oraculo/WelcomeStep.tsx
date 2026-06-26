'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  userName?: string;
}

export default function WelcomeStep({ onNext, welcomeMessage, setWelcomeMessage, userName }: WelcomeStepProps) {
  const [loading, setLoading] = useState(true);
  const [typedMessage, setTypedMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    generateWelcomeMessage();
  }, []);

  // Efecto de escritura progresiva - solo si hay mensaje y no está cargando
  useEffect(() => {
    if (welcomeMessage && !loading && currentIndex < welcomeMessage.length) {
      const timeout = setTimeout(() => {
        setTypedMessage(prev => prev + welcomeMessage[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // Velocidad de escritura

      return () => clearTimeout(timeout);
    }
  }, [welcomeMessage, currentIndex, loading]);

  const generateWelcomeMessage = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/oraculo/gabriel-greeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName || 'querida alma'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Resetear estado de escritura antes de establecer nuevo mensaje
        setTypedMessage('');
        setCurrentIndex(0);
        setWelcomeMessage(data.greeting);
      } else {
        throw new Error('Failed to fetch greeting');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Gabriel greeting:', error);
      
      // Mensaje de fallback de Gabriel
      const fallbackName = userName || 'querida alma';
      setTypedMessage('');
      setCurrentIndex(0);
      setWelcomeMessage(`Hola ${fallbackName}, qué hermoso tenerte aquí conmigo. Soy Gabriel y mi corazón se llena de alegría al verte. Tu alma ha buscado respuestas y quiero que sepas que estás exactamente donde necesitas estar en este momento. Permítete sentir el amor que te rodea, abre tu corazón a la guía que ya vive dentro de ti.`);
      setLoading(false);
    }
  };

  return (
    <div className="text-center space-y-8">
      {/* Animación celestial de fondo */}
      <div className="relative">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-0 -z-10"
        >
          <div className="w-96 h-96 mx-auto rounded-full bg-gradient-to-r from-amber-400/20 via-fuchsia-500/20 to-pink-500/20 blur-3xl" />
        </motion.div>

        {/* Avatar de Gabriel */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-10 mb-8"
        >
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 flex items-center justify-center shadow-2xl border-4 border-white/20 overflow-hidden">
            <img 
              src="/oraculo/busto_gabriel.png" 
              alt="Arcángel Gabriel" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          
          {/* Halo de luz */}
          <motion.div
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-4 -left-4 w-40 h-40 rounded-full bg-gradient-to-r from-yellow-300/30 to-white/30 blur-xl"
          />
        </motion.div>
      </div>

      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-300 to-fuchsia-400 bg-clip-text text-transparent mb-4">
          Arcángel Gabriel te saluda
        </h2>
        <div className="flex items-center justify-center space-x-2 text-amber-300">
          <Sparkles className="w-5 h-5" />
          <span className="text-lg">Mensajero Divino</span>
          <Sparkles className="w-5 h-5" />
        </div>
      </motion.div>

      {/* Mensaje de bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-amber-400" />
              </motion.div>
              <span className="text-lg text-fuchsia-300">Gabriel está preparando tu mensaje...</span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-lg md:text-xl leading-relaxed text-white/90 italic">
                "{typedMessage}"
                {currentIndex < welcomeMessage.length && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-fuchsia-400"
                  >
                    |
                  </motion.span>
                )}
              </p>
              
              {currentIndex >= welcomeMessage.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mt-6 text-sm text-white/70"
                >
                  ✨ Mensaje canalizado directamente desde los cielos ✨
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Botón para continuar */}
      {!loading && currentIndex >= welcomeMessage.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(236,72,153,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="bg-gradient-to-r from-amber-400 to-fuchsia-500 text-white font-semibold py-4 px-8 rounded-2xl shadow-2xl shadow-fuchsia-500/25 hover:from-amber-300 hover:to-fuchsia-400 hover:shadow-fuchsia-400/35 transition-all duration-300 flex items-center space-x-2"
          >
            <span>Continuar a escribir mi intención</span>
            <Sparkles className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}

      {/* Partículas flotantes */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Partícula 1 */}
          <motion.div
            className="absolute"
            initial={{ x: 200, y: 800, opacity: 0 }}
            animate={{ y: -100, opacity: [0, 1, 0] }}
            transition={{ duration: 8, repeat: Infinity, delay: 0, ease: "easeOut" }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300/60" />
          </motion.div>
          
          {/* Partícula 2 */}
          <motion.div
            className="absolute"
            initial={{ x: 500, y: 800, opacity: 0 }}
            animate={{ y: -100, opacity: [0, 1, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1.5, ease: "easeOut" }}
          >
            <Sparkles className="w-4 h-4 text-cyan-300/60" />
          </motion.div>
          
          {/* Partícula 3 */}
          <motion.div
            className="absolute"
            initial={{ x: 800, y: 800, opacity: 0 }}
            animate={{ y: -100, opacity: [0, 1, 0] }}
            transition={{ duration: 7, repeat: Infinity, delay: 3, ease: "easeOut" }}
          >
            <Sparkles className="w-4 h-4 text-purple-300/60" />
          </motion.div>
          
          {/* Partícula 4 */}
          <motion.div
            className="absolute"
            initial={{ x: 100, y: 800, opacity: 0 }}
            animate={{ y: -100, opacity: [0, 1, 0] }}
            transition={{ duration: 9, repeat: Infinity, delay: 2, ease: "easeOut" }}
          >
            <Sparkles className="w-3 h-3 text-amber-300/60" />
          </motion.div>
          
          {/* Partícula 5 */}
          <motion.div
            className="absolute"
            initial={{ x: 1000, y: 800, opacity: 0 }}
            animate={{ y: -100, opacity: [0, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: 4, ease: "easeOut" }}
          >
            <Sparkles className="w-4 h-4 text-pink-300/60" />
          </motion.div>
          
          {/* Partícula 6 */}
          <motion.div
            className="absolute"
            initial={{ x: 350, y: 800, opacity: 0 }}
            animate={{ y: -100, opacity: [0, 1, 0] }}
            transition={{ duration: 8.5, repeat: Infinity, delay: 1, ease: "easeOut" }}
          >
            <Sparkles className="w-3 h-3 text-white/40" />
          </motion.div>
        </div>
      )}
    </div>
  );
}