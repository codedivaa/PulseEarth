# 🌍 PulseEarth

**Real-time global economic intelligence on an interactive 3D globe.**

PulseEarth transforms World Bank data, live news feeds, and AI analysis into a Bloomberg-grade intelligence platform — browse 190 countries, compare economies, generate investment reports, and watch AI anchor briefings, all on a photorealistic rotating globe.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r184-000?style=flat-square&logo=three.js)](https://threejs.org/)
[![AWS DynamoDB](https://img.shields.io/badge/DynamoDB-City_Data-232F3E?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/dynamodb/)
[![Claude AI](https://img.shields.io/badge/Claude-Haiku-CC785C?style=flat-square)](https://anthropic.com/)

---

## Table of Contents

- [Product Vision](#product-vision)
- [Live Features](#live-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [AI & Data Pipeline](#ai--data-pipeline)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Sources & Methodology](#data-sources--methodology)
- [Known Limitations](#known-limitations)
- [Business Case](#business-case)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Product Vision

Global economic data is scattered across dozens of sources, locked behind paywalls, or buried in spreadsheets requiring expert interpretation. PulseEarth solves this with a single, beautiful interface where anyone — an investor, student, journalist, or policy analyst — can understand the economic pulse of any country in seconds.

The platform combines verified World Bank data with AI-powered analysis to produce insight that used to require a Bloomberg Terminal subscription and a PhD in economics.

---

## Live Features

### 🌐 Interactive 3D Globe
- Photorealistic Earth (night texture, topology bump map, star field background)
- ACESFilmic tone mapping with 3.5x exposure for cinematic quality
- Atmospheric glow in brand gold (#FFD166) at 0.30 altitude
- 190 countries from NaturalEarth GeoJSON with interactive polygon selection
- Gold highlight + 3D elevation (0.18 altitude) on selected country
- Radial glow disc (520px) anchored on selected country centroid
- Auto-rotation (speed 0.25, pauses on drag, resumes 4s after release)
- Smooth fly-to camera animation (1.6–1.8 second transitions)

### 🏙 City Intelligence Network
- 29 global economic hubs stored in AWS DynamoDB
- City dots sized and colored by pulse_intensity (economic activity score)
- Animated ripple rings per city — speed proportional to economic intensity
- Click any city dot to open the City Intelligence panel

### 🎛 Six Intelligence Layers (toggleable)

| Layer | Description |
|---|---|
| **Economic Heatmap** | GDP per capita, log-normalized, 5-tier percentile coloring. Polygon elevation proportional to wealth. |
| **Trade Routes** | 30 major bilateral corridors rendered as golden animated dashes with glow halos. |
| **City Network** | 50+ hardcoded city-to-city corridors as solid cyan arcs — always visible. |
| **Investment Signal** | Risk-adjusted green/yellow/red country overlay for quick opportunity screening. |
| **Economic News** | Toggles the live news panel in the sidebar. |
| **Historical Timeline** | Year slider (2015–2025) — reloads all World Bank data for that year. |

### 🔍 Global Search
- Searches 190 countries, capitals, and 29 cities simultaneously
- 280ms debounce, minimum 2 characters
- Type-coded badges (country / capital / city) with flag emoji
- Searching a capital navigates to the country panel
- Fly-to camera animation on every selection

### 📊 Country Intelligence Panel

**Header:** Flag, region, capital, currency, year badge (when timeline is active), Verified · World Bank YYYY badge with actual data vintage year

**Brief Me (AI Text Summary):**
- Collapsible one-click executive briefing
- Headline + 85–100 word Bloomberg-style script
- 3 number-backed key takeaways
- 2026 investment outlook
- 2 risks + 2 opportunities
- Claude Haiku powered; resets per country, cached on re-open

**Investment Report Generator:**
- Full investment report with STRONG BUY / BUY / HOLD / UNDERWEIGHT / AVOID
- Confidence score 1–10 based on data completeness
- Downloadable as PDF via browser print API
- Deterministic engine always produces a complete report — never shows placeholder text

**World Bank Macro Metrics** (all with data vintage year):
- Population (SP.POP.TOTL)
- GDP in USD trillions (NY.GDP.MKTP.CD)
- GDP per Capita (NY.GDP.PCAP.CD)
- GDP Growth % YoY (NY.GDP.MKTP.KD.ZG)
- Inflation / CPI (FP.CPI.TOTL.ZG)
- Unemployment (SL.UEM.TOTL.ZS)
- Life Expectancy (SP.DYN.LE00.IN)

**Composite Scores:**
- Risk Score (0–100): inflation + unemployment + GDP growth + GDP per capita
- Innovation Index (10–98): GDP per capita + life expectancy + inverse risk

**Additional Sections:**
- Investment Signal (color-coded buy/sell derived rating)
- Investment Intelligence (🟢🟡🔴 opportunity signals)
- Business Value Section ("Who Should Care" audience segmentation)
- Trade Intelligence (WB exports, imports, balance, trade % of GDP, partner countries)
- Economic Hubs (top cities with pulse intensity bar chart)
- Compare Button → side-by-side country comparison mode
- AI Insight Stream (110-word streaming Bloomberg briefing)
- Economic News Panel (multi-source RSS, when news layer is on)

**DataUnavailable state:** Territories and disputed regions without WB data show a dedicated informational card instead of blank zeros.

### 📰 AI News Anchor
- Fixed bottom-left widget — never covers the country dashboard
- Detailed animated female presenter SVG avatar (88×116px, custom-drawn)
- ON AIR badge with pulsing animation
- Country-specific briefing: changes when different country is selected
- Structured output: headline, script, key takeaways, outlook, risks, opportunities, sectors
- Audio playback (Kokoro / Parler TTS via HuggingFace — optional)
- All content grounded in live World Bank metrics

### 📈 Investment Report (PDF Export)
- Deterministic report engine — guaranteed output with zero AI dependency
- Optional Claude Haiku enhancement for richer prose
- Five-tier recommendation system with color coding
- Content: executive summary, 4 economic strengths, 3 risks, trade analysis, 3 sector opportunities, key sectors with signals, 12–18 month growth outlook, recommendation rationale
- 60-country sector lookup table for sector-specific content
- Exports as print-quality PDF

### ⚖ Compare Mode
- Side-by-side comparison of any two countries
- Center-out bar chart: bars grow from center, showing which country wins each metric
- All 7 WB metrics compared with winner highlighted in gold
- Trigger: click "Compare" button then select or click a second country

### 🎬 Demo Mode
- Auto-cycles 6 showcase countries: US → China → India → UAE → Germany → Singapore
- 11-second dwell per country with animated progress bar
- 800ms crossfade transition between countries
- Clickable country dots for manual navigation override
- Auto-enables trade routes and news layers for maximum visual impact
- All country headlines are factually verified

### 📅 Historical Timeline
- Slider: 2015 to 2025
- Quick-jump buttons at 2015, 2017, 2019, 2021, 2023, 2025
- Year badge appears in country header when active
- Reloads World Bank historical series for selected year

### 🏙 City Intelligence Panel
- Economic Pulse hero card with animated radial gradient and growth signal badge
- 4 core metrics: GDP (Est.), Population (Est.), Startups (Est.), Trade Volume (Est.)
- Startup Ecosystem score bar (computed from startup count + GDP + pulse intensity)
- Economic Score bar (computed from pulse intensity + GDP + inverse risk)
- Geopolitical Risk bar
- City Intelligence section: GDP/capita, startup density, trade per capita (all estimated)
- Disclaimer labelling all values as reference estimates
- AI Insight Stream (city-mode briefing)

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.9 | App Router, API routes, SSR |
| React | 19.2.4 | UI framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| Framer Motion | 12.40 | Animations and transitions |
| react-globe.gl | 2.38 | 3D globe rendering |
| Three.js | r184 | WebGL engine |
| SWR | 2.4.1 | Data fetching |
| Zod | 4.4.3 | Runtime validation |

### Backend & Infrastructure
| Technology | Purpose |
|---|---|
| Next.js API Routes | 11 serverless endpoints |
| World Bank API | Macroeconomic data (free, no auth) |
| RSS Feeds | News aggregation (BBC, Reuters, country-specific) |
| AWS DynamoDB | City metrics persistence |
| @aws-sdk v3 | DynamoDB client |

### AI
| Model | Purpose |
|---|---|
| Claude Haiku (claude-haiku-4-5-20251001) | Brief Me, AI Anchor, Investment Report, Insight Stream |
| Gemini Flash (optional) | Alternative investment report generation |
| Kokoro / Parler TTS | Audio for AI Anchor (optional) |

---

## Architecture

```
Browser
  └── AppShell (client state manager)
        ├── GlobeContainer (dynamic import, SSR disabled)
        │     └── GlobeCore (react-globe.gl + Three.js)
        │           ├── Country polygons (NaturalEarth GeoJSON)
        │           ├── City dots + pulse rings (DynamoDB)
        │           ├── Trade route arcs (30 hardcoded corridors)
        │           ├── City network arcs (50+ hardcoded corridors)
        │           ├── Heatmap coloring (WB GDP/capita percentiles)
        │           └── Selection glow (HTML element overlay)
        ├── SearchBar (debounced, 3 entity types)
        ├── LayerControl (6 toggles)
        ├── TimelineSlider (2015–2025)
        ├── NewsAnchor (AI Anchor widget, bottom-left)
        ├── DemoMode (auto-cycle overlay, top-center)
        └── SidebarPanel
              ├── CountryView
              │     ├── BriefSection (Brief Me — Claude Haiku)
              │     ├── InvestmentReport (PDF generator)
              │     ├── StatCards / BarCards (WB metrics)
              │     ├── BusinessValueSection
              │     ├── InvestmentIntelligence
              │     ├── TradePanel (WB trade data)
              │     ├── NewsPanel (RSS aggregation)
              │     └── InsightStream (streaming AI)
              ├── CityView
              │     └── InsightStream
              └── ComparePanel (side-by-side WB metrics)

API Layer (Next.js Serverless)
  ├── GET  /api/country/[code]?year=  ← 8 parallel WB calls + metadata
  ├── GET  /api/city/[cityId]         ← DynamoDB lookup
  ├── GET  /api/cities                ← All city dots
  ├── GET  /api/heatmap               ← Bulk WB GDP/capita (24h cache)
  ├── GET  /api/search?q=             ← Countries + capitals + cities
  ├── GET  /api/trade/[code]          ← WB exports/imports + partners
  ├── GET  /api/news/[code]           ← RSS aggregation + scoring
  ├── GET  /api/insight/[id]?...      ← Streaming SSE AI brief
  ├── POST /api/anchor/[code]         ← Structured AI briefing JSON
  └── POST /api/report/[code]         ← Investment report JSON
```

---

## AI & Data Pipeline

### World Bank Data Flow
```
GET /api/country/[code]
  → getWorldBankData(code, year?)        # lib/worldbank.ts
      → 7 parallel WB API calls
      → yearCache records vintage per indicator
      → returns WorldBankData + dataYear
  → getRestCountryData(code)             # lib/restcountries.ts
      → WB country API (name, region, capital, lat/lng)
      → CURRENCY_MAP inline lookup
  → computeRiskScore(...)                # composite 0-100
  → computeInnovation(...)               # composite 10-98
  → getCitiesByCountryCode(code)         # lib/queries.ts → DynamoDB
  → returns CountryData JSON
```

### Investment Report Guarantee
```
POST /api/report/[code]
  1. buildDeterministicReport(metrics)   # always runs, always produces output
  2. generateViaClaude(prompt)           # optional — JSON prefill forces valid JSON
  3. parseReport(raw) → validate         # falls back to deterministic if AI fails
  → Final report never shows placeholder text
```

### News Pipeline
```
GET /api/news/[code]
  → BBC Business RSS (with COUNTRY_ALIASES matching)
  → Reuters RSS (with COUNTRY_ALIASES matching)
  → Google News RSS (simplified query)
  → Country-specific feeds (ET, Arabian Business, CNA, etc.)
  → freshnessScore: missing dates → 65, <6h → 100, decaying to 2
  → tiered selection: 72h window → 7d → 30d fallback
  → top 6 by combined freshness + quality score
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- AWS account with DynamoDB table
- Anthropic API key

```bash
git clone https://github.com/your-org/pulseearth.git
cd pulseearth
npm install
cp .env.example .env.local
# Fill in credentials
npm run seed      # Seeds 29 cities into DynamoDB
npm run dev       # → http://localhost:3000
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** | Claude Haiku for all AI features |
| `AWS_REGION` | **Yes** | e.g. `us-east-1` |
| `AWS_ACCESS_KEY_ID` | **Yes** | DynamoDB access |
| `AWS_SECRET_ACCESS_KEY` | **Yes** | DynamoDB secret |
| `DYNAMODB_TABLE_NAME` | **Yes** | e.g. `city-metrics` |
| `NEXT_PUBLIC_APP_URL` | Recommended | Full app URL |
| `GEMINI_API_KEY` | Optional | Alternative AI for reports |
| `HUGGING_FACE_TOKEN` | Optional | TTS audio in AI Anchor |
| `CRON_SECRET` | Optional | Auth for scheduled jobs |

---

## API Reference

### `GET /api/country/[countryCode]?year=YYYY`
Full country intelligence. Returns WB macroeconomics, metadata, computed risk/innovation scores, and associated cities.

### `GET /api/heatmap`
Log-normalized GDP per capita scores (0–1) for all countries. 24-hour edge cache.

### `GET /api/search?q={query}`
Multi-entity search across countries, capitals, cities. Min 2 chars.

### `GET /api/trade/[countryCode]`
WB export/import volumes, trade balance, trade % of GDP, partner country list.

### `GET /api/news/[countryCode]`
Up to 6 scored news articles from RSS aggregation.

### `GET /api/insight/[entityId]`
Streaming SSE text. Params: `type=country|city`, `mode=brief|anchor|news|investment`, plus WB metric values.

### `POST /api/anchor/[countryCode]`
Structured AI briefing JSON: headline, script, key takeaways, outlook, risks, opportunities, sectors.

### `POST /api/report/[countryCode]`
Full investment report JSON with recommendation, confidence score, and all report sections.

---

## Data Sources & Methodology

### World Bank API
Free public API (`api.worldbank.org/v2`). No API key required. Data typically lags 1–2 years — actual vintage year is fetched and displayed on every metric card.

### Composite Scores
**Risk Score:** Inflation + unemployment + GDP growth + GDP per capita composite. Lower = safer. Range 0–100. Not derived from WB governance indicators.

**Innovation Index:** Proxy using GDP per capita + life expectancy + inverse risk. Range 10–98. Not derived from R&D spending or patent data.

### City Data
Seeded reference estimates from DynamoDB. Not live statistics. All values labelled "(Est.)" in UI.

---

## Known Limitations

1. World Bank data lags 1–2 years (vintage year displayed on every metric)
2. City metrics are reference estimates, not official statistics
3. Innovation Index is a proxy, not actual R&D data
4. Risk Score does not incorporate political stability or governance indicators
5. Trade partner list covers ~35 major economies; others show no partner data
6. TTS audio requires HuggingFace token; text-only fallback always works
7. Reuters RSS feed intermittently unavailable; BBC and Google News are primary fallbacks
8. Historical data may have gaps pre-2018 for some countries
9. ~10 territories/disputed regions return DataUnavailable (no WB indicators)
10. DynamoDB must be seeded before city dots appear (`npm run seed`)

---

## Business Case

**Target users:** Investment analysts, corporate strategists, financial journalists, economics educators, policy researchers.

**Market:** Global economic intelligence software market $8B+ (2024). Bloomberg Terminal costs ~$6,000/user/year and serves institutions only. PulseEarth targets the 10M+ professionals priced out of institutional tools.

**Differentiation:** Free World Bank data + AI synthesis delivers 80% of Bloomberg-grade insight at near-zero marginal cost. Globe-first UX surfaces geographic patterns invisible in spreadsheets. AI-native — every country view has instant synthesis.

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full plan.

**Near-term:** Live GDP nowcasting, IMF integration, mobile responsive layout, user authentication, saved watchlists.

**Medium-term:** Natural language querying, WebSocket live data, embeddable widgets, alert system.

**Long-term:** Enterprise API tier, white-label licensing, AI country risk ratings, regulatory data integration.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup guide, branch conventions, and PR process.

---

## License

MIT License. See [LICENSE.md](./LICENSE.md).
