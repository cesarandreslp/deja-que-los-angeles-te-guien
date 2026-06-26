"use client";
import React, { useState } from "react";

interface IntentCaptureProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export default function IntentCapture({ value, onChange, onNext }: IntentCaptureProps) {
  const [showModal, setShowModal] = useState(false);

  // Sugerencias de intención
  const intentSuggestions = [
    "¿Cuál es mi propósito de vida?",
    "¿Cómo puedo sanar mi corazón?",
    "¿Qué decisión debo tomar en mi carrera?",
    "¿Cómo mejorar mis relaciones familiares?",
    "¿Qué bloqueos debo liberar?",
    "¿Cuál es mi misión espiritual?",
    "¿Cómo encontrar el amor verdadero?",
    "¿Qué debo aprender en esta etapa?",
    "¿Cómo superar mis miedos?",
    "¿Cuál es mi siguiente paso espiritual?"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
  };
  const validateIntent = (text: string) => {
    if (!text) return false;
    return /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(text); // Al menos una letra
  };

  const handleContinue = () => {
    if (validateIntent(value)) {
      onNext();
    } else {
      alert("Por favor, escribe al menos una palabra válida para tu intención o pregunta.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-serif text-amber-300 mb-4">
          Comparte tu Intención Sagrada
        </h3>
        <p className="text-white/80 mb-6">
          Los arcángeles esperan conocer tu corazón. Escribe tu pregunta o intención con sinceridad.
        </p>
      </div>

      <div className="relative">
        <textarea 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="w-full h-32 p-4 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300/50 resize-none"
          placeholder="Escribe aquí tu pregunta o intención... Los arcángeles escuchan tu corazón."
        />
        <div className="absolute bottom-2 right-2 text-xs text-white/40">
          {value.length} caracteres
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={handleContinue}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          ✨ Continuar con los Arcángeles
        </button>
      </div>
      
      <div className="text-center text-white/60 text-sm">
        Tu intención será guardada con amor y respeto sagrado
      </div>
    </div>
  );
}