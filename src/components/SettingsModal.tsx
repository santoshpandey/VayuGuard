import { useEffect, useState } from 'react';
import { X, Key, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  apiKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
  onRegenerate: (key: string) => void;
}

export function SettingsModal({
  open,
  apiKey,
  onSave,
  onClose,
  onRegenerate,
}: SettingsModalProps) {
  const [value, setValue] = useState(apiKey);

  useEffect(() => {
    if (open) setValue(apiKey);
  }, [open, apiKey]);

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
        aria-label="Close settings"
        onClick={onClose}
      />
      <div role="dialog" aria-modal="true" aria-labelledby="settings-title" className="relative w-full max-w-md glass-strong rounded-t-3xl sm:rounded-3xl p-5 animate-slide-up safe-bottom">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="settings-title" className="font-display text-lg font-semibold">Settings</h2>
            <p className="text-xs text-muted mt-0.5">Gemini API for live generation</p>
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

        <label className="block">
          <span className="flex items-center gap-2 text-sm font-medium mb-2">
            <Key className="h-4 w-4 text-emerald" />
            Gemini API Key
          </span>
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste your Google AI Studio key"
            className="w-full rounded-xl border border-border bg-bg/60 px-3.5 py-3 text-sm text-text placeholder:text-muted/60 outline-none focus:border-emerald-500/40"
            autoComplete="off"
          />
        </label>
        <p className="mt-2 text-[0.7rem] text-muted leading-relaxed">
          Without a key, VayuGuard runs in demo mode using realistic city presets. Keys stay in
          this browser session&apos;s sessionStorage and are cleared when the session ends.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onSave(value);
              onClose();
            }}
            className="w-full rounded-xl bg-emerald text-bg font-semibold text-sm py-3 hover:bg-emerald-400 transition-colors"
          >
            Save API Key
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(value);
              onRegenerate(value);
              onClose();
            }}
            className="w-full rounded-xl border border-emerald-500/35 bg-emerald-dim text-emerald-300 font-medium text-sm py-3 flex items-center justify-center gap-2 hover:border-emerald-500/55 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Save & Regenerate Plan
          </button>
        </div>
      </div>
    </div>
  );
}
