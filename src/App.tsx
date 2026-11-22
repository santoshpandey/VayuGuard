import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ActionTab,
  CityPreset,
  GeminiPlan,
  HouseholdProfile,
} from './types';
import {
  CITY_PRESETS,
  DEFAULT_HOUSEHOLD,
  getCityById,
  getFallbackPlan,
} from './data/presets';
import {
  generatePlan,
  loadApiKey,
  saveApiKey,
} from './services/gemini';
import { Header } from './components/Header';
import { AqiHero } from './components/AqiHero';
import { ImpactBar } from './components/ImpactBar';
import { HouseholdPanel } from './components/HouseholdPanel';
import { LocationModal } from './components/LocationModal';
import { SettingsModal } from './components/SettingsModal';
import { ActionEngine } from './components/ActionEngine';
import { SmogCoach } from './components/SmogCoach';
import { ChampionCard } from './components/ChampionCard';
import { DesktopContext } from './components/DesktopContext';
import { HourlySmogChart } from './components/HourlySmogChart';
import { VisionAuditCard } from './components/VisionAuditCard';
import { CommunityImpactCard } from './components/CommunityImpactCard';
import { fetchAirQuality } from './services/airQualityApi';
import type { HourlyAirQuality } from './types';

export default function App() {
  const [city, setCity] = useState<CityPreset>(() => getCityById('noida'));
  const [household, setHousehold] = useState<HouseholdProfile>(DEFAULT_HOUSEHOLD);
  const [plan, setPlan] = useState<GeminiPlan>(() => getFallbackPlan('noida'));
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<ActionTab>('routine');
  const [apiKey, setApiKey] = useState(() => loadApiKey());
  const [hourly, setHourly] = useState<HourlyAirQuality[]>([]);
  const [airStatus, setAirStatus] = useState<'loading' | 'live' | 'offline'>('loading');
  const [safeWindow, setSafeWindow] = useState(() => getFallbackPlan('noida').safeVentilationWindow);

  const [locationOpen, setLocationOpen] = useState(false);
  const [householdOpen, setHouseholdOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coachOpenSignal, setCoachOpenSignal] = useState(0);

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [exposureReducedPct, setExposureReducedPct] = useState(0);
  const [emissionsSavedKg, setEmissionsSavedKg] = useState(0);

  const impactCredits = useRef<Map<string, { exposure: number; co2: number }>>(new Map());
  const genToken = useRef(0);
  const contextKey = useRef(`${city.id}|${city.aqi}|${city.pm25}|${household.family.join(',')}|${household.homeSetup.join(',')}`);
  const mounted = useRef(false);
  const airRequest = useRef(0);

  useEffect(() => {
    const requestId = ++airRequest.current;
    setAirStatus('loading');
    void fetchAirQuality(city).then((result) => {
      if (requestId !== airRequest.current) return;
      setCity((current) => ({
        ...current,
        ...result.city,
        id: current.id,
        name: current.name,
        locality: current.locality,
      }));
      setHourly(result.hourly);
      setSafeWindow(result.safeVentilationWindow);
      setAirStatus('live');
    }).catch((error: unknown) => {
      if (requestId !== airRequest.current) return;
      console.warn('Live air quality unavailable; using static preset data.', error);
      const nearest = CITY_PRESETS.reduce((best, preset) => {
        const distance = Math.hypot(preset.latitude - city.latitude, preset.longitude - city.longitude);
        const bestDistance = Math.hypot(best.latitude - city.latitude, best.longitude - city.longitude);
        return distance < bestDistance ? preset : best;
      });
      setCity((current) => ({
        ...current,
        aqi: nearest.aqi,
        pm25: nearest.pm25,
        primaryPollutant: nearest.primaryPollutant,
        tier: nearest.tier,
        tierLabel: nearest.tierLabel,
      }));
      setHourly([]);
      setSafeWindow(getFallbackPlan(city.id).safeVentilationWindow);
      setAirStatus('offline');
    });
    return () => {
      airRequest.current += 1;
    };
  }, [city.id, city.latitude, city.longitude]);

  const refreshPlan = useCallback(
    async (nextCity: CityPreset, nextHousehold: HouseholdProfile, key: string) => {
      const token = ++genToken.current;
      setLoading(true);
      setCompletedIds(new Set());
      setExposureReducedPct(0);
      setEmissionsSavedKg(0);
      impactCredits.current = new Map();
      setPlan(getFallbackPlan(nextCity.id));

      try {
        if (key.trim()) {
          const live = await generatePlan(key, nextCity, nextHousehold);
          if (token === genToken.current) setPlan(live);
        } else {
          await new Promise((r) => setTimeout(r, 400));
          if (token === genToken.current) setPlan(getFallbackPlan(nextCity.id));
        }
      } catch (err) {
        console.warn('Gemini plan generation failed; using preset.', err);
        if (token === genToken.current) setPlan(getFallbackPlan(nextCity.id));
      } finally {
        if (token === genToken.current) setLoading(false);
      }
    },
    []
  );

  // Regenerate when city or household profile changes
  useEffect(() => {
    const key = `${city.id}|${city.aqi}|${city.pm25}|${household.family.join(',')}|${household.homeSetup.join(',')}`;
    if (!mounted.current) {
      mounted.current = true;
      contextKey.current = key;
      return;
    }
    if (contextKey.current === key) return;
    contextKey.current = key;
    void refreshPlan(city, household, apiKey);
  }, [city, household, apiKey, refreshPlan]);

  const allActions = useMemo(
    () => [...plan.dailyRoutines, ...plan.indoorHacks, ...plan.sustainableAlternatives],
    [plan]
  );
  const effectivePlan = useMemo(
    () => ({ ...plan, safeVentilationWindow: safeWindow }),
    [plan, safeWindow]
  );

  function toggleComplete(id: string, exposurePct: number, co2Kg: number) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        const credit = impactCredits.current.get(id);
        if (credit) {
          setExposureReducedPct((v) => Math.max(0, Math.round(v - credit.exposure)));
          setEmissionsSavedKg((v) => Math.max(0, Math.round((v - credit.co2) * 10) / 10));
          impactCredits.current.delete(id);
        }
      } else {
        next.add(id);
        const cappedExposure = Math.min(exposurePct, 25);
        impactCredits.current.set(id, { exposure: cappedExposure, co2: co2Kg });
        setExposureReducedPct((v) => Math.min(92, Math.round(v + cappedExposure)));
        setEmissionsSavedKg((v) => Math.round((v + co2Kg) * 10) / 10);
      }
      return next;
    });
  }

  return (
    <div className="app-atmosphere min-h-dvh">
      <div className="mx-auto flex max-w-5xl gap-6 px-0 lg:px-6 lg:py-6 justify-center">
        <div className="relative w-full max-w-md min-h-dvh lg:min-h-[calc(100dvh-3rem)] lg:rounded-3xl lg:border lg:border-border lg:overflow-hidden lg:shadow-2xl lg:shadow-black/40 bg-bg/40">
          <Header
            city={city}
            household={household}
            onOpenLocation={() => setLocationOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenHousehold={() => setHouseholdOpen(true)}
          />

          <ImpactBar
            exposureReducedPct={exposureReducedPct}
            emissionsSavedKg={emissionsSavedKg}
            completedCount={completedIds.size}
            totalActions={allActions.length}
            sticky="top"
          />

          <main className="px-4 pb-28 pt-4 space-y-4">
            <AqiHero
              city={city}
              advisory={plan.advisorySummary}
              safeWindow={safeWindow}
              loading={loading}
              airStatus={airStatus}
            />

            {hourly.length > 0 && <HourlySmogChart hourly={hourly} />}

            <VisionAuditCard city={city} household={household} apiKey={apiKey} />

            <button
              type="button"
              onClick={() => setHouseholdOpen(true)}
              className="w-full glass rounded-2xl px-3.5 py-3 text-left animate-fade-up stagger-1"
            >
              <p className="text-[0.65rem] uppercase tracking-[0.12em] text-muted mb-2">
                Household · tap to customise
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[...household.family, ...household.homeSetup].slice(0, 6).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-emerald-500/25 bg-emerald-dim px-2 py-0.5 text-[0.65rem] text-emerald-300"
                  >
                    {t}
                  </span>
                ))}
                {household.family.length + household.homeSetup.length > 6 && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-[0.65rem] text-muted">
                    +{household.family.length + household.homeSetup.length - 6}
                  </span>
                )}
              </div>
            </button>

            <ActionEngine
              tab={tab}
              onTabChange={setTab}
              routines={plan.dailyRoutines}
              hacks={plan.indoorHacks}
              alternatives={plan.sustainableAlternatives}
              completedIds={completedIds}
              onToggleComplete={toggleComplete}
              loading={loading}
            />

            <CommunityImpactCard
              city={city}
              safeWindow={safeWindow}
              alternatives={plan.sustainableAlternatives}
              completedIds={completedIds}
              apiKey={apiKey}
            />

            <ChampionCard
              city={city}
              exposureReducedPct={exposureReducedPct}
              emissionsSavedKg={emissionsSavedKg}
              completedCount={completedIds.size}
              visible={completedIds.size >= 3}
            />
          </main>

          <SmogCoach
            city={city}
            household={household}
            plan={effectivePlan}
            apiKey={apiKey}
            openSignal={coachOpenSignal}
          />
        </div>

        <DesktopContext
          city={city}
          household={household}
          exposureReducedPct={exposureReducedPct}
          emissionsSavedKg={emissionsSavedKg}
          completedCount={completedIds.size}
          totalActions={allActions.length}
          onOpenHousehold={() => setHouseholdOpen(true)}
          onOpenCoach={() => setCoachOpenSignal((n) => n + 1)}
        />
      </div>

      <LocationModal
        open={locationOpen}
        selectedId={city.id}
        onSelect={setCity}
        onClose={() => setLocationOpen(false)}
      />

      <HouseholdPanel
        open={householdOpen}
        profile={household}
        onChange={setHousehold}
        onClose={() => setHouseholdOpen(false)}
      />

      <SettingsModal
        open={settingsOpen}
        apiKey={apiKey}
        onSave={(key) => {
          saveApiKey(key);
          setApiKey(key.trim());
        }}
        onClose={() => setSettingsOpen(false)}
        onRegenerate={(key) => {
          void refreshPlan(city, household, key);
        }}
      />
    </div>
  );
}
