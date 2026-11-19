import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import type { ChatMessage, CityPreset, GeminiPlan, HouseholdProfile } from '../types';
import { askSmogCoach } from '../services/gemini';

interface SmogCoachProps {
  city: CityPreset;
  household: HouseholdProfile;
  plan: GeminiPlan;
  apiKey: string;
  openSignal?: number;
}

const SUGGESTIONS = [
  'Can my daughter attend outdoor football at 5:30 PM?',
  'Is it safe to open windows now?',
  'Should I drive or take metro this evening?',
  'Morning jog OK for elderly grandparents?',
];

export function SmogCoach({ city, household, plan, apiKey, openSignal = 0 }: SmogCoachProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (openSignal > 0) setOpen(true);
  }, [openSignal]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `I'm your Smog Coach for ${city.name}. Ask about outdoor play, commute, ventilation, or school runs — I'll judge against AQI ${city.aqi} and your household profile.`,
      timestamp: Date.now(),
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `I'm your Smog Coach for ${city.name}. Ask about outdoor play, commute, ventilation, or school runs — I'll judge against AQI ${city.aqi} and your household profile.`,
        timestamp: Date.now(),
      },
    ]);
  }, [city.id, city.aqi, city.name]);

  async function submit(question: string) {
    const q = question.trim();
    if (!q || busy) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);

    try {
      const { verdict, answer } = await askSmogCoach(apiKey, city, household, q, plan);
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: answer,
          verdict,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content:
            'I could not reach Gemini just now. Try again, or clear the API key to use offline coaching heuristics.',
          verdict: 'Temporarily Unavailable',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          id="smog-coach-fab"
          className="fixed bottom-5 right-[max(1.25rem,calc(50%-13.5rem))] z-40 flex items-center gap-2 rounded-full bg-emerald px-4 py-3 text-sm font-semibold text-bg shadow-lg shadow-emerald-900/40 hover:bg-emerald-400 transition-colors animate-fade-up lg:right-[max(1.25rem,calc(50vw-22rem))]"
        >
          <MessageCircle className="h-4 w-4" />
          Ask Smog Coach
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-full max-w-md flex-col glass-strong rounded-t-3xl md:rounded-3xl max-h-[88dvh] animate-slide-up overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-dim border border-emerald-500/30">
                  <Sparkles className="h-4 w-4 text-emerald" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Ask Smog Coach</h2>
                  <p className="text-[0.65rem] text-muted">
                    {city.name} · AQI {city.aqi}
                    {!apiKey && ' · Offline heuristics'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[280px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[0.8rem] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald text-bg rounded-br-md'
                        : 'bg-surface-2 border border-border text-text rounded-bl-md'
                    }`}
                  >
                    {msg.verdict && (
                      <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-amber-400">
                        {msg.verdict}
                      </p>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-border bg-surface-2 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {messages.length < 3 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="shrink-0 rounded-full border border-border bg-bg/40 px-3 py-1.5 text-[0.65rem] text-muted hover:text-emerald-300 hover:border-emerald-500/30"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              className="border-t border-border p-3 safe-bottom flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void submit(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a time, activity, or commute…"
                className="flex-1 rounded-xl border border-border bg-bg/50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500/40 placeholder:text-muted/60"
                disabled={busy}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald text-bg disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
