import { GoogleGenAI } from '@google/genai';
import type {
  CityPreset,
  GeminiPlan,
  HouseholdProfile,
  DailyRoutine,
  IndoorHack,
  SustainableAlternative,
} from '../types';
import { getFallbackPlan } from '../data/presets';

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    advisorySummary: { type: 'string' },
    safeVentilationWindow: { type: 'string' },
    dailyRoutines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          timeSlot: { type: 'string' },
          title: { type: 'string' },
          action: { type: 'string' },
          riskLevel: { type: 'string', enum: ['safe', 'moderate', 'hazardous'] },
          directImpactMetric: { type: 'string' },
          impactExplanation: { type: 'string' },
          exposureReductionPct: { type: 'number' },
          co2SavedKg: { type: 'number' },
        },
        required: [
          'timeSlot',
          'title',
          'action',
          'riskLevel',
          'directImpactMetric',
          'impactExplanation',
          'exposureReductionPct',
          'co2SavedKg',
        ],
      },
    },
    indoorHacks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          category: { type: 'string', enum: ['zero-cost', 'equipment'] },
          difficulty: { type: 'string', enum: ['easy', 'moderate', 'advanced'] },
          steps: { type: 'array', items: { type: 'string' } },
          pm25ReductionPercent: { type: 'number' },
          scientificWhy: { type: 'string' },
          exposureReductionPct: { type: 'number' },
          co2SavedKg: { type: 'number' },
        },
        required: [
          'title',
          'category',
          'difficulty',
          'steps',
          'pm25ReductionPercent',
          'scientificWhy',
          'exposureReductionPct',
          'co2SavedKg',
        ],
      },
    },
    sustainableAlternatives: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          currentHabit: { type: 'string' },
          ecoSwap: { type: 'string' },
          co2SavedKgPerWeek: { type: 'number' },
          pm25AvoidedGPerWeek: { type: 'number' },
          costSavingsInrPerMonth: { type: 'number' },
          healthBenefit: { type: 'string' },
          communityImpactExplanation: { type: 'string' },
          exposureReductionPct: { type: 'number' },
          co2SavedKg: { type: 'number' },
        },
        required: [
          'currentHabit',
          'ecoSwap',
          'co2SavedKgPerWeek',
          'pm25AvoidedGPerWeek',
          'costSavingsInrPerMonth',
          'healthBenefit',
          'communityImpactExplanation',
          'exposureReductionPct',
          'co2SavedKg',
        ],
      },
    },
  },
  required: [
    'advisorySummary',
    'safeVentilationWindow',
    'dailyRoutines',
    'indoorHacks',
    'sustainableAlternatives',
  ],
} as const;

function hydratePlan(raw: Omit<GeminiPlan, never>, cityId: string): GeminiPlan {
  const fallback = getFallbackPlan(cityId);

  const routines: DailyRoutine[] = (raw.dailyRoutines ?? fallback.dailyRoutines).map(
    (r, i) => ({
      ...r,
      id: `routine-${i}`,
      riskLevel: (['safe', 'moderate', 'hazardous'].includes(r.riskLevel)
        ? r.riskLevel
        : 'moderate') as DailyRoutine['riskLevel'],
      exposureReductionPct: Number(r.exposureReductionPct) || 10,
      co2SavedKg: Number(r.co2SavedKg) || 0,
    })
  );

  const hacks: IndoorHack[] = (raw.indoorHacks ?? fallback.indoorHacks).map((h, i) => ({
    ...h,
    id: `hack-${i}`,
    category: (h.category === 'equipment' ? 'equipment' : 'zero-cost') as IndoorHack['category'],
    difficulty: (['easy', 'moderate', 'advanced'].includes(h.difficulty)
      ? h.difficulty
      : 'easy') as IndoorHack['difficulty'],
    steps: Array.isArray(h.steps) ? h.steps : [String(h.steps)],
    pm25ReductionPercent: Number(h.pm25ReductionPercent) || 15,
    exposureReductionPct: Number(h.exposureReductionPct) || 10,
    co2SavedKg: Number(h.co2SavedKg) || 0,
  }));

  const alts: SustainableAlternative[] = (
    raw.sustainableAlternatives ?? fallback.sustainableAlternatives
  ).map((a, i) => ({
    ...a,
    id: `eco-${i}`,
    co2SavedKgPerWeek: Number(a.co2SavedKgPerWeek) || 0,
    pm25AvoidedGPerWeek: Number(a.pm25AvoidedGPerWeek) || 0,
    costSavingsInrPerMonth: Number(a.costSavingsInrPerMonth) || 0,
    exposureReductionPct: Number(a.exposureReductionPct) || 10,
    co2SavedKg: Number(a.co2SavedKg) || Number(a.co2SavedKgPerWeek) / 7 || 0,
  }));

  return {
    advisorySummary: raw.advisorySummary || fallback.advisorySummary,
    safeVentilationWindow: raw.safeVentilationWindow || fallback.safeVentilationWindow,
    dailyRoutines: routines,
    indoorHacks: hacks,
    sustainableAlternatives: alts,
  };
}

function buildPlanPrompt(city: CityPreset, household: HouseholdProfile): string {
  return `You are VayuGuard, an expert urban air-quality coach for Indian cities during winter smog season.

Generate a hyper-specific action plan for this household:

LOCATION: ${city.name}, ${city.locality}
AQI: ${city.aqi} (${city.tierLabel})
Primary pollutant: ${city.primaryPollutant} at ${city.pm25} µg/m³
Family tags: ${household.family.join(', ') || 'General household'}
Home setup: ${household.homeSetup.join(', ') || 'Basic apartment'}

Context rules:
- Use realistic Indian winter thermal inversion patterns (morning/evening smog traps, midday safe windows).
- Reference metro/carpool, wet-mopping, HEPA, N95, gas stove exhaust, leaf burning bans where relevant.
- Tailor advice to the selected family vulnerabilities and equipment.
- Every routine/hack/swap MUST include quantified impact (PM2.5 %, CO₂ kg).
- Write in clear, actionable English. No placeholder text.
- dailyRoutines: exactly 4 items covering Morning, Midday ventilation, Evening smog peak, Night.
- indoorHacks: 4–5 items mixing zero-cost and equipment.
- sustainableAlternatives: 3–4 habit vs eco-swap comparisons with ₹ savings where sensible.
- exposureReductionPct and co2SavedKg are used when the user checks off that action today (per-action daily credit).
- riskLevel must be one of: safe | moderate | hazardous.
- category must be: zero-cost | equipment.
- difficulty must be: easy | moderate | advanced.`;
}

export async function generatePlan(
  apiKey: string,
  city: CityPreset,
  household: HouseholdProfile
): Promise<GeminiPlan> {
  if (!apiKey.trim()) {
    return getFallbackPlan(city.id);
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: buildPlanPrompt(city, household),
    config: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.7,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  const parsed = JSON.parse(text) as GeminiPlan;
  return hydratePlan(parsed, city.id);
}

export async function askSmogCoach(
  apiKey: string,
  city: CityPreset,
  household: HouseholdProfile,
  question: string,
  plan: GeminiPlan
): Promise<{ verdict: string; answer: string }> {
  if (!apiKey.trim()) {
    return localCoachReply(city, household, question, plan);
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  const coachSchema = {
    type: 'object',
    properties: {
      verdict: { type: 'string' },
      answer: { type: 'string' },
    },
    required: ['verdict', 'answer'],
  } as const;

  const prompt = `You are VayuGuard Smog Coach for Indian urban families.

Active context:
- Location: ${city.name}, ${city.locality}
- AQI ${city.aqi} (${city.tierLabel}), PM2.5 ${city.pm25} µg/m³
- Family: ${household.family.join(', ') || 'General'}
- Home: ${household.homeSetup.join(', ') || 'Basic'}
- Safe ventilation window: ${plan.safeVentilationWindow}
- Advisory: ${plan.advisorySummary}

User question: "${question}"

Respond with:
1) verdict — short label like "Not Recommended — High Smog Trap" or "Safe with Precautions"
2) answer — 2–4 sentences: physiological/why explanation + a concrete safer alternative (indoor or rescheduled).
Be decisive, specific to Indian winter smog, and never vague.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: coachSchema,
      temperature: 0.5,
    },
  });

  const text = response.text;
  if (!text) throw new Error('Empty coach response');
  return JSON.parse(text) as { verdict: string; answer: string };
}

function localCoachReply(
  city: CityPreset,
  household: HouseholdProfile,
  question: string,
  plan: GeminiPlan
): { verdict: string; answer: string } {
  const q = question.toLowerCase();
  const hasKids = household.family.includes('Kids');
  const hasAsthma = household.family.includes('Asthma/Sensitive');
  const severe = city.aqi >= 300;
  const poor = city.aqi >= 201;

  const mentionsOutdoor =
    /outdoor|outside|park|football|cricket|run|jog|walk|play|practice|sports|balcony|school pe|cycling/.test(
      q
    );
  const mentionsEvening = /5\s*(:|.)?\s*30|evening|sunset|after\s*5|6\s*pm|7\s*pm|smog peak/.test(q);
  const mentionsMorning = /morning|dawn|sunrise|6\s*am|7\s*am|jog/.test(q);
  const mentionsVent = /ventilat|open window|fresh air|air out/.test(q);
  const mentionsCommute = /commute|drive|metro|office|school drop|car/.test(q);

  if (mentionsOutdoor && (mentionsEvening || severe)) {
    return {
      verdict: 'Not Recommended — High Smog Trap',
      answer: `At AQI ${city.aqi} in ${city.locality}, PM2.5 typically spikes ~40% after sunset as the winter inversion re-forms. ${
        hasKids || hasAsthma
          ? 'Children and sensitive lungs absorb a higher dose per breath — skip outdoor practice today.'
          : 'Skip outdoor exertion during the evening peak.'
      } Reschedule to the safe window (${plan.safeVentilationWindow}) or switch to indoor drills/yoga. Wear N95 for any unavoidable outdoor minutes.`,
    };
  }

  if (mentionsOutdoor && mentionsMorning && poor) {
    return {
      verdict: 'Avoid — Morning Inversion',
      answer: `Dawn air in ${city.name} often traps overnight exhaust near the ground. Replace the outdoor run with indoor cardio. If you must step out, keep it under 10 minutes with a fitted N95.`,
    };
  }

  if (mentionsVent) {
    return {
      verdict: severe ? 'Brief Flush Only' : 'Yes — Use the Safe Window',
      answer: `Best ventilation for ${city.name} today is ${plan.safeVentilationWindow}. ${
        severe
          ? 'Limit to 8–15 minutes, then seal and run HEPA on turbo.'
          : 'Cross-ventilate opposite windows, then return purifier to Auto.'
      } Avoid opening windows during evening traffic peak.`,
    };
  }

  if (mentionsCommute) {
    return {
      verdict: 'Prefer Metro + Mask',
      answer: `Solo road commute during smog peak raises both your inhalation dose and local emissions. Use metro/carpool where possible, wear N95 door-to-door, and keep windows up with recirculation if you must drive. Estimated savings: ~2–4 kg CO₂ per avoided car trip.`,
    };
  }

  if (mentionsOutdoor && city.aqi < 100) {
    return {
      verdict: 'Generally Safe with Light Caution',
      answer: `AQI ${city.aqi} in ${city.locality} supports outdoor activity away from heavy traffic corridors. Keep sessions moderate${
        hasAsthma ? ', carry reliever medication, and stop if wheezy' : ''
      }. Midday remains the cleanest stretch.`,
    };
  }

  return {
    verdict: severe ? 'High Caution Day' : 'Proceed with Context',
    answer: `${plan.advisorySummary} Safe ventilation: ${plan.safeVentilationWindow}. ${
      hasKids ? 'Prioritise indoor play for kids during peak hours. ' : ''
    }Ask me about a specific time or activity for a sharper verdict.`,
  };
}

export const API_KEY_STORAGE = 'vayuguard_gemini_key';

export function loadApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

export function saveApiKey(key: string): void {
  try {
    if (key.trim()) localStorage.setItem(API_KEY_STORAGE, key.trim());
    else localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    /* ignore */
  }
}
