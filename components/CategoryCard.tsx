
import React from 'react';
import { Category } from '../types';

interface Props {
  category: Category;
  onClick: () => void;
}

const CategoryCard: React.FC<Props> = ({ category, onClick }) => {
  // Map Tailwind classes to custom 3D colors for deeper shading
  const getShadowColor = (color: string) => {
    if (color.includes('red')) return 'rgba(185, 28, 28, 1)';
    if (color.includes('blue')) return 'rgba(29, 78, 216, 1)';
    if (color.includes('green')) return 'rgba(21, 128, 61, 1)';
    if (color.includes('orange')) return 'rgba(194, 65, 12, 1)';
    if (color.includes('yellow')) return 'rgba(161, 98, 7, 1)';
    if (color.includes('teal')) return 'rgba(15, 118, 110, 1)';
    if (color.includes('indigo')) return 'rgba(67, 56, 202, 1)';
    if (color.includes('pink')) return 'rgba(190, 24, 93, 1)';
    return 'rgba(0,0,0,0.2)';
  };

  return (
    <div className="perspective-lg">
      <button 
        onClick={onClick}
        className={`relative w-full h-44 flex flex-col items-center justify-center p-4 rounded-[2.5rem] clay-button transform hover:-translate-y-2 active:translate-y-2 active:shadow-none ${category.color} text-white transition-all`}
        style={{
           boxShadow: `0 12px 0 0 ${getShadowColor(category.color)}, 0 20px 40px rgba(0,0,0,0.15)`
        }}
      >
        <div className="text-6xl mb-3 drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] animate-bounce-subtle">
          {category.icon}
        </div>
        <span className="text-xl font-bold text-white drop-shadow-md kids-font tracking-wide">
          {category.name}
        </span>
        
        {/* Glossy overlay */}
        <div className="absolute top-4 left-6 w-1/3 h-4 bg-white opacity-20 rounded-full"></div>
      </button>
    </div>
  );
};

export default CategoryCard;
