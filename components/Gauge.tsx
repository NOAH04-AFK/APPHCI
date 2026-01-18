import React from 'react';

interface GaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color?: 'green' | 'red' | 'blue' | 'yellow';
  isCritical?: boolean;
}

export const Gauge: React.FC<GaugeProps> = ({ label, value, max, unit, color = 'blue', isCritical = false }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  let barColor = 'bg-blue-500';
  if (color === 'red') barColor = 'bg-red-500';
  if (color === 'green') barColor = 'bg-emerald-500';
  if (color === 'yellow') barColor = 'bg-yellow-500';
  
  if (isCritical) barColor = 'bg-red-600 animate-pulse';

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-inner">
      <div className="flex justify-between items-end mb-2">
        <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{label}</span>
        <span className={`font-mono-display text-xl ${isCritical ? 'text-red-500' : 'text-slate-200'}`}>
          {value.toFixed(0)} <span className="text-sm text-slate-500">{unit}</span>
        </span>
      </div>
      <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
         {/* Background Grid Lines */}
        <div className="absolute inset-0 flex justify-between px-2">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="h-full w-px bg-slate-800/50"></div>
            ))}
        </div>
        <div 
          className={`h-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};