import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X, MapPin, Check, LocateFixed, Search } from 'lucide-react';
import type { CityPreset } from '../types';
import { CITY_PRESETS } from '../data/presets';
import { searchLocations, type GeocodingResult } from '../services/airQualityApi';
import { aqiAccent, tierFromAqi } from '../utils/aqi';

interface LocationModalProps {
  open: boolean;
  selectedId: string;
  onSelect: (city: CityPreset) => void;
  onClose: () => void;
}

function cityFromSearch(result: GeocodingResult): CityPreset {
  const nearest = CITY_PRESETS.reduce((best, city) => {
    const distance = Math.hypot(city.latitude - result.latitude, city.longitude - result.longitude);
    const bestDistance = Math.hypot(best.latitude - result.latitude, best.longitude - result.longitude);
    return distance < bestDistance ? city : best;
  });
  return {
    ...nearest,
    id: `place-${result.id}`,
    name: result.name,
    locality: [result.admin1, result.country].filter(Boolean).join(', ') || 'Selected location',
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export function LocationModal({ open, selectedId, onSelect, onClose }: LocationModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError('');
    try {
      const found = await searchLocations(query.trim());
      setResults(found);
      if (found.length === 0) setError('No matching places found.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Location search failed.');
    } finally {
      setBusy(false);
    }
  }

  function useLiveLocation() {
    setBusy(true);
    setError('');
    if (!navigator.geolocation) {
      setBusy(false);
      setError('Location access is not supported by this browser. Search for a city instead.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = CITY_PRESETS.reduce((best, city) => {
          const distance = Math.hypot(city.latitude - coords.latitude, city.longitude - coords.longitude);
          const bestDistance = Math.hypot(best.latitude - coords.latitude, best.longitude - coords.longitude);
          return distance < bestDistance ? city : best;
        });
        const nearPreset = Math.hypot(nearest.latitude - coords.latitude, nearest.longitude - coords.longitude) < 0.25;
        const tier = tierFromAqi(0);
        onSelect({
          ...nearest,
          id: 'live-location',
          name: nearPreset ? nearest.name : 'My Location',
          locality: nearPreset
            ? nearest.locality
            : `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`,
          latitude: coords.latitude,
          longitude: coords.longitude,
          aqi: 0,
          pm25: 0,
          tier: tier.tier,
          tierLabel: tier.label,
        });
        onClose();
        setBusy(false);
      },
      (geoError) => {
        setBusy(false);
        const message = geoError.code === geoError.PERMISSION_DENIED
          ? 'Location permission was denied. Allow access in browser settings or search for a city.'
          : geoError.code === geoError.POSITION_UNAVAILABLE
            ? 'Your location is unavailable right now. Search for a city instead.'
            : 'Location request timed out. Try again or search for a city.';
        setError(message);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        aria-label="Close location picker"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-title"
        className="relative max-h-[88dvh] w-full max-w-md overflow-y-auto glass-strong rounded-t-3xl p-5 animate-slide-up safe-bottom sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="location-title" className="font-display text-lg font-semibold">Choose Location</h2>
            <p className="mt-0.5 text-xs text-muted">Live AQI from Open-Meteo · no API key required</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted hover:text-text focus-visible:ring-2 focus-visible:ring-emerald-400" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={useLiveLocation}
          disabled={busy}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-dim px-3 py-2.5 text-sm font-semibold text-emerald-300 hover:border-emerald-400 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <LocateFixed className="h-4 w-4" aria-hidden="true" />
          Use My Live Location
        </button>

        <form className="mt-3 flex gap-2" onSubmit={(event) => void search(event)}>
          <label htmlFor="location-search" className="sr-only">Search city or place</label>
          <input
            ref={searchRef}
            id="location-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a city or place"
            className="min-w-0 flex-1 rounded-xl border border-border bg-bg/60 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          />
          <button type="submit" disabled={busy || !query.trim()} aria-label="Search locations" className="flex min-h-11 w-11 items-center justify-center rounded-xl bg-emerald text-bg disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-400">
            <Search className="h-4 w-4" />
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-300" role="alert">{error}</p>}

        {results.length > 0 && (
          <ul className="mt-3 space-y-2" aria-label="Search results">
            {results.map((result) => (
              <li key={result.id}>
                <button type="button" onClick={() => { onSelect(cityFromSearch(result)); onClose(); }} className="w-full rounded-xl border border-border bg-surface-2/50 px-3 py-2.5 text-left text-sm hover:border-emerald-500/35 focus-visible:ring-2 focus-visible:ring-emerald-400">
                  <span className="block font-medium">{result.name}</span>
                  <span className="text-xs text-muted">{[result.admin1, result.country].filter(Boolean).join(', ')}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Quick presets</h3>
        <ul className="space-y-2">
          {CITY_PRESETS.map((city) => {
            const accent = aqiAccent(city.tier);
            const selected = city.id === selectedId;
            return (
              <li key={city.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => { onSelect(city); onClose(); }}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    selected ? 'border-emerald-500/40 bg-emerald-dim' : 'border-border bg-surface-2/50 hover:border-emerald-500/25'
                  }`}
                >
                  <MapPin className={`h-4 w-4 ${accent.text}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{city.name}, {city.locality}</span>
                    <span className={`mt-0.5 block text-xs ${accent.text}`}>Last-known AQI {city.aqi} · updates on selection</span>
                  </span>
                  {selected && <Check className="h-4 w-4 shrink-0 text-emerald" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
