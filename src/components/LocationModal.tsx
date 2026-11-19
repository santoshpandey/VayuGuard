import { X, MapPin, Check } from 'lucide-react';
import type { CityPreset } from '../types';
import { CITY_PRESETS } from '../data/presets';
import { aqiAccent } from '../utils/aqi';

interface LocationModalProps {
  open: boolean;
  selectedId: string;
  onSelect: (city: CityPreset) => void;
  onClose: () => void;
}

export function LocationModal({ open, selectedId, onSelect, onClose }: LocationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        aria-label="Close location picker"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md glass-strong rounded-t-3xl sm:rounded-3xl p-5 animate-slide-up safe-bottom">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Choose Location</h2>
            <p className="text-xs text-muted mt-0.5">City presets with live AQI context</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-text"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="space-y-2">
          {CITY_PRESETS.map((city) => {
            const accent = aqiAccent(city.tier);
            const selected = city.id === selectedId;
            return (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(city);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                    selected
                      ? 'border-emerald-500/40 bg-emerald-dim'
                      : 'border-border bg-surface-2/50 hover:border-emerald-500/25'
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg/50 border border-border">
                    <MapPin className={`h-4 w-4 ${accent.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {city.name}, {city.locality}
                    </p>
                    <p className={`text-xs mt-0.5 ${accent.text}`}>
                      AQI {city.aqi} · {city.tierLabel}
                    </p>
                  </div>
                  {selected && <Check className="h-4 w-4 text-emerald shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
