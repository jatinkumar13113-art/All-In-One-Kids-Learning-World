
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Category, LearningItem } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  category: Category;
  onComplete: (score: number) => void;
  onBack: () => void;
  speak: (text: string) => void;
  language: string;
  isTranslating: boolean;
}

const QuizView: React.FC<Props> = ({ category, onComplete, onBack, speak, language, isTranslating: parentIsTranslating }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [localTranslatedName, setLocalTranslatedName] = useState('');
  const [isLocalTranslating, setIsLocalTranslating] = useState(false);
  const lastTranslatedText = useRef('');

  const items = category.items as LearningItem[];
  const currentQuestion = items[questionIndex];
  
  const options = useMemo(() => {
    const others = items.filter(i => i.id !== currentQuestion.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
    const result = [currentQuestion, ...shuffledOthers.slice(0, 3)];
    return result.sort(() => 0.5 - Math.random());
  }, [currentQuestion, items]);

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
    fetchTranslation(currentQuestion.name);
  }, [currentQuestion.name, fetchTranslation]);

  const askQuestion = useCallback(() => {
    speak(`Where is the ${currentQuestion.name}? Can you find it?`);
  }, [currentQuestion.name, speak]);

  useEffect(() => {
    askQuestion();
  }, [askQuestion]);

  const handleAnswer = (item: LearningItem) => {
    if (feedback) return;

    if (item.id === currentQuestion.id) {
      setScore(prev => prev + 25);
      setFeedback('correct');
      speak("Yay! You found it! Great job!");
      setTimeout(() => {
        setFeedback(null);
        if (questionIndex < 4 && questionIndex < items.length - 1) {
          setQuestionIndex(prev => prev + 1);
        } else {
          onComplete(score + 25);
        }
      }, 2000);
    } else {
      setFeedback('wrong');
      speak("Oh no! That's not it. Try again!");
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  const loading = parentIsTranslating || isLocalTranslating;

  return (
    <div className="min-h-screen p-4 flex flex-col bg-sky-100 overflow-hidden">
      <div className="flex justify-between items-center mb-6 px-2 pt-2">
        <button onClick={onBack} className="bg-white p-4 rounded-3xl shadow-[0_8px_0_#ddd] text-3xl active:translate-y-1 transition-all">🔙</button>
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl kids-font text-blue-600 drop-shadow-sm">QUIZ TIME!</h2>
            {loading && <span className="text-xs text-orange-400 font-bold animate-pulse block">✨ Thinking...</span>}
        </div>
        <div className="text-2xl md:text-3xl font-bold text-orange-500 bg-white px-6 py-3 rounded-3xl shadow-[0_8px_0_#ddd] kids-font animate-pulse-subtle">⭐ {score}</div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center space-y-8 md:space-y-12 pb-10">
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] clay-card text-center border-4 border-dashed border-blue-200 w-full max-w-md animate-bounce-subtle">
           <p className="text-3xl text-gray-400 mb-4 kids-font uppercase tracking-tighter">FIND THE...</p>
           <h3 className="text-6xl md:text-7xl kids-font text-blue-600 drop-shadow-md px-2 break-words">
             {loading ? '...' : (localTranslatedName || currentQuestion.name)}
           </h3>
        </div>

        <div className="grid grid-cols-2 gap-6 md:gap-10 w-full max-w-xl px-4">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleAnswer(opt)}
              className={`aspect-square bg-white rounded-[3.5rem] clay-button flex items-center justify-center text-[7rem] md:text-[9rem] transition-all transform active:scale-90
                ${feedback === 'correct' && opt.id === currentQuestion.id ? 'bg-green-100 scale-105 shadow-[0_12px_0_#15803d]' : 'shadow-[0_12px_0_#ddd]'}
                ${feedback === 'wrong' && opt.id !== currentQuestion.id ? 'opacity-30 grayscale blur-[2px] translate-y-2' : 'hover:scale-105'}
              `}
            >
              <span className="drop-shadow-2xl">{opt.image}</span>
            </button>
          ))}
        </div>
      </div>

      {feedback === 'correct' && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white p-16 rounded-full text-5xl md:text-7xl font-bold shadow-2xl kids-font animate-in zoom-in spin-in-12 duration-500">
             AWESOME! 🌟
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
