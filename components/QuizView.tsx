
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Category, LearningItem } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  category: Category;
  onComplete: (score: number) => void;
  onBack: () => void;
  speak: (text: string) => void;
  voiceCommand: string;
  language: string;
  isTranslating: boolean;
}

const QuizView: React.FC<Props> = ({ category, onComplete, onBack, speak, voiceCommand, language, isTranslating: parentIsTranslating }) => {
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
      console.error(e);
      setLocalTranslatedName(text);
    } finally {
      setIsLocalTranslating(false);
    }
  }, [language]);

  useEffect(() => {
    fetchTranslation(currentQuestion.name);
  }, [currentQuestion.name, fetchTranslation]);

  const askQuestion = useCallback(() => {
    speak(`Where is the ${currentQuestion.name}?`);
  }, [currentQuestion.name, speak]);

  useEffect(() => {
    askQuestion();
  }, [askQuestion]);

  useEffect(() => {
    if (!voiceCommand) return;
    if (voiceCommand.includes('play sound') || voiceCommand.includes('repeat') || voiceCommand.includes('speak')) {
      askQuestion();
    }
  }, [voiceCommand, askQuestion]);

  const handleAnswer = (item: LearningItem) => {
    if (feedback) return;

    if (item.id === currentQuestion.id) {
      setScore(prev => prev + 25);
      setFeedback('correct');
      speak("Great job!");
      setTimeout(() => {
        setFeedback(null);
        if (questionIndex < items.length - 1 && questionIndex < 4) {
          setQuestionIndex(prev => prev + 1);
        } else {
          onComplete(score + 25);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      speak("Oops, try again!");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const loading = parentIsTranslating || isLocalTranslating;

  return (
    <div className="min-h-screen p-4 flex flex-col bg-sky-100">
      <div className="flex justify-between items-center mb-8 px-2">
        <button onClick={onBack} className="bg-white p-4 rounded-3xl shadow-[0_6px_0_#ddd] text-3xl active:translate-y-1 active:shadow-none transition-all">🔙</button>
        <div className="text-center">
            <h2 className="text-4xl kids-font text-blue-600 drop-shadow-sm">QUIZ!</h2>
            {loading && <span className="text-[10px] text-orange-400 font-bold animate-pulse block">✨ Translating...</span>}
        </div>
        <div className="text-3xl font-bold text-orange-500 bg-white px-6 py-3 rounded-3xl shadow-[0_6px_0_#ddd] kids-font">⭐ {score}</div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center space-y-12">
        <div className="bg-white p-10 rounded-[3.5rem] clay-card text-center border-4 border-dashed border-blue-200 w-full max-w-md animate-bounce-subtle">
           <p className="text-4xl text-gray-500 mb-4 kids-font opacity-60 uppercase tracking-tighter">Find The</p>
           <h3 className="text-7xl kids-font text-blue-600 mb-2 drop-shadow-md">
             {loading ? '...' : (localTranslatedName || currentQuestion.name)}
           </h3>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleAnswer(opt)}
              className={`aspect-square bg-white rounded-[3rem] clay-button flex items-center justify-center text-9xl transition-all transform active:scale-90
                ${feedback === 'correct' && opt.id === currentQuestion.id ? 'bg-green-100 scale-105 shadow-[0_12px_0_#15803d]' : 'shadow-[0_12px_0_#ddd]'}
                ${feedback === 'wrong' && opt.id !== currentQuestion.id ? 'opacity-40 grayscale blur-[1px]' : ''}
              `}
            >
              <span className="drop-shadow-xl">{opt.image}</span>
            </button>
          ))}
        </div>
      </div>

      {feedback === 'correct' && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-in fade-in zoom-in">
          <div className="bg-green-500 text-white p-12 rounded-full text-6xl font-bold shadow-2xl kids-font drop-shadow-xl">
            🌟 BRAVO! 🌟
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
