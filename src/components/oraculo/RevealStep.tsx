'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, MessageCircle, ChevronLeft, Sparkles, Heart, X, BookOpen } from 'lucide-react';

interface Card {
  id: number;
  code: string;
  title: string;
  arcangel: string;
  shortMsg: string;
  definition: string;
  imageUrl?: string;
}

interface RevealStepProps {
  cards: Card[];
  readingType: number;
  readingId: string | null;
  intent: string;
  onPrevious: () => void;
  onNextToGroupChat?: () => void;
}

export default function RevealStep({ cards, readingType, readingId, intent, onPrevious, onNextToGroupChat }: RevealStepProps) {
  // 🛡️ FILTRO DEFENSIVO RADICAL - FORZAR limpieza de TODOS los objetos
  const safeCards = React.useMemo(() => {
    console.log('🔍 RevealStep - Cards RECIBIDAS:', cards);
    console.log('🔍 RevealStep - Type of cards:', typeof cards, 'Is Array:', Array.isArray(cards));
    if (cards && Array.isArray(cards) && cards.length > 0) {
      console.log('🔍 RevealStep - Primera carta:', cards[0]);
      console.log('🔍 RevealStep - Claves de primera carta:', Object.keys(cards[0]));
    }
    
    if (!cards || !Array.isArray(cards)) return [];
    return cards.map((card: any) => {
      if (typeof card !== 'object' || card === null) return null;
      const filtered = {
        id: card.id || 0,
        code: card.code || '',
        title: card.title || card.name || 'Sin título',
        arcangel: card.arcangel || 'Desconocido',
        shortMsg: card.shortMsg || '',
        definition: card.definition || card.description || '',
        imageUrl: card.imageUrl || ''
      };
      console.log('🛡️ RevealStep - Carta filtrada:', filtered);
      return filtered;
    }).filter(c => c !== null);
  }, [cards]);

  const [revealed, setRevealed] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Validación temprana - si no hay cartas, mostrar mensaje de carga
  if (!safeCards || safeCards.length === 0) {
    return (
      <div className="text-center space-y-8">
        <div className="text-white">
          <h2 className="text-3xl font-bold mb-4">Preparando tus cartas...</h2>
          <p>Selecciona tus cartas en el paso anterior para continuar.</p>
        </div>
        <button
          onClick={onPrevious}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-300"
        >
          Volver
        </button>
      </div>
    );
  }

  const getPositionLabel = (index: number) => {
    if (readingType === 1) {
      return 'Respuesta Divina';
    } else if (readingType === 3) {
      const labels = ['Pasado/Origen', 'Presente/Verdad', 'Futuro/Resultado'];
      return labels[index] || '';
    } else {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const rowLabels = ['Primera Pregunta', 'Segunda Pregunta', 'Tercera Pregunta'];
      const colLabels = ['Pasado', 'Presente', 'Futuro'];
      return `${rowLabels[row]} - ${colLabels[col]}`;
    }
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  return (
    <div className="space-y-8">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent mb-4">
          {revealed ? 'Tu Mensaje Angelical' : 'Momento de la Revelación'}
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          {revealed 
            ? 'Los Arcángeles han hablado. Aquí está su mensaje de amor y sabiduría para ti.'
            : 'Las cartas están listas. Presiona revelar cuando te sientas preparado para recibir tu mensaje.'
          }
        </p>
      </motion.div>

      {/* Grid de cartas */}
      <div className={`
        grid gap-6 max-w-6xl mx-auto
        ${readingType === 1 ? 'grid-cols-1 max-w-sm' : 
          readingType === 3 ? 'grid-cols-1 md:grid-cols-3' : 
          'grid-cols-3 gap-4'}
      `}>
        {safeCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative"
          >
            {/* Posición label */}
            <div className="text-center mb-3">
              <span className="text-sm font-medium text-cyan-300 bg-black/30 px-3 py-1 rounded-full">
                {getPositionLabel(index)}
              </span>
            </div>

            {/* Carta */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => revealed && setSelectedCard(card)}
                className={`
                  relative aspect-[3/4] bg-gradient-to-br rounded-2xl shadow-2xl border-2 overflow-hidden
                  ${revealed 
                    ? 'from-purple-600 to-blue-700 border-cyan-400/50 cursor-pointer' 
                    : 'from-gray-700 to-gray-900 border-white/20 cursor-pointer'
                  }
                `}
              >
                <AnimatePresence mode="wait">
                  {!revealed ? (
                    // Dorso de la carta
                    <motion.div
                      key="back"
                      className="absolute inset-0"
                    >
                      <img 
                        src="/oraculo/arcangeles_cartas/dorso.png" 
                        alt="Dorso de carta"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-12 h-12 text-white/80 drop-shadow-lg" />
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    // Frente de la carta
                    <motion.div
                      key="front"
                      initial={{ rotateY: 180 }}
                      animate={{ rotateY: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                      className="absolute inset-0"
                    >
                      {/* Imagen de la carta */}
                      <img 
                        src={card.imageUrl || `/oraculo/arcangeles_cartas/${card.code}.png`} 
                        alt={`${card.title} - Arcángel ${card.arcangel}`}
                        className="w-full h-full object-cover rounded-2xl"
                        onError={(e) => {
                          e.currentTarget.src = '/oraculo/arcangeles_cartas/dorso.png';
                        }}
                      />
                      
                      {/* Overlay con información */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 rounded-2xl">
                        <div className="absolute top-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white mb-1 drop-shadow-lg">{card.title}</h3>
                          <p className="text-cyan-300 text-sm drop-shadow-lg">Arcángel {card.arcangel}</p>
                        </div>
                        
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white/90 text-sm italic drop-shadow-lg">"{card.shortMsg}"</p>
                          <div className="mt-2 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                              <BookOpen className="w-3 h-3 text-white/80" />
                              <span className="text-xs text-white/80">Toca para leer más</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Efecto de brillo */}
                {revealed && (
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Botón de revelación */}
      {!revealed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReveal}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-2xl hover:from-purple-400 hover:to-pink-500 transition-all duration-300 flex items-center space-x-2 mx-auto"
          >
            <Eye className="w-6 h-6" />
            <span>Revelar Cartas</span>
            <Sparkles className="w-6 h-6" />
          </motion.button>
        </motion.div>
      )}

      {/* Botones de navegación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex items-center justify-center space-x-4 pt-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevious}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Volver a seleccionar</span>
        </motion.button>

        {onNextToGroupChat && revealed && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextToGroupChat}
            className="bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white font-semibold py-4 px-8 rounded-xl shadow-2xl hover:from-amber-400 hover:to-fuchsia-500 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Abrir Chat de los Arcángeles</span>
          </motion.button>
        )}
      </motion.div>

      {/* Modal de carta expandida */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="p-6 pb-0">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedCard.title}</h3>
                      <p className="text-cyan-300">Arcángel {selectedCard.arcangel}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Imagen de la carta */}
              <div className="px-6">
                <div className="aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={selectedCard.imageUrl || `/oraculo/arcangeles_cartas/${selectedCard.code}.png`} 
                    alt={`${selectedCard.title} - Arcángel ${selectedCard.arcangel}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/oraculo/arcangeles_cartas/dorso.png';
                    }}
                  />
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-6">
                {/* Mensaje corto */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                  <h4 className="text-lg font-semibold text-cyan-300 mb-2">Mensaje del Arcángel</h4>
                  <p className="text-white/90 italic">"{selectedCard.shortMsg}"</p>
                </div>

                {/* Definición completa */}
                <div className="bg-gradient-to-r from-amber-500/10 to-fuchsia-500/10 backdrop-blur-sm border border-amber-400/30 rounded-2xl p-6">
                  <h4 className="text-xl font-semibold text-amber-300 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Sabiduría Divina
                  </h4>
                  <p className="text-white/90 leading-relaxed text-lg">
                    {selectedCard.definition}
                  </p>
                </div>

                {/* Footer */}
                <div className="text-center pt-4">
                  <p className="text-white/60 text-sm">
                    Reflexiona sobre este mensaje y permite que su sabiduría divina guíe tu camino.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}