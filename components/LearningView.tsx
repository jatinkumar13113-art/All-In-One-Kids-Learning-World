
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Category, LearningItem, CategoryId } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  category: Category;
  onBack: () => void;
  onFinish: () => void;
  speak: (text: string) => void;
  playAnimalSound: (item: LearningItem) => void;
  language: string;
  isTranslating: boolean;
}

const LearningView: React.FC<Props> = ({ category, onBack, onFinish, speak, playAnimalSound, language, isTranslating: parentIsTranslating }) => {
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
      setLocalTranslatedName(text);
    } finally {
      setIsLocalTranslating(false);
    }
  }, [language]);

  useEffect(() => {
    fetchTranslation(currentItem.name);
  }, [currentItem.name, fetchTranslation]);

  const handleSpeak = useCallback(() => {
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

  useEffect(() => {
    handleSpeak();
  }, [index, handleSpeak]);

  const loading = parentIsTranslating || isLocalTranslating;
  const isRhyme = category.id === CategoryId.RHYMES;

  return (
    <div className="flex flex-col h-screen p-4 bg-sky-100 overflow-hidden">
      <div className="flex justify-between items-center mb-6 pt-2 px-2">
        <button 
          onClick={onBack} 
          className="bg-white text-3xl p-4 rounded-3xl shadow-[0_8px_0_#ddd] active:translate-y-1 active:shadow-none transition-all"
        >
          🔙
        </button>
        <div className="flex flex-col items-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 bg-white px-8 py-3 rounded-full shadow-[0_8px_0_#ddd] kids-font">
              {index + 1} / {items.length}
            </div>
            {loading && <span className="text-xs text-orange-400 font-bold animate-pulse mt-1">✨ Learning...</span>}
        </div>
        <div className="flex space-x-3">
          {currentItem.soundPhonetic && (
            <button 
              onClick={handleAnimalSound} 
              className="bg-orange-400 text-3xl p-4 rounded-3xl shadow-[0_8px_0_#c2410c] active:translate-y-1 active:shadow-none transition-all"
            >
              🐾
            </button>
          )}
          <button 
            onClick={handleSpeak} 
            className="bg-white text-3xl p-4 rounded-3xl shadow-[0_8px_0_#ddd] active:translate-y-1 active:shadow-none transition-all"
          >
            {isRhyme ? '🎵' : '🔊'}
          </button>
        </div>
      </div>

      <div className={`flex-grow flex ${isRhyme ? 'flex-col' : 'items-center justify-center'} perspective-lg`}>
        <div className={`w-full max-w-sm ${isRhyme ? 'mx-auto mb-4 p-6' : 'aspect-[4/5] p-10 clay-card'} bg-white rounded-[4rem] flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-[1.02]`}>
           <div className={`${isRhyme ? 'text-[7rem]' : 'text-[10rem] md:text-[14rem]'} mb-6 drop-shadow-2xl animate-bounce-subtle`}>
             {currentItem.image}
           </div>
           <h2 className={`${isRhyme ? 'text-4xl' : 'text-5xl md:text-6xl'} kids-font text-blue-800 drop-shadow-md text-center break-words max-w-full px-2`}>
             {loading ? '...' : (localTranslatedName || currentItem.name)}
           </h2>
        </div>

        {isRhyme && currentItem.audioText && (
          <div className="w-full max-w-lg mx-auto bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 border-4 border-dashed border-blue-200 shadow-inner flex-grow overflow-y-auto mt-4 max-h-[35vh]">
            <p className="text-xl md:text-2xl text-blue-900 text-center leading-relaxed font-bold whitespace-pre-line">
              {currentItem.audioText}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-12 p-8 md:p-12 pb-16">
        <button 
          onClick={handlePrev} 
          disabled={index === 0}
          className={`text-5xl bg-orange-400 text-white w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center shadow-[0_10px_0_#c2410c] transition-all ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'active:translate-y-2 active:shadow-none hover:scale-105'}`}
        >
          ⬅️
        </button>
        <button 
          onClick={handleNext} 
          className="text-5xl bg-green-500 text-white w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center shadow-[0_10px_0_#15803d] transition-all active:translate-y-2 active:shadow-none hover:scale-105"
        >
          ➡️
        </button>
      </div>
    </div>
  );
};

export default LearningView;
