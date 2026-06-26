'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Eye } from 'lucide-react';

interface CardSelectionStepProps {
  readingType: number;
  intent: string;
  onCardsSelected: (result: { cards: any[], readingId: string }) => void;
  onPrevious: () => void;
}

export default function CardSelectionStep({ readingType, intent, onCardsSelected, onPrevious }: CardSelectionStepProps) {
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [shuffledCards, setShuffledCards] = useState<number[]>([]);
  
  // Generar y barajar 45 cartas al montar el componente
  const totalCards = 45;
  
  useEffect(() => {
    // Crear array de cartas del 1 al 45
    const cardArray = Array.from({ length: totalCards }, (_, i) => i + 1);
    
    // Algoritmo Fisher-Yates para barajar
    const shuffled = [...cardArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setShuffledCards(shuffled);
  }, []); // Solo se ejecuta una vez al montar

  const handleCardClick = (cardIndex: number) => {
    if (selectedCards.includes(cardIndex)) {
      // Deseleccionar carta
      setSelectedCards(prev => prev.filter(id => id !== cardIndex));
    } else if (selectedCards.length < readingType) {
      // Seleccionar carta
      setSelectedCards(prev => [...prev, cardIndex]);
    }
  };

  const handleContinue = async () => {
    if (selectedCards.length === readingType) {
      try {
        // Obtener las cartas seleccionadas del backend
        const response = await fetch('/api/oraculo/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            count: readingType,
            selectedIndexes: selectedCards,
            question: intent,
            type: readingType
          }),
        });
        
        const data = await response.json();

        if (response.status === 403 && data.requiresMembership) {
          // Redirigir a membresías si no tiene membresía activa
          window.location.href = '/memberships?feature=oraculo';
          return;
        }

        if (response.status === 409 && data.hasReadingToday) {
          // Ya tiene una consulta hoy
          alert(data.message || 'Ya realizaste tu consulta del oráculo hoy. Solo puedes hacer una consulta por día.');
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || 'Error al obtener las cartas');
        }
        
        onCardsSelected({
          cards: data.cards,
          readingId: data.readingId
        });
      } catch (error) {
        console.error('Error fetching selected cards:', error);
        alert('Error al procesar la consulta. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const getReadingTypeText = () => {
    switch (readingType) {
      case 1: return "una carta";
      case 3: return "tres cartas";
      case 9: return "nueve cartas";
      default: return `${readingType} cartas`;
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
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent mb-4">
          Selecciona tus Cartas
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Tu intuición te guiará. Selecciona {getReadingTypeText()} que sientas que tienen un mensaje especial para ti.
        </p>
        
        <div className="mt-4 text-cyan-300">
          <span className="text-lg font-medium">
            {selectedCards.length} de {readingType} cartas seleccionadas
          </span>
          {selectedCards.length < readingType && (
            <div className="text-sm text-white/60 mt-1">
              Te {readingType - selectedCards.length === 1 ? 'falta' : 'faltan'} {readingType - selectedCards.length} carta{readingType - selectedCards.length === 1 ? '' : 's'} por seleccionar
            </div>
          )}
        </div>
      </motion.div>

      {/* Cuadrícula de cartas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-3">
          {shuffledCards.map((cardNumber) => {
            const isSelected = selectedCards.includes(cardNumber);
            const isHovered = hoveredCard === cardNumber;
            const canSelect = selectedCards.length < readingType || isSelected;
            
            return (
              <motion.div
                key={cardNumber}
                whileHover={{ scale: canSelect ? 1.05 : 1 }}
                whileTap={{ scale: canSelect ? 0.95 : 1 }}
                onClick={() => canSelect && handleCardClick(cardNumber)}
                onMouseEnter={() => setHoveredCard(cardNumber)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`
                  relative aspect-[2/3] rounded-lg cursor-pointer transition-all duration-300
                  ${isSelected 
                    ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 border-2 border-yellow-300 shadow-lg shadow-yellow-500/30' 
                    : canSelect
                      ? 'bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-700 border-2 border-white/30 hover:border-cyan-400'
                      : 'bg-gray-600/50 border-2 border-gray-500/30 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {/* Efecto de brillo para cartas seleccionadas */}
                {isSelected && (
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-orange-400/20 rounded-lg"
                  />
                )}
                
                {/* Imagen del dorso de la carta */}
                <div className="absolute inset-0 p-1">
                  <img 
                    src="/oraculo/arcangeles_cartas/dorso.png" 
                    alt="Dorso de carta"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                
                {/* Efecto hover */}
                {isHovered && canSelect && !isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/10 rounded-lg"
                  />
                )}
                
                {/* Estrella para cartas seleccionadas */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Sparkles className="w-2 h-2 text-yellow-900" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Instrucciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Eye className="w-5 h-5 text-cyan-400" />
            <span className="text-lg font-medium text-cyan-300">Guía de selección</span>
          </div>
          
          <div className="text-white/70 text-sm space-y-2">
            <p>• Confía en tu intuición y selecciona las cartas que más te llamen la atención</p>
            <p>• No hay elecciones incorrectas - cada carta tiene un mensaje perfecto para ti</p>
            <p>• Las cartas seleccionadas brillarán en dorado</p>
            <p>• Puedes cambiar tu selección haciendo clic nuevamente en una carta</p>
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
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Anterior</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: selectedCards.length === readingType ? 1.05 : 1 }}
          whileTap={{ scale: selectedCards.length === readingType ? 0.95 : 1 }}
          onClick={handleContinue}
          disabled={selectedCards.length !== readingType}
          className={`
            font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center space-x-2
            ${selectedCards.length === readingType 
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-400 hover:to-pink-500' 
              : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          <span>Revelar mis cartas</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}