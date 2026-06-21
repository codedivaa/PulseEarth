# Data Methodology

How PulseEarth collects, processes, scores, and displays every piece of data.

---

## World Bank Macroeconomic Data

### Source
World Bank Open Data API: `https://api.worldbank.org/v2`

Free, no API key required. Licensed under Creative Commons Attribution 4.0.

### Indicators Fetched Per Country

| Field | WB Indicator | Description |
|---|---|---|
| `population_m` | SP.POP.TOTL | Total population, divided by 1,000,000 |
| `gdp_billion` | NY.GDP.MKTP.CD | GDP in current USD, divided by 1,000,000,000 |
| `gdpGrowth` | NY.GDP.MKTP.KD.ZG | Annual GDP growth rate, constant prices, % |
| `gdpPerCapita` | NY.GDP.PCAP.CD | GDP per capita in current USD |
| `inflation` | FP.CPI.TOTL.ZG | Consumer Price Index, annual change % |
| `unemployment` | SL.UEM.TOTL.ZS | Unemployment as % of total labor force |
| `lifeExpectancy` | SP.DYN.LE00.IN | Life expectancy at birth, years |

**Trade indicators (separate `/api/trade/` endpoint):**

| Field | WB Indicator | Description |
|---|---|---|
| `exports` | NE.EXP.GNFS.CD | Exports of goods and services, current USD |
| `imports` | NE.IMP.GNFS.CD | Imports of goods and services, current USD |
| `tradePct` | NE.TRD.GNFS.ZS | Trade as % of GDP |

**Heatmap indicator (separate `/api/heatmap/` endpoint):**

| Field | WB Indicator | Description |
|---|---|---|
| score | NY.GDP.PCAP.CD | GDP per capita, all countries bulk fetch |

### Fetch Strategy
All 7 per-country indicators are fetched in parallel using `Promise.allSettled()`. Each call uses `AbortSignal.timeout(7000)` — a 7-second hard timeout. If any individual indicator fails, the remaining indicators still return successfully.

The API call requests the most recent value (`mrv=1`, most recent value) unless a `year` parameter is provided by the client (Historical Timeline feature).

### Data Vintage Tracking
When an indicator value is found, the World Bank API also returns the year of that data point in the `row.date` field. PulseEarth stores this in a `yearCache` Map, keyed by `{countryCode}:{indicator}:{year}`. The year of the GDP indicator is used as the representative `dataYear` for the entire dataset and is displayed throughout the UI as "World Bank YYYY".

### Country Metadata
Country name, region, subregion, capital, latitude, longitude, and flag emoji are fetched from the World Bank Country API: `https://api.worldbank.org/v2/country/{iso2}?format=json`. Currency codes come from an inline `CURRENCY_MAP` (ISO 4217), eliminating any dependency on external currency APIs.

Country metadata is cached in-memory for 24 hours per country.

---

## Composite Scores

### Risk Score (0–100, lower = safer)

The Risk Score is a PulseEarth composite indicator. It is **not** derived from World Bank governance indicators, political stability indices, or sovereign credit ratings.

**Formula:**
```
base = 30

Inflation adjustments:
  > 20%  → +30
  > 10%  → +20
  > 5%   → +10
  < 0%   → +5 (deflation risk)

Unemployment adjustments:
  > 20%  → +20
  > 10%  → +12
  > 5%   → +6

GDP Growth adjustments:
  < -2%  → +15 (contraction)
  < 0%   → +8
  > 5%   → -5 (strong growth)
  > 3%   → -3

GDP per Capita adjustments:
  < $1,000  → +15 (extreme poverty risk)
  < $5,000  → +8
  > $30,000 → -8 (wealthy, stable)
  > $15,000 → -4

Final = clamp(base + adjustments, 0, 100)
```

**Interpretation:** Risk Scores below 30 indicate low macroeconomic risk (Singapore: 8, Switzerland: 5). Scores above 60 indicate elevated risk (Argentina: 68, Pakistan: 72). The score is directionally useful for comparative analysis but should not be used as the sole input to investment decisions.

### Innovation Index (10–98)

The Innovation Index is a proxy indicator. It does **not** use R&D expenditure data, patent filings, technology output, or Global Innovation Index methodology.

**Formula:**
```
base = 40

GDP per Capita adjustments (wealth enables innovation):
  > $50,000 → +30
  > $25,000 → +22
  > $10,000 → +14
  > $3,000  → +6

Life Expectancy adjustments (human capital proxy):
  > 80 years → +15
  > 72 years → +8
  > 65 years → +3

Stability factor:
  + (100 - riskScore) × 0.15

Final = clamp(base + adjustments, 10, 98)
```

**Rationale:** Wealthy countries with high life expectancy and macroeconomic stability tend to score well on true innovation metrics. This proxy captures the correlation, not the causation. It is clearly labelled in the UI as "PulseEarth composite · GDP per capita + life expectancy."

### Investment Recommendation (5-tier)

**Formula:**
```
growthPts = clamp(gdpGrowth × 5, -15, 35)
riskPts   = max(0, 35 - risk × 0.35)
inflPts   = inflation < 2.5 → 18
            inflation < 5.0 → 15
            inflation < 8.0 → 10
            inflation < 15  → 4
            else            → 0
innovPts  = min(innovationScore × 0.1, 10)

total = growthPts + riskPts + inflPts + innovPts

≥ 72 → STRONG BUY (electric green)
≥ 58 → BUY (bright green)
≥ 40 → HOLD (gold)
≥ 22 → UNDERWEIGHT (orange)
else → AVOID (red)
```

This formula is fully deterministic and runs before any AI call. The AI (Claude Haiku) then writes analytical prose around the computed recommendation, but cannot change the rating.

---

## Heatmap Score

### Source
Same World Bank indicator (NY.GDP.PCAP.CD) as the country panel, but fetched in bulk for all countries at once via a single WB API call: `https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&mrv=1&per_page=400`.

### Normalization
Raw GDP per capita values span from ~$300 (poorest) to ~$130,000 (richest). A log transform is applied to compress this range:

```
logVal = log(gdpPerCapita + 1)
score  = (logVal - globalMin) / (globalMax - globalMin)  → 0 to 1
```

### Percentile Ranking
The normalized scores are then converted to percentile ranks:

```
percentile = sorted_rank(score) / (n - 1)  → 0 to 1
```

This ensures the 5 color tiers map to clean percentile bands regardless of the actual GDP distribution:
- Top 10% (≥0.90) → electric cyan-green `rgba(0,255,140,0.99)`
- Top 25% (≥0.75) → vivid green `rgba(50,210,80,0.97)`
- Middle 35% (≥0.40) → gold/amber `rgba(255,195,0,0.97)`
- Bottom 25% (≥0.25) → orange-red `rgba(255,75,0,0.97)`
- Bottom 10% (<0.25) → crimson `rgba(210,15,15,0.99)`

Polygon elevation on the globe is also driven by the 0–1 score: `altitude = 0.002 + score × 0.080`.

**Cache:** 24-hour edge cache (Vercel CDN). One World Bank API call per day.

---

## City Intelligence Data

### Source
AWS DynamoDB table `city-metrics`. Seeded from `src/data/seed-cities.json`.

### Fields and Their Basis

| Field | Basis | Label in UI |
|---|---|---|
| `gdp_billion` | Research estimate | GDP (Est.) with ~ prefix |
| `population_m` | Research estimate | Population (Est.) with ~ prefix |
| `startup_count` | Research estimate | Startups (Est.) with ~ prefix |
| `trade_volume_b` | Research estimate | Trade Volume (Est.) with ~ prefix |
| `risk_score` | Research estimate | Geopolitical Risk bar |
| `pulse_intensity` | Composite 0–1 | Economic Pulse hero + dot/ring sizing |

City data is **not live** and **not official statistics**. All values are clearly labelled "(Est.)" in the UI.

### Derived Scores (computed client-side from DynamoDB values)

**Startup Ecosystem Score:**
```
min(100, round((startup_count / 50) × 40 + (gdp_billion / 300) × 30 + pulse_intensity × 30))
```

**Economic Score:**
```
min(100, round(pulse_intensity × 35 + (gdp_billion / 500) × 35 + (100 - risk_score) × 0.30))
```

**Growth Signal:**
```
pulse_intensity > 0.7  → "High Growth" (green)
pulse_intensity > 0.45 → "Moderate Growth" (gold)
else                   → "Stable" (slate)
```

**Derived City Intelligence:**
```
GDP per capita (est.)  = (gdp_billion × 1000) / population_m / 1000  → $K
Startup density (est.) = startup_count / population_m                 → per 1M pop
Trade per capita (est.)= (trade_volume_b × 1000) / population_m / 1000 → $K
```

---

## News Data

### Sources

| Source | Type | Country Coverage |
|---|---|---|
| BBC Business RSS | Premium | Global (English, broad coverage) |
| Reuters Business RSS | Premium | Global (English, financial focus) |
| Google News RSS | General | Per-country query |
| Economic Times | Country-specific | India (IN) |
| Arabian Business | Country-specific | UAE/GCC (AE, SA, QA, KW) |
| Channel NewsAsia | Country-specific | Singapore, SE Asia (SG, MY, ID) |
| (additional) | Country-specific | Other major markets |

### Filtering

Articles are filtered by country name relevance. Because many country names don't appear literally in headlines (e.g., "United Arab Emirates" vs. "UAE"), PulseEarth uses a `COUNTRY_ALIASES` map:

```typescript
'united arab emirates': ['uae', 'dubai', 'abu dhabi', 'emirati', 'adgm', 'difc'],
'united kingdom': ['uk', 'british', 'sterling', 'bank of england', 'ftse'],
'south korea': ['korea', 'korean'],
'saudi arabia': ['saudi', 'aramco', 'riyadh'],
// ... more aliases
```

An article passes the filter if the country name or any alias appears in the title or summary.

### Freshness Scoring

```
missing/invalid pubDate → 65  (article may be fresh; don't discard)
< 6 hours              → 100
< 24 hours             → 88
< 48 hours             → 72
< 72 hours             → 58
< 7 days               → 30
< 30 days              → 10
older than 30 days     → 2   (still shown if nothing fresher)
```

### Selection Algorithm

1. Collect all articles from all sources
2. Score each by freshness + source quality
3. Sort by combined score descending
4. Tiered gate:
   - If ≥3 articles are within 72 hours → use those
   - Else if ≥3 articles are within 7 days → use those
   - Else if ≥2 articles are within 30 days → use those
   - Else → use sorted array (best available)
5. Return top 6 articles

---

## Trade Partner Data

### Live Data (from World Bank)
Exports (NE.EXP.GNFS.CD), imports (NE.IMP.GNFS.CD), and trade as % of GDP (NE.TRD.GNFS.ZS) are fetched live per country from the World Bank API. Trade balance = exports − imports.

### Static Partner List
The list of top trading partner countries is a static lookup table (`PARTNERS` in `/api/trade/`) covering ~35 major economies. For countries not in this table, no partner list is shown. The table is based on commonly known bilateral trade relationships and is not updated dynamically.

---

## AI-Generated Content

All AI-generated content (Brief Me, AI Anchor, Investment Report, Insight Stream) is produced by Claude Haiku (`claude-haiku-4-5-20251001`).

### Grounding
Every AI prompt receives the verified World Bank metrics as structured input. The prompts explicitly require citing at least 2 verified figures and prohibit generic language without numerical backing.

### Validation
AI responses are parsed and validated before display:
- Investment Report: `parseReport()` validates required fields; falls back to `buildDeterministicReport()` on failure
- AI Anchor / Brief Me: `parseBriefing()` extracts structured fields; field-level fallbacks for any missing element
- Insight Stream: raw streaming text with no post-processing validation (graceful empty state on failure)

### Deterministic Fallback
The Investment Report's deterministic engine (`buildDeterministicReport()`) always runs first. The recommendation, confidence score, strengths, risks, and sector analysis are all computed from WB metrics without any AI call. Claude Haiku enhances the prose but cannot change the rating.
