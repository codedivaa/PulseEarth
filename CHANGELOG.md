# Changelog

All significant changes to PulseEarth, in reverse chronological order.

---

## v0.1.0 — Launch (2025)

### Foundation (Sprint 1)

**Globe Visualization**
- Integrated react-globe.gl with Three.js r184 as the core rendering engine
- Configured ACESFilmic tone mapping (exposure 3.5) for cinematic rendering quality
- Added atmospheric glow (#FFD166, altitude 0.30) matching brand identity
- Loaded NaturalEarth 1:110m GeoJSON from CloudFront CDN for 190-country polygon layer
- Implemented night Earth texture + topology bump map + night sky background
- Set up auto-rotation (speed 0.25) with pause-on-drag and 4-second resume delay
- Added smooth fly-to camera animation (1.6–1.8 second transitions)

**Real Data Layer**
- Built `lib/worldbank.ts`: fetches 7 WB indicators per country in parallel with `Promise.allSettled()`
- Built `lib/restcountries.ts`: fetches country metadata from WB country API (not REST Countries, which deprecated free access)
- Added `CURRENCY_MAP` inline lookup (ISO 4217) to eliminate dependency on external currency APIs
- Implemented 24-hour in-memory cache for country metadata
- Added 7-second `AbortSignal.timeout()` on all WB API calls to prevent hanging

**Country API Route**
- Created `GET /api/country/[countryCode]` with Next.js 16 `await params` pattern
- Implemented `computeRiskScore()`: composite of inflation + unemployment + GDP growth + GDP/capita
- Implemented `computeInnovation()`: composite of GDP/capita + life expectancy + inverse risk
- Added historical year support via `?year=YYYY` query parameter
- Added fallback handling for territories with no WB data

**AWS DynamoDB + City Intelligence**
- Created `lib/dynamo.ts` DynamoDB client singleton
- Created `lib/queries.ts` with city query helpers (`getAllCityDots`, `getCitiesByCountryCode`, `getCityById`)
- Created `scripts/seed.ts` seeder for 29 global cities
- Built `GET /api/cities` and `GET /api/city/[cityId]` routes
- CityView component: Economic Pulse hero, 4 metric cards, 3 score bars, City Intelligence section

**Search**
- Built `GET /api/search?q=` searching countries + capitals + cities simultaneously
- Implemented 280ms debounce, 2-character minimum, deduplication by entity ID
- Added type-coded result badges (country / capital / city) with flag emoji
- Capital search navigates to the country panel (not a "capital" panel)

### Intelligence Layers (Sprint 2)

**6 Intelligence Layers**
- Built `LayerControl` component: left-side floating panel with mini toggle switches + active count badge
- Implemented Economic Heatmap: `GET /api/heatmap` fetches bulk WB NY.GDP.PCAP.CD, log-normalizes, percentile-ranks
- Five-tier color system: crimson → orange-red → gold → vivid green → electric cyan-green
- Polygon elevation proportional to GDP per capita (wealth as literal height)
- Implemented Trade Routes: 30 hardcoded bilateral corridors as golden animated dashes with glow halos
- Implemented City Network: 50+ hardcoded city-to-city corridors as solid cyan arcs
- Implemented Investment Signal: risk-adjusted green/yellow/red country overlay
- Added Economic News layer toggle (controls sidebar news panel visibility)
- Added Historical Timeline layer toggle (shows/hides the year slider)

**Historical Timeline**
- Built `TimelineSlider` component: range input 2015–2025 with quick-jump marks
- Year passed to `/api/country/` as `?year=` parameter, reloads WB historical series
- Year badge appears in country header when timeline is active

**Country Panel Expansion**
- Added Investment Signal badge (STRONG BUY / BUY / HOLD / UNDERWEIGHT / AVOID)
- Added Business Value Section: "Who Should Care" audience segmentation
- Added Investment Intelligence section: 🟢🟡🔴 opportunity/risk signal cards
- Added Trade Intelligence Panel: live WB exports, imports, balance, trade % of GDP, partner countries
- Added Economic Hubs section: top cities with pulse intensity visualization
- Built `GET /api/trade/[countryCode]`: WB trade data + static PARTNERS map (~35 economies)

**DataUnavailable State**
- Added detection for territories with no WB data (GDP = 0 and population = 0)
- Built dedicated DataUnavailable component with geographic context and data coverage explanation

### AI Features (Sprint 3)

**AI Insight Stream**
- Built `GET /api/insight/[entityId]` streaming SSE endpoint
- Four modes: `brief` (default), `anchor`, `news`, `investment`
- City and country modes with different prompts
- All WB metrics passed as URL params for prompt grounding
- 20-second hard timeout via AbortController
- `InsightStream` component with ReadableStream reader and streaming text display

**Brief Me**
- Added collapsible BriefSection to CountryView
- POST to `/api/anchor/[countryCode]` with all WB metrics as body
- Structured output: headline, script, 3 key takeaways, investment outlook, risks, opportunities
- Claude Haiku powered with fallback script built from WB metrics
- Resets on country change; caches result on re-open within same session

**AI Anchor (NewsAnchor)**
- Built `POST /api/anchor/[countryCode]` route: Bloomberg-style structured briefing
- Custom-drawn female anchor SVG avatar (88×116px, fully detailed face/suit/desk)
- ON AIR badge with pulsing animation
- Structured display: headline, script, key takeaways, outlook, risks, opportunities, sectors
- Optional TTS audio via Kokoro / Parler TTS (HuggingFace)
- Fixed bottom-left position — never covers country dashboard
- Country-specific: updates on every country selection

**Investment Report Generator**
- Built `POST /api/report/[countryCode]` route
- `buildDeterministicReport()`: always runs first, always produces complete output from WB metrics alone
- `COUNTRY_SECTORS`: 60-country sector lookup table
- `deriveRecommendation()`: scoring formula → 5-tier rating (STRONG BUY through AVOID)
- `generateViaClaude()`: JSON prefill (`{ role: 'assistant', content: '{' }`) forces valid JSON output
- `parseReport()`: validates AI output; falls back to deterministic on failure
- InvestmentReport component: recommendation badge, confidence score, all report sections
- PDF export: opens new browser window with print-quality HTML, calls `window.print()`

**Compare Mode**
- Built `ComparePanel` component with side-by-side country comparison
- MetricRow: center-out bar charts showing which country wins each metric
- 7 WB metrics compared with winner highlighted in gold
- Triggered via "Compare" button in country panel; second country selected on globe

**Demo Mode**
- Built `DemoMode` component: auto-cycles 6 showcase countries
- 11-second dwell, 800ms crossfade transition
- Progress bar with animated indicator
- Clickable country dots for manual navigation override
- Auto-enables trade routes and news layers on activation
- 🎬 Demo button: fixed bottom-right, animates in after globe loads

### Data Reliability Sprint (Sprint 4)

**Investment Report Fix**
- Resolved "Data is currently under analysis. Please retry." always-shown issue
- Root cause 1: no GEMINI_API_KEY → Gemini always failed silently
- Root cause 2: Claude Haiku returning non-JSON prose before the JSON object
- Fix: `buildDeterministicReport()` always runs first; JSON prefill technique forces valid JSON from Claude

**News Pipeline Fix**
- Resolved news panel always empty for many countries
- Root cause: `freshnessScore()` returned 0 for missing/invalid `pubDate` (treated as epoch = infinitely old)
- Fix: missing dates now score 65 (not 0); staleness gate relaxed from 7 days to 30 days
- Fixed BBC/Reuters filtering too strict for UAE, UK, South Korea: added `COUNTRY_ALIASES` map
- Simplified Google News queries (removed complex OR chains that reduced result counts)
- Added country-specific RSS feeds for key markets

### Data Accuracy Audit (Sprint 5)

**Source Label Corrections**
- Risk Score source: changed from "WB governance indicators" to "PulseEarth composite · inflation + unemployment + GDP growth" (factually accurate)
- Innovation Index source: changed from "WB R&D + tech indicators" to "PulseEarth composite · GDP per capita + life expectancy" (factually accurate)

**Data Value Corrections**
- Dubai city GDP: corrected from $280B to $115B (previous value was 2.5× the actual estimate)
- Removed duplicate São Paulo entry in `seed-cities.json` (was listed twice with different populations)

**Data Vintage Transparency**
- Added `yearCache` Map to `worldbank.ts` to track the actual year of each WB data point
- Added `dataYear` field to `WorldBankData` interface and `CountryData` type
- Threaded `dataYear` through country route → CountryData → CountryView
- "Verified · World Bank" badge now shows actual vintage year (e.g., "Verified · World Bank 2022")
- `wbSrc()` helper attaches vintage year to every stat card source label
- All WB source labels updated: "World Bank 2022 · SP.POP.TOTL" format

**Demo Mode Accuracy**
- China headline: removed "fastest growth" (factually incorrect — India grew faster 2022–2024)
- Singapore headline: removed "#1 ease of doing business" (WB retired that ranking in 2021)
- All remaining Demo Mode headlines verified against current public data

**City Metric Transparency**
- All 4 city metric cards relabelled with "(Est.)" suffix: "GDP (Est.)", "Population (Est.)", etc.
- All city metric values prefixed with "~" to indicate estimate nature
- City Intelligence section: added "derived from estimates" subtitle
- All 3 derived values (GDP/capita, startup density, trade per capita) prefixed with "~"
- Added disclaimer paragraph: "City-level metrics are estimates for contextual reference."

---

## v0.0.1 — Initial Scaffold

- Next.js 16 project with TypeScript, Tailwind CSS, and ESLint
- Basic globe rendering with react-globe.gl
- Static country polygons (no interactivity)
- Placeholder sidebar
