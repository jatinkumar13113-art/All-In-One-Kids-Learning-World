
import React, { useState } from 'react';

interface Props {
  onUnlock: () => void;
  onClose: () => void;
}

const ParentPortal: React.FC<Props> = ({ onUnlock, onClose }) => {
  const [num1] = useState(Math.floor(Math.random() * 5) + 1);
  const [num2] = useState(Math.floor(Math.random() * 5) + 1);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer) === num1 + num2) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
      setAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-900/90 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
      <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-3xl">✖️</button>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Parent Lock</h2>
        <p className="text-gray-600 mb-8 text-center text-xl">Please solve to access settings:</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
          <div className="text-5xl font-bold text-blue-600 bg-blue-50 px-8 py-4 rounded-3xl border-2 border-blue-200">
            {num1} + {num2} = ?
          </div>
          
          <input 
            type="number" 
            autoFocus
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className={`w-full text-center text-4xl p-4 border-4 rounded-2xl outline-none transition-colors
              ${error ? 'border-red-500 bg-red-50' : 'border-blue-100 focus:border-blue-400'}`}
            placeholder="Answer"
          />
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white text-2xl font-bold py-5 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors"
          >
            Unlock Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default ParentPortal;
