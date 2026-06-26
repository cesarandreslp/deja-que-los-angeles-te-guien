"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Heart, Eye, Star } from 'lucide-react';
import WelcomeStep from "@/components/oraculo/WelcomeStep";
import IntentCaptureStep from "@/components/oraculo/IntentCaptureStep";
import PrayerVideoStep from "@/components/oraculo/PrayerVideoStep";
import ReadingTypeStep from "@/components/oraculo/ReadingTypeStep";
import ShuffleStep from "@/components/oraculo/ShuffleStep";
import CardSelectionStep from "@/components/oraculo/CardSelectionStep";
import RevealStep from "@/components/oraculo/RevealStep";
import GroupChatRevealStep from "@/components/oraculo/GroupChatRevealStep";
import ExistingReadingStep from "@/components/oraculo/ExistingReadingStep";
import { useDailyReading } from "@/hooks/useDailyReading";

export default function OraculoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const dailyReading = useDailyReading()
  
  const [step, setStep] = useState<number>(1);
  const [intent, setIntent] = useState<string>("");
  const [readingType, setReadingType] = useState<number>(3);
  const [cards, setCards] = useState<any[]>([]);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  
  // Ref para evitar bucles infinitos en useEffect
  const hasInitialized = useRef(false);

  const steps = [
    { number: 1, title: 'Bienvenida', icon: Heart },
    { number: 2, title: 'Intención', icon: Sparkles },
    { number: 3, title: 'Oración', icon: Star },
    { number: 4, title: 'Barajado', icon: Sparkles },
    { number: 5, title: 'Tipo de lectura', icon: Eye },
    { number: 6, title: 'Selección', icon: Heart },
    { number: 7, title: 'Revelación', icon: Star },
    { number: 8, title: 'Chat Grupal', icon: Heart },
  ];

  const goToNextStep = () => {
    try {
      setStep(prev => Math.min(prev + 1, 8));
    } catch (error) {
      console.error('Error navigating to next step:', error);
      setHasError(true);
    }
  };

  const goToPreviousStep = () => {
    try {
      setStep(prev => Math.max(prev - 1, 1));
    } catch (error) {
      console.error('Error navigating to previous step:', error);
      setHasError(true);
    }
  };

  // Verificar autenticación y manejar estados de consulta diaria
  useEffect(() => {
    // Evitar bucle infinito - solo ejecutar una vez cuando los datos estén listos
    if (status === 'loading' || dailyReading.loading) return;
    if (hasInitialized.current) return; // Ya se inicializó

    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/oraculo');
      return;
    }

    if (dailyReading.requiresMembership) {
      router.push('/memberships?feature=oraculo');
      return;
    }

    if (dailyReading.hasReadingToday && dailyReading.todayReading) {
      // Ya tiene una consulta hoy - configurar datos existentes
      setReadingId(dailyReading.todayReading.id);
      setIntent(dailyReading.todayReading.question);
      setReadingType(dailyReading.todayReading.type);
      
      // Filtrar solo los campos necesarios de las cartas
      const filteredCards = dailyReading.todayReading.cards.map((card: any) => ({
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
      setCards(filteredCards);
      
      // Usar el paso especial para consulta existente
      setStep(10); // Paso especial para consulta existente
      setWelcomeMessage(`¡Bienvenido de nuevo! Esta es tu consulta del oráculo de hoy.`);
      hasInitialized.current = true; // Marcar como inicializado
    } else if (dailyReading.canCreateNew) {
      // NO establecer ningún mensaje inicial - Gabriel se encargará
      hasInitialized.current = true; // Marcar como inicializado
    }

    if (dailyReading.error) {
      setHasError(true);
      hasInitialized.current = true; // Marcar como inicializado
    }
  }, [status, dailyReading.loading, dailyReading.requiresMembership, dailyReading.hasReadingToday, dailyReading.canCreateNew, dailyReading.error, dailyReading.todayReading, router]);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Ha ocurrido un error</h2>
          <p>Por favor, recarga la página para comenzar nuevamente.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  // Mostrar loading mientras verificamos autenticación
  if (dailyReading.loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/80">Conectando con los arcángeles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al dashboard
          </button>
          
          <h1 className="text-xl font-bold text-center flex-1">
            Oráculo de los Arcángeles
          </h1>
          
          <div className="w-24"> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Progress Bar - Solo mostrar para pasos normales */}
      {step !== 10 && (
        <div className="bg-black/10 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {steps.map((stepInfo, index) => {
              const Icon = stepInfo.icon;
              const isActive = step === stepInfo.number;
              const isCompleted = step > stepInfo.number;
              
              return (
                <div key={stepInfo.number} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${isActive ? 'bg-cyan-500 border-cyan-400 text-white' : 
                      isCompleted ? 'bg-green-500 border-green-400 text-white' : 
                      'bg-transparent border-white/30 text-white/50'}
                  `}>
                    {isCompleted ? (
                      <Star className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="ml-2 hidden md:block">
                    <div className={`text-sm font-medium ${isActive ? 'text-cyan-300' : isCompleted ? 'text-green-300' : 'text-white/50'}`}>
                      {stepInfo.title}
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-colors duration-300
                      ${isCompleted ? 'bg-green-400' : 'bg-white/20'}
                    `} />
                  )}
                </div>
              );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <WelcomeStep 
                  onNext={goToNextStep}
                  welcomeMessage={welcomeMessage}
                  setWelcomeMessage={setWelcomeMessage}
                  userName={session?.user?.name || undefined}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="intent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <IntentCaptureStep 
                  intent={intent}
                  setIntent={setIntent}
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="prayer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <PrayerVideoStep 
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="shuffle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <ShuffleStep 
                  intent={intent}
                  readingType={readingType}
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="reading-type"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <ReadingTypeStep 
                  readingType={readingType}
                  setReadingType={setReadingType}
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                />
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <CardSelectionStep 
                  readingType={readingType}
                  intent={intent}
                  onCardsSelected={(result: { cards: any[], readingId: string }) => {
                    console.log('🎯 page.tsx - Cards RECIBIDAS de API:', result.cards);
                    if (result.cards && result.cards.length > 0) {
                      console.log('🎯 page.tsx - Primera carta SIN filtrar:', result.cards[0]);
                      console.log('🎯 page.tsx - Claves de primera carta SIN filtrar:', Object.keys(result.cards[0]));
                    }
                    
                    // Filtrar cartas para eliminar campos de Prisma no renderizables
                    const filteredCards = result.cards.map((card: any) => ({
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
                    
                    console.log('✅ page.tsx - Cards FILTRADAS:', filteredCards);
                    if (filteredCards.length > 0) {
                      console.log('✅ page.tsx - Primera carta FILTRADA:', filteredCards[0]);
                      console.log('✅ page.tsx - Claves de primera carta FILTRADA:', Object.keys(filteredCards[0]));
                    }
                    
                    setCards(filteredCards);
                    setReadingId(result.readingId);
                    goToNextStep();
                  }}
                  onPrevious={goToPreviousStep}
                />
              </motion.div>
            )}

            {step === 7 && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <RevealStep 
                  cards={cards}
                  readingType={readingType}
                  readingId={readingId}
                  intent={intent}
                  onPrevious={goToPreviousStep}
                  onNextToGroupChat={goToNextStep}
                />
              </motion.div>
            )}

            {step === 8 && (
              <motion.div
                key="group-chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {cards && cards.length > 0 ? (
                  <GroupChatRevealStep 
                    cards={cards}
                    readingType={readingType}
                    intent={intent}
                    userName={session?.user?.name || undefined}
                    onPrevious={goToPreviousStep}
                  />
                ) : (
                  <div className="text-center space-y-8">
                    <div className="text-white">
                      <h2 className="text-3xl font-bold mb-4">Preparando el chat...</h2>
                      <p>Parece que falta información de las cartas. Volvamos al paso anterior.</p>
                    </div>
                    <button
                      onClick={goToPreviousStep}
                      className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-300"
                    >
                      Volver
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {step === 10 && dailyReading.todayReading && (() => {
              // Filtrar las cartas para evitar errores de renderizado
              const filteredReading = {
                ...dailyReading.todayReading,
                cards: dailyReading.todayReading.cards.map((card: any) => ({
                  id: card.id,
                  code: card.code,
                  name: card.name,
                  title: card.title || card.name, // Alias para compatibilidad
                  description: card.description,
                  definition: card.definition || card.description, // Alias para compatibilidad
                  imageUrl: card.imageUrl,
                  arcangel: card.arcangel,
                  shortMsg: card.shortMsg
                }))
              };
              
              return (
                <motion.div
                  key="existing-reading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <ExistingReadingStep 
                    reading={filteredReading}
                    onNextToGroupChat={() => setStep(8)}
                  />
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}