"use client";
import React, { useState } from "react";

interface ShuffleBoardProps {
  type: number;
  intent: string;
  onDraw: (result: any) => void;
}

export default function ShuffleBoard({ type, intent, onDraw }: ShuffleBoardProps) {
  const [shuffling, setShuffling] = useState(false);
  const [shuffleStage, setShuffleStage] = useState(0); // 0: preparando, 1: barajando, 2: seleccionando

  const handleDraw = async () => {
    setShuffling(true);
    setShuffleStage(1);

    try {
      // Simular tiempo de barajado para la experiencia
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShuffleStage(2);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch("/api/oraculo/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, question: intent }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener las cartas');
      }

      const result = await response.json();
      onDraw(result);
      
    } catch (error) {
      console.error('Error drawing cards:', error);
      alert("Error al obtener las cartas angelicales. Por favor, intenta nuevamente.");
    } finally {
      setShuffling(false);
      setShuffleStage(0);
    }
  };

  const getShuffleText = () => {
    switch (shuffleStage) {
      case 1: return "Barajando las cartas...";
      case 2: return "Los arcángeles eligen para ti...";
      default: return "Listo para barajar";
    }
  };

  const getShuffleIcon = () => {
    switch (shuffleStage) {
      case 1: return "🌪️";
      case 2: return "✨";
      default: return "🃏";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-serif text-amber-300 mb-4">
          Preparación de las Cartas Sagradas
        </h3>
        <p className="text-white/80 mb-6">
          Las 45 cartas de los arcángeles esperan ser barajadas con tu energía
        </p>
      </div>

      {/* Área de visualización del mazo */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Cartas apiladas simulando mazo */}
          <div className="relative w-40 h-56">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-40 h-56 bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-xl border border-amber-300/30 shadow-2xl transition-all duration-300 ${
                  shuffling 
                    ? shuffleStage === 1 
                      ? `animate-spin` 
                      : shuffleStage === 2 
                        ? `animate-pulse` 
                        : ''
                    : ''
                }`}
                style={{
                  transform: `translate(${i * 2}px, ${i * -2}px) rotate(${shuffling ? (i * 10) : 0}deg)`,
                  zIndex: 5 - i
                }}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                  <div className="text-4xl mb-2 filter drop-shadow-lg">
                    {getShuffleIcon()}
                  </div>
                  <div className="text-amber-300 font-serif text-sm">
                    Oráculo
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    Arcángeles
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Información de la consulta */}
      <div className="bg-black/30 backdrop-blur-md rounded-lg p-4 border border-white/20 max-w-md mx-auto">
        <div className="text-center">
          <p className="text-white/70 text-sm mb-2">Tu intención:</p>
          <p className="text-amber-300 font-medium text-sm italic">"{intent}"</p>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-white/60 text-xs">
              Tipo de lectura: <span className="text-amber-300">{type} carta{type > 1 ? 's' : ''}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Estado del barajado */}
      <div className="text-center">
        <p className="text-white/80 mb-4 font-medium">
          {getShuffleText()}
        </p>
        
        {!shuffling ? (
          <button 
            onClick={handleDraw}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            🎲 Barajar y Seleccionar Cartas
          </button>
        ) : (
          <div className="px-8 py-3 bg-gradient-to-r from-amber-600/50 to-yellow-600/50 text-white font-semibold rounded-lg cursor-not-allowed">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Procesando...
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-white/60 text-sm">
        Los arcángeles guían la selección de tus cartas con amor divino
      </div>
    </div>
  );
}