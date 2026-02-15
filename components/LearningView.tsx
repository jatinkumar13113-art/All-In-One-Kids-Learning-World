
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Category, LearningItem, CategoryId } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  category: Category;
  onBack: () => void;
  onFinish: () => void;
  speak: (text: string) => void;
  playAnimalSound: (item: LearningItem) => void;
  voiceCommand: string;
  language: string;
  isTranslating: boolean;
}

const LearningView: React.FC<Props> = ({ category, onBack, onFinish, speak, playAnimalSound, voiceCommand, language, isTranslating: parentIsTranslating }) => {
  const [index, setIndex] = useState(0);
  const [localTranslatedName, setLocalTranslatedName] = useState('');
  const [isLocalTranslating, setIsLocalTranslating] = useState(false);
  const items = category.items as LearningItem[];
  const currentItem = items[index];
  const lastTranslatedText = useRef('');

  const fetchTranslation = useCallback(async (text: string) => {
    if (!text) return;
    if (language === 'en') {
      setLocalTranslatedName(text);
      return;
    }
    if (lastTranslatedText.current === text) return;

    setIsLocalTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the word "${text}" to ${language}. Only return the translated word.`,
      });
      const translated = response.text.trim() || text;
      setLocalTranslatedName(translated);
      lastTranslatedText.current = text;
    } catch (e) {
      console.error(e);
      setLocalTranslatedName(text);
    } finally {
      setIsLocalTranslating(false);
    }
  }, [language]);

  useEffect(() => {
    fetchTranslation(currentItem.name);
  }, [currentItem.name, fetchTranslation]);

  const handleSpeak = useCallback(() => {
    // If it's a rhyme, speak the lyrics (audioText), else speak the name
    if (category.id === CategoryId.RHYMES && currentItem.audioText) {
      speak(currentItem.audioText);
    } else {
      speak(currentItem.name);
    }
  }, [category.id, currentItem.name, currentItem.audioText, speak]);

  const handleAnimalSound = useCallback(() => {
    playAnimalSound(currentItem);
  }, [currentItem, playAnimalSound]);

  const handleNext = useCallback(() => {
    if (index < items.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      onFinish();
    }
  }, [index, items.length, onFinish]);

  const handlePrev = useCallback(() => {
    if (index > 0) {
      setIndex(prev => prev - 1);
    }
  }, [index]);

  // Initial Speak on item change
  useEffect(() => {
    handleSpeak();
  }, [index, handleSpeak]);

  useEffect(() => {
    if (!voiceCommand) return;
    if (voiceCommand.includes('next') || voiceCommand.includes('forward')) {
      handleNext();
    } else if (voiceCommand.includes('previous')) {
      handlePrev();
    } else if (voiceCommand.includes('play sound') || voiceCommand.includes('repeat') || voiceCommand.includes('speak')) {
      handleSpeak();
    } else if (voiceCommand.includes('animal sound') || voiceCommand.includes('make sound')) {
      handleAnimalSound();
    }
  }, [voiceCommand, handleNext, handlePrev, handleSpeak, handleAnimalSound]);

  const loading = parentIsTranslating || isLocalTranslating;
  const isRhyme = category.id === CategoryId.RHYMES;

  return (
    <div className="flex flex-col h-screen p-4 bg-sky-100 overflow-hidden">
      <div className="flex justify-between items-center mb-6 pt-2">
        <button 
          onClick={onBack} 
          className="bg-white text-3xl p-3 rounded-2xl shadow-[0_6px_0_#ddd,0_10px_20px_rgba(0,0,0,0.05)] active:translate-y-1 active:shadow-none transition-all"
        >
          🔙
        </button>
        <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600 bg-white px-8 py-3 rounded-full shadow-[0_6px_0_#ddd] kids-font">
              {index + 1} / {items.length}
            </div>
            {loading && <span className="text-[10px] text-orange-400 font-bold animate-pulse">✨ Translating...</span>}
        </div>
        <div className="flex space-x-3">
          {currentItem.soundPhonetic && (
            <button 
              onClick={handleAnimalSound} 
              className="bg-orange-400 text-3xl p-3 rounded-2xl shadow-[0_6px_0_#c2410c,0_10px_20px_rgba(0,0,0,0.05)] active:translate-y-1 active:shadow-none transition-all"
              title="Animal Sound"
            >
              🐾
            </button>
          )}
          <button 
            onClick={handleSpeak} 
            className="bg-white text-3xl p-3 rounded-2xl shadow-[0_6px_0_#ddd,0_10px_20px_rgba(0,0,0,0.05)] active:translate-y-1 active:shadow-none transition-all"
            title="Pronounce"
          >
            {isRhyme ? '🎵' : '🔊'}
          </button>
        </div>
      </div>

      <div className={`flex-grow flex ${isRhyme ? 'flex-col' : 'items-center justify-center'} perspective-lg`}>
        <div className={`w-full max-w-sm ${isRhyme ? 'mx-auto mb-4 p-4' : 'aspect-[4/5] p-8 clay-card transform rotate-x-6 hover:rotate-0'} bg-white rounded-[4rem] flex flex-col items-center justify-center shadow-2xl transition-all`}>
           <div className={`${isRhyme ? 'text-[8rem]' : 'text-[12rem] md:text-[15rem]'} mb-6 drop-shadow-2xl animate-bounce-subtle`}>
             {currentItem.image}
           </div>
           <h2 className={`${isRhyme ? 'text-4xl' : 'text-5xl md:text-6xl'} kids-font text-blue-800 drop-shadow-md text-center`}>
             {loading ? '...' : (localTranslatedName || currentItem.name)}
           </h2>
        </div>

        {isRhyme && currentItem.audioText && (
          <div className="w-full max-w-lg mx-auto bg-white/60 backdrop-blur-md rounded-3xl p-6 border-4 border-dashed border-blue-200 shadow-inner flex-grow overflow-y-auto mt-4 max-h-[30vh]">
            <p className="text-2xl text-blue-900 text-center leading-relaxed kids-font whitespace-pre-line animate-pulse-subtle">
              {currentItem.audioText}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-10 p-10 pb-12">
        <button 
          onClick={handlePrev} 
          disabled={index === 0}
          className={`text-5xl bg-orange-400 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-[0_10px_0_#c2410c,0_15px_30px_rgba(0,0,0,0.15)] transition-all ${index === 0 ? 'opacity-30' : 'active:translate-y-2 active:shadow-none'}`}
        >
          ⬅️
        </button>
        <button 
          onClick={handleNext} 
          className="text-5xl bg-green-500 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-[0_10px_0_#15803d,0_15px_30px_rgba(0,0,0,0.15)] transition-all active:translate-y-2 active:shadow-none"
        >
          ➡️
        </button>
      </div>
    </div>
  );
};

export default LearningView;
