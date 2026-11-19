import { Award, Share2 } from 'lucide-react';
import type { CityPreset } from '../types';

interface ChampionCardProps {
  city: CityPreset;
  exposureReducedPct: number;
  emissionsSavedKg: number;
  completedCount: number;
  visible: boolean;
}

export function ChampionCard({
  city,
  exposureReducedPct,
  emissionsSavedKg,
  completedCount,
  visible,
}: ChampionCardProps) {
  if (!visible) return null;

  async function share() {
    const text = `🌿 Clean Air Champion — VayuGuard\n${city.name}: −${exposureReducedPct}% PM2.5 exposure · ${emissionsSavedKg.toFixed(1)} kg CO₂ saved today (${completedCount} actions).\nProtecting family lungs + cutting household pollution.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'VayuGuard Clean Air Champion', text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('Champion card copied to clipboard!');
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <section className="mt-4 animate-fade-up rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-dim via-surface to-crimson-dim/20 p-4 overflow-hidden relative">
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-emerald/20 blur-2xl" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald text-bg">
          <Award className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-emerald-400 font-semibold">
            Community Pledge
          </p>
          <h3 className="font-display text-lg font-semibold mt-0.5">Clean Air Champion</h3>
          <p className="text-[0.8rem] text-muted mt-1 leading-relaxed">
            My family in {city.name} cut{' '}
            <strong className="text-emerald-300">−{exposureReducedPct}%</strong> exposure and saved{' '}
            <strong className="text-emerald-300">{emissionsSavedKg.toFixed(1)} kg CO₂</strong> today
            with {completedCount} VayuGuard actions.
          </p>
          <button
            type="button"
            onClick={() => void share()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-bg/40 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-dim transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share Champion Card
          </button>
        </div>
      </div>
    </section>
  );
}
