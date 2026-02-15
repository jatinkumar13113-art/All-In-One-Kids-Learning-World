
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CATEGORIES, APP_CONFIG } from './constants';
import { GameState, Category, UserProgress, CategoryId, SUPPORTED_LANGUAGES, LearningItem } from './types';
import Mascot from './components/Mascot';
import CategoryCard from './components/CategoryCard';
import LearningView from './components/LearningView';
import QuizView from './components/QuizView';
import ParentPortal from './components/ParentPortal';
import Confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    stars: 0,
    completedCategories: [],
    level: 1,
    language: 'en'
  });
  const [isLocked, setIsLocked] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const translationCache = useRef<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Progress Load Error", e);
      }
    }

    const loadVoices = () => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const translateWithRetry = async (text: string, targetLang: string, retries = 3, backoff = 1000): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following word for a toddler learning game into ${targetLang}. Only return the translated word: "${text}"`,
      });
      return response.text?.trim() || text;
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.message?.includes('429'))) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        return translateWithRetry(text, targetLang, retries - 1, backoff * 2);
      }
      return text;
    }
  };

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (!text || targetLang === 'en') return text;
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache.current[cacheKey]) return translationCache.current[cacheKey];

    setIsTranslating(true);
    const result = await translateWithRetry(text, targetLang);
    translationCache.current[cacheKey] = result;
    setIsTranslating(false);
    return result;
  };

  const getKidVoice = useCallback((lang: string) => {
    const filtered = availableVoices.filter(v => v.lang.startsWith(lang) || v.lang.replace('_', '-').startsWith(lang));
    const cuteVoice = filtered.find(v => 
      v.name.toLowerCase().includes('kid') || 
      v.name.toLowerCase().includes('child') || 
      v.name.toLowerCase().includes('junior') ||
      v.name.toLowerCase().includes('google')
    );
    return cuteVoice || filtered[0] || null;
  }, [availableVoices]);

  const speak = useCallback(async (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    
    let textToSpeak = text;
    if (progress.language !== 'en') {
      textToSpeak = await translateText(text, progress.language);
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = progress.language === 'en' ? 'en-US' : progress.language;
    
    // BABY VOICE SETTINGS
    utterance.pitch = 1.8; 
    utterance.rate = 1.0;
    utterance.volume = 1;

    const voice = getKidVoice(utterance.lang);
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }, [progress.language, getKidVoice]);

  const playAnimalSound = useCallback((item: LearningItem) => {
    if (!item.soundPhonetic) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.soundPhonetic);
    utterance.rate = 0.85; 
    utterance.pitch = 1.3; 
    
    const voice = getKidVoice(progress.language);
    if (voice) utterance.voice = voice;
    
    window.speechSynthesis.speak(utterance);
  }, [progress.language, getKidVoice]);

  const handleStart = useCallback(() => {
    speak("Hi! I'm your learning buddy! Let's play!");
    setGameState('CATEGORY_SELECT');
  }, [speak]);

  const handleSelectCategory = useCallback((cat: Category) => {
    speak(`Let's explore ${cat.name}! Yay!`);
    setSelectedCategory(cat);
    setGameState('LEARNING');
  }, [speak]);

  const handleFinishLearning = useCallback(() => {
    speak("Great job! Now let's do a quiz!");
    setGameState('QUIZ');
  }, [speak]);

  const handleQuizComplete = useCallback((score: number) => {
    const earnedStars = Math.floor(score / 20);
    setProgress(prev => ({
      ...prev,
      stars: prev.stars + earnedStars,
      level: prev.level + (earnedStars > 2 ? 1 : 0)
    }));
    Confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    setGameState('REWARDS');
  }, []);

  const handleGoBack = useCallback(() => {
    const current = stateRef.current;
    if (current === 'CATEGORY_SELECT') setGameState('HOME');
    else if (current === 'LEARNING') setGameState('CATEGORY_SELECT');
    else if (current === 'QUIZ') setGameState('LEARNING');
    else if (current === 'REWARDS') setGameState('CATEGORY_SELECT');
    speak("Okay! Going back!");
  }, [speak]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => { 
      setIsListening(false); 
      setTimeout(() => {
        try { recognition.start(); } catch(e) {}
      }, 2000);
    };

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      setLastCommand(command);
      if (command.includes('go back') || command.includes('back')) handleGoBack();
      else if (command.includes('start quiz') || command.includes('quiz')) {
        if (stateRef.current === 'LEARNING') handleFinishLearning();
      } else if (command.includes('play now') || command.includes('start game') || command.includes('play game')) {
        if (stateRef.current === 'HOME') handleStart();
      }
    };

    try { recognition.start(); } catch(e) {}
    return () => {
      recognition.onend = null;
      try { recognition.stop(); } catch(e) {}
    };
  }, [handleGoBack, handleFinishLearning, handleStart]);

  const toggleLanguage = (langCode: string) => {
    setProgress(prev => ({ ...prev, language: langCode }));
    setTimeout(() => speak(`Okay! Let's learn in this language!`), 200);
  };

  const renderContent = () => {
    switch (gameState) {
      case 'HOME':
        return (
          <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center pb-20 overflow-hidden">
            <div className="relative mb-12">
               <h1 className="text-6xl md:text-8xl kids-font text-orange-500 tracking-tight drop-shadow-[0_8px_0_rgba(194,65,12,1)] animate-bounce-subtle">
                KIDS<br/>WORLD
               </h1>
               <div className="absolute -top-10 -right-10 text-6xl animate-float">🌟</div>
            </div>
            
            <button 
              onClick={handleStart}
              className="relative bg-green-500 text-white text-3xl md:text-4xl px-12 md:px-20 py-6 md:py-8 rounded-[3rem] font-bold shadow-[0_15px_0_#15803d,0_20px_40px_rgba(0,0,0,0.1)] transform active:translate-y-4 active:shadow-none transition-all hover:scale-105 flex items-center space-x-4 animate-pulse-subtle"
            >
              <span>PLAY NOW!</span>
              <span className="text-5xl">🎈</span>
            </button>
            
            <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-2xl px-4">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  className={`px-4 py-2 rounded-2xl shadow-[0_4px_0_#ddd] font-bold text-sm transition-all transform active:scale-90 flex items-center space-x-2 ${progress.language === lang.code ? 'bg-orange-500 text-white shadow-[0_4px_0_#c2410c]' : 'bg-white text-gray-700'}`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>

            <p className="mt-8 text-blue-600 font-bold animate-pulse text-lg kids-font tracking-wide">
              {isListening ? '🎤 I am listening! Say "Play Now"!' : 'Tap Play to start!'}
            </p>
            <Mascot />
          </div>
        );

      case 'CATEGORY_SELECT':
        return (
          <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32">
            <div className="flex justify-between items-center mb-10 sticky top-0 bg-sky-100/95 backdrop-blur-md z-30 py-4 px-2 rounded-3xl">
               <button onClick={() => setGameState('HOME')} className="bg-white p-4 rounded-3xl shadow-[0_8px_0_#ddd] text-3xl hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all">🏠</button>
               <h2 className="text-3xl md:text-4xl kids-font text-blue-600 drop-shadow-sm">Choose One!</h2>
               <button onClick={() => setIsLocked(true)} className="bg-white p-4 rounded-3xl shadow-[0_8px_0_#ddd] text-3xl hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all">⚙️</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
              {CATEGORIES.map(cat => (
                <CategoryCard key={cat.id} category={cat} onClick={() => handleSelectCategory(cat)} />
              ))}
            </div>
          </div>
        );

      case 'LEARNING':
        return selectedCategory && (
          <LearningView 
            category={selectedCategory} 
            onBack={() => setGameState('CATEGORY_SELECT')} 
            onFinish={handleFinishLearning}
            speak={speak}
            playAnimalSound={playAnimalSound}
            voiceCommand={lastCommand}
            language={progress.language}
            isTranslating={isTranslating}
          />
        );

      case 'QUIZ':
        return selectedCategory && (
          <QuizView 
            category={selectedCategory} 
            onComplete={handleQuizComplete}
            onBack={() => setGameState('LEARNING')}
            speak={speak}
            voiceCommand={lastCommand}
            language={progress.language}
            isTranslating={isTranslating}
          />
        );

      case 'REWARDS':
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 space-y-10">
            <div className="text-[12rem] animate-float drop-shadow-2xl">🏆</div>
            <h2 className="text-5xl md:text-7xl kids-font text-orange-500 drop-shadow-lg text-center">YOU ARE A STAR!</h2>
            <div className="flex space-x-6">
              {[1, 2, 3].map(i => (
                <div key={i} className={`text-7xl md:text-9xl animate-bounce delay-${i * 100} drop-shadow-xl`}>⭐</div>
              ))}
            </div>
            <button 
              onClick={() => {
                speak("Pick another one, superstar!");
                setGameState('CATEGORY_SELECT');
              }}
              className="bg-blue-600 text-white text-3xl px-16 py-8 rounded-[3rem] font-bold shadow-[0_12px_0_#1e3a8a] hover:bg-blue-700 active:translate-y-3 active:shadow-none transition-all"
            >
              NEXT CHALLENGE!
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-10 left-[5%] text-7xl animate-float">☁️</div>
        <div className="absolute top-60 right-[10%] text-6xl animate-pulse">☁️</div>
        <div className="absolute bottom-[15%] left-[10%] text-6xl animate-bounce">🌻</div>
        <div className="absolute bottom-[5%] right-[5%] text-7xl animate-bounce-subtle">🎨</div>
        <div className="absolute top-[40%] left-[-2%] text-9xl animate-pulse opacity-10">🌈</div>
      </div>

      <main className="relative z-10">
        {renderContent()}
      </main>

      {(gameState === 'HOME' || gameState === 'CATEGORY_SELECT') && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-40">
           <div className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-[2.5rem] shadow-2xl border-4 border-white kids-font text-blue-500 text-xl md:text-2xl flex items-center space-x-8">
             <span>⭐ {progress.stars}</span>
             <span className="w-1 h-8 bg-blue-100"></span>
             <span>🏅 LEVEL {progress.level}</span>
           </div>
        </div>
      )}

      {isLocked && (
        <ParentPortal 
          onUnlock={() => setIsLocked(false)} 
          onClose={() => setIsLocked(false)} 
        />
      )}
    </div>
  );
};

export default App;
