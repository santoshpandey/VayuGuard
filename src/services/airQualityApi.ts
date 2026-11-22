import type { CityPreset, HourlyAirQuality } from '../types';
import { tierFromAqi } from '../utils/aqi';

interface AirQualityResponse {
  current?: {
    us_aqi?: number;
    pm2_5?: number;
  };
  hourly?: {
    time?: string[];
    pm2_5?: number[];
    us_aqi?: number[];
  };
}

export interface GeocodingResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

function isFiniteNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function getSafeVentilationWindow(hourly: HourlyAirQuality[]): string {
  const candidates: { start: number; end: number; mean: number }[] = [];

  for (let index = 0; index < hourly.length - 1; index += 1) {
    const first = hourly[index];
    const second = hourly[index + 1];
    if (!first || !second) continue;

    const firstDate = new Date(`${first.time}:00Z`);
    const secondDate = new Date(`${second.time}:00Z`);
    const firstHour = Number(first.time.slice(11, 13));
    const secondHour = Number(second.time.slice(11, 13));
    const consecutive = secondDate.getTime() - firstDate.getTime() === 60 * 60 * 1000;

    if (consecutive && firstHour >= 11 && firstHour < 16 && secondHour <= 16) {
      candidates.push({
        start: firstHour,
        end: secondHour,
        mean: (first.pm25 + second.pm25) / 2,
      });
    }
  }

  const best = candidates.sort((a, b) => a.mean - b.mean)[0];
  if (!best) return 'No 2-hour forecast window available';

  const formatHour = (hour: number) => {
    const normalized = hour % 24;
    const suffix = normalized >= 12 ? 'PM' : 'AM';
    const display = normalized % 12 || 12;
    return `${display}:00 ${suffix}`;
  };

  return `${formatHour(best.start)} – ${formatHour(best.end)}`;
}

export async function fetchAirQuality(
  city: CityPreset,
  latitude = city.latitude,
  longitude = city.longitude
): Promise<{ city: CityPreset; hourly: HourlyAirQuality[]; safeVentilationWindow: string }> {
  const url = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'us_aqi,pm2_5,pm10,nitrogen_dioxide',
    hourly: 'pm2_5,us_aqi',
    timezone: 'auto',
    forecast_days: '1',
  }).toString();

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Air quality request failed (${response.status})`);
  const data = (await response.json()) as AirQualityResponse;
  const currentAqi = data.current?.us_aqi;
  const currentPm25 = data.current?.pm2_5;
  if (!isFiniteNumber(currentAqi) || !isFiniteNumber(currentPm25)) {
    throw new Error('Air quality response did not include current AQI and PM2.5');
  }

  const times = data.hourly?.time ?? [];
  const pmValues = data.hourly?.pm2_5 ?? [];
  const aqiValues = data.hourly?.us_aqi ?? [];
  const hourly = times.flatMap((time, index) => {
    const pm25 = pmValues[index];
    const aqi = aqiValues[index];
    return isFiniteNumber(pm25) && isFiniteNumber(aqi) ? [{ time, pm25, aqi }] : [];
  });

  if (hourly.length === 0) throw new Error('Air quality response did not include hourly data');
  const tier = tierFromAqi(currentAqi);
  return {
    city: {
      ...city,
      latitude,
      longitude,
      aqi: Math.round(currentAqi),
      pm25: Math.round(currentPm25 * 10) / 10,
      primaryPollutant: 'PM2.5',
      tier: tier.tier,
      tierLabel: tier.label,
    },
    hourly,
    safeVentilationWindow: getSafeVentilationWindow(hourly),
  };
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.search = new URLSearchParams({ name: query, count: '5' }).toString();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Location search failed (${response.status})`);
  const data = (await response.json()) as { results?: GeocodingResult[] };
  return data.results ?? [];
}
