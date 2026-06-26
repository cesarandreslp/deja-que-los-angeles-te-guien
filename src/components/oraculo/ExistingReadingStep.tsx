'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Eye, MessageCircle, Sparkles, Heart, Star, Clock, BookOpen } from 'lucide-react';

interface Card {
  id: number;
  code: string;
  name: string;
  title?: string; // Alias para compatibilidad
  description: string;
  definition?: string; // Alias para compatibilidad
  imageUrl: string;
  arcangel: string;
  shortMsg: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: string;
}

interface DailyReading {
  id: string;
  question: string;
  type: number;
  cards: Card[];
  messages: Message[];
  createdAt: string;
}

interface ExistingReadingStepProps {
  reading: DailyReading;
  onNextToGroupChat?: () => void;
}

export default function ExistingReadingStep({ reading, onNextToGroupChat }: ExistingReadingStepProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  
  console.log('🔮 ExistingReadingStep - Reading COMPLETA recibida:', reading);
  console.log('🔮 ExistingReadingStep - Cards SIN filtrar:', reading.cards);
  if (reading.cards && reading.cards.length > 0) {
    console.log('🔮 ExistingReadingStep - Primera carta SIN filtrar:', reading.cards[0]);
    console.log('🔮 ExistingReadingStep - Claves de primera carta:', Object.keys(reading.cards[0]));
  }
  
  // Filtrar solo los campos necesarios de las cartas para evitar errores de renderizado
  const filteredCards: Card[] = reading.cards.map((card: any) => ({
    id: card.id,
    code: card.code,
    name: card.name,
    title: card.title || card.name, // Alias para compatibilidad
    description: card.description,
    definition: card.definition || card.description, // Alias para compatibilidad
    imageUrl: card.imageUrl,
    arcangel: card.arcangel,
    shortMsg: card.shortMsg
  }));
  
  console.log('✅ ExistingReadingStep - Cards FILTRADAS:', filteredCards);
  if (filteredCards.length > 0) {
    console.log('✅ ExistingReadingStep - Primera carta FILTRADA:', filteredCards[0]);
    console.log('✅ ExistingReadingStep - Claves de primera carta FILTRADA:', Object.keys(filteredCards[0]));
  }

  const getPositionLabel = (index: number) => {
    if (reading.type === 1) {
      return 'Respuesta Divina';
    } else if (reading.type === 3) {
      const labels = ['Pasado', 'Presente', 'Futuro'];
      return labels[index] || `Carta ${index + 1}`;
    } else if (reading.type === 9) {
      const labels = [
        'Fundamento', 'Desafío', 'Pasado Distante',
        'Pasado Reciente', 'Corona/Posible Resultado', 'Futuro Inmediato',
        'Tu Enfoque', 'Influencias Externas', 'Esperanzas y Miedos'
      ];
      return labels[index] || `Carta ${index + 1}`;
    }
    return `Carta ${index + 1}`;
  };

  const getReadingTypeName = () => {
    switch (reading.type) {
      case 1: return 'Lectura Directa';
      case 3: return 'Lectura Temporal';
      case 9: return 'Lectura Profunda';
      default: return 'Lectura';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="text-center space-y-8">
      {/* Título y fecha */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Calendar className="w-8 h-8 text-amber-400" />
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-300 via-fuchsia-400 to-pink-300 bg-clip-text text-transparent">
            Tu Consulta de Hoy
          </h2>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-center space-x-2 text-amber-300 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Realizada el {formatDate(reading.createdAt)}</span>
          </div>
          <p className="text-white/80 text-sm">
            📅 Recuerda que solo puedes hacer una consulta por día. Esta es tu consulta del oráculo de hoy.
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-white/20 rounded-3xl p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <BookOpen className="w-6 h-6 text-purple-300" />
            <span className="text-purple-300 font-semibold">{getReadingTypeName()}</span>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-3">Tu pregunta:</h3>
          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
            <p className="text-white italic text-lg">"{reading.question}"</p>
          </div>
        </div>
      </motion.div>

      {/* Cartas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        <div className={`
          grid gap-6 justify-center
          ${reading.type === 1 ? 'grid-cols-1 max-w-sm mx-auto' : ''}
          ${reading.type === 3 ? 'grid-cols-1 md:grid-cols-3' : ''}
          ${reading.type === 9 ? 'grid-cols-2 md:grid-cols-3' : ''}
        `}>
          {filteredCards.map((card, index) => {
            // 🛡️ Sanity check - asegurar que card es un objeto válido
            if (!card || typeof card !== 'object') {
              console.error('❌ Card inválida en index', index, ':', card);
              return null;
            }
            
            return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 50, rotateY: 180 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.5 + (index * 0.2),
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ scale: 1.05, y: -10 }}
              onClick={() => setSelectedCard(card)}
              className="relative cursor-pointer group"
            >
              {/* Posición de la carta */}
              <div className="text-center mb-3">
                <span className="inline-block bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-semibold py-1 px-3 rounded-full">
                  {getPositionLabel(index)}
                </span>
              </div>

              {/* Carta */}
              <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl group-hover:shadow-purple-500/30 transition-all duration-300">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Imagen de la carta */}
                <div className="aspect-[2/3] bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
                  {card.imageUrl ? (
                    <img 
                      src={card.imageUrl} 
                      alt={card.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-white/60 mx-auto mb-2" />
                      <div className="text-white/80 text-sm font-medium">{card.arcangel}</div>
                    </div>
                  )}
                </div>

                {/* Información de la carta */}
                <div className="p-4 text-center">
                  <h3 className="text-white font-bold text-lg mb-1">{card.name}</h3>
                  <p className="text-purple-300 text-sm font-medium mb-2">Arcángel {card.arcangel}</p>
                  <p className="text-white/80 text-sm leading-relaxed">{card.shortMsg}</p>
                </div>

                {/* Efecto de brillo */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Botón para ir al chat grupal */}
      {onNextToGroupChat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextToGroupChat}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:from-purple-400 hover:to-pink-500 transition-all duration-300 flex items-center space-x-3"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-lg">Continuar al Chat con los Arcángeles</span>
          </motion.button>
        </motion.div>
      )}

      {/* Modal para ver carta completa */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl border border-white/20 max-w-md w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedCard.name}</h3>
                    <p className="text-purple-300 font-medium">Arcángel {selectedCard.arcangel}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <Star className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Imagen */}
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                {selectedCard.imageUrl ? (
                  <img 
                    src={selectedCard.imageUrl} 
                    alt={selectedCard.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles className="w-16 h-16 text-white/60" />
                )}
              </div>

              {/* Descripción completa */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-white mb-3">Mensaje del Arcángel:</h4>
                <p className="text-white/90 leading-relaxed mb-4">{selectedCard.description}</p>
                
                <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                  <p className="text-amber-300 italic font-medium">{selectedCard.shortMsg}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje inspiracional */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md border border-amber-300/30 rounded-2xl p-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Heart className="w-6 h-6 text-amber-400" />
            <span className="text-amber-300 font-semibold">Reflexión del día</span>
          </div>
          <p className="text-white/90 text-center">
            ✨ Esta consulta fue creada especialmente para ti hoy. Los Arcángeles han elegido estos mensajes 
            para guiarte en tu camino. Medita sobre estas palabras y permite que su sabiduría se integre 
            en tu corazón. ✨
          </p>
        </div>
      </motion.div>
    </div>
  );
}