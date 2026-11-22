import { Wind, Clock, AlertTriangle } from 'lucide-react';
import type { CityPreset } from '../types';
import { aqiAccent } from '../utils/aqi';
import { whoMultiplier } from '../data/presets';

interface AqiHeroProps {
  city: CityPreset;
  advisory: string;
  safeWindow: string;
  loading?: boolean;
  airStatus?: 'loading' | 'live' | 'offline';
}

export function AqiHero({ city, advisory, safeWindow, loading, airStatus = 'offline' }: AqiHeroProps) {
  const accent = aqiAccent(city.tier);

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-4 animate-fade-up ${accent.bg} ${accent.border} ${
        accent.glow ? 'animate-pulse-glow' : ''
      }`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-2xl"
        style={{
          background:
            city.tier === 'good' || city.tier === 'moderate'
              ? '#10B981'
              : city.tier === 'poor'
                ? '#F59E0B'
                : '#EF4444',
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted font-medium">
            Air Quality
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`font-display text-4xl font-bold tabular-nums leading-none ${accent.text}`}>
              {city.aqi}
            </span>
            <span className={`text-sm font-semibold ${accent.text}`}>• {city.tierLabel}</span>
          </div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border ${accent.border} ${accent.bg}`}
        >
          {city.aqi >= 201 ? (
            <AlertTriangle className={`h-5 w-5 ${accent.text}`} />
          ) : (
            <Wind className={`h-5 w-5 ${accent.text}`} />
          )}
        </div>
      </div>

      <div className="relative mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-border bg-bg/40 px-2.5 py-1 text-[0.7rem] text-text">
          {city.primaryPollutant}: {city.pm25} µg/m³
        </span>
        <span className="inline-flex items-center rounded-full border border-crimson/25 bg-crimson-deep/30 px-2.5 py-1 text-[0.7rem] text-red-200">
          {whoMultiplier(city.pm25)}
        </span>
      </div>
      <p className="relative mt-2 text-[0.65rem] text-muted" aria-live="polite">
        {airStatus === 'live' ? 'Live Open-Meteo AQI and forecast' : airStatus === 'loading' ? 'Updating live air quality…' : 'Offline · showing static preset AQI'}
      </p>

      <div className="relative mt-3 flex items-center gap-2 rounded-xl border border-border bg-bg/35 px-3 py-2">
        <Clock className="h-3.5 w-3.5 shrink-0 text-emerald" />
        <p className="text-xs text-text">
          <span className="text-muted">Best window: </span>
          {loading || airStatus === 'loading' ? (
            <span className="skeleton inline-block h-3 w-28 align-middle" />
          ) : (
            <span className="font-medium text-emerald-300">{safeWindow}</span>
          )}
        </p>
      </div>

      <p className="relative mt-3 text-[0.8rem] leading-relaxed text-text/90">
        {loading ? (
          <span className="skeleton block h-10 w-full" />
        ) : (
          advisory
        )}
      </p>
    </section>
  );
}
