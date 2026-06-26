'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Crown, Heart, Zap, Shield, Star, Sparkles, ChevronLeft, MessageCircle, Users } from 'lucide-react';
import { 
  generateGabrielIntroduction, 
  generateGabrielQuestion, 
  generateArchangelResponse,
  generateGabrielSynthesis,
  generateGabrielPrivateResponse,
  type ArchangelName 
} from '@/lib/archangelAgents';

interface Card {
  id: number;
  code: string;
  name: string;
  title?: string;
  arcangel: string;
  shortMsg: string;
  description: string;
  definition?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | ArchangelName | 'system';
  timestamp: Date;
  isTyping?: boolean;
}

interface GroupChatRevealStepProps {
  cards: Card[];
  readingType: number;
  intent: string;
  userName?: string;
  onPrevious: () => void;
}

type ChatPhase = 'waiting_to_start' | 'gabriel_intro' | 'asking_archangels' | 'synthesis' | 'private_chat' | 'completed';

interface ArchangelResponseData {
  arcangel: string;
  card: string;
  message: string;
}

// Configuración de arcángeles con imágenes
const archangels = {
  'Miguel': { 
    name: 'Miguel',
    image: '/arcangeles-chat/miguel_chat.png',
    color: 'from-blue-500 to-blue-700',
    icon: <Shield className="w-5 h-5" />
  },
  'Gabriel': { 
    name: 'Gabriel',
    image: '/arcangeles-chat/gabriel_chat.png',
    color: 'from-yellow-500 to-orange-600',
    icon: <Crown className="w-5 h-5" />
  },
  'Rafael': { 
    name: 'Rafael',
    image: '/arcangeles-chat/rafael_chat.png',
    color: 'from-green-500 to-emerald-600',
    icon: <Heart className="w-5 h-5" />
  },
  'Uriel': { 
    name: 'Uriel',
    image: '/arcangeles-chat/uriel_chat.png',
    color: 'from-purple-500 to-violet-600',
    icon: <Zap className="w-5 h-5" />
  },
  'Jofiel': { 
    name: 'Jofiel',
    image: '/arcangeles-chat/jofiel_chat.png',
    color: 'from-pink-500 to-rose-600',
    icon: <Star className="w-5 h-5" />
  },
  'Zadkiel': { 
    name: 'Zadkiel',
    image: '/arcangeles-chat/zadquiel_chat.png',
    color: 'from-indigo-500 to-purple-600',
    icon: <Sparkles className="w-5 h-5" />
  },
  'Raguel': { 
    name: 'Raguel',
    image: '/arcangeles-chat/raguel_chat.png',
    color: 'from-teal-500 to-cyan-600',
    icon: <Users className="w-5 h-5" />
  },
  'Metatron': { 
    name: 'Metatron',
    image: '/arcangeles-chat/metatron_chat.png',
    color: 'from-amber-500 to-yellow-600',
    icon: <Crown className="w-5 h-5" />
  },
  'Sandalfon': { 
    name: 'Sandalfon',
    image: '/arcangeles-chat/sandalfon_chat.png',
    color: 'from-rose-500 to-pink-600',
    icon: <Heart className="w-5 h-5" />
  },
  'Jeremiel': { 
    name: 'Jeremiel',
    image: '/arcangeles-chat/jeremiel_chat.png',
    color: 'from-violet-500 to-purple-600',
    icon: <Star className="w-5 h-5" />
  },
  'Raziel': { 
    name: 'Raziel',
    image: '/arcangeles-chat/raziel_chat.png',
    color: 'from-indigo-500 to-blue-600',
    icon: <Sparkles className="w-5 h-5" />
  },
  'Azrael': { 
    name: 'Azrael',
    image: '/arcangeles-chat/azrael_chat.png',
    color: 'from-gray-500 to-slate-600',
    icon: <Heart className="w-5 h-5" />
  },
  'Haniel': { 
    name: 'Haniel',
    image: '/arcangeles-chat/haniel_chat.png',
    color: 'from-pink-500 to-purple-600',
    icon: <Star className="w-5 h-5" />
  },
  'Chamuel': { 
    name: 'Chamuel',
    image: '/arcangeles-chat/chamuel_chat.png',
    color: 'from-rose-500 to-red-600',
    icon: <Heart className="w-5 h-5" />
  },
  'Ariel': { 
    name: 'Ariel',
    image: '/arcangeles-chat/ariel_chat.png',
    color: 'from-green-500 to-teal-600',
    icon: <Shield className="w-5 h-5" />
  }
};

export default function GroupChatRevealStep({ 
  cards, 
  readingType, 
  intent, 
  userName,
  onPrevious 
}: GroupChatRevealStepProps) {
  // 🛡️ FILTRO DEFENSIVO RADICAL - FORZAR limpieza de TODOS los objetos
  const safeCards = React.useMemo(() => {
    console.log('🔍 GroupChatRevealStep - Cards RECIBIDAS:', cards);
    console.log('🔍 GroupChatRevealStep - Type of cards:', typeof cards, 'Is Array:', Array.isArray(cards));
    if (cards && Array.isArray(cards) && cards.length > 0) {
      console.log('🔍 GroupChatRevealStep - Primera carta:', cards[0]);
      console.log('🔍 GroupChatRevealStep - Claves de primera carta:', Object.keys(cards[0]));
    }
    
    if (!cards || !Array.isArray(cards)) return [];
    return cards.map((card: any) => {
      if (typeof card !== 'object' || card === null) return null;
      const filtered = {
        id: card.id || 0,
        code: card.code || '',
        name: card.name || card.title || 'Sin nombre',
        title: card.title || card.name || 'Sin título',
        arcangel: card.arcangel || 'Desconocido',
        shortMsg: card.shortMsg || '',
        description: card.description || card.definition || '',
        definition: card.definition || card.description || ''
      };
      console.log('🛡️ GroupChatRevealStep - Carta filtrada:', filtered);
      return filtered;
    }).filter(c => c !== null);
  }, [cards]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatPhase, setChatPhase] = useState<ChatPhase>('waiting_to_start');
  const [privateQuestionCount, setPrivateQuestionCount] = useState(0);
  const [typingArchangel, setTypingArchangel] = useState<string | null>(null);
  const [archangelResponses, setArchangelResponses] = useState<ArchangelResponseData[]>([]);
  const [synthesisMessage, setSynthesisMessage] = useState<string>('');
  const [currentArchangelIndex, setCurrentArchangelIndex] = useState(0);
  const [buttonText, setButtonText] = useState('Iniciar Interpretación');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      // Guardar la posición actual del scroll de la página
      const currentPageScroll = window.pageYOffset;
      
      // Hacer scroll del chat
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      
      // Restaurar la posición del scroll de la página si cambió
      if (window.pageYOffset !== currentPageScroll) {
        window.scrollTo(0, currentPageScroll);
      }
    }
  };

  useEffect(() => {
    // Usar setTimeout para asegurar que el DOM se actualice antes de hacer scroll
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 150);

    return () => clearTimeout(timer);
  }, [messages]);

  // Función para obtener posición de la carta según el tipo de lectura
  const getCardPosition = (index: number, readingType: number): string => {
    if (readingType === 1) return 'Respuesta Divina';
    if (readingType === 3) return ['Pasado', 'Presente', 'Futuro'][index];
    return `Posición ${index + 1} de ${readingType}`;
  };

  // Función para generar respuesta privada con Gabriel
  const generateGabrielPrivateChat = async (userMessage: string): Promise<string> => {
    try {
      return await generateGabrielPrivateResponse(intent, userMessage, synthesisMessage);
    } catch (error) {
      console.error('Error generating Gabriel private response:', error);
      return 'La respuesta está en tu corazón. Confía en tu intuición divina.';
    }
  };

  // Simular typing indicator
  const simulateTyping = (archangel: string, duration: number = 2000) => {
    setTypingArchangel(archangel);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setTypingArchangel(null);
        resolve();
      }, duration);
    });
  };

  // Función para manejar chat privado con Gabriel
  const handlePrivateChat = async () => {
    if (!newMessage.trim() || isLoading || privateQuestionCount >= 3) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    setPrivateQuestionCount(prev => prev + 1);

    // Gabriel responde en el chat privado
    await simulateTyping('Gabriel', 1500 + Math.random() * 1000);

    try {
      const response = await generateGabrielPrivateChat(newMessage);
      
      const gabrielMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'Gabriel',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, gabrielMessage]);

      // Si ya se hicieron 3 preguntas, finalizar el chat
      if (privateQuestionCount >= 2) { // 2 porque ya incrementamos arriba
        setTimeout(() => {
          const finalMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: 'Has completado tus 3 preguntas privadas conmigo. Que la luz divina te acompañe siempre. ✨',
            sender: 'Gabriel',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, finalMessage]);
          setChatPhase('completed');
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating Gabriel private response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Disculpa, hay interferencia en nuestra conexión. Intenta nuevamente.',
        sender: 'Gabriel',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatPhase === 'private_chat') {
        handlePrivateChat();
      }
    }
  };

  // Función principal para manejar los pasos de interpretación
  const handleInterpretationStep = async () => {
    setIsLoading(true);

    try {
      if (chatPhase === 'waiting_to_start') {
        // Gabriel da la introducción
        await simulateTyping('Gabriel', 2000);
        const uniqueArchangels = Array.from(new Set(safeCards.map(card => card.arcangel)));
        const gabrielIntro = await generateGabrielIntroduction(safeCards, intent, uniqueArchangels, userName || 'querida alma');
        
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: gabrielIntro,
          sender: 'Gabriel',
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
        setChatPhase('asking_archangels');
        setButtonText('Continuar Interpretación');
        
      } else if (chatPhase === 'asking_archangels' && currentArchangelIndex < safeCards.length) {
        // Gabriel pregunta al arcángel actual
        const card = safeCards[currentArchangelIndex];
        const archangelName = card.arcangel as ArchangelName;
        const cardPosition = getCardPosition(currentArchangelIndex, readingType);
        const presentedArchangels = new Set(archangelResponses.map(r => r.arcangel));
        const isFirstAppearance = !presentedArchangels.has(archangelName);
        
        // Gabriel presenta la carta
        await simulateTyping('Gabriel', 1500);
        const gabrielQuestion = await generateGabrielQuestion(
          archangelName,
          card,
          intent,
          cardPosition,
          isFirstAppearance,
          userName || 'querida alma'
        );
        
        const questionMessage: Message = {
          id: `${Date.now()}-question-${currentArchangelIndex}`,
          content: gabrielQuestion,
          sender: 'Gabriel',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, questionMessage]);
        
        // Pausa antes de que responda el arcángel
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // El arcángel responde
        await simulateTyping(archangelName, 2000);
        const archangelResponse = await generateArchangelResponse(
          archangelName,
          card,
          intent,
          cardPosition,
          isFirstAppearance,
          gabrielQuestion,
          userName || 'querida alma'
        );
        
        const responseMessage: Message = {
          id: `${Date.now()}-response-${currentArchangelIndex}`,
          content: archangelResponse,
          sender: archangelName,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, responseMessage]);
        
        // Guardar respuesta para la síntesis
        const newResponse: ArchangelResponseData = {
          arcangel: archangelName,
          card: card.name || card.title || 'Carta seleccionada',
          message: archangelResponse
        };
        
        setArchangelResponses(prev => [...prev, newResponse]);
        setCurrentArchangelIndex(prev => prev + 1);
        
        // Si es el último arcángel, cambiar texto del botón
        if (currentArchangelIndex + 1 >= safeCards.length) {
          setButtonText('Ver Síntesis Final');
          setChatPhase('synthesis');
        }
        
      } else if (chatPhase === 'synthesis') {
        // Gabriel hace la síntesis final
        await simulateTyping('Gabriel', 3000);
        const synthesis = await generateGabrielSynthesis(safeCards, intent, archangelResponses);
        setSynthesisMessage(synthesis);
        
        const synthesisMessage: Message = {
          id: `${Date.now()}-synthesis`,
          content: synthesis,
          sender: 'Gabriel',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, synthesisMessage]);
        
        // Pausa antes de la invitación
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Gabriel invita al chat privado
        const invitationMessage: Message = {
          id: `${Date.now()}-invitation`,
          content: '¿Tienes alguna pregunta específica para mí? Puedes hacerme hasta 3 preguntas privadas para profundizar en tu lectura. 💫',
          sender: 'Gabriel',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, invitationMessage]);
        setChatPhase('private_chat');
      }
      
    } catch (error) {
      console.error('Error in interpretation step:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Ha ocurrido un error en la conexión celestial. Los arcángeles intentarán comunicarse nuevamente.',
        sender: 'Gabriel',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 min-h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center flex-shrink-0"
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-300 to-fuchsia-400 bg-clip-text text-transparent mb-4">
          Chat Angelical
        </h2>
        <p className="text-white/80 text-lg">
          Los Arcángeles se comunican contigo directamente
        </p>
      </motion.div>

      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex-1 flex flex-col max-w-6xl mx-auto"
        style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
      >
        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          style={{ 
            scrollBehavior: 'smooth',
            overscrollBehavior: 'contain'
          }}
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex w-full ${
                  message.sender === 'user' 
                    ? 'justify-end' 
                    : message.sender === 'Gabriel' 
                      ? 'justify-start' 
                      : 'justify-end'
                }`}
              >
                <div className={`flex items-start space-x-4 ${
                  message.sender === 'user' 
                    ? 'max-w-md' 
                    : message.sender === 'Gabriel'
                      ? 'max-w-3xl w-full'
                      : 'max-w-3xl w-full flex-row-reverse space-x-reverse'
                }`}>
                  {message.sender !== 'user' && (
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-lg border-2 border-white/30">
                      <img 
                        src={archangels[message.sender as keyof typeof archangels]?.image || '/arcangeles-chat/gabriel_chat.png'} 
                        alt={`Arcángel ${message.sender}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/arcangeles-chat/gabriel_chat.png';
                        }}
                      />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="flex-1">
                    {message.sender !== 'user' && (
                      <div className={`flex items-center space-x-2 mb-2 ${
                        message.sender !== 'Gabriel' ? 'justify-end' : ''
                      }`}>
                        <span className="text-white font-semibold text-sm">
                          Arcángel {archangels[message.sender as keyof typeof archangels]?.name || message.sender}
                        </span>
                        <span className="text-white/50 text-xs">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    
                    <div className={`px-5 py-4 rounded-2xl shadow-lg ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white max-w-sm' 
                        : message.sender === 'Gabriel'
                          ? 'bg-gradient-to-r from-yellow-500/30 to-orange-600/30 backdrop-blur-sm border border-white/30 text-white'
                          : `bg-gradient-to-r ${archangels[message.sender as keyof typeof archangels]?.color || 'from-purple-500 to-pink-500'}/30 backdrop-blur-sm border border-white/30 text-white`
                    }`}>
                      <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.sender === 'user' && (
                        <p className="text-xs opacity-70 mt-1 text-right">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Typing indicator */}
            {typingArchangel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start w-full"
              >
                <div className="flex items-start space-x-4 max-w-3xl w-full">
                  <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 shadow-lg border-2 border-white/30">
                    <img 
                      src={archangels[typingArchangel as keyof typeof archangels]?.image || '/arcangeles-chat/gabriel_chat.png'} 
                      alt={`Arcángel ${typingArchangel}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-white font-semibold text-sm">
                        Arcángel {archangels[typingArchangel as keyof typeof archangels]?.name || typingArchangel}
                      </span>
                    </div>
                    <div className={`px-5 py-4 rounded-2xl shadow-lg bg-gradient-to-r ${archangels[typingArchangel as keyof typeof archangels]?.color || 'from-purple-500 to-pink-500'}/30 backdrop-blur-sm border border-white/30 text-white`}>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-white/70 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-white/70 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-white/70 rounded-full"
                          />
                        </div>
                        <span className="text-xs opacity-70 ml-2">escribiendo...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Solo disponible en chat privado */}
        {chatPhase === 'private_chat' && (
          <div className="border-t border-white/20 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    privateQuestionCount >= 3 
                      ? "Has completado tus 3 preguntas..." 
                      : `Pregunta ${privateQuestionCount + 1}/3 para Gabriel...`
                  }
                  disabled={isLoading || privateQuestionCount >= 3}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent resize-none min-h-[50px] max-h-32 disabled:opacity-50"
                  rows={2}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrivateChat}
                disabled={!newMessage.trim() || isLoading || privateQuestionCount >= 3}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-3 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-white/50">
                {privateQuestionCount >= 3 
                  ? "Consulta completada ✨" 
                  : "Presiona Enter para enviar • Shift+Enter para nueva línea"
                }
              </p>
              <p className="text-xs text-yellow-400/70">
                {privateQuestionCount}/3 preguntas privadas
              </p>
            </div>
          </div>
        )}

        {/* Botón de interpretación paso a paso */}
        {(chatPhase === 'waiting_to_start' || chatPhase === 'asking_archangels' || chatPhase === 'synthesis') && (
          <div className="border-t border-white/20 p-4">
            <div className="flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInterpretationStep}
                disabled={isLoading}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Crown className="w-5 h-5" />
                    </motion.div>
                    <span>Canalizando...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>{buttonText}</span>
                  </>
                )}
              </motion.button>
            </div>
            {chatPhase === 'asking_archangels' && (
              <div className="flex justify-center mt-2">
                <p className="text-xs text-white/50">
                  Arcángel {currentArchangelIndex + 1} de {safeCards.length}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Estado completado */}
        {chatPhase === 'completed' && (
          <div className="border-t border-white/20 p-4">
            <div className="text-center text-white/70">
              <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm">Tu consulta angelical ha sido completada</p>
              <p className="text-xs mt-1 opacity-70">Que la luz divina te acompañe siempre ✨</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex justify-center pt-4 flex-shrink-0"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevious}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Volver a las cartas</span>
        </motion.button>
      </motion.div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 50,
            }}
            animate={{
              y: -50,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  );
}