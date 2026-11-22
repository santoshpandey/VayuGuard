import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Mic, MicOff } from 'lucide-react';
import type { CoachMessage, CityPreset, GeminiPlan, HouseholdProfile } from '../types';
import { askSmogCoach, sanitizeUserPrompt } from '../services/gemini';

interface SmogCoachProps {
  city: CityPreset;
  household: HouseholdProfile;
  plan: GeminiPlan;
  apiKey: string;
  openSignal?: number;
}

interface SpeechResultLike {
  0: { transcript: string };
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

const STARTERS = [
  "Safe for kids' outdoor play at 5 PM?",
  'Best time to open windows today?',
  'N95 vs surgical mask for metro commute?',
];

function welcome(city: CityPreset): CoachMessage {
  return {
    role: 'assistant',
    text: `I'm your Smog Coach for ${city.name}. Ask about outdoor activity, ventilation, or commuting. Current AQI: ${city.aqi}.`,
  };
}

export function SmogCoach({ city, household, plan, apiKey, openSignal = 0 }: SmogCoachProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [messages, setMessages] = useState<CoachMessage[]>([welcome(city)]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechRecognitionLike | null>(null);
  const speechWindow = window as SpeechWindow;
  const SpeechRecognitionConstructor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

  useEffect(() => {
    if (openSignal > 0) setOpen(true);
  }, [openSignal]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    setMessages([welcome(city)]);
  }, [city.id, city.aqi, city.name]);

  useEffect(() => () => speechRef.current?.stop(), []);

  async function submit(value: string) {
    const text = sanitizeUserPrompt(value);
    if (!text || busy) return;
    const conversation: CoachMessage[] = [...messages, { role: 'user', text }];
    setMessages(conversation);
    setInput('');
    setBusy(true);
    try {
      const { verdict, answer } = await askSmogCoach(apiKey, city, household, conversation, plan);
      setMessages((current) => [...current, { role: 'assistant', text: `${verdict}\n${answer}` }]);
    } catch (reason) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: `Temporarily unavailable. ${reason instanceof Error ? reason.message : 'Try again, or use offline coaching.'}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function toggleVoice() {
    if (!SpeechRecognitionConstructor) return;
    if (listening) {
      speechRef.current?.stop();
      return;
    }
    setVoiceError('');
    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = sanitizeUserPrompt(event.results[0]?.[0]?.transcript ?? '');
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => {
      setVoiceError('Voice input was unavailable. Check microphone permission or type your question.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    speechRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          id="smog-coach-fab"
          className="fixed bottom-5 right-[max(1.25rem,calc(50%-13.5rem))] z-40 flex min-h-11 items-center gap-2 rounded-full bg-emerald px-4 py-3 text-sm font-semibold text-bg shadow-lg shadow-emerald-900/40 transition-colors hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg lg:right-[max(1.25rem,calc(50vw-22rem))]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Ask Smog Coach
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <button type="button" className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" aria-label="Close chat" onClick={() => setOpen(false)} />
          <section role="dialog" aria-modal="true" aria-labelledby="coach-title" className="relative flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden glass-strong rounded-t-3xl animate-slide-up md:rounded-3xl">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-dim">
                  <Sparkles className="h-4 w-4 text-emerald" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="coach-title" className="text-sm font-semibold">Ask Smog Coach</h2>
                  <p className="text-[0.65rem] text-muted">{city.name} · AQI {city.aqi}{!apiKey && ' · Offline heuristics'}</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted focus-visible:ring-2 focus-visible:ring-emerald-400" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-[280px] flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[0.8rem] leading-relaxed ${
                    message.role === 'user' ? 'rounded-br-md bg-emerald text-bg' : 'rounded-bl-md border border-border bg-surface-2 text-text'
                  }`}>
                    {message.text}
                  </p>
                </div>
              ))}
              {busy && <p className="text-xs text-muted" role="status">Thinking through the latest AQI context…</p>}
              <div ref={bottomRef} />
            </div>

            {messages.length === 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 pb-2">
                {STARTERS.map((starter) => (
                  <button key={starter} type="button" onClick={() => void submit(starter)} className="min-h-10 shrink-0 rounded-full border border-border bg-bg/40 px-3 py-1.5 text-left text-xs text-muted hover:border-emerald-500/30 hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400">
                    {starter}
                  </button>
                ))}
              </div>
            )}

            <form className="safe-bottom flex gap-2 border-t border-border p-3" onSubmit={(event) => { event.preventDefault(); void submit(input); }}>
              <label htmlFor="coach-question" className="sr-only">Ask an air-quality question</label>
              <input
                id="coach-question"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about a time, activity, or commute…"
                maxLength={500}
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-bg/50 px-3.5 py-2.5 text-sm outline-none placeholder:text-muted/60 focus-visible:ring-2 focus-visible:ring-emerald-400"
                disabled={busy}
              />
              {SpeechRecognitionConstructor && (
                <button type="button" onClick={toggleVoice} aria-label={listening ? 'Stop voice input' : 'Start voice input'} aria-pressed={listening} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400">
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              <button type="submit" disabled={busy || !input.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald text-bg disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-400" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </form>
            {voiceError && <p className="px-4 pb-2 text-xs text-amber-300" role="status">{voiceError}</p>}
          </section>
        </div>
      )}
    </>
  );
}
