
import React, { useState, useEffect, useRef } from 'react';
import { StatusMonitor } from './components/StatusMonitor';
import { Modal } from './components/Modal';
import { Controls } from './components/Controls';
import { SystemState, SystemMetrics, ShutdownStep, StepId, ItemId } from './types';
import { INITIAL_METRICS, SHUTDOWN_SEQUENCE_CONFIG, TIME_LIMIT } from './constants';
import { Radiation, AlertTriangle, Droplets, Zap, Search, Settings, ShieldAlert, History, Pipette as Pipe, Cpu, Activity } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<SystemState>(SystemState.INTRO);
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_METRICS);
  const [steps, setSteps] = useState<ShutdownStep[]>(SHUTDOWN_SEQUENCE_CONFIG);
  const [inventory, setInventory] = useState<ItemId[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>("¡Rápido! Busca el fusible en las máquinas.");
  const [showLever, setShowLever] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Imagen de planta nuclear futurista
  const reactorImgUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop"; 
  const janitorImg = "https://i.imgur.com/KvC9unO.png";

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs(prev => [...prev.slice(-15), { id: Math.random().toString(36), timestamp, message, type }]);
  };

  const startGame = () => {
    setGameState(SystemState.RUNNING);
    setMetrics(INITIAL_METRICS);
    setSteps(SHUTDOWN_SEQUENCE_CONFIG.map(s => ({ ...s, completed: false })));
    setInventory([]);
    setTimeLeft(TIME_LIMIT);
    setFeedback(null);
    setShowLever(false);
    setLogs([]);
    addLog("CONEXIÓN ESTABLECIDA", "info");
    addLog("FALLO DE CONTENCIÓN DETECTADO", "critical");
  };

  useEffect(() => {
    if (gameState === SystemState.RUNNING) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { 
            setGameState(SystemState.MELTDOWN); 
            return 0; 
          }
          return prev - 1;
        });

        setMetrics(prev => {
          const vDone = steps.find(s => s.id === 'VENT')?.completed;
          const wDone = steps.find(s => s.id === 'WATER')?.completed;
          const rDone = steps.find(s => s.id === 'REACTOR')?.completed;
          let tempMod = 6.5;
          if (vDone) tempMod -= 2.5;
          if (wDone) tempMod -= 5.0;
          if (rDone) tempMod -= 16.0;
          
          return {
            ...prev,
            temperature: Math.min(1400, Math.max(40, prev.temperature + tempMod)),
            pressure: prev.pressure + (prev.temperature > 500 ? 100 : 40) - (vDone ? 400 : 0),
            waterLevel: Math.max(0, prev.waterLevel - 1.2 + (wDone ? 18 : 0))
          };
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, steps]);

  const findItem = (item: ItemId) => {
    if (inventory.includes(item)) return;
    setInventory(prev => [...prev, item]);
    addLog(`COMPONENTE RECOGIDO: ${item}`, "success");
    if (item === 'FUSE') setHint("¡Bien! Ahora detén las turbinas en la consola.");
    if (item === 'VALVE_HANDLE') setHint("¡Válvula lista! Úsala para ventilar el gas.");
  };

  const handleAction = (id: StepId) => {
    if (gameState !== SystemState.RUNNING) return;
    const nextStepIdx = steps.findIndex(s => !s.completed);
    const stepIdx = steps.indexOf(steps.find(s => s.id === id)!);
    const step = steps[stepIdx];

    if (stepIdx !== nextStepIdx) {
      setFeedback("SIGUE EL ORDEN");
      setTimeout(() => setFeedback(null), 1000);
      return;
    }

    if (step.requiredItem && !inventory.includes(step.requiredItem)) {
      setFeedback(`FALTA ${step.requiredItem}`);
      setTimeout(() => setFeedback(null), 1000);
      return;
    }

    addLog(`PASO EJECUTADO: ${step.label}`, "success");
    if (id === 'REACTOR') setShowLever(true);
    setSteps(prev => prev.map(s => s.id === id ? { ...s, completed: true } : s));
    if (id === 'EMERGENCY') setGameState(SystemState.SAFE);
  };

  return (
    <div className="min-h-screen text-slate-300 font-sans select-none overflow-hidden relative">
      <style>{`
        .main-background {
          position: fixed;
          inset: 0;
          background-image: url('${reactorImgUrl}');
          background-size: cover;
          background-position: center;
          z-index: -2;
          filter: brightness(0.6) saturate(1.2);
        }
        .main-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.9) 100%), 
                      linear-gradient(to bottom, rgba(5,5,7,0.5), rgba(5,5,7,0.95));
          z-index: -1;
        }
        .hex-grid {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%2306b6d4' stroke-width='0.5'/%3E%3C/svg%3E");
          opacity: 0.2;
          z-index: -1;
        }
        .scanlines {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 50%);
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 50;
        }
        .panel-industrial {
          background: rgba(10, 10, 12, 0.75);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(6, 182, 212, 0.3);
          box-shadow: 0 8px 32px rgba(0,0,0,0.8);
        }
        .hazard-bar {
          background: repeating-linear-gradient(45deg, #facc15, #facc15 10px, #000 10px, #000 20px);
        }
        .reactor-glow {
          box-shadow: 0 0 100px ${metrics.temperature > 600 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.2)'};
        }
        .led-btn {
          width: 14px;
          height: 14px;
          background: #0f172a;
          border: 1px solid #1e293b;
          transition: all 0.2s;
          cursor: pointer;
        }
        .led-btn:hover { background: #22d3ee; box-shadow: 0 0 15px #06b6d4; }
        .blink-red { animation: blink-red 2.5s infinite; }
        @keyframes blink-red { 0%, 100% { background: #1a1a1e; } 50% { background: #ef4444; box-shadow: 0 0 10px #ef4444; } }
        .blink-yellow { animation: blink-yellow 3s infinite 1s; }
        @keyframes blink-yellow { 0%, 100% { background: #1a1a1e; } 50% { background: #facc15; box-shadow: 0 0 10px #facc15; } }
        .glow-emergency { animation: glow-emergency 1.5s infinite alternate; }
        @keyframes glow-emergency { from { box-shadow: 0 0 20px #991b1b; } to { box-shadow: 0 0 80px #dc2626; border-color: #fca5a5; } }
        .obj-pickup { filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.5)); animation: float 3s infinite ease-in-out; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      `}</style>

      {/* CAPAS DE FONDO */}
      <div className="main-background"></div>
      <div className="main-overlay"></div>
      <div className="hex-grid"></div>
      <div className="scanlines"></div>

      {/* BARRA DE ALERTA */}
      <div className="h-10 w-full hazard-bar border-b-2 border-black flex items-center justify-center relative z-20">
         <span className="text-black font-black text-sm uppercase flex items-center gap-6">
           <AlertTriangle size={18} /> PROTOCOLO DE EMERGENCIA NIVEL 5 ACTIVADO <AlertTriangle size={18} />
         </span>
      </div>

      <div className="p-6 flex h-[calc(100vh-40px)] gap-6 relative z-10">
        {/* IZQUIERDA */}
        <div className="w-[320px] flex flex-col gap-6">
           <div className="panel-industrial flex-1 p-5 flex flex-col rounded-lg">
              <div className="text-xs font-bold text-cyan-400 mb-4 uppercase border-b border-cyan-900/50 pb-2 flex justify-between items-center">
                <span>ESTADO DEL NÚCLEO</span>
                <Cpu size={14} className="animate-pulse text-cyan-400" />
              </div>
              <StatusMonitor metrics={metrics} state={gameState} timeLeft={timeLeft} />
           </div>
           <div className="panel-industrial h-[280px] p-5 rounded-lg">
              <div className="text-xs font-bold text-zinc-500 mb-3 uppercase border-b border-zinc-800 pb-2">LOG DE EVENTOS</div>
              <div className="font-mono text-[11px] space-y-2 h-[210px] overflow-y-auto pr-2 custom-scrollbar">
                 {logs.map(log => (
                   <div key={log.id} className={`${log.type === 'critical' ? 'text-red-500 font-bold animate-pulse' : log.type === 'success' ? 'text-cyan-400' : 'text-zinc-500'}`}>
                     [{log.timestamp}] > {log.message}
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* CENTRO */}
        <div className="flex-1 panel-industrial relative flex items-center justify-center reactor-glow rounded-xl overflow-hidden">
           <div className={`relative w-[540px] h-[540px] rounded-full border-[18px] border-black/90 flex items-center justify-center transition-all duration-1000 ${metrics.temperature > 700 ? 'border-red-900 shadow-[0_0_120px_rgba(220,38,38,0.6)]' : 'border-cyan-900/60 shadow-[0_0_100px_rgba(6,182,212,0.4)]'}`}>
              <div className="flex flex-col items-center z-10">
                 <Radiation size={200} className={`${metrics.temperature > 700 ? 'text-red-600' : 'text-cyan-400'} drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]`} />
                 <div className="text-8xl font-black font-mono-display text-white mt-6 drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]">{metrics.temperature.toFixed(0)}°C</div>
              </div>
           </div>

           <div className="absolute bottom-0 left-8 w-[340px] z-20">
              <div className="relative">
                <img src={janitorImg} alt="Willie" className="w-full h-auto drop-shadow-[0_0_40px_black]" />
                {hint && gameState === SystemState.RUNNING && (
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-white text-black p-4 border-[4px] border-black text-xs font-black rounded-2xl shadow-2xl w-[220px] text-center animate-bounce z-30">
                    {hint}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-black"></div>
                  </div>
                )}
              </div>
           </div>

           {!inventory.includes('FUSE') && (
             <button onClick={() => findItem('FUSE')} className="absolute top-20 right-20 obj-pickup group z-20">
                <div className="bg-black/80 p-8 border-2 border-yellow-400 group-hover:bg-yellow-400 transition-all backdrop-blur-md">
                   <Zap size={50} className="text-yellow-400 group-hover:text-black" />
                </div>
                <div className="text-[10px] text-yellow-400 font-black mt-4 text-center bg-black/90 px-4 py-2 uppercase tracking-widest border border-yellow-400/30">CÉLULA DE ENERGÍA</div>
             </button>
           )}

           {!inventory.includes('VALVE_HANDLE') && (
             <button onClick={() => findItem('VALVE_HANDLE')} className="absolute bottom-28 right-20 obj-pickup group z-20">
                <div className="bg-black/80 p-8 border-2 border-cyan-400 rounded-full group-hover:bg-cyan-400 transition-all backdrop-blur-md">
                   <Droplets size={50} className="text-cyan-400 group-hover:text-black" />
                </div>
                <div className="text-[10px] text-cyan-400 font-black mt-4 text-center bg-black/90 px-4 py-2 uppercase tracking-widest border border-cyan-400/30">VÁLVULA DE PLASMA</div>
           </button>
           )}

           {showLever && gameState === SystemState.RUNNING && (
             <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl z-40 flex items-center justify-center p-12">
                <button onClick={() => handleAction('EMERGENCY')} className="group flex flex-col items-center bg-zinc-950 p-16 border-[12px] border-red-600 glow-emergency transition-all hover:scale-110 active:scale-95 shadow-2xl">
                   <div className="h-64 w-20 bg-zinc-900 border-4 border-black relative mb-12 rounded shadow-inner overflow-hidden">
                      <div className="absolute top-0 w-full h-1/2 bg-red-700 group-hover:translate-y-full transition-transform duration-500 ease-in-out"></div>
                   </div>
                   <div className="text-center">
                    <span className="block text-7xl font-black text-red-600 uppercase tracking-tighter mb-3 drop-shadow-[0_0_20px_rgba(220,38,38,1)]">FRENADO OMEGA</span>
                    <span className="block text-sm font-bold text-white/40 uppercase tracking-[0.5em] animate-pulse">AUTORIZACIÓN REQUERIDA</span>
                   </div>
                </button>
             </div>
           )}
        </div>

        {/* DERECHA */}
        <div className="w-[320px] flex flex-col gap-6">
           <div className="panel-industrial p-5 flex-1 flex flex-col rounded-lg">
              <div className="text-xs font-bold text-yellow-500 mb-6 uppercase border-b border-yellow-900/50 pb-2 flex justify-between items-center">
                <span>CONSOLA DE MANDO</span>
                <Activity size={14} className="text-yellow-500" />
              </div>
              <Controls steps={steps} onAction={handleAction} disabled={gameState !== SystemState.RUNNING} />
           </div>

           <div className="panel-industrial h-[180px] p-5 rounded-lg">
              <div className="text-xs font-bold text-cyan-400 mb-4 uppercase border-b border-cyan-900/50 pb-2">INVENTARIO TÁCTICO</div>
              <div className="flex gap-5 items-center justify-center h-[100px]">
                 {['FUSE', 'VALVE_HANDLE', 'KEYCARD'].map(it => (
                   <div key={it} className={`w-16 h-16 border-2 flex items-center justify-center rounded-lg transition-all ${inventory.includes(it as ItemId) ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-110' : 'border-zinc-800 bg-black/60 opacity-20'}`}>
                      {inventory.includes(it as ItemId) && (
                        it === 'FUSE' ? <Zap className="text-yellow-400 w-8 h-8" /> :
                        it === 'VALVE_HANDLE' ? <Droplets className="text-cyan-400 w-8 h-8" /> :
                        <Search className="text-white w-8 h-8" />
                      )}
                   </div>
                 ))}
                 {!inventory.includes('KEYCARD') && (
                   <button onClick={() => findItem('KEYCARD')} className="w-16 h-16 border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-cyan-400 transition-all bg-black/60 rounded-lg group">
                      <Search size={28} className="text-zinc-500 group-hover:text-cyan-400" />
                   </button>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* ERROR FEEDBACK */}
      {feedback && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-14 py-8 font-black text-5xl border-[10px] border-black z-[100] animate-bounce shadow-[0_0_150px_rgba(0,0,0,1)] uppercase">
           {feedback}
        </div>
      )}

      {/* PANTALLA DE INICIO (RESTAURADA A ESTILO INDUSTRIAL CLÁSICO) */}
      {gameState === SystemState.INTRO && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-14 text-center">
          {/* Fondo sutilmente visible para no perder la temática, pero oscurecido */}
          <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
             <div className="absolute inset-0 main-background"></div>
             <div className="absolute inset-0 hex-grid scale-150"></div>
          </div>
          
          <div className="relative mb-10">
            <Radiation size={160} className="text-yellow-500 animate-spin-slow relative z-10 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
          </div>
          
          <h1 className="text-9xl font-black text-white mb-4 tracking-tighter relative z-10 drop-shadow-[0_4px_10px_rgba(0,0,0,1)]">
            CHERNOBYL-Z
          </h1>
          
          <p className="text-zinc-500 font-bold tracking-[0.4em] mb-16 uppercase relative z-10 text-xl border-t border-b border-zinc-800 py-4">
            Consola de Seguridad del Turno de Noche
          </p>
          
          <button 
            onClick={startGame} 
            className="px-24 py-12 text-5xl font-black text-white hover:scale-110 active:scale-95 transition-all border-4 border-zinc-500 shadow-[0_0_60px_rgba(255,255,255,0.1)] relative z-10 group overflow-hidden bg-zinc-900 rounded-sm"
          >
            <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            TOMAR EL TURNO
          </button>
          
          <div className="mt-12 text-zinc-600 font-mono text-sm uppercase tracking-widest relative z-10 animate-pulse">
            -- Sistema de Contención listo para Operar --
          </div>
        </div>
      )}

      {/* MODALES DE FINAL */}
      {gameState === SystemState.SAFE && <Modal title="MISIÓN CUMPLIDA" message="Has estabilizado la planta nuclear. Willie por fin puede barrer tranquilo." type="success" actionLabel="REINICIAR" onAction={() => setGameState(SystemState.INTRO)} />}
      {gameState === SystemState.MELTDOWN && <Modal title="CATÁSTROFE" message="La planta ha estallado. El silencio radioactivo reina ahora." type="fail" actionLabel="REINTENTAR" onAction={startGame} />}
    </div>
  );
};

export default App;
