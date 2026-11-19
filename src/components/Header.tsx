import { Leaf, MapPin, Settings, ChevronDown } from 'lucide-react';
import type { CityPreset, HouseholdProfile } from '../types';

interface HeaderProps {
  city: CityPreset;
  household: HouseholdProfile;
  onOpenLocation: () => void;
  onOpenSettings: () => void;
  onOpenHousehold: () => void;
}

export function Header({
  city,
  household,
  onOpenLocation,
  onOpenSettings,
  onOpenHousehold,
}: HeaderProps) {
  const tagCount = household.family.length + household.homeSetup.length;

  return (
    <header className="sticky top-0 z-30 glass-strong px-4 pt-3 pb-3 safe-top">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-dim border border-emerald-500/25">
            <Leaf className="h-4 w-4 text-emerald" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-[1.05rem] font-semibold leading-tight tracking-tight text-text truncate">
              VayuGuard
            </h1>
            <p className="text-[0.7rem] text-muted leading-tight">Urban Air Quality Assistant</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenLocation}
          className="flex flex-1 items-center gap-2 min-w-0 rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-left hover:border-emerald-500/30 transition-colors"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald" />
          <span className="truncate text-xs text-text">
            {city.name}, {city.locality}
            <span className="text-muted"> — AQI {city.aqi}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted ml-auto" />
        </button>

        <button
          type="button"
          onClick={onOpenHousehold}
          className="shrink-0 rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-xs text-muted hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
        >
          Profile
          <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-dim px-1.5 text-[0.65rem] font-semibold text-emerald-400">
            {tagCount}
          </span>
        </button>
      </div>
    </header>
  );
}
