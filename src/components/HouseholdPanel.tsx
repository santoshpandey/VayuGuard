import { useEffect, useState } from 'react';
import { X, Users, Home } from 'lucide-react';
import type { FamilyTag, HomeSetupTag, HouseholdProfile } from '../types';
import { FAMILY_TAGS, HOME_SETUP_TAGS } from '../data/presets';

interface HouseholdPanelProps {
  open: boolean;
  profile: HouseholdProfile;
  onChange: (next: HouseholdProfile) => void;
  onClose: () => void;
}

function toggle<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function HouseholdPanel({ open, profile, onChange, onClose }: HouseholdPanelProps) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    if (open) setDraft(profile);
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        aria-label="Close household panel"
        onClick={onClose}
      />
      <div role="dialog" aria-modal="true" aria-labelledby="household-title" className="relative w-full max-w-md max-h-[85dvh] overflow-y-auto glass-strong rounded-t-3xl sm:rounded-3xl p-5 animate-slide-up safe-bottom">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="household-title" className="font-display text-lg font-semibold">Household Profile</h2>
            <p className="text-xs text-muted mt-0.5">Apply to regenerate your tailored plan</p>
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

        <section className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Users className="h-4 w-4 text-emerald" />
            <h3 className="text-sm font-medium">Family Members</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {FAMILY_TAGS.map((tag) => {
              const active = draft.family.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setDraft((d) => ({ ...d, family: toggle(d.family, tag as FamilyTag) }))
                  }
                  className={`chip rounded-full border px-3 py-1.5 text-xs font-medium ${
                    active ? 'chip-active' : 'chip-inactive'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2.5">
            <Home className="h-4 w-4 text-emerald" />
            <h3 className="text-sm font-medium">Home Setup</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {HOME_SETUP_TAGS.map((tag) => {
              const active = draft.homeSetup.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      homeSetup: toggle(d.homeSetup, tag as HomeSetupTag),
                    }))
                  }
                  className={`chip rounded-full border px-3 py-1.5 text-xs font-medium ${
                    active ? 'chip-active' : 'chip-inactive'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={() => {
            onChange(draft);
            onClose();
          }}
          className="mt-6 w-full rounded-xl bg-emerald text-bg font-semibold text-sm py-3 hover:bg-emerald-400 transition-colors"
        >
          Apply & Regenerate Plan
        </button>
      </div>
    </div>
  );
}
