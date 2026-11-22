import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, FlaskConical, Zap, ArrowRightLeft, IndianRupee } from 'lucide-react';
import type {
  ActionTab,
  DailyRoutine,
  IndoorHack,
  SustainableAlternative,
  HackCategory,
} from '../types';
import { riskStyles, slotEmoji } from '../utils/aqi';
import { PlanSkeleton } from './Skeleton';

interface ActionEngineProps {
  tab: ActionTab;
  onTabChange: (tab: ActionTab) => void;
  routines: DailyRoutine[];
  hacks: IndoorHack[];
  alternatives: SustainableAlternative[];
  completedIds: Set<string>;
  onToggleComplete: (id: string, exposurePct: number, co2Kg: number) => void;
  loading: boolean;
}

const TABS: { id: ActionTab; label: string }[] = [
  { id: 'routine', label: 'Daily Routine' },
  { id: 'indoor', label: 'Indoor Air' },
  { id: 'eco', label: 'Eco Swaps' },
];

export function ActionEngine({
  tab,
  onTabChange,
  routines,
  hacks,
  alternatives,
  completedIds,
  onToggleComplete,
  loading,
}: ActionEngineProps) {
  const [hackFilter, setHackFilter] = useState<'all' | HackCategory>('all');
  const [expandedHack, setExpandedHack] = useState<string | null>(null);

  const filteredHacks =
    hackFilter === 'all' ? hacks : hacks.filter((h) => h.category === hackFilter);

  return (
    <section className="animate-fade-up stagger-2">
      <div className="flex border-b border-border mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex-1 pb-2.5 text-xs font-semibold transition-colors ${
              tab === t.id ? 'tab-active' : 'text-muted hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PlanSkeleton />
      ) : (
        <>
          {tab === 'routine' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text mb-1">Today&apos;s Tailored Plan</h3>
              {routines.map((r, i) => {
                const risk = riskStyles(r.riskLevel);
                const done = completedIds.has(r.id);
                return (
                  <article
                    key={r.id}
                    className={`glass rounded-2xl p-4 animate-fade-up stagger-${Math.min(i + 1, 4)} ${
                      done ? 'opacity-80 ring-1 ring-emerald-500/25' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-[0.7rem] text-muted">
                        {slotEmoji(r.timeSlot)} {r.timeSlot}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-bold tracking-wide ${risk.text} ${risk.bg} ${risk.border}`}
                      >
                        {risk.label}
                      </span>
                    </div>
                    <h4 className="font-display text-[0.95rem] font-semibold leading-snug">
                      {r.title}
                    </h4>
                    <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">{r.action}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-dim px-2 py-1 text-[0.7rem] font-semibold text-emerald-300">
                        <Zap className="h-3 w-3" />
                        {r.directImpactMetric}
                      </span>
                    </div>
                    <p className="mt-2 text-[0.7rem] text-muted/90 leading-relaxed">
                      {r.impactExplanation}
                    </p>
                    <button
                      type="button"
                      aria-pressed={done}
                      onClick={() =>
                        onToggleComplete(r.id, r.exposureReductionPct, r.co2SavedKg)
                      }
                      className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                        done
                          ? 'border-emerald-500/40 bg-emerald-dim text-emerald-300'
                          : 'border-border text-muted hover:border-emerald-500/30 hover:text-emerald-300'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {done ? 'Completed Today' : 'Mark Completed'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {tab === 'indoor' && (
            <div className="space-y-3">
              <div className="flex gap-2 mb-1">
                {(
                  [
                    ['all', 'All'],
                    ['zero-cost', 'Zero-Cost'],
                    ['equipment', 'Equipment'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={hackFilter === id}
                    onClick={() => setHackFilter(id)}
                    className={`chip rounded-full border px-3 py-1 text-[0.7rem] font-medium ${
                      hackFilter === id ? 'chip-active' : 'chip-inactive'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {filteredHacks.map((h, i) => {
                const done = completedIds.has(h.id);
                const open = expandedHack === h.id;
                return (
                  <article
                    key={h.id}
                    className={`glass rounded-2xl p-4 animate-fade-up stagger-${Math.min(i + 1, 4)} ${
                      done ? 'ring-1 ring-emerald-500/25' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-[0.95rem] font-semibold leading-snug flex-1">
                        {h.title}
                      </h4>
                      <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-dim px-2 py-0.5 text-[0.65rem] font-bold text-emerald-300">
                        −{h.pm25ReductionPercent}% PM2.5
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-md border border-border px-2 py-0.5 text-[0.65rem] text-muted capitalize">
                        {h.category.replace('-', ' ')}
                      </span>
                      <span className="rounded-md border border-border px-2 py-0.5 text-[0.65rem] text-muted capitalize">
                        {h.difficulty}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedHack(open ? null : h.id)}
                      className="mt-3 flex w-full items-center justify-between text-left text-xs text-emerald-300"
                    >
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <FlaskConical className="h-3.5 w-3.5" />
                        How it works
                      </span>
                      {open ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {open && (
                      <div className="mt-2 rounded-xl border border-border bg-bg/40 p-3 animate-fade-in">
                        <p className="text-[0.75rem] leading-relaxed text-muted mb-2">
                          {h.scientificWhy}
                        </p>
                        <ol className="space-y-1.5">
                          {h.steps.map((step, si) => (
                            <li key={si} className="flex gap-2 text-[0.75rem] text-text">
                              <span className="text-emerald font-semibold">{si + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <button
                      type="button"
                      aria-pressed={done}
                      onClick={() =>
                        onToggleComplete(h.id, h.exposureReductionPct, h.co2SavedKg)
                      }
                      className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                        done
                          ? 'border-emerald-500/40 bg-emerald-dim text-emerald-300'
                          : 'border-border text-muted hover:border-emerald-500/30 hover:text-emerald-300'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {done ? 'Adopted Today' : 'Mark Adopted'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {tab === 'eco' && (
            <div className="space-y-3">
              {alternatives.map((a, i) => {
                const done = completedIds.has(a.id);
                return (
                  <article
                    key={a.id}
                    className={`glass rounded-2xl p-4 animate-fade-up stagger-${Math.min(i + 1, 4)} ${
                      done ? 'ring-1 ring-emerald-500/25' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-wider text-muted mb-2">
                      <ArrowRightLeft className="h-3 w-3 text-emerald" />
                      Habit → Eco Swap
                    </div>
                    <div className="grid gap-2">
                      <div className="rounded-xl border border-crimson/25 bg-crimson-dim/50 px-3 py-2">
                        <p className="text-[0.65rem] text-red-300/80 mb-0.5">Current habit</p>
                        <p className="text-[0.8rem] text-text leading-snug">{a.currentHabit}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-500/25 bg-emerald-dim px-3 py-2">
                        <p className="text-[0.65rem] text-emerald-400/80 mb-0.5">Sustainable swap</p>
                        <p className="text-[0.8rem] text-text leading-snug font-medium">
                          {a.ecoSwap}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Metric label="CO₂ / wk" value={`${a.co2SavedKgPerWeek} kg`} />
                      <Metric label="PM2.5 / wk" value={`${a.pm25AvoidedGPerWeek} g`} />
                      <Metric
                        label="₹ / mo"
                        value={`₹${a.costSavingsInrPerMonth}`}
                        icon
                      />
                    </div>

                    <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
                      <span className="text-emerald-300 font-medium">Health: </span>
                      {a.healthBenefit}
                    </p>
                    <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted">
                      <span className="text-emerald-300 font-medium">Community: </span>
                      {a.communityImpactExplanation}
                    </p>

                    <button
                      type="button"
                      aria-pressed={done}
                      onClick={() =>
                        onToggleComplete(a.id, a.exposureReductionPct, a.co2SavedKg)
                      }
                      className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                        done
                          ? 'border-emerald-500/40 bg-emerald-dim text-emerald-300'
                          : 'border-border text-muted hover:border-emerald-500/30 hover:text-emerald-300'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {done ? 'Swapped Today' : 'I Made This Swap'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg/40 px-2 py-2 text-center">
      <p className="text-[0.6rem] text-muted mb-0.5 flex items-center justify-center gap-0.5">
        {icon && <IndianRupee className="h-2.5 w-2.5" />}
        {label}
      </p>
      <p className="text-[0.75rem] font-semibold text-emerald-300 tabular-nums">{value}</p>
    </div>
  );
}
