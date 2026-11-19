import type { AqiTier, RiskLevel } from '../types';

export function tierFromAqi(aqi: number): { tier: AqiTier; label: string } {
  if (aqi <= 50) return { tier: 'good', label: 'Good' };
  if (aqi <= 100) return { tier: 'moderate', label: 'Moderate' };
  if (aqi <= 200) return { tier: 'poor', label: 'Poor' };
  if (aqi <= 300) return { tier: 'very-poor', label: 'Very Poor' };
  return { tier: 'severe', label: 'Severe' };
}

export function aqiAccent(tier: AqiTier): {
  text: string;
  bg: string;
  border: string;
  glow: boolean;
} {
  switch (tier) {
    case 'good':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-dim',
        border: 'border-emerald-500/30',
        glow: false,
      };
    case 'moderate':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-dim',
        border: 'border-amber-500/30',
        glow: false,
      };
    case 'poor':
      return {
        text: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        glow: false,
      };
    case 'very-poor':
      return {
        text: 'text-crimson',
        bg: 'bg-crimson-dim',
        border: 'border-crimson/40',
        glow: true,
      };
    case 'severe':
      return {
        text: 'text-red-300',
        bg: 'bg-crimson-deep/40',
        border: 'border-crimson/50',
        glow: true,
      };
  }
}

export function riskStyles(risk: RiskLevel): {
  label: string;
  text: string;
  bg: string;
  border: string;
} {
  switch (risk) {
    case 'safe':
      return {
        label: 'SAFE WINDOW',
        text: 'text-emerald-400',
        bg: 'bg-emerald-dim',
        border: 'border-emerald-500/30',
      };
    case 'moderate':
      return {
        label: 'CAUTION',
        text: 'text-amber-400',
        bg: 'bg-amber-dim',
        border: 'border-amber-500/30',
      };
    case 'hazardous':
      return {
        label: 'SMOG TRAP',
        text: 'text-crimson',
        bg: 'bg-crimson-dim',
        border: 'border-crimson/35',
      };
  }
}

export function slotEmoji(timeSlot: string): string {
  const s = timeSlot.toLowerCase();
  if (s.includes('morning') || s.includes('dawn')) return '🌅';
  if (s.includes('midday') || s.includes('afternoon') || s.includes('noon')) return '☀️';
  if (s.includes('evening')) return '🌆';
  if (s.includes('night')) return '🌙';
  return '🕐';
}
