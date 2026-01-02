
import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onImageSelected(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`relative w-full max-w-2xl aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 cursor-pointer group ${
        isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        accept="image/*"
        className="hidden"
      />
      
      <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <i className="fa-solid fa-cloud-arrow-up text-3xl text-blue-400"></i>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Drop your photo here</h3>
      <p className="text-slate-400 text-center">
        or click to browse your files<br />
        <span className="text-xs mt-2 block">Supports JPG, PNG, WEBP</span>
      </p>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
        <span className="px-3 py-1 rounded-full bg-slate-900/80 text-xs border border-slate-700">AI Background Removal</span>
        <span className="px-3 py-1 rounded-full bg-slate-900/80 text-xs border border-slate-700">Environment Swap</span>
      </div>
    </div>
  );
};

export default ImageUploader;
