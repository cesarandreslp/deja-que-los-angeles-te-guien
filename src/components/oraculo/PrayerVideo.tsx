"use client";
import React from "react";

interface PrayerVideoProps {
  onNext: () => void;
}

export default function PrayerVideo({ onNext }: PrayerVideoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full mb-4">
            <span className="text-2xl">🙏</span>
          </div>
        </div>
        <h3 className="text-2xl font-serif text-amber-300 mb-4">
          Momento de Oración Sagrada
        </h3>
        <p className="text-white/80 mb-6">
          Antes de consultar a los arcángeles, dediquemos un momento sagrado a la oración y conexión divina.
        </p>
      </div>

      <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black/50 backdrop-blur-md border border-white/20">
        <video 
          controls 
          autoPlay
          muted
          src="/oraculo/oracion.mp4" 
          className="w-full aspect-video object-cover"
          poster="/oraculo/busto_gabriel.png"
        >
          Tu navegador no soporta video HTML5.
        </video>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-white/70 text-sm">
          "La oración es el aliento del alma que se eleva hacia lo divino"
        </p>
        
        <button 
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          🌟 Continuar hacia la Consulta
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-white/50 text-xs">
          Puedes pausar el video en cualquier momento y continuar cuando te sientas preparado
        </p>
      </div>
    </div>
  );
}