import type { CityPreset, GeminiPlan, HouseholdProfile } from '../types';

export const CITY_PRESETS: CityPreset[] = [
  {
    id: 'noida',
    name: 'Noida',
    locality: 'Sector 62',
    aqi: 312,
    pm25: 184,
    primaryPollutant: 'PM2.5',
    tier: 'very-poor',
    tierLabel: 'Very Poor',
  },
  {
    id: 'delhi',
    name: 'Delhi',
    locality: 'Anand Vihar',
    aqi: 385,
    pm25: 248,
    primaryPollutant: 'PM2.5',
    tier: 'severe',
    tierLabel: 'Severe',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    locality: 'Indiranagar',
    aqi: 68,
    pm25: 28,
    primaryPollutant: 'PM2.5',
    tier: 'moderate',
    tierLabel: 'Moderate',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    locality: 'Andheri East',
    aqi: 142,
    pm25: 72,
    primaryPollutant: 'PM2.5',
    tier: 'poor',
    tierLabel: 'Poor',
  },
];

export const DEFAULT_HOUSEHOLD: HouseholdProfile = {
  family: ['Kids', 'Office Commuter'],
  homeSetup: ['Air Purifier', 'Indoor Plants', 'Gas Stove', 'N95 Masks'],
};

export const FAMILY_TAGS = [
  'Kids',
  'Elderly',
  'Asthma/Sensitive',
  'Office Commuter',
] as const;

export const HOME_SETUP_TAGS = [
  'Air Purifier',
  'Indoor Plants',
  'Gas Stove',
  'Two-Wheeler/Car',
  'N95 Masks',
  'Induction Stove',
] as const;

function withIds<T extends { id?: string }>(
  items: Omit<T, 'id'>[],
  prefix: string
): (T & { id: string })[] {
  return items.map((item, i) => ({ ...item, id: `${prefix}-${i}` })) as (T & { id: string })[];
}

export const FALLBACK_PLANS: Record<string, GeminiPlan> = {
  noida: {
    advisorySummary:
      'Thermal inversion is locking PM2.5 near the ground — stay indoors until the midday sun breaks the smog layer. Mask up for any outdoor trip.',
    safeVentilationWindow: '1:30 PM – 3:30 PM',
    dailyRoutines: withIds(
      [
        {
          timeSlot: 'Morning · 6:00–9:00 AM',
          title: 'Skip Outdoor Morning Run',
          action:
            'Cold-night inversion traps exhaust and construction dust. Do 20-min indoor yoga or resistance bands instead of park jogging.',
          riskLevel: 'hazardous' as const,
          directImpactMetric: '−45% PM2.5 inhalation',
          impactExplanation:
            'Dawn AQI in Sector 62 routinely spikes 40–60 points above daytime averages during winter.',
          exposureReductionPct: 45,
          co2SavedKg: 0,
        },
        {
          timeSlot: 'Midday · 1:30–3:30 PM',
          title: '20-Min Cross-Ventilation Window',
          action:
            'Open opposite windows for 15–20 minutes while AQI dips. Run HEPA purifier on high for 10 minutes after closing.',
          riskLevel: 'safe' as const,
          directImpactMetric: '−28% indoor CO₂ + VOCs',
          impactExplanation:
            'Solar heating lifts the inversion layer; midday is the safest flush window in NCR winters.',
          exposureReductionPct: 18,
          co2SavedKg: 0,
        },
        {
          timeSlot: 'Evening · 5:00–9:00 PM',
          title: 'Metro + N95 vs Solo Car',
          action:
            'Batch school pickup and office return via Aqua Line + short auto. Wear N95 from door to door during the smog peak.',
          riskLevel: 'hazardous' as const,
          directImpactMetric: '−3.2 kg CO₂ / trip',
          impactExplanation:
            'Evening traffic + stubble haze creates a double pollution peak; cabin air without filtration is worse than metro platforms.',
          exposureReductionPct: 32,
          co2SavedKg: 3.2,
        },
        {
          timeSlot: 'Night · 9:00 PM–6:00 AM',
          title: 'Seal & Purify Sleep Zone',
          action:
            'Close all windows, wet-mop bedroom floors, set purifier to sleep mode near the bed. Avoid incense or agarbatti.',
          riskLevel: 'moderate' as const,
          directImpactMetric: '−55% overnight PM2.5 load',
          impactExplanation:
            'Indoor PM2.5 can exceed outdoor levels if cooking residue and dust settle overnight without filtration.',
          exposureReductionPct: 55,
          co2SavedKg: 0.1,
        },
      ],
      'routine'
    ),
    indoorHacks: withIds(
      [
        {
          title: 'Wet-Mop Twice Daily (Not Dry Sweep)',
          category: 'zero-cost' as const,
          difficulty: 'easy' as const,
          steps: [
            'Mix 1 tsp vinegar in a bucket of water',
            'Mop high-traffic zones after morning and evening',
            'Leave windows shut while mopping; ventilate at midday only',
          ],
          pm25ReductionPercent: 22,
          scientificWhy:
            'Dry sweeping re-suspends settled PM2.5 into the breathing zone; wet mopping captures particles in water.',
          exposureReductionPct: 12,
          co2SavedKg: 0,
        },
        {
          title: 'HEPA Purifier Zoning',
          category: 'equipment' as const,
          difficulty: 'easy' as const,
          steps: [
            'Place purifier 1–2 ft from the bed, intake unobstructed',
            'Run turbo 30 min before sleep, then Auto/Sleep',
            'Replace or clean pre-filter every 2 weeks in smog season',
          ],
          pm25ReductionPercent: 65,
          scientificWhy:
            'True HEPA captures ≥99.97% of 0.3 µm particles — the size most damaging to alveoli.',
          exposureReductionPct: 40,
          co2SavedKg: 0,
        },
        {
          title: 'Gas Stove Exhaust Protocol',
          category: 'zero-cost' as const,
          difficulty: 'easy' as const,
          steps: [
            'Turn on chimney/exhaust BEFORE lighting the burner',
            'Keep a window ajar toward the exhaust path only',
            'After cooking, run exhaust 10 more minutes',
          ],
          pm25ReductionPercent: 35,
          scientificWhy:
            'LPG combustion emits ultrafine particles and NO₂; delayed exhaust lets them circulate through the flat.',
          exposureReductionPct: 20,
          co2SavedKg: 0.2,
        },
        {
          title: 'DIY Box-Fan Corsi-Rosenthal Filter',
          category: 'equipment' as const,
          difficulty: 'moderate' as const,
          steps: [
            'Tape 4 MERV-13 filters into a cube around a box fan',
            'Seal gaps with packing tape; run fan on low',
            'Place in living room during peak AQI hours',
          ],
          pm25ReductionPercent: 48,
          scientificWhy:
            'High-CADR DIY filtration proven in peer-reviewed studies to cut indoor PM2.5 by nearly half in sealed rooms.',
          exposureReductionPct: 28,
          co2SavedKg: 0,
        },
        {
          title: 'Balcony Plant Dust Rinse',
          category: 'zero-cost' as const,
          difficulty: 'easy' as const,
          steps: [
            'Rinse money plant / snake plant leaves every 3 days',
            'Keep plants indoors overnight during severe AQI',
            'Avoid misting during peak smog (spreads particles)',
          ],
          pm25ReductionPercent: 8,
          scientificWhy:
            'Dust-coated leaves stop photosynthetic VOC uptake; clean foliage modestly aids indoor air freshness.',
          exposureReductionPct: 4,
          co2SavedKg: 0,
        },
      ],
      'hack'
    ),
    sustainableAlternatives: withIds(
      [
        {
          currentHabit: 'Solo petrol car to Sector 18 / office',
          ecoSwap: 'Aqua Line metro + last-mile e-rickshaw',
          co2SavedKgPerWeek: 18.4,
          pm25AvoidedGPerWeek: 42,
          costSavingsInrPerMonth: 3200,
          healthBenefit:
            'Cabin filtration + shorter roadside exposure cuts commute inhalation by up to 80%.',
          communityImpactExplanation:
            'One less car on the Noida Expressway removes ~2.6 kg CO₂ and local NOx per weekday trip.',
          exposureReductionPct: 25,
          co2SavedKg: 3.2,
        },
        {
          currentHabit: 'Deep frying + open LPG wok evenings',
          ecoSwap: 'Batch steam/pressure-cook; shift heavy frying to midday vent window',
          co2SavedKgPerWeek: 2.1,
          pm25AvoidedGPerWeek: 18,
          costSavingsInrPerMonth: 450,
          healthBenefit:
            'Cuts cooking-derived ultrafine particles that spike indoor AQI to outdoor “poor” levels.',
          communityImpactExplanation:
            'Lower evening gas demand and kitchen exhaust plumes reduce neighbourhood micro-smog.',
          exposureReductionPct: 15,
          co2SavedKg: 0.4,
        },
        {
          currentHabit: 'Burning dry leaves / garden waste',
          ecoSwap: 'Leaf compost bin or municipal green-waste pickup',
          co2SavedKgPerWeek: 5.6,
          pm25AvoidedGPerWeek: 120,
          costSavingsInrPerMonth: 0,
          healthBenefit:
            'Leaf burning emits black carbon that lodges deep in lungs — especially harmful for kids and asthmatics.',
          communityImpactExplanation:
            'A single leaf pile burn can spike local PM2.5 by 100+ µg/m³ for nearby homes.',
          exposureReductionPct: 10,
          co2SavedKg: 1.2,
        },
        {
          currentHabit: 'Idling AC in parked car for school pickup',
          ecoSwap: 'Coordinate carpool queue; wait indoors with N95 if delay',
          co2SavedKgPerWeek: 4.8,
          pm25AvoidedGPerWeek: 15,
          costSavingsInrPerMonth: 1100,
          healthBenefit:
            'Avoids sitting in concentrated exhaust plumes outside school gates during evening peak.',
          communityImpactExplanation:
            'School-gate idling clusters are hotspots for children’s peak PM2.5 exposure.',
          exposureReductionPct: 12,
          co2SavedKg: 0.8,
        },
      ],
      'eco'
    ),
  },

  delhi: {
    advisorySummary:
      'Severe AQI — treat outdoor air as a health hazard. Minimise exits, seal the home, and use N95 for every outdoor minute.',
    safeVentilationWindow: '2:00 PM – 3:00 PM (brief)',
    dailyRoutines: withIds(
      [
        {
          timeSlot: 'Morning · 6:00–9:00 AM',
          title: 'Full Indoor Lockdown Morning',
          action:
            'No balcony time. Keep kids’ PE indoors. Check WFH options; if commute is mandatory, N95 + shortest metro path.',
          riskLevel: 'hazardous' as const,
          directImpactMetric: '−60% morning PM2.5 intake',
          impactExplanation:
            'Anand Vihar winters often exceed AQI 350 at dawn due to inversion + truck emissions.',
          exposureReductionPct: 60,
          co2SavedKg: 0,
        },
        {
          timeSlot: 'Midday · 2:00–3:00 PM',
          title: 'Ultra-Brief Air Flush',
          action:
            'Crack two windows for 8–10 minutes only. Purifier on turbo before and after. Skip if AQI still >350.',
          riskLevel: 'moderate' as const,
          directImpactMetric: '−15% indoor CO₂',
          impactExplanation:
            'Even on severe days, brief solar lift may allow a short flush — keep it under 10 minutes.',
          exposureReductionPct: 10,
          co2SavedKg: 0,
        },
        {
          timeSlot: 'Evening · 5:00–9:00 PM',
          title: 'Postpone Non-Essential Errands',
          action:
            'Grocery delivery over market runs. If travel needed, metro over roads; never walk arterial corridors unmasked.',
          riskLevel: 'hazardous' as const,
          directImpactMetric: '−4.1 kg CO₂ / trip avoided',
          impactExplanation:
            'Evening smog peak + diesel fleets make roadside exposure the day’s worst window.',
          exposureReductionPct: 40,
          co2SavedKg: 4.1,
        },
        {
          timeSlot: 'Night · 9:00 PM–6:00 AM',
          title: 'Bedroom Clean-Room Protocol',
          action:
            'Door draft seal, wet mop, HEPA at highest CADR for bedroom volume. No candles or mosquito coils.',
          riskLevel: 'hazardous' as const,
          directImpactMetric: '−70% overnight PM2.5',
          impactExplanation:
            'At AQI 385, outdoor seepage overnight can recreate “poor” indoor levels without aggressive filtration.',
          exposureReductionPct: 70,
          co2SavedKg: 0.1,
        },
      ],
      'routine'
    ),
    indoorHacks: withIds(
      [
        {
          title: 'Draft-Seal Windows with Weather Strips',
          category: 'zero-cost' as const,
          difficulty: 'easy' as const,
          steps: [
            'Apply foam tape on window gaps',
            'Hang damp towel at door base if needed',
            'Recheck seals after midday vent',
          ],
          pm25ReductionPercent: 30,
          scientificWhy:
            'Infiltration through gaps is the main indoor PM2.5 source when outdoor AQI is severe.',
          exposureReductionPct: 18,
          co2SavedKg: 0,
        },
        {
          title: 'Dual HEPA: Living + Bedroom',
          category: 'equipment' as const,
          difficulty: 'easy' as const,
          steps: [
            'Dedicate one unit to sleeping zone 24/7',
            'Second unit in living area during waking hours',
            'Do not move a single unit room-to-room mid-cycle',
          ],
          pm25ReductionPercent: 75,
          scientificWhy:
            'CADR must match room volume; relocating a purifier resets clean-air equilibrium each time.',
          exposureReductionPct: 50,
          co2SavedKg: 0,
        },
        {
          title: 'No-Fry Kitchen Days',
          category: 'zero-cost' as const,
          difficulty: 'easy' as const,
          steps: [
            'Prefer pressure cooker / steam / boil menus',
            'If frying is essential, use induction + exhaust',
            'Eat one outdoor-restaurant meal instead of home deep-fry',
          ],
          pm25ReductionPercent: 40,
          scientificWhy:
            'Cooking can push indoor PM2.5 above 300 µg/m³ within minutes on high-AQI days.',
          exposureReductionPct: 25,
          co2SavedKg: 0.3,
        },
        {
          title: 'N95 Fit-Check Ritual',
          category: 'equipment' as const,
          difficulty: 'easy' as const,
          steps: [
            'Pinch nose clip; check cheek seal',
            'Replace after 8 outdoor hours or if damp',
            'Kids: use ISI/NIOSH-rated kid sizes, not cloth',
          ],
          pm25ReductionPercent: 80,
          scientificWhy:
            'A well-fitted N95 filters ≥95% of airborne particles; poor fit drops protection dramatically.',
          exposureReductionPct: 35,
          co2SavedKg: 0,
        },
      ],
      'hack'
    ),
    sustainableAlternatives: withIds(
      [
        {
          currentHabit: 'Daily diesel/petrol solo commute across Ring Road',
          ecoSwap: 'Metro + e-bus pass; WFH 2 days/week',
          co2SavedKgPerWeek: 28,
          pm25AvoidedGPerWeek: 65,
          costSavingsInrPerMonth: 4800,
          healthBenefit: 'Removes hours of trapped cabin + roadside ultrafine exposure.',
          communityImpactExplanation:
            'Delhi’s transport sector is a top NOx/PM contributor — each avoided car trip compounds city-wide.',
          exposureReductionPct: 30,
          co2SavedKg: 5.0,
        },
        {
          currentHabit: 'Diesel generator backup for short outages',
          ecoSwap: 'Inverter + solar lantern bank for 2–4 hr gaps',
          co2SavedKgPerWeek: 12,
          pm25AvoidedGPerWeek: 80,
          costSavingsInrPerMonth: 900,
          healthBenefit: 'Eliminates neighbourhood DG plume that spikes local PM during outages.',
          communityImpactExplanation:
            'Residential DG clusters create micro-smog events felt by entire RWAs.',
          exposureReductionPct: 8,
          co2SavedKg: 2.0,
        },
        {
          currentHabit: 'Open burning of packaging / dry waste',
          ecoSwap: 'Segregated dry waste + kabadiwala pickup',
          co2SavedKgPerWeek: 6.5,
          pm25AvoidedGPerWeek: 150,
          costSavingsInrPerMonth: 200,
          healthBenefit: 'Plastic/paper burns release dioxins and ultrafine carbon.',
          communityImpactExplanation:
            'Colony-level open burning is a leading local winter PM spike source.',
          exposureReductionPct: 12,
          co2SavedKg: 1.5,
        },
      ],
      'eco'
    ),
  },

  bengaluru: {
    advisorySummary:
      'Moderate AQI — good day for outdoor activity with light caution near traffic corridors. Keep evening walks away from ORR choke points.',
    safeVentilationWindow: '7:00 AM – 6:00 PM (most of day)',
    dailyRoutines: withIds(
      [
        {
          timeSlot: 'Morning · 6:00–9:00 AM',
          title: 'Park Run is OK — Avoid Arterials',
          action:
            'Jog Cubbon/neighbourhood park trails; skip ORR-adjacent sidewalks during peak traffic.',
          riskLevel: 'safe' as const,
          directImpactMetric: '+cardiovascular benefit',
          impactExplanation:
            'At AQI ~68, outdoor exercise benefits outweigh pollution risk away from dense traffic.',
          exposureReductionPct: 5,
          co2SavedKg: 0,
        },
        {
          timeSlot: 'Midday · 12:00–3:00 PM',
          title: 'Full Home Air Exchange',
          action:
            'Cross-ventilate freely. Purifier can run on low or Auto. Ideal time for balcony plant care.',
          riskLevel: 'safe' as const,
          directImpactMetric: '−40% indoor stale air',
          impactExplanation:
            'Bengaluru’s daytime mixing height usually keeps PM manageable for open-window living.',
          exposureReductionPct: 8,
          co2SavedKg: 0,
        },
        {
          timeSlot: 'Evening · 5:30–8:00 PM',
          title: 'Namma Metro over Solo Two-Wheeler',
          action:
            'Prefer Purple/Green Line for IT corridor hops; keep a light mask for last-mile auto.',
          riskLevel: 'moderate' as const,
          directImpactMetric: '−2.1 kg CO₂ / trip',
          impactExplanation:
            'Evening traffic still elevates roadside NO₂ even when citywide AQI looks moderate.',
          exposureReductionPct: 15,
          co2SavedKg: 2.1,
        },
        {
          timeSlot: 'Night · 9:00 PM–6:00 AM',
          title: 'Light Seal + Fan',
          action:
            'Close windows if near a busy junction; ceiling fan + optional purifier sleep mode.',
          riskLevel: 'safe' as const,
          directImpactMetric: '−12% overnight roadside seepage',
          impactExplanation:
            'Local traffic can still nudge night PM near major roads even on moderate city days.',
          exposureReductionPct: 10,
          co2SavedKg: 0,
        },
      ],
      'routine'
    ),
    indoorHacks: withIds(
      [
        {
          title: 'Morning Cross-Breeze Ritual',
          category: 'zero-cost' as const,
          difficulty: 'easy' as const,
          steps: [
            'Open opposite windows 20–30 minutes after sunrise',
            'Run kitchen exhaust briefly while flushing',
            'Close if you smell smoke or see haze',
          ],
          pm25ReductionPercent: 25,
          scientificWhy:
            'Fresh air exchange dilutes indoor VOCs and CO₂ when outdoor air is relatively clean.',
          exposureReductionPct: 10,
          co2SavedKg: 0,
        },
        {
          title: 'Plant Leaf Dust Wipe Weekly',
          category: 'zero-cost' as const,
          difficulty: 'easy' as const,
          steps: [
            'Wipe snake plant / areca leaves with damp cloth',
            'Rotate plants between balcony and indoor light',
            'Avoid overwatering in cooler months',
          ],
          pm25ReductionPercent: 6,
          scientificWhy:
            'Clean foliage maintains modest VOC uptake and humidity buffering.',
          exposureReductionPct: 3,
          co2SavedKg: 0,
        },
        {
          title: 'Purifier as Peak-Hour Backup',
          category: 'equipment' as const,
          difficulty: 'easy' as const,
          steps: [
            'Enable Auto mode during traffic peaks',
            'Place near the most-used living zone',
            'Check filter status monthly',
          ],
          pm25ReductionPercent: 50,
          scientificWhy:
            'Even moderate cities see indoor spikes from cooking and outdoor traffic pulses.',
          exposureReductionPct: 20,
          co2SavedKg: 0,
        },
      ],
      'hack'
    ),
    sustainableAlternatives: withIds(
      [
        {
          currentHabit: 'Daily two-wheeler solo to Whitefield / ORR',
          ecoSwap: 'BMTC / Metro + office shuttle days',
          co2SavedKgPerWeek: 14,
          pm25AvoidedGPerWeek: 28,
          costSavingsInrPerMonth: 2200,
          healthBenefit: 'Less roadside exhaust inhalation during long corridor rides.',
          communityImpactExplanation:
            'Two-wheeler density on ORR is a major local NOx contributor during peak hours.',
          exposureReductionPct: 18,
          co2SavedKg: 2.1,
        },
        {
          currentHabit: 'AC idling in traffic jams',
          ecoSwap: 'Switch engine off >60s stops; use metro for predictable hops',
          co2SavedKgPerWeek: 3.5,
          pm25AvoidedGPerWeek: 10,
          costSavingsInrPerMonth: 800,
          healthBenefit: 'Reduces cabin recirculation of own exhaust in gridlock.',
          communityImpactExplanation:
            'Idling fleets amplify junction-level pollution hotspots.',
          exposureReductionPct: 8,
          co2SavedKg: 0.6,
        },
        {
          currentHabit: 'Weekend lake-area car picnic with idling',
          ecoSwap: 'Cycle / walk last mile; pack cold meals',
          co2SavedKgPerWeek: 4.2,
          pm25AvoidedGPerWeek: 12,
          costSavingsInrPerMonth: 600,
          healthBenefit: 'Keeps recreation zones cleaner for kids’ outdoor play.',
          communityImpactExplanation:
            'Popular lakes see weekend car clusters that degrade local air enjoyment.',
          exposureReductionPct: 6,
          co2SavedKg: 0.5,
        },
      ],
      'eco'
    ),
  },

  mumbai: {
    advisorySummary:
      'Poor AQI with coastal moisture holding particles — limit outdoor exertion near highways; ventilate mid-morning when sea breeze helps.',
    safeVentilationWindow: '10:00 AM – 1:00 PM',
    dailyRoutines: withIds(
      [
        {
          timeSlot: 'Morning · 6:00–9:00 AM',
          title: 'Shift Jog Away from Highways',
          action:
            'Use seaface / park loops, not WEH-adjacent roads. Light mask if AQI crosses 150.',
          riskLevel: 'moderate' as const,
          directImpactMetric: '−25% traffic-plume intake',
          impactExplanation:
            'Andheri East mornings mix construction dust with highway exhaust before sea breeze strengthens.',
          exposureReductionPct: 25,
          co2SavedKg: 0,
        },
        {
          timeSlot: 'Midday · 10:00 AM–1:00 PM',
          title: 'Sea-Breeze Ventilation Window',
          action:
            'Open windows facing the breeze for 25 minutes. Run kitchen exhaust if cooking coincides.',
          riskLevel: 'safe' as const,
          directImpactMetric: '−32% indoor PM + humidity stale air',
          impactExplanation:
            'Mid-morning sea breeze often disperses overnight-accumulated urban PM in coastal Mumbai.',
          exposureReductionPct: 16,
          co2SavedKg: 0,
        },
        {
          timeSlot: 'Evening · 5:00–9:00 PM',
          title: 'Local Train + Mask Protocol',
          action:
            'Prefer Western/Central line over ride-hail on clogged arterials. N95 on platforms during peak.',
          riskLevel: 'moderate' as const,
          directImpactMetric: '−2.8 kg CO₂ / trip',
          impactExplanation:
            'Evening congestion on SV Road / WEH traps exhaust; trains cut both emissions and exposure time.',
          exposureReductionPct: 22,
          co2SavedKg: 2.8,
        },
        {
          timeSlot: 'Night · 9:00 PM–6:00 AM',
          title: 'Dehumidify + Filter Sleep Air',
          action:
            'Close windows if near construction. Purifier + optional dehumidifier to cut mould + particle load.',
          riskLevel: 'moderate' as const,
          directImpactMetric: '−35% overnight particle + mould risk',
          impactExplanation:
            'Coastal humidity helps particles linger indoors; filtration matters even below Delhi-level AQI.',
          exposureReductionPct: 30,
          co2SavedKg: 0.1,
        },
      ],
      'routine'
    ),
    indoorHacks: withIds(
      [
        {
          title: 'Anti-Humidity Dust Control',
          category: 'zero-cost' as const,
          difficulty: 'easy' as const,
          steps: [
            'Wet-wipe surfaces; avoid feather dusters',
            'Run exhaust fans during showers/cooking',
            'Air dry laundry near vented balcony mid-morning',
          ],
          pm25ReductionPercent: 18,
          scientificWhy:
            'Damp dust aggregates become inhalable again when disturbed; moisture also feeds mould spores.',
          exposureReductionPct: 10,
          co2SavedKg: 0,
        },
        {
          title: 'HEPA During Construction Hours',
          category: 'equipment' as const,
          difficulty: 'easy' as const,
          steps: [
            'Turbo mode 8 AM–1 PM if nearby demolition/building',
            'Seal balcony door during peak dust hours',
            'Vacuum with HEPA later, never dry broom',
          ],
          pm25ReductionPercent: 55,
          scientificWhy:
            'Construction PM spikes dominate many Mumbai micro-environments regardless of city AQI.',
          exposureReductionPct: 30,
          co2SavedKg: 0,
        },
        {
          title: 'Chimney-First Cooking',
          category: 'zero-cost' as const,
          difficulty: 'easy' as const,
          steps: [
            'Start chimney before ignition',
            'Prefer covered pots to reduce aerosol escape',
            'Post-cook exhaust for 10 minutes',
          ],
          pm25ReductionPercent: 30,
          scientificWhy:
            'Kitchen aerosols plus outdoor seepage compound indoor burden on poor-AQI days.',
          exposureReductionPct: 15,
          co2SavedKg: 0.2,
        },
        {
          title: 'N95 for Platform Peaks',
          category: 'equipment' as const,
          difficulty: 'easy' as const,
          steps: [
            'Wear on crowded local platforms 8–10 AM / 6–8 PM',
            'Remove only after exiting station zone',
            'Store in clean paper envelope between uses',
          ],
          pm25ReductionPercent: 70,
          scientificWhy:
            'Station micro-environments concentrate particles from trains, dust, and nearby traffic.',
          exposureReductionPct: 20,
          co2SavedKg: 0,
        },
      ],
      'hack'
    ),
    sustainableAlternatives: withIds(
      [
        {
          currentHabit: 'Daily cab across Andheri–BKC',
          ecoSwap: 'Local train + share auto last mile',
          co2SavedKgPerWeek: 16,
          pm25AvoidedGPerWeek: 35,
          costSavingsInrPerMonth: 5500,
          healthBenefit: 'Shorter high-exposure road time in congested east-west corridors.',
          communityImpactExplanation:
            'Fewer peak-hour cabs ease idling clusters around metro/rail interchanges.',
          exposureReductionPct: 20,
          co2SavedKg: 2.8,
        },
        {
          currentHabit: 'Diesel backup during load issues',
          ecoSwap: 'Inverter + LED load prioritisation',
          co2SavedKgPerWeek: 8,
          pm25AvoidedGPerWeek: 45,
          costSavingsInrPerMonth: 700,
          healthBenefit: 'Avoids DG fumes entering lower-floor flats.',
          communityImpactExplanation:
            'Society DG stacks are a frequent complaint source for indoor air on outage nights.',
          exposureReductionPct: 6,
          co2SavedKg: 1.2,
        },
        {
          currentHabit: 'Two-wheeler school drop in peak traffic',
          ecoSwap: 'Walking school bus / carpool rota within society',
          co2SavedKgPerWeek: 5.5,
          pm25AvoidedGPerWeek: 14,
          costSavingsInrPerMonth: 1500,
          healthBenefit: 'Kids avoid sitting in exhaust at eye-level on bikes.',
          communityImpactExplanation:
            'School-gate two-wheeler swarms create intense local pollution bursts.',
          exposureReductionPct: 14,
          co2SavedKg: 0.9,
        },
      ],
      'eco'
    ),
  },
};

export function getFallbackPlan(cityId: string): GeminiPlan {
  return FALLBACK_PLANS[cityId] ?? FALLBACK_PLANS.noida;
}

export function getCityById(cityId: string): CityPreset {
  return CITY_PRESETS.find((c) => c.id === cityId) ?? CITY_PRESETS[0];
}

export function whoMultiplier(pm25: number): string {
  const who = 15; // WHO annual guideline µg/m³
  return `${(pm25 / who).toFixed(1)}× WHO`;
}
