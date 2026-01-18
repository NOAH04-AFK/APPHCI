import React from 'react';

interface ModalProps {
  title: string;
  message: string;
  type: 'start' | 'success' | 'fail';
  onAction: () => void;
  actionLabel: string;
}

export const Modal: React.FC<ModalProps> = ({ title, message, type, onAction, actionLabel }) => {
  const getColors = () => {
    switch(type) {
      case 'success': return 'border-emerald-500 bg-slate-900/95';
      case 'fail': return 'border-red-600 bg-slate-900/95';
      default: return 'border-blue-500 bg-slate-900/95';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`max-w-md w-full p-8 rounded-xl border-2 shadow-2xl text-center ${getColors()}`}>
        <h2 className="text-3xl font-bold font-mono-display mb-4 uppercase tracking-wider">{title}</h2>
        <p className="text-slate-300 mb-8 leading-relaxed">
          {message}
        </p>
        <button 
          onClick={onAction}
          className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors rounded"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};