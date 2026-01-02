
import React from 'react';

interface ProcessingOverlayProps {
  status: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ status }) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl animate-in fade-in duration-300">
      <div className="relative mb-8">
        <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fa-solid fa-wand-magic-sparkles text-2xl text-blue-400 animate-pulse"></i>
        </div>
      </div>
      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
        {status}
      </h3>
      <p className="text-slate-400 mt-2">Gemini is re-imagining your image...</p>
    </div>
  );
};

export default ProcessingOverlay;
