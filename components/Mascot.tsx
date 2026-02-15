
import React from 'react';

const Mascot: React.FC = () => {
  return (
    <div className="relative w-56 h-56 mx-auto mt-8 animate-float">
      {/* 3D Soft Body */}
      <div className="absolute inset-0 bg-yellow-400 rounded-full border-[10px] border-yellow-500 shadow-[inset_-15px_-15px_20px_rgba(0,0,0,0.1),inset_15px_15px_20px_rgba(255,255,255,0.4),10px_20px_40px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col items-center justify-center">
        {/* Eyes with Depth */}
        <div className="flex space-x-6 mt-2">
          <div className="w-8 h-10 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden">
             <div className="w-4 h-4 bg-black rounded-full mt-1 animate-pulse"></div>
          </div>
          <div className="w-8 h-10 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden">
             <div className="w-4 h-4 bg-black rounded-full mt-1 animate-pulse"></div>
          </div>
        </div>
        {/* Rosy Cheeks */}
        <div className="absolute top-1/2 -translate-y-1 w-full flex justify-around px-4 opacity-40">
           <div className="w-6 h-4 bg-pink-400 rounded-full blur-[2px]"></div>
           <div className="w-6 h-4 bg-pink-400 rounded-full blur-[2px]"></div>
        </div>
        {/* 3D Smile */}
        <div className="w-16 h-8 border-b-8 border-red-500 rounded-full mt-4 shadow-sm"></div>
      </div>
      
      {/* 3D Ears/Antennae */}
      <div className="absolute -top-6 -left-4 w-20 h-20 bg-yellow-500 rounded-full border-8 border-yellow-600 shadow-lg -rotate-[30deg] z-[-1]"></div>
      <div className="absolute -top-6 -right-4 w-20 h-20 bg-yellow-500 rounded-full border-8 border-yellow-600 shadow-lg rotate-[30deg] z-[-1]"></div>
      
      {/* Glossy highlight */}
      <div className="absolute top-8 left-12 w-12 h-6 bg-white opacity-40 rounded-full rotate-[-20deg]"></div>
    </div>
  );
};

export default Mascot;
