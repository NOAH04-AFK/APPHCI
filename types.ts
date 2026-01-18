
export enum SystemState {
  INTRO = 'INTRO',
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  SAFE = 'SAFE',
  MELTDOWN = 'MELTDOWN',
  GAME_OVER = 'GAME_OVER'
}

export interface SystemMetrics {
  temperature: number; // Celsius
  waterLevel: number; // Percentage 0-100
  energyOutput: number; // MWe
  pressure: number; // PSI
}

export type ItemId = 'VALVE_HANDLE' | 'KEYCARD' | 'FUSE';

export type StepId = 'TURBINES' | 'VENT' | 'WATER' | 'REACTOR' | 'EMERGENCY';

export interface ShutdownStep {
  id: StepId;
  label: string;
  description: string;
  completed: boolean;
  order: number;
  requiredItem?: ItemId;
}
