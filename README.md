# VayuGuard — Urban Air Quality Assistant

GenAI-powered mobile-first web app that helps urban families navigate air pollution with live forecasts, personalized routines, visual audits, community actions, and a conversational Smog Coach.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 
- Lucide Icons
- `@google/genai` (`gemini-2.5-flash`) with JSON `responseSchema`
- Open-Meteo Air Quality and Geocoding APIs (no API key required)

## Quick start

```bash
npm install
npm run dev
```

Open the local URL Vite prints. Live Open-Meteo AQI and a 24-hour forecast load for the selected city without an API key. If the network is unavailable, the app uses static preset data.

### Live Gemini generation

1. Open **Settings** (gear icon)
2. Paste a Google AI Studio API key
3. Tap **Save & Regenerate Plan**

The key is stored in `sessionStorage` only and is cleared when the browser session ends. It is never written to `localStorage`.

## Features

- Live Open-Meteo AQI / PM2.5 hero, location search, and one-click browser geolocation
- Responsive accessible 24-hour PM2.5 smog curve with a forecast-derived two-hour ventilation window
- Household profile chips (family + home setup) that regenerate advice
- 3-tab Action Engine: Daily Routine · Indoor Air · Eco Swaps
- Impact checklist with sticky exposure / CO₂ score
- Gemini 2.5 Flash multimodal Room, Purifier Filter & Outdoor Haze Vision Audit, with a sample audit available without a key
- Community RWA simulator scales weekly CO₂ and PM2.5 impact from adopted swaps and creates a shareable WhatsApp alert
- Multi-turn grounded Smog Coach with quick prompts and optional browser voice input
- Clean Air Champion share card after 3+ completed actions
- Desktop side context panel alongside the mobile shell

## Accessibility and security

- UI controls support keyboard navigation, visible focus indicators, pressed states, live status announcements, and Escape-to-close dialogs.
- Chart data is also summarized for screen readers; color is not the only signal for interactive controls.
- The interface follows WCAG 2.1 AA-oriented contrast and semantic markup practices.
- Open-Meteo requests do not require a key. Gemini calls use the user-provided key held in session-scoped browser storage. Uploaded image files are type/size-validated before being sent to Gemini and are not persisted by VayuGuard.
