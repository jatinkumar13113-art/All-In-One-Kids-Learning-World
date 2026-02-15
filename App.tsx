
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

  // Translation cache to avoid redundant API calls
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

    // Load voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
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
      console.error("Translation Error:", error);
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

  // Helper to find the "cutest" voice
  const getKidVoice = (lang: string) => {
    const filtered = availableVoices.filter(v => v.lang.startsWith(lang));
    // Prefer "Google" voices as they often sound smoother, or voices with "Kid", "Child", or "Junior" in the name
    const cuteVoice = filtered.find(v => 
      v.name.toLowerCase().includes('kid') || 
      v.name.toLowerCase().includes('child') || 
      v.name.toLowerCase().includes('junior') ||
      v.name.toLowerCase().includes('google')
    );
    return cuteVoice || filtered[0];
  };

  const speak = useCallback(async (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    
    let textToSpeak = text;
    if (progress.language !== 'en') {
      textToSpeak = await translateText(text, progress.language);
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = progress.language === 'en' ? 'en-US' : progress.language;
    
    // BABY VOICE SETTINGS: Higher pitch, slightly faster rate for excitement
    utterance.pitch = 1.7; 
    utterance.rate = 1.05;
    utterance.volume = 1;

    const voice = getKidVoice(utterance.lang);
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }, [progress.language, availableVoices]);

  const playAnimalSound = useCallback((item: LearningItem) => {
    if (!item.soundPhonetic) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.soundPhonetic);
    
    // Animal sounds should be "fun" but recognizable
    utterance.rate = 0.9; 
    utterance.pitch = 1.2; 
    
    const voice = getKidVoice(progress.language);
    if (voice) utterance.voice = voice;
    
    window.speechSynthesis.speak(utterance);
  }, [progress.language, availableVoices]);

  const playSoundEffect = (type: 'win' | 'correct' | 'wrong' | 'click') => {
    if (type === 'win') Confetti();
  };

  const handleStart = useCallback(() => {
    speak("Hi! Let's play together!");
    setGameState('CATEGORY_SELECT');
  }, [speak]);

  const handleSelectCategory = useCallback((cat: Category) => {
    speak(`Let's go to ${cat.name}! Yay!`);
    setSelectedCategory(cat);
    setGameState('LEARNING');
  }, [speak]);

  const handleFinishLearning = useCallback(() => {
    speak("Let's do a fun quiz!");
    setGameState('QUIZ');
  }, [speak]);

  const handleQuizComplete = useCallback((score: number) => {
    const earnedStars = Math.floor(score / 20);
    setProgress(prev => ({
      ...prev,
      stars: prev.stars + earnedStars,
      level: prev.level + (earnedStars > 2 ? 1 : 0)
    }));
    playSoundEffect('win');
    setGameState('REWARDS');
  }, []);

  const handleGoBack = useCallback(() => {
    const current = stateRef.current;
    if (current === 'CATEGORY_SELECT') setGameState('HOME');
    else if (current === 'LEARNING') setGameState('CATEGORY_SELECT');
    else if (current === 'QUIZ') setGameState('LEARNING');
    else if (current === 'REWARDS') setGameState('CATEGORY_SELECT');
    speak("Going back!");
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
      }, 1000);
    };

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      setLastCommand(command);
      if (command.includes('go back') || command.includes('back')) handleGoBack();
      else if (command.includes('start quiz') || command.includes('quiz')) {
        if (stateRef.current === 'LEARNING') handleFinishLearning();
      } else if (command.includes('play now') || command.includes('start game')) {
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
    // Wait a bit for state to update
    setTimeout(() => speak(`Okay! Changing language!`), 100);
  };

  const renderContent = () => {
    switch (gameState) {
      case 'HOME':
        return (
          <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center">
            <div className="relative mb-12">
               <h1 className="text-6xl md:text-8xl kids-font text-orange-500 tracking-tight drop-shadow-[0_8px_0_rgba(194,65,12,1)] animate-bounce-subtle">
                KIDS<br/>WORLD
               </h1>
               <div className="absolute -top-4 -right-8 text-4xl animate-float">🌟</div>
            </div>
            
            <div className="relative group">
              <button 
                onClick={handleStart}
                className="relative bg-green-500 text-white text-4xl px-16 py-8 rounded-[3rem] font-bold shadow-[0_15px_0_#15803d,0_20px_40px_rgba(0,0,0,0.1)] transform active:translate-y-4 active:shadow-none transition-all hover:scale-105 active:scale-95 flex items-center space-x-4"
              >
                <span>PLAY NOW!</span>
                <span className="text-5xl">🎈</span>
              </button>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-lg px-4">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  className={`px-4 py-2 rounded-2xl shadow-[0_4px_0_#ddd] kids-font text-sm transition-all transform active:scale-90 ${progress.language === lang.code ? 'bg-orange-500 text-white shadow-[0_4px_0_#c2410c]' : 'bg-white text-gray-700'}`}
                >
                  <span className="mr-1">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>

            <p className="mt-6 text-blue-500 font-bold animate-pulse text-xl">Say "Play Now" to Start!</p>
            <Mascot />
          </div>
        );

      case 'CATEGORY_SELECT':
        return (
          <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10 sticky top-0 bg-sky-100/90 backdrop-blur-md z-20 py-4 px-2">
               <button onClick={() => setGameState('HOME')} className="bg-white p-4 rounded-3xl shadow-[0_8px_0_#ddd] text-3xl hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all">🏠</button>
               <h2 className="text-4xl kids-font text-blue-600 drop-shadow-sm">Choose Fun!</h2>
               <button onClick={() => setIsLocked(true)} className="bg-white p-4 rounded-3xl shadow-[0_8px_0_#ddd] text-3xl hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all">⚙️</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-32">
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
          <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 space-y-10 animate-in fade-in zoom-in duration-500">
            <div className="text-[12rem] animate-float drop-shadow-2xl">🏆</div>
            <h2 className="text-6xl kids-font text-orange-500 drop-shadow-lg">Superstar!</h2>
            <div className="flex space-x-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-8xl star-shine drop-shadow-xl">⭐</div>
              ))}
            </div>
            <button 
              onClick={() => {
                speak("Let's pick another one!");
                setGameState('CATEGORY_SELECT');
              }}
              className="bg-blue-600 text-white text-3xl px-16 py-8 rounded-[3rem] font-bold shadow-[0_12px_0_#1e3a8a] hover:bg-blue-700 active:translate-y-3 active:shadow-none transition-all"
            >
              Play Again!
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 selection:bg-pink-300 selection:text-white">
      <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-10 left-[10%] text-7xl animate-float">☁️</div>
        <div className="absolute top-40 right-[15%] text-6xl animate-pulse">☁️</div>
        <div className="absolute bottom-[20%] left-[5%] text-6xl animate-bounce">🌻</div>
        <div className="absolute bottom-[10%] right-[10%] text-7xl animate-bounce-subtle">🎨</div>
        <div className="absolute top-[45%] left-[2%] text-8xl animate-pulse opacity-20">🌈</div>
      </div>

      <div className={`fixed top-4 right-4 z-50 flex items-center space-x-3 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full shadow-2xl border-4 transition-all duration-500 ${isListening ? 'border-green-400 scale-100' : 'border-gray-200 scale-90 opacity-40'}`}>
        <div className={`w-4 h-4 rounded-full ${isListening ? 'bg-green-500 animate-ping' : 'bg-gray-400'}`}></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-700 uppercase leading-none kids-font">
            Listening
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mt-0.5">
            {isListening ? 'Active' : 'Standby'}
          </span>
        </div>
      </div>

      <main className="relative z-10 pt-4">
        {renderContent()}
      </main>

      {gameState === 'HOME' && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
           <div className="bg-white/80 backdrop-blur-md px-10 py-4 rounded-[2rem] shadow-xl border-4 border-white kids-font text-blue-500 text-2xl flex items-center space-x-6">
             <span>⭐ STARS: {progress.stars}</span>
             <span className="w-1 h-8 bg-blue-100"></span>
             <span>🏅 LEVEL: {progress.level}</span>
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
