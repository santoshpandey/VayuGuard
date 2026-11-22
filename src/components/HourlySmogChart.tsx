import type { HourlyAirQuality } from '../types';
import { getSafeVentilationWindow } from '../services/airQualityApi';

interface HourlySmogChartProps {
  hourly: HourlyAirQuality[];
}

function hourLabel(time: string): string {
  const hour = Number(time.slice(11, 13));
  const minutes = time.slice(14, 16);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minutes} ${suffix}`;
}

export function HourlySmogChart({ hourly }: HourlySmogChartProps) {
  if (hourly.length === 0) return null;

  const peak = hourly.reduce((highest, point) => (point.pm25 > highest.pm25 ? point : highest));
  const safeWindow = getSafeVentilationWindow(hourly);
  const start = safeWindow.match(/(\d{1,2}):00 (AM|PM)/);
  const startHour = start
    ? (Number(start[1]) % 12) + (start[2] === 'PM' ? 12 : 0)
    : -1;
  const max = Math.max(1, ...hourly.map((point) => point.pm25));
  const barWidth = 100 / hourly.length;

  return (
    <section className="glass rounded-2xl p-4" aria-labelledby="hourly-smog-title">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 id="hourly-smog-title" className="font-display text-base font-semibold">
            24-hour smog curve
          </h2>
          <p className="mt-0.5 text-xs text-muted">Forecast PM2.5 · µg/m³</p>
        </div>
        <span className="rounded-full border border-emerald-500/25 bg-emerald-dim px-2 py-1 text-[0.65rem] text-emerald-300">
          Best: {safeWindow}
        </span>
      </div>

      <svg
        viewBox="0 0 360 142"
        role="img"
        aria-label={`24-hour PM2.5 forecast. Peak PM2.5 is ${peak.pm25} micrograms per cubic meter at ${hourLabel(peak.time)}. Lowest two-hour window starts at ${startHour >= 0 ? `${startHour % 12 || 12}:00 ${startHour >= 12 ? 'PM' : 'AM'}` : 'unavailable'}.`}
        className="h-36 w-full overflow-visible"
        preserveAspectRatio="none"
      >
        {[0, 1, 2].map((line) => (
          <line
            key={line}
            x1="0"
            x2="360"
            y1={18 + line * 48}
            y2={18 + line * 48}
            stroke="rgba(139,163,154,.16)"
            strokeDasharray="3 4"
          />
        ))}
        {hourly.map((point, index) => {
          const hour = Number(point.time.slice(11, 13));
          const height = Math.max(2, (point.pm25 / max) * 112);
          const safe = startHour >= 0 && (hour === startHour || hour === (startHour + 1) % 24);
          const color = safe
            ? '#10B981'
            : point.pm25 > 55 || hour <= 8 || hour >= 18
              ? '#EF4444'
              : '#F59E0B';
          const x = index * barWidth * 3.6;
          return (
            <g key={`${point.time}-${index}`}>
              <rect
                x={x + 1}
                y={128 - height}
                width={Math.max(1, barWidth * 3.6 - 2)}
                height={height}
                rx="2"
                fill={color}
                opacity={safe ? 1 : 0.78}
              >
                <title>{`${hourLabel(point.time)}: ${point.pm25} µg/m³${safe ? ', safe ventilation window' : ''}`}</title>
              </rect>
            </g>
          );
        })}
        <text x="0" y="140" fill="#8BA39A" fontSize="10">12 AM</text>
        <text x="108" y="140" fill="#8BA39A" fontSize="10">6 AM</text>
        <text x="217" y="140" fill="#8BA39A" fontSize="10">12 PM</text>
        <text x="325" y="140" fill="#8BA39A" fontSize="10">6 PM</text>
      </svg>

      <p className="sr-only" aria-live="polite">
        Peak PM2.5 at {hourLabel(peak.time)} ({peak.pm25} micrograms per cubic meter).
        Lowest PM2.5 window at {safeWindow}.
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.65rem] text-muted" aria-hidden="true">
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-500" /> Safe ventilation</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-400" /> Moderate</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-red-500" /> Smog trap</span>
      </div>
    </section>
  );
}
