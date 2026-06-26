"use client";
import React, { useState } from "react";

interface RevealGridProps {
  type: number;
  cards: any[];
  readingId: string | null;
  intent: string;
}

export default function RevealGrid({ type, cards = [], readingId, intent }: RevealGridProps) {
  const [revealed, setRevealed] = useState(false);
  const [interpretations, setInterpretations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentInterpretation, setCurrentInterpretation] = useState(0);

  // Definir bloques para lectura de 9 cartas
  const blocks = type === 9 ? [[0,1,2],[3,4,5],[6,7,8]] : (type ===3 ? [[0],[1],[2]] : [[0]]);
  const blockNames = type === 9 ? ['Pasado/Origen', 'Presente/Verdad', 'Futuro/Resultado'] : 
                    type === 3 ? ['Primera Carta', 'Segunda Carta', 'Tercera Carta'] : ['Tu Carta'];

  const revealCards = async () => {
    setRevealed(true);
    setLoading(true);
    
    try {
      if (type === 1) {
        // Lectura de carta única
        const response = await fetch("/api/oraculo/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            readingId, 
            mode: "single", 
            cards: cards,
            intent
          }),
        });
        
        const data = await response.json();
        setInterpretations([data.interpretation]);
        
      } else if (type === 3) {
        // Lectura de 3 cartas - una por una
        const newInterpretations = [];
        for (let i = 0; i < 3; i++) {
          const response = await fetch("/api/oraculo/interpret", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              readingId, 
              mode: "reveal-card", 
              cards: [cards[i]],
              intent
            }),
          });
          
          const data = await response.json();
          newInterpretations.push(data.interpretation);
          setInterpretations([...newInterpretations]);
          
          // Pausa pequeña entre interpretaciones
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } else if (type === 9) {
        // Lectura de 9 cartas - por bloques
        const newInterpretations = [];
        for (let b = 0; b < 3; b++) {
          const blockCards = blocks[b].map(i => cards[i]);
          const response = await fetch("/api/oraculo/interpret", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              readingId, 
              mode: "reveal-block", 
              cards: blockCards,
              intent
            }),
          });
          
          const data = await response.json();
          newInterpretations.push(data.interpretation);
          setInterpretations([...newInterpretations]);
          
          // Pausa entre bloques
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    } catch (error) {
      console.error('Error interpreting cards:', error);
      alert('Error obteniendo la interpretación angelical');
    } finally {
      setLoading(false);
    }
  };

  const askBlockQuestion = async (blockIndex: number, question: string) => {
    if (!question.trim()) {
      alert("Por favor, escribe una pregunta válida");
      return;
    }
    
    setLoading(true);
    try {
      const blockCards = blocks[blockIndex].map(i => cards[i]);
      const response = await fetch("/api/oraculo/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          readingId, 
          mode: "reveal-block", 
          questionBlock: question,
          cards: blockCards,
          intent
        }),
      });
      
      const data = await response.json();
      setInterpretations(prev => [...prev, data.interpretation]);
    } catch (error) {
      console.error('Error with block question:', error);
      alert('Error obteniendo respuesta del bloque');
    } finally {
      setLoading(false);
    }
  };

  const askCardQuestion = async (cardIndex: number, question: string) => {
    if (!question.trim()) {
      alert("Por favor, escribe una pregunta válida");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch("/api/oraculo/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          readingId, 
          mode: "reveal-card", 
          questionBlock: question,
          cards: [cards[cardIndex]],
          intent
        }),
      });
      
      const data = await response.json();
      setInterpretations(prev => [...prev, data.interpretation]);
    } catch (error) {
      console.error('Error with card question:', error);
      alert('Error obteniendo respuesta de la carta');
    } finally {
      setLoading(false);
    }
  };

  const finalGabrielInterpretation = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/oraculo/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          readingId, 
          mode: "final-gabriel", 
          cards: cards,
          intent
        }),
      });
      
      const data = await response.json();
      setInterpretations(prev => [...prev, data.interpretation]);
    } catch (error) {
      console.error('Error with final interpretation:', error);
      alert('Error obteniendo interpretación final de Gabriel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-serif text-amber-300 mb-4">
          {revealed ? 'Tu Consulta Angelical' : 'Revelar las Cartas Sagradas'}
        </h3>
        <p className="text-white/80 mb-6">
          {revealed ? 'Los arcángeles han hablado con sabiduría divina' : 'Las cartas elegidas esperan ser reveladas'}
        </p>
      </div>

      {/* Grid de cartas */}
      <div className={`grid gap-6 justify-center ${
        type === 9 ? 'grid-cols-3 max-w-4xl mx-auto' : 
        type === 3 ? 'grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto' : 
        'grid-cols-1 max-w-sm mx-auto'
      }`}>
        {cards.map((card, i) => (
          <div key={card.code} className="relative group">
            <div className="w-40 h-56 mx-auto perspective-1000">
              <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${revealed ? 'rotate-y-180' : ''}`}>
                {/* Dorso de la carta */}
                <div className="absolute inset-0 w-full h-full backface-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-xl border border-amber-300/30 shadow-2xl p-4 flex flex-col items-center justify-center">
                    <div className="text-4xl mb-2 filter drop-shadow-lg">🔮</div>
                    <div className="text-amber-300 font-serif text-sm text-center">Oráculo</div>
                    <div className="text-white/60 text-xs mt-1 text-center">Arcángeles</div>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent rounded-xl"></div>
                  </div>
                </div>
                
                {/* Frente de la carta */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                  <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-400 shadow-2xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-amber-200 to-amber-300 relative overflow-hidden">
                      <img 
                        src={card.imageUrl || `/oraculo/arcangeles_cartas/${card.code}.png`}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/oraculo/arcangeles_cartas/dorso.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-3 h-24 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-sm font-bold text-gray-800 leading-tight">{card.name}</h4>
                        <p className="text-xs text-amber-700 font-medium">Arcángel {card.arcangel}</p>
                      </div>
                      <p className="text-xs text-gray-600 italic">{card.shortMsg}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Etiqueta del bloque para lectura de 9 cartas */}
            {type === 9 && revealed && (
              <div className="text-center mt-2">
                <span className="text-xs text-amber-300 font-medium">
                  {i === 0 || i === 3 || i === 6 ? blockNames[Math.floor(i/3)] : ''}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botón de revelar */}
      {!revealed && (
        <div className="text-center">
          <button 
            onClick={revealCards}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            ✨ Revelar las Cartas Sagradas
          </button>
        </div>
      )}

      {/* Interpretaciones */}
      {revealed && (
        <div className="space-y-6">
          {interpretations.map((interpretation, idx) => (
            <div key={idx} className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-2xl">👼</div>
                <div>
                  <h4 className="text-amber-300 font-semibold">
                    {type === 9 && idx < 3 ? `${blockNames[idx]} - Interpretación` : 
                     type === 3 && idx < 3 ? blockNames[idx] : 
                     'Mensaje Angelical'}
                  </h4>
                </div>
              </div>
              <div className="prose prose-invert prose-amber max-w-none">
                <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                  {interpretation}
                </div>
              </div>
            </div>
          ))}

          {/* Loading para nueva interpretación */}
          {loading && (
            <div className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-white/20 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full"></div>
                <span className="text-amber-300">Los arcángeles están respondiendo...</span>
              </div>
            </div>
          )}

          {/* Preguntas adicionales para lectura de 9 cartas */}
          {type === 9 && interpretations.length >= 3 && (
            <div className="space-y-4">
              <h4 className="text-amber-300 font-semibold text-center">Preguntas Adicionales por Bloque</h4>
              {[0,1,2].map(blockIndex => (
                <BlockQuestionComponent 
                  key={blockIndex} 
                  blockIndex={blockIndex} 
                  blockName={blockNames[blockIndex]}
                  onAsk={askBlockQuestion}
                  disabled={loading}
                />
              ))}
            </div>
          )}

          {/* Preguntas adicionales para lectura de 3 cartas */}
          {type === 3 && interpretations.length >= 3 && (
            <div className="space-y-4">
              <h4 className="text-amber-300 font-semibold text-center">Preguntas Adicionales por Carta</h4>
              {[0,1,2].map(cardIndex => (
                <CardQuestionComponent 
                  key={cardIndex} 
                  cardIndex={cardIndex} 
                  cardName={cards[cardIndex]?.name}
                  onAsk={(q: string) => askCardQuestion(cardIndex, q)}
                  disabled={loading}
                />
              ))}
            </div>
          )}

          {/* Interpretación final de Gabriel */}
          <div className="text-center pt-6">
            <button 
              onClick={finalGabrielInterpretation}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🕊️ Mensaje Final del Arcángel Gabriel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para preguntas por bloque
function BlockQuestionComponent({ 
  blockIndex, 
  blockName, 
  onAsk, 
  disabled 
}: { 
  blockIndex: number; 
  blockName: string; 
  onAsk: (blockIndex: number, question: string) => void;
  disabled: boolean;
}) {
  const [question, setQuestion] = useState("");

  const handleAsk = () => {
    onAsk(blockIndex, question);
    setQuestion("");
  };

  return (
    <div className="flex gap-2">
      <input 
        value={question} 
        onChange={e => setQuestion(e.target.value)}
        className="flex-1 p-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
        placeholder={`Pregunta para ${blockName}`}
        disabled={disabled}
      />
      <button 
        onClick={handleAsk}
        disabled={disabled || !question.trim()}
        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Preguntar
      </button>
    </div>
  );
}

// Componente para preguntas por carta
function CardQuestionComponent({ 
  cardIndex, 
  cardName, 
  onAsk, 
  disabled 
}: { 
  cardIndex: number; 
  cardName: string; 
  onAsk: (question: string) => void;
  disabled: boolean;
}) {
  const [question, setQuestion] = useState("");

  const handleAsk = () => {
    onAsk(question);
    setQuestion("");
  };

  return (
    <div className="flex gap-2">
      <input 
        value={question} 
        onChange={e => setQuestion(e.target.value)}
        className="flex-1 p-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
        placeholder={`Pregunta para "${cardName}"`}
        disabled={disabled}
      />
      <button 
        onClick={handleAsk}
        disabled={disabled || !question.trim()}
        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Preguntar
      </button>
    </div>
  );
}