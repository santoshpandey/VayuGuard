export type RiskLevel = 'safe' | 'moderate' | 'hazardous';
export type HackCategory = 'zero-cost' | 'equipment';
export type HackDifficulty = 'easy' | 'moderate' | 'advanced';
export type AqiTier = 'good' | 'moderate' | 'poor' | 'very-poor' | 'severe';

export type FamilyTag = 'Kids' | 'Elderly' | 'Asthma/Sensitive' | 'Office Commuter';
export type HomeSetupTag =
  | 'Air Purifier'
  | 'Indoor Plants'
  | 'Gas Stove'
  | 'Two-Wheeler/Car'
  | 'N95 Masks'
  | 'Induction Stove';

export interface CityPreset {
  id: string;
  name: string;
  locality: string;
  latitude: number;
  longitude: number;
  aqi: number;
  pm25: number;
  primaryPollutant: string;
  tier: AqiTier;
  tierLabel: string;
}

export interface DailyRoutine {
  id: string;
  timeSlot: string;
  title: string;
  action: string;
  riskLevel: RiskLevel;
  directImpactMetric: string;
  impactExplanation: string;
  exposureReductionPct: number;
  co2SavedKg: number;
}

export interface IndoorHack {
  id: string;
  title: string;
  category: HackCategory;
  difficulty: HackDifficulty;
  steps: string[];
  pm25ReductionPercent: number;
  scientificWhy: string;
  exposureReductionPct: number;
  co2SavedKg: number;
}

export interface SustainableAlternative {
  id: string;
  currentHabit: string;
  ecoSwap: string;
  co2SavedKgPerWeek: number;
  pm25AvoidedGPerWeek: number;
  costSavingsInrPerMonth: number;
  healthBenefit: string;
  communityImpactExplanation: string;
  exposureReductionPct: number;
  co2SavedKg: number;
}

export interface GeminiPlan {
  advisorySummary: string;
  safeVentilationWindow: string;
  dailyRoutines: DailyRoutine[];
  indoorHacks: IndoorHack[];
  sustainableAlternatives: SustainableAlternative[];
}

export interface HouseholdProfile {
  family: FamilyTag[];
  homeSetup: HomeSetupTag[];
}

export interface CoachMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface HourlyAirQuality {
  time: string;
  pm25: number;
  aqi: number;
}

export interface VisionAudit {
  detectedSubject: 'Indoor Room' | 'Air Purifier Filter' | 'Outdoor Haze / Commute' | 'Other';
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  findings: string[];
  immediateFixes: string[];
  estimatedPm25Impact: string;
}

export interface ImpactState {
  completedIds: Set<string>;
  exposureReducedPct: number;
  emissionsSavedKg: number;
}

export type ActionTab = 'routine' | 'indoor' | 'eco';
