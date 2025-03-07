import { RiskLevel } from './events.js';

export interface RiskAnalysis {
  score: number;
  level: RiskLevel;
  factors: string[];
  details?: Record<string, any>;
}

export interface RiskFeature {
  name: string;
  value: number;
  weight: number;
  description: string;
} 