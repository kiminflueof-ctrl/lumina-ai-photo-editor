
import React, { useState, useEffect, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import ProcessingOverlay from './components/ProcessingOverlay';
import { processImage } from './services/geminiService';
import { ImageData, EditMode, ProcessingState, HistoryItem } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    statusMessage: ''
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeMode, setActiveMode] = useState<EditMode | null>(null);

  const handleImageSelected = (base64: string, mimeType: string) => {
    setOriginalImage({ base64, mimeType });
    setCurrentImage(base64);
    setActiveMode(null);
  };

  const applyEdit = async (prompt: string, mode: EditMode) => {
    if (!originalImage) return;

    setProcessing({ isProcessing: true, statusMessage: 'Analyzing Subject...' });
    setActiveMode(mode);

    try {
      setProcessing(prev => ({ ...prev, statusMessage: 'Removing Background...' }));
      const result = await processImage(originalImage, prompt);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        imageUrl: result,
        prompt: prompt,
        timestamp: Date.now()
      };

      setCurrentImage(result);
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 5));
      setProcessing({ isProcessing: false, statusMessage: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to process image. Please try again.');
      setProcessing({ isProcessing: false, statusMessage: '' });
    }
  };

  const handleRemoveBackground = () => {
    const prompt = "Remove the background of this image completely and replace it with a clean, solid studio white background. Keep the subject crisp and clear.";
    applyEdit(prompt, EditMode.REMOVE_BG);
  };

  const handleReplaceEnvironment = (environment: string) => {
    const prompt = `Keep the main subject of this image exactly as is, but change the background to a ${environment}. Ensure the lighting on the subject matches the new ${environment} environment for a realistic look.`;
    applyEdit(prompt, EditMode.REPLACE_BG);
  };

  const handleCustomEdit = () => {
    if (!customPrompt.trim()) return;
    applyEdit(customPrompt, EditMode.STYLE);
  };

  const downloadImage = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `lumina-edit-${Date.now()}.png`;
    link.click();
  };

  const resetEditor = () => {
    setOriginalImage(null);
    setCurrentImage(null);
    setActiveMode(null);
    setCustomPrompt('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-wand-sparkles text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Lumina <span className="text-blue-400">AI</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Pro Photo Editor</p>
            </div>
          </div>

          {currentImage && (
            <div className="flex items-center gap-3">
              <button 
                onClick={resetEditor}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Start Over
              </button>
              <button 
                onClick={downloadImage}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-download"></i>
                Download
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row h-full">
        {/* Editor Area */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-auto">
          {!currentImage ? (
            <div className="w-full flex flex-col items-center gap-8 animate-in zoom-in duration-500">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Transform your photos with AI
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Upload a photo to remove backgrounds, swap environments, and create professional-grade visuals in seconds.
                </p>
              </div>
              <ImageUploader onImageSelected={handleImageSelected} />
            </div>
          ) : (
            <div className="relative group w-full max-w-4xl max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800">
              {processing.isProcessing && <ProcessingOverlay status={processing.statusMessage} />}
              <img 
                src={currentImage} 
                alt="Editor Canvas" 
                className="w-full h-full object-contain bg-slate-900" 
              />
              
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button 
                  onClick={() => setCurrentImage(originalImage?.base64 || null)}
                  className="px-3 py-1.5 bg-slate-900/60 backdrop-blur-sm text-xs rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  <i className="fa-solid fa-clock-rotate-left mr-2"></i>
                  View Original
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <aside className={`w-full lg:w-96 border-l border-slate-800 bg-slate-900/30 p-6 overflow-y-auto transition-all ${!currentImage ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="space-y-8">
            {/* Quick Actions */}
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleRemoveBackground}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${activeMode === EditMode.REMOVE_BG ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}
                >
                  <i className="fa-solid fa-user-minus text-xl text-blue-400"></i>
                  <span className="text-xs font-semibold">Remove BG</span>
                </button>
                <button 
                  onClick={() => handleReplaceEnvironment('luxury apartment with soft natural light')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${activeMode === EditMode.REPLACE_BG ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}
                >
                  <i className="fa-solid fa-house text-xl text-purple-400"></i>
                  <span className="text-xs font-semibold">Indoor Set</span>
                </button>
                <button 
                  onClick={() => handleReplaceEnvironment('serene mountain landscape during sunset')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all border-slate-800 bg-slate-800/50 hover:border-slate-700`}
                >
                  <i className="fa-solid fa-mountain-sun text-xl text-orange-400"></i>
                  <span className="text-xs font-semibold">Outdoor</span>
                </button>
                <button 
                  onClick={() => handleReplaceEnvironment('abstract neon geometric futuristic background')}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all border-slate-800 bg-slate-800/50 hover:border-slate-700`}
                >
                  <i className="fa-solid fa-bolt text-xl text-cyan-400"></i>
                  <span className="text-xs font-semibold">Cyberpunk</span>
                </button>
              </div>
            </section>

            {/* Custom Prompt */}
            <section>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">AI Magic Brush</h3>
              <div className="space-y-3">
                <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="E.g., Replace the background with a futuristic office overlooking Mars..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none h-24"
                />
                <button 
                  onClick={handleCustomEdit}
                  disabled={!customPrompt.trim() || processing.isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  Transform with AI
                </button>
              </div>
            </section>

            {/* History */}
            {history.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Edit History</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentImage(item.imageUrl)}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-800 hover:border-blue-500 transition-all"
                    >
                      <img src={item.imageUrl} alt="History" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      </main>

      {/* Footer Info */}
      <footer className="py-4 px-6 border-t border-slate-800 bg-slate-900/50 text-center">
        <p className="text-[10px] text-slate-500 font-medium">
          POWERED BY <span className="text-slate-300">GEMINI AI</span> • LATEST MODEL: GEMINI-2.5-FLASH-IMAGE
        </