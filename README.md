# VayuGuard — Urban Air Quality Assistant

GenAI-powered mobile-first web app that helps Indian urban families navigate winter smog with personalized daily routines, indoor air hacks, eco swaps, and a conversational Smog Coach.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Lucide Icons
- `@google/genai` (`gemini-2.5-flash`) with JSON `responseSchema`

## Quick start

```bash
npm install
npm run dev
```

Open the local URL Vite prints. The app loads instantly in **demo mode** with city presets (Noida, Delhi, Bengaluru, Mumbai) — no API key required.

### Live Gemini generation

1. Open **Settings** (gear icon)
2. Paste a Google AI Studio API key
3. Tap **Save & Regenerate Plan**

## Features

- Live location presets with AQI / PM2.5 hero card
- Household profile chips (family + home setup) that regenerate advice
- 3-tab Action Engine: Daily Routine · Indoor Air · Eco Swaps
- Impact checklist with sticky exposure / CO₂ score
- Ask Smog Coach slide-up chat (live Gemini or offline heuristics)
- Clean Air Champion share card after 3+ completed actions
- Desktop side context panel alongside the mobile shell
