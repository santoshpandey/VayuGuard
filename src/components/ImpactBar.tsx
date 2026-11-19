import { Shield, Leaf } from 'lucide-react';

interface ImpactBarProps {
  exposureReducedPct: number;
  emissionsSavedKg: number;
  completedCount: number;
  totalActions: number;
  sticky?: 'top' | 'bottom';
}

export function ImpactBar({
  exposureReducedPct,
  emissionsSavedKg,
  completedCount,
  totalActions,
  sticky = 'top',
}: ImpactBarProps) {
  const progress =
    totalActions > 0 ? Math.min(100, Math.round((completedCount / totalActions) * 100)) : 0;
  const safeScore = Math.min(100, Math.round(exposureReducedPct * 0.85 + progress * 0.15));

  return (
    <div
      className={`z-20 glass-strong px-4 py-2.5 border-x-0 ${
        sticky === 'top' ? 'sticky top-[4.5rem] border-b border-t-0' : 'sticky bottom-0 border-t border-b-0'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-[0.65rem] uppercase tracking-[0.12em] text-muted font-medium">
          Today&apos;s Impact · {completedCount}/{totalActions} actions
        </p>
        <span className="text-[0.7rem] font-semibold text-emerald-400">{safeScore}% safer</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="impact-bar h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
          style={{ width: `${Math.max(progress, exposureReducedPct > 0 ? 8 : 0)}%` }}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] text-text">
          <Shield className="h-3 w-3 text-emerald" />
          Exposure Reduced:{' '}
          <strong className="text-emerald-300">−{exposureReducedPct}%</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[0.72rem] text-text">
          <Leaf className="h-3 w-3 text-emerald" />
          Emissions Saved:{' '}
          <strong className="text-emerald-300">{emissionsSavedKg.toFixed(1)} kg CO₂</strong>
        </span>
      </div>
    </div>
  );
}
