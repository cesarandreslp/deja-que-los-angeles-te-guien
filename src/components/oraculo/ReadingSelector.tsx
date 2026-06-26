"use client";
import React from "react";

interface ReadingSelectorProps {
  value: number;
  onChange: (type: number) => void;
  onNext: () => void;
}

export default function ReadingSelector({ value, onChange, onNext }: ReadingSelectorProps) {
  const readingTypes = [
    {
      type: 1,
      title: "Carta Única",
      subtitle: "Respuesta Directa",
      description: "Una carta para una respuesta clara y directa",
      icon: "🎴",
      time: "5-10 min"
    },
    {
      type: 3,
      title: "Lectura de 3 Cartas",
      subtitle: "Pasado • Presente • Futuro",
      description: "Comprende tu situación desde tres perspectivas",
      icon: "🔮",
      time: "15-20 min"
    },
    {
      type: 9,
      title: "Consulta Completa",
      subtitle: "Lectura Profunda de 9 Cartas",
      description: "Exploración exhaustiva con múltiples dimensiones",
      icon: "✨",
      time: "30-45 min"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-serif text-amber-300 mb-4">
          Elige tu Tipo de Consulta
        </h3>
        <p className="text-white/80 mb-6">
          Cada tipo de lectura ofrece una profundidad diferente de sabiduría angelical
        </p>
      </div>

      <div className="grid gap-4 max-w-4xl mx-auto">
        {readingTypes.map((reading) => (
          <div
            key={reading.type}
            onClick={() => onChange(reading.type)}
            className={`p-6 rounded-xl border-2 cursor-pointer transform transition-all duration-200 hover:scale-[1.02] ${
              value === reading.type
                ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400 shadow-lg shadow-amber-400/20'
                : 'bg-black/30 border-white/20 hover:border-white/40'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{reading.icon}</div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xl font-semibold text-white">{reading.title}</h4>
                    <p className="text-amber-300 text-sm font-medium">{reading.subtitle}</p>
                  </div>
                  <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
                    {reading.time}
                  </span>
                </div>
                <p className="text-white/70 text-sm">{reading.description}</p>
              </div>
              
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                value === reading.type
                  ? 'border-amber-400 bg-amber-400'
                  : 'border-white/30'
              }`}>
                {value === reading.type && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button 
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          🎲 Barajar las Cartas Sagradas
        </button>
      </div>
      
      <div className="text-center text-white/60 text-sm">
        Las cartas han sido bendecidas por la luz angelical
      </div>
    </div>
  );
}