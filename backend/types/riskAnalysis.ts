import { RiskLevel, RiskAnalysis } from './events';

export interface BehaviorAnalysis {
  pattern: string;
  confidence: number;
  details: Record<string, any>;
}

export interface GraphAnalysis {
  centrality: number;
  degree: number;
  clustering: number;
  paths: Array<{
    from: string;
    to: string;
    weight: number;
  }>;
}

export interface AIAnalysis {
  behaviorAnalysis: BehaviorAnalysis;
  graphAnalysis: GraphAnalysis;
  summary: string;
}

export interface EnhancedRiskAnalysis extends RiskAnalysis {
  aiAnalysis: AIAnalysis;
  combinations: Array<{
    factors: string[];
    score: number;
    description: string;
  }>;
  timestamp: number;
  action: 'none' | 'alert' | 'block' | 'monitor';
} 