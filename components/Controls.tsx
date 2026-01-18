
import React from 'react';
import { ShutdownStep, StepId } from '../types';
import { CheckCircle } from 'lucide-react';

interface ControlsProps {
  steps: ShutdownStep[];
  onAction: (id: StepId) => void;
  disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ steps, onAction, disabled }) => {
  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => {
        const isNext = steps.findIndex(s => !s.completed) === steps.indexOf(step);
        
        let color = "bg-gray-800 border-gray-900 text-gray-500 opacity-50";
        if (step.completed) color = "bg-green-900/40 border-green-600 text-green-400 opacity-100";
        else if (isNext) color = "bg-blue-600 border-white text-white opacity-100 animate-pulse";

        return (
          <button
            key={step.id}
            onClick={() => onAction(step.id)}
            disabled={disabled || step.completed}
            className={`w-full flex items-center justify-between p-2 border-2 transition-all font-bold text-[10px] uppercase tracking-tighter ${color}`}
          >
            <span>{step.label}</span>
            {step.completed ? <CheckCircle size={14} /> : step.requiredItem && <span className="text-[8px] bg-black px-1">REQ: {step.requiredItem.split('_')[0]}</span>}
          </button>
        );
      })}
    </div>
  );
};
