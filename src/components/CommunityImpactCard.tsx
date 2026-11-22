import { useMemo, useState } from 'react';
import { Copy, Users, WandSparkles } from 'lucide-react';
import type { CityPreset, SustainableAlternative } from '../types';
import { generateCommunityAlert } from '../services/gemini';

type CommunityScale = 'household' | 'tower' | 'sector';

const SCALES: { id: CommunityScale; label: string; multiplier: number }[] = [
  { id: 'household', label: 'My Household (4 people)', multiplier: 1 },
  { id: 'tower', label: 'My Apartment Tower (100 families)', multiplier: 100 },
  { id: 'sector', label: 'My Residential Sector / RWA (1,000 families)', multiplier: 1000 },
];

interface CommunityImpactCardProps {
  city: CityPreset;
  safeWindow: string;
  alternatives: SustainableAlternative[];
  completedIds: Set<string>;
  apiKey: string;
}

export function CommunityImpactCard({
  city,
  safeWindow,
  alternatives,
  completedIds,
  apiKey,
}: CommunityImpactCardProps) {
  const [scale, setScale] = useState<CommunityScale>('household');
  const [alert, setAlert] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const selectedScale = SCALES.find((item) => item.id === scale) ?? SCALES[0];
  const adopted = useMemo(
    () => alternatives.filter((alternative) => completedIds.has(alternative.id)),
    [alternatives, completedIds]
  );
  const co2Saved = adopted.reduce((sum, item) => sum + item.co2SavedKgPerWeek, 0) * selectedScale.multiplier;
  const pmAvoided = adopted.reduce((sum, item) => sum + item.pm25AvoidedGPerWeek, 0) * selectedScale.multiplier;

  const topActions = [
    ...adopted.map((item) => item.ecoSwap),
    ...alternatives.filter((item) => !completedIds.has(item.id)).map((item) => item.ecoSwap),
    'Avoid idling vehicles near building and school entrances',
    'Do not burn leaves or household waste; report smoke to the RWA',
    'Coordinate shared rides or public transport for peak-hour trips',
  ].slice(0, 3);

  async function createAlert() {
    setBusy(true);
    setError('');
    setStatus('');
    const context = { city, safeWindow, actions: topActions, scale: selectedScale.label };
    const fallback = `🌿 ${city.name} clean-air update\nToday's AQI: ${city.aqi} (${city.tierLabel}). Best ventilation window: ${safeWindow}.\n\nThis week's neighborhood actions:\n${topActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}\n\nPlease share with your neighbors and follow local air-quality advisories.`;
    try {
      const generated = apiKey ? await generateCommunityAlert(apiKey, context) : fallback;
      setAlert(generated);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not generate the community alert.');
    } finally {
      setBusy(false);
    }
  }

  async function copyAlert() {
    try {
      await navigator.clipboard.writeText(alert);
      setStatus('Community alert copied to clipboard.');
    } catch {
      setStatus('Clipboard access is unavailable. Select and copy the alert text.');
    }
  }

  return (
    <section className="glass rounded-2xl p-4" aria-labelledby="community-impact-title">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-dim">
          <Users className="h-5 w-5 text-emerald" aria-hidden="true" />
        </div>
        <div>
          <h2 id="community-impact-title" className="font-display text-base font-semibold">
            Community impact multiplier
          </h2>
          <p className="mt-1 text-xs text-muted">Project the weekly benefit of adopted eco swaps.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2" role="group" aria-label="Community scale">
        {SCALES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={scale === item.id}
            onClick={() => setScale(item.id)}
            className={`min-h-11 rounded-xl border px-3 py-2 text-left text-xs transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              scale === item.id
                ? 'border-emerald-500/45 bg-emerald-dim text-emerald-200'
                : 'border-border bg-bg/35 text-muted hover:text-text'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-bg/40 p-3">
          <p className="text-[0.65rem] text-muted">Weekly CO₂ saved</p>
          <p className="mt-1 text-lg font-semibold text-emerald-300">{co2Saved.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</p>
        </div>
        <div className="rounded-xl border border-border bg-bg/40 p-3">
          <p className="text-[0.65rem] text-muted">PM2.5 avoided</p>
          <p className="mt-1 text-lg font-semibold text-emerald-300">{pmAvoided.toLocaleString(undefined, { maximumFractionDigits: 1 })} g</p>
        </div>
      </div>
      <p className="mt-2 text-[0.65rem] text-muted">
        Estimates scale household swap data linearly; actual impact varies by travel and participation.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => void createAlert()}
          disabled={busy}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald px-3 py-2.5 text-sm font-semibold text-bg hover:bg-emerald-400 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <WandSparkles className="h-4 w-4" aria-hidden="true" />
          {busy ? 'Preparing alert…' : 'Generate RWA / Community Alert'}
        </button>
        {alert && (
          <button
            type="button"
            onClick={() => void copyAlert()}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm text-text hover:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-300" role="alert">{error}</p>}
      <p className="mt-2 min-h-5 text-xs text-emerald-300" aria-live="polite">{status}</p>
      {alert && (
        <textarea
          aria-label="Generated WhatsApp community alert"
          readOnly
          value={alert}
          rows={7}
          className="mt-2 w-full resize-y rounded-xl border border-border bg-bg/55 p-3 text-sm leading-relaxed text-text focus-visible:ring-2 focus-visible:ring-emerald-400"
        />
      )}
    </section>
  );
}
