# Project Structure

Complete map of every file, folder, route, and service in PulseEarth.

```
pulseearth/
│
├── src/
│   │
│   ├── app/                              # Next.js 16 App Router root
│   │   ├── layout.tsx                    # Root HTML layout, global CSS import
│   │   ├── page.tsx                      # Entry point → renders <AppShell />
│   │   ├── globals.css                   # Tailwind base + custom animations
│   │   ├── global.css                    # Additional global overrides
│   │   ├── favicon.ico
│   │   │
│   │   └── api/                          # Serverless API routes
│   │       │
│   │       ├── country/[countryCode]/
│   │       │   └── route.ts              # GET /api/country/[code]?year=
│   │       │                             # World Bank macroeconomics + WB country metadata
│   │       │                             # Parallel fetch: 7 WB indicators + 1 metadata call
│   │       │                             # Computes: Risk Score, Innovation Index
│   │       │                             # Returns: CountryData with dataYear (vintage)
│   │       │
│   │       ├── city/[cityId]/
│   │       │   └── route.ts              # GET /api/city/[cityId]
│   │       │                             # DynamoDB single-city lookup by cityId
│   │       │
│   │       ├── cities/
│   │       │   └── route.ts              # GET /api/cities
│   │       │                             # DynamoDB full scan → all CityDot objects
│   │       │                             # Used by GlobeCore to place city dots
│   │       │
│   │       ├── heatmap/
│   │       │   └── route.ts              # GET /api/heatmap
│   │       │                             # Bulk WB NY.GDP.PCAP.CD for all countries
│   │       │                             # Log-normalizes to 0-1 scores
│   │       │                             # 24-hour edge cache (revalidate: 86400)
│   │       │
│   │       ├── search/
│   │       │   └── route.ts              # GET /api/search?q=
│   │       │                             # Searches countries + capitals + cities in parallel
│   │       │                             # Deduplicates, returns typed SearchResult[]
│   │       │                             # Min 2 chars; 5-minute cache
│   │       │
│   │       ├── trade/[countryCode]/
│   │       │   └── route.ts              # GET /api/trade/[code]
│   │       │                             # WB: NE.EXP.GNFS.CD, NE.IMP.GNFS.CD, NE.TRD.GNFS.ZS
│   │       │                             # Static PARTNERS map: 35+ major economies
│   │       │                             # Computes trade balance (exports - imports)
│   │       │                             # 12-hour cache (revalidate: 43200)
│   │       │
│   │       ├── news/[countryCode]/
│   │       │   └── route.ts              # GET /api/news/[code]
│   │       │                             # RSS aggregation: BBC, Reuters, Google News
│   │       │                             # Country-specific feeds (ET, Arabian Business, CNA)
│   │       │                             # COUNTRY_ALIASES for BBC/Reuters name matching
│   │       │                             # freshnessScore: 65 for missing dates, 0-100 by age
│   │       │                             # Tiered selection: 72h → 7d → 30d fallback
│   │       │                             # Returns top 6 articles by freshness + quality
│   │       │
│   │       ├── insight/[entityId]/
│   │       │   └── route.ts              # GET /api/insight/[id]?type=&mode=&...metrics
│   │       │                             # Streaming SSE endpoint (Server-Sent Events)
│   │       │                             # 4 modes: brief, anchor, news, investment
│   │       │                             # City mode: regional role + industries brief
│   │       │                             # Country mode: data-grounded Bloomberg brief
│   │       │                             # 20s hard timeout via AbortController
│   │       │
│   │       ├── anchor/[countryCode]/
│   │       │   └── route.ts              # POST /api/anchor/[code]
│   │       │                             # Accepts: countryName, articles[], WB metrics
│   │       │                             # Returns: AnchorBriefing (structured JSON)
│   │       │                             # JSON prefill forces valid Claude output
│   │       │                             # Falls back gracefully on parse failure
│   │       │                             # maxDuration: 55s
│   │       │
│   │       └── report/[countryCode]/
│   │           └── route.ts              # POST /api/report/[code]
│   │                                     # Step 1: buildDeterministicReport() — always runs
│   │                                     # Step 2: generateViaClaude() — optional enhancement
│   │                                     # COUNTRY_SECTORS: 60-country sector lookup
│   │                                     # deriveRecommendation(): scoring → 5-tier rating
│   │                                     # parseReport(): validates AI output or falls back
│   │                                     # Returns: InvestmentReport (never a placeholder)
│   │
│   ├── components/
│   │   │
│   │   ├── Globe/
│   │   │   ├── GlobeContainer.tsx        # Dynamic import wrapper (SSR disabled)
│   │   │   │                             # Passes props from AppShell to GlobeCore
│   │   │   │
│   │   │   └── GlobeCore.tsx             # Core 3D globe (react-globe.gl + Three.js)
│   │   │                                 # ACESFilmic tone mapping, atmospheric glow
│   │   │                                 # Country polygons: NaturalEarth GeoJSON from CDN
│   │   │                                 # City dots: from /api/cities (DynamoDB)
│   │   │                                 # Pulse rings: animated per-city ripple effect
│   │   │                                 # Trade arcs: 30 hardcoded bilateral corridors
│   │   │                                 # City network arcs: 50+ hardcoded corridors
│   │   │                                 # Heatmap: percentile-ranked GDP/capita colors
│   │   │                                 # Investment overlay: risk-adjusted coloring
│   │   │                                 # Selection glow: HTML element on country centroid
│   │   │                                 # Auto-rotation, fly-to camera, hover tooltips
│   │   │
│   │   ├── Layout/
│   │   │   └── AppShell.tsx              # Main client state manager
│   │   │                                 # State: selectedEntity, compareEntity, layers,
│   │   │                                 #        flyTo, timelineYear, demoActive
│   │   │                                 # Orchestrates all components and layer toggles
│   │   │                                 # Compare mode banner + trigger logic
│   │   │
│   │   ├── Sidebar/
│   │   │   ├── SidebarPanel.tsx          # Sidebar container with AnimatePresence
│   │   │   │                             # Routes to CountryView or CityView
│   │   │   │                             # Manages compare state hand-off
│   │   │   │
│   │   │   ├── CountryView.tsx           # Full country intelligence panel
│   │   │   │                             # Fetches /api/country/ on mount
│   │   │   │                             # Shows: meta header, BriefSection, InvestmentReport,
│   │   │   │                             #   StatCards, BarCards, BusinessValueSection,
│   │   │   │                             #   InvestmentIntelligence, TradePanel, NewsPanel,
│   │   │   │                             #   Economic Hubs, InsightStream
│   │   │   │                             # DataUnavailable for territories with no WB data
│   │   │   │                             # BriefSection: Brief Me collapsible (Claude Haiku)
│   │   │   │                             # TradePanel: fetches /api/trade/
│   │   │   │                             # StatCard: animated count-up numbers
│   │   │   │                             # BarCard: progress bar with source label
│   │   │   │                             # wbSrc(): helper attaches vintage year to sources
│   │   │   │
│   │   │   ├── CityView.tsx              # City intelligence panel
│   │   │   │                             # Fetches /api/city/ on mount
│   │   │   │                             # Animated Economic Pulse hero card
│   │   │   │                             # 4 metric cards: GDP, Population, Startups, Trade
│   │   │   │                             # Computed: Startup Ecosystem, Economic Score, Risk
│   │   │   │                             # City Intelligence: per-capita derived metrics
│   │   │   │                             # All values labelled "(Est.)" with "~" prefix
│   │   │   │
│   │   │   ├── ComparePanel.tsx          # Side-by-side country comparison
│   │   │   │                             # Fetches both countries in parallel
│   │   │   │                             # MetricRow: center-out bar charts, winner highlight
│   │   │   │                             # 7 WB metrics: pop, GDP, GDP/cap, growth,
│   │   │   │                             #   inflation, unemployment, life expectancy
│   │   │   │
│   │   │   ├── InsightStream.tsx         # Streaming AI insight component
│   │   │   │                             # Calls /api/insight/ via fetch + ReadableStream
│   │   │   │                             # Supports country and city modes
│   │   │   │                             # Passes all WB metrics as URL params
│   │   │   │                             # 20s timeout, graceful empty-state
│   │   │   │
│   │   │   ├── InvestmentReport.tsx      # Investment Report modal + PDF export
│   │   │   │                             # POST to /api/report/
│   │   │   │                             # Recommendation badge: STRONG BUY → AVOID
│   │   │   │                             # Confidence score display
│   │   │   │                             # Full report sections in modal
│   │   │   │                             # PDF: opens new window → window.print()
│   │   │   │
│   │   │   ├── NewsPanel.tsx             # Economic news feed
│   │   │   │                             # Fetches /api/news/ on country change
│   │   │   │                             # Article cards: source, age label, headline, summary
│   │   │   │
│   │   │   └── StatCard.tsx              # Reusable animated stat card
│   │   │                                 # Uses useCountUp hook for number animation
│   │   │                                 # Displays: label, animated value, source attribution
│   │   │
│   │   └── UI/
│   │       ├── SearchBar.tsx             # Floating search bar (top-center)
│   │       │                             # Debounced 280ms, min 2 chars
│   │       │                             # Result types: country / capital / city
│   │       │                             # Flag emoji, type badge, fly-to on select
│   │       │
│   │       ├── LayerControl.tsx          # Intelligence layer toggles (left-center)
│   │       │                             # 6 layers with mini toggle switches
│   │       │                             # Active count badge on main button
│   │       │
│   │       ├── TimelineSlider.tsx        # Historical year slider (bottom-center)
│   │       │                             # Range: 2015–2025, step 1
│   │       │                             # Quick-jump marks at 6 years
│   │       │
│   │       ├── NewsAnchor.tsx            # AI Anchor widget (fixed bottom-left)
│   │       │                             # PresenterSVG: 88×116px animated avatar
│   │       │                             # ON AIR badge, headline ticker
│   │       │                             # Structured briefing display
│   │       │                             # Optional audio playback (TTS)
│   │       │                             # Updates on country change
│   │       │
│   │       ├── DemoMode.tsx              # Auto-cycle demo overlay (top-center)
│   │       │                             # 6 countries, 11s dwell, 800ms fade
│   │       │                             # Progress bar, clickable country dots
│   │       │                             # Triggered by 🎬 Demo button (bottom-right)
│   │       │
│   │       └── LoadingScreen.tsx         # Full-screen loading animation
│   │                                     # Shown while globe initializes
│   │                                     # Fades out when GlobeCore fires onLoaded
│   │
│   ├── data/
│   │   └── seed-cities.json              # 29 city records for DynamoDB seeding
│   │                                     # Fields: name, country, countryCode, lat, lng,
│   │                                     #   gdp_billion, population_m, startup_count,
│   │                                     #   trade_volume_b, risk_score, pulse_intensity
│   │
│   ├── hooks/
│   │   └── useCountUp.ts                 # Animated number counter hook
│   │                                     # Input: target number, duration, delay
│   │                                     # Output: current animated value
│   │
│   ├── lib/
│   │   ├── dynamo.ts                     # DynamoDB client singleton
│   │   │                                 # Reads AWS_REGION, AWS_ACCESS_KEY_ID, etc.
│   │   │
│   │   ├── queries.ts                    # DynamoDB query helpers
│   │   │                                 # getCitiesByCountryCode(code)
│   │   │                                 # getAllCityDots() → CityDot[]
│   │   │                                 # getCityById(cityId)
│   │   │
│   │   ├── worldbank.ts                  # World Bank API fetcher
│   │   │                                 # getWorldBankData(code, year?)
│   │   │                                 # Fetches 7 indicators in parallel
│   │   │                                 # yearCache: tracks vintage year per indicator
│   │   │                                 # Returns WorldBankData + dataYear
│   │   │
│   │   └── restcountries.ts              # Country metadata fetcher
│   │                                     # getRestCountryData(iso2)
│   │                                     # Uses World Bank country API (not REST Countries)
│   │                                     # 24h in-memory cache
│   │                                     # getAllCountries() for search
│   │                                     # CURRENCY_MAP: inline ISO4217 lookup (no external API)
│   │
│   └── types/
│       ├── city.ts                       # CityMetrics, CityDot interfaces
│       ├── country.ts                    # CountryData interface (includes dataYear)
│       ├── globe.ts                      # SelectedEntity type (country | city)
│       └── layers.ts                     # LayerState interface + DEFAULT_LAYERS
│
├── scripts/
│   └── seed.ts                           # DynamoDB seeder (npx tsx scripts/seed.ts)
│                                         # Reads seed-cities.json
│                                         # PutItem for each city with generated cityId
│
├── public/                               # Static assets (served at /)
│
├── .env.example                          # All required/optional env vars with docs
├── .env.local                            # Your actual secrets (gitignored)
├── .gitignore
├── next.config.ts                        # Next.js configuration
├── tsconfig.json                         # TypeScript configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── postcss.config.mjs                    # PostCSS configuration
├── package.json                          # Dependencies and scripts
│
└── docs/                                 # Documentation files
    ├── README.md                         # Main product README
    ├── ARCHITECTURE.md                   # System design + Mermaid diagrams
    ├── DEPLOYMENT.md                     # GitHub + AWS + Vercel setup
    ├── DATA_METHODOLOGY.md               # Data collection and scoring
    ├── PROJECT_STRUCTURE.md              # This file
    ├── CONTRIBUTING.md                   # Contribution guidelines
    ├── DEMO_SCRIPT.md                    # 3-minute investor demo script
    ├── PRODUCT_FAQ.md                    # 30 Q&As
    ├── ROADMAP.md                        # Feature roadmap
    ├── CHANGELOG.md                      # Feature history
    └── LICENSE.md                        # MIT license
```

---

## Key Conventions

### API Route Patterns
All API routes use the Next.js 16 App Router `await params` pattern:
```typescript
export async function GET(req: Request, { params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
```

### External API Calls
- All World Bank calls use `AbortSignal.timeout(7000)` — never hang forever
- All routes handle fetch errors internally and return partial data rather than 500
- Parallel fetches use `Promise.allSettled()` — one failure doesn't block others

### Caching Strategy
- `/api/heatmap`: 24h edge cache (revalidate: 86400)
- `/api/trade/`: 12h edge cache (revalidate: 43200)
- `/api/country/`: No cache (user-requested, includes year param)
- `/api/news/`: No cache (freshness is core to value)
- `/api/insight/`: No cache (streaming, personalized)
- Country metadata (`restcountries.ts`): 24h in-memory Map cache

### AI Usage
All AI calls use `claude-haiku-4-5-20251001` via `@anthropic-ai/sdk`. JSON prefill (`{ role: 'assistant', content: '{' }`) is used in the report route to force valid JSON output from the model.
