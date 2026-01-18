
import React from 'react';
import { SystemMetrics, SystemState } from '../types';
import { MAX_TEMP_THRESHOLD } from '../constants';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface StatusMonitorProps {
  metrics: SystemMetrics;
  state: SystemState;
  timeLeft: number;
}

export const StatusMonitor: React.FC<StatusMonitorProps> = ({ metrics, state, timeLeft }) => {
  const isOverheat = metrics.temperature > MAX_TEMP_THRESHOLD;
  const isSafe = state === SystemState.SAFE;
  
  return (
    <div className="h-full flex flex-col p-4 font-mono text-blue-400 bg-black">
      <div className="flex justify-between items-center mb-4 border-b-2 border-blue-900 pb-2">
         <div className="text-[10px] font-black uppercase tracking-tighter">Sector 7-G Monitor</div>
         <div className={`text-4xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>
           {timeLeft}s
         </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
            <span>Temp Núcleo</span>
            <span className={isOverheat ? 'text-red-500' : ''}>{metrics.temperature.toFixed(0)}°C</span>
          </div>
          <div className="h-4 border-2 border-blue-900 bg-black">
            <div 
              className={`h-full transition-all duration-500 ${isOverheat ? 'bg-red-500' : 'bg-green-600'}`} 
              style={{ width: `${(metrics.temperature / 1000) * 100}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
            <span>Refrigerante</span>
            <span>{metrics.waterLevel.toFixed(0)}%</span>
          </div>
          <div className="h-4 border-2 border-blue-900 bg-black">
            <div className="h-full bg-blue-500" style={{ width: `${metrics.waterLevel}%` }}></div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-[100px] border-2 border-blue-900 mt-4">
           {isOverheat && (
             <div className="text-center text-red-500 animate-pulse">
               <AlertTriangle size={32} className="mx-auto mb-1" />
               <div className="text-[10px] font-black uppercase">¡Fusión!</div>
             </div>
           )}
           {isSafe && (
             <div className="text-center text-green-500">
               <CheckCircle size={32} className="mx-auto mb-1" />
               <div className="text-[10px] font-black uppercase">Seguro</div>
             </div>
           )}
           {!isOverheat && !isSafe && (
             <div className="text-[8px] text-blue-900 uppercase font-black text-center">
               Esperando Entrada Secuencial...
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
