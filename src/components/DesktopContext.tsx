import { Users, Home, Shield, Leaf, MessageCircle } from 'lucide-react';
import type { CityPreset, HouseholdProfile } from '../types';

interface DesktopContextProps {
  city: CityPreset;
  household: HouseholdProfile;
  exposureReducedPct: number;
  emissionsSavedKg: number;
  completedCount: number;
  totalActions: number;
  onOpenHousehold: () => void;
  onOpenCoach: () => void;
}

export function DesktopContext({
  city,
  household,
  exposureReducedPct,
  emissionsSavedKg,
  completedCount,
  totalActions,
  onOpenHousehold,
  onOpenCoach,
}: DesktopContextProps) {
  const progress =
    totalActions > 0 ? Math.min(100, Math.round((completedCount / totalActions) * 100)) : 0;
  const safeScore = Math.min(100, Math.round(exposureReducedPct * 0.85 + progress * 0.15));

  return (
    <aside className="hidden lg:flex w-[320px] shrink-0 flex-col gap-4 sticky top-6 self-start">
      <div className="glass rounded-2xl p-5 animate-fade-up">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[0.7rem] uppercase tracking-[0.14em] text-muted font-semibold">
            Household Profile
          </h2>
          <button
            type="button"
            onClick={onOpenHousehold}
            className="text-[0.7rem] text-emerald-400 hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted mb-2">
            <Users className="h-3.5 w-3.5 text-emerald" />
            Family
          </div>
          <div className="flex flex-wrap gap-1.5">
            {household.family.length === 0 && (
              <span className="text-xs text-muted">No tags selected</span>
            )}
            {household.family.map((t) => (
              <span
                key={t}
                className="rounded-full border border-emerald-500/30 bg-emerald-dim px-2.5 py-0.5 text-[0.7rem] text-emerald-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-2">
            <Home className="h-3.5 w-3.5 text-emerald" />
            Home Setup
          </div>
          <div className="flex flex-wrap gap-1.5">
            {household.homeSetup.length === 0 && (
              <span className="text-xs text-muted">No tags selected</span>
            )}
            {household.homeSetup.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2.5 py-0.5 text-[0.7rem] text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-fade-up stagger-1">
        <h2 className="text-[0.7rem] uppercase tracking-[0.14em] text-muted font-semibold mb-3">
          Today&apos;s Impact Score
        </h2>
        <div className="flex items-end justify-between mb-2">
          <span className="font-display text-3xl font-bold text-emerald-300">{safeScore}%</span>
          <span className="text-xs text-muted mb-1">safer day</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2 mb-4">
          <div
            className="impact-bar h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
            style={{ width: `${safeScore}%` }}
          />
        </div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2 text-text">
            <Shield className="h-4 w-4 text-emerald" />
            −{exposureReducedPct}% PM2.5 Exposure
          </li>
          <li className="flex items-center gap-2 text-text">
            <Leaf className="h-4 w-4 text-emerald" />
            {emissionsSavedKg.toFixed(1)} kg CO₂ Saved
          </li>
        </ul>
        <p className="mt-3 text-[0.7rem] text-muted">
          {city.name}, {city.locality} · AQI {city.aqi}
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenCoach}
        className="glass rounded-2xl p-5 text-left hover:border-emerald-500/35 transition-colors animate-fade-up stagger-2 group"
      >
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="h-4 w-4 text-emerald" />
          <h2 className="text-[0.7rem] uppercase tracking-[0.14em] text-muted font-semibold group-hover:text-emerald-300">
            Ask Smog Coach
          </h2>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          &ldquo;Can my daughter play outside at 5:30 PM?&rdquo;
        </p>
        <p className="mt-2 text-xs text-emerald-400/90">
          Instant verdict grounded in your AQI & household tags →
        </p>
      </button>
    </aside>
  );
}
