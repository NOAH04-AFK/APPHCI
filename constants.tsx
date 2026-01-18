
import { StepId, ShutdownStep } from './types';
import { Fan, Droplet, Zap, Radiation, OctagonAlert } from 'lucide-react';
import React from 'react';

export const MAX_TEMP_THRESHOLD = 400; // Celsius
export const TIME_LIMIT = 45; // Slightly more time for searching

export const INITIAL_METRICS = {
  temperature: 380,
  waterLevel: 40,
  energyOutput: 1200,
  pressure: 2400
};

export const SHUTDOWN_SEQUENCE_CONFIG: ShutdownStep[] = [
  { id: 'TURBINES', label: '1. Detener Turbinas', description: 'Requiere: Fusible Principal', completed: false, order: 1, requiredItem: 'FUSE' },
  { id: 'VENT', label: '2. Ventilar Radioactividad', description: 'Requiere: Manivela de Válvula', completed: false, order: 2, requiredItem: 'VALVE_HANDLE' },
  { id: 'WATER', label: '3. Ciclo de Agua', description: 'Sistema de enfriamiento', completed: false, order: 3 },
  { id: 'REACTOR', label: '4. Apagar Reactor', description: 'Requiere: Tarjeta de Seguridad', completed: false, order: 4, requiredItem: 'KEYCARD' },
  { id: 'EMERGENCY', label: '5. BOTÓN DE EMERGENCIA', description: 'Bloqueo final', completed: false, order: 5 },
];

export const getIconForStep = (id: StepId) => {
  switch (id) {
    case 'TURBINES': return <Zap className="w-6 h-6" />;
    case 'VENT': return <Fan className="w-6 h-6" />;
    case 'WATER': return <Droplet className="w-6 h-6" />;
    case 'REACTOR': return <Radiation className="w-6 h-6" />;
    case 'EMERGENCY': return <OctagonAlert className="w-6 h-6" />;
    default: return null;
  }
};
