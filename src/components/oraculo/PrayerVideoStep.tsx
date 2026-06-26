'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';

interface PrayerVideoStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function PrayerVideoStep({ onNext, onPrevious }: PrayerVideoStepProps) {
  const [isPlaying, setIsPlaying] = useState(true); // Inicia como true porque el video tiene autoPlay
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Asegurar que el video se reproduzca cuando el componente se monta
    const video = videoRef.current;
    if (video) {
      // Configurar el video para autoplay
      video.load(); // Asegurar que se carga
      
      // Esperar un poco antes de intentar reproducir
      const timer = setTimeout(() => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.log('Auto-play falló:', error);
              // Auto-play falló, mostrar el botón de play
              setIsPlaying(false);
            });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handlePlayButtonClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="text-center space-y-8">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mb-4">
          Momento de Oración
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Antes de comenzar la consulta, tomemos un momento para conectar con la energía divina y preparar nuestro corazón para recibir la guía angelical.
        </p>
      </motion.div>

      {/* Contenedor del video */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative bg-black/50 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
          <div className="aspect-video relative">
            {/* Video */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls
              autoPlay
              muted
              playsInline
              preload="auto"
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleVideoEnd}
            >
              <source src="/oraculo/oracion.mp4" type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>

            {/* Overlay de carga */}
            {!isPlaying && !videoEnded && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayButtonClick}
                  className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-6 cursor-pointer"
                >
                  <Play className="w-12 h-12 text-white ml-1" />
                </motion.div>
              </div>
            )}

            {/* Overlay de controles personalizados */}
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-lg p-2"
              >
                <Volume2 className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </div>

          {/* Información del video */}
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-xl font-semibold text-white mb-2">
              Oración de Conexión Angelical
            </h3>
            <p className="text-white/70">
              Una oración especial para abrir tu corazón y tu mente a la sabiduría divina de los Arcángeles.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mensaje de preparación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-yellow-900 font-bold text-sm">✦</span>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-white mb-2">Preparación Espiritual</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Mientras observas este momento sagrado, permite que tu mente se calme y tu corazón se abra. 
                Los Arcángeles están preparando el espacio energético para tu consulta. 
                Respira profundamente y siente la presencia divina a tu alrededor.
              </p>
            </div>
          </div>
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-fuchsia-500/25 hover:from-fuchsia-400 hover:to-pink-500 hover:shadow-fuchsia-400/35 transition-all duration-300 flex items-center space-x-2"
        >
          <span>Continuar al barajado de cartas</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Nota especial si el video termina */}
      {videoEnded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto bg-green-500/20 border border-green-400/30 rounded-2xl p-4"
        >
          <div className="text-green-300 text-center">
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-900 font-bold">✓</span>
            </div>
            <p className="font-medium">¡Preparación completada!</p>
            <p className="text-sm text-green-200/80">Tu espíritu está listo para la consulta</p>
          </div>
        </motion.div>
      )}

      {/* Partículas de luz */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: typeof window !== 'undefined' ? window.innerHeight : 1000,
              opacity: 0
            }}
            animate={{
              y: -100,
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut"
            }}
          >
            <div className="w-2 h-2 bg-yellow-300/60 rounded-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}