import { useRef, useState } from 'react';
import { Camera, CheckCircle2, ImagePlus, Sparkles } from 'lucide-react';
import type { CityPreset, HouseholdProfile, VisionAudit } from '../types';
import { auditImage } from '../services/gemini';

interface VisionAuditCardProps {
  city: CityPreset;
  household: HouseholdProfile;
  apiKey: string;
}

const SAMPLE_AUDIT: VisionAudit = {
  detectedSubject: 'Indoor Room',
  riskLevel: 'high',
  findings: [
    'A visible gap around the window frame may allow outdoor particles to leak indoors.',
    'The room appears close to a traffic-facing window.',
  ],
  immediateFixes: [
    'Seal the visible frame gap with removable weather stripping.',
    'Keep the window closed during the morning and evening traffic peaks.',
    'Run the purifier near the breathing zone and clean its pre-filter.',
  ],
  estimatedPm25Impact: 'Approximate: sealing leakage may reduce indoor particle entry; verify with a monitor.',
};

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read the selected image.'));
        return;
      }
      const base64 = reader.result.split(',')[1];
      if (!base64) {
        reject(new Error('Could not encode the selected image.'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

export function VisionAuditCard({ city, household, apiKey }: VisionAuditCardProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<VisionAudit | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError('');
    setResult(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Image must be 4 MB or smaller.');
      return;
    }
    if (!apiKey) {
      setError('No Gemini key is active. Use the sample audit to explore this feature.');
      return;
    }

    setBusy(true);
    try {
      const data = await readImage(file);
      setResult(await auditImage(apiKey, { data, mimeType: file.type }, city, household));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The vision audit could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass rounded-2xl p-4" aria-labelledby="vision-audit-title">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-dim">
          <Camera className="h-5 w-5 text-emerald" aria-hidden="true" />
        </div>
        <div>
          <h2 id="vision-audit-title" className="font-display text-base font-semibold">
            Room, filter &amp; sky audit
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Scan a room, purifier filter, or outdoor haze. Visual observations are not a substitute for an air-quality monitor.
          </p>
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        aria-label="Choose a room, purifier filter, or outdoor haze image"
        onChange={(event) => {
          void handleFile(event.currentTarget.files?.[0]);
          event.currentTarget.value = '';
        }}
      />
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald px-3 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-emerald-400 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          {busy ? 'Auditing image…' : 'Scan Room / Filter / Haze'}
        </button>
        <button
          type="button"
          onClick={() => {
            setError('');
            setResult(SAMPLE_AUDIT);
          }}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-dim px-3 py-2.5 text-sm font-medium text-emerald-300 hover:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Try Sample Audit
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
      {result && (
        <div className="mt-4 rounded-xl border border-border bg-bg/45 p-3" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{result.detectedSubject}</h3>
            <span className="rounded-full border border-amber-400/30 bg-amber-dim px-2 py-1 text-xs capitalize text-amber-300">
              {result.riskLevel} risk
            </span>
          </div>
          <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Visual findings</h4>
          <ul className="mt-1 space-y-1">
            {result.findings.map((finding) => <li key={finding} className="text-sm text-text">• {finding}</li>)}
          </ul>
          <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Immediate fixes</h4>
          <ol className="mt-1 space-y-1">
            {result.immediateFixes.map((fix, index) => (
              <li key={fix} className="flex gap-2 text-sm text-text">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald" aria-hidden="true" />
                <span>{index + 1}. {fix}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-emerald-300">{result.estimatedPm25Impact}</p>
        </div>
      )}
    </section>
  );
}
