# Product FAQ

30 questions covering product, data, AI, technical architecture, and roadmap.

---

## Data & Accuracy

**Q1: Where does the economic data come from?**
All macroeconomic data (GDP, growth, inflation, unemployment, population, life expectancy, exports, imports) comes from the World Bank's free public API at `api.worldbank.org/v2`. No API key is required. The World Bank is the same data source used by the IMF, UN, and Bloomberg Terminal.

**Q2: How current is the data?**
World Bank data typically lags 1–2 years behind the current date. For example, in 2025, the most recent available GDP data may be from 2022 or 2023, depending on the country. PulseEarth fetches the actual year of the most recent data point and displays it on every metric card (e.g., "World Bank 2022"). This is a known limitation disclosed prominently in the UI, not hidden.

**Q3: How does the Historical Timeline work?**
The year slider (2015–2025) passes a `year` parameter to the World Bank API, which returns the closest available data point for that year. This allows you to compare the same country across different economic periods. Note that some countries have data gaps before 2018.

**Q4: How accurate is the Risk Score?**
The Risk Score is a PulseEarth composite built from four World Bank indicators: inflation, unemployment, GDP growth, and GDP per capita. It is not derived from WB governance indicators, political stability scores, or sovereign credit ratings. It is a macroeconomic proxy — useful for relative screening, not a substitute for professional country risk analysis.

**Q5: How accurate is the Innovation Index?**
The Innovation Index is a proxy built from GDP per capita (wealth as an enabler of R&D), life expectancy (human development), and inverse risk (stability as a prerequisite for innovation). It does not use actual R&D spending, patent data, or technology output statistics. All composite scores are clearly labelled with their source methodology.

**Q6: How accurate are the city metrics?**
City metrics (GDP, population, startup count, trade volume) are reference estimates sourced from research and stored in AWS DynamoDB. They are not official national statistics and not live data. The UI labels all city values with "(Est.)" and a "~" prefix. City intelligence is for contextual reference only — verified national data is in the country panel.

**Q7: Are the trade route arcs live?**
The trade route arc positions and relative weights on the globe are hardcoded based on known major bilateral relationships. However, the trade statistics in the country panel (export volume, import volume, trade as % of GDP, trade balance) are fetched live from the World Bank API for each country.

**Q8: What about countries with no data?**
Some small territories, uninhabited regions, and disputed areas do not have World Bank economic indicators. PulseEarth detects this and shows a DataUnavailable card with geographic context, rather than displaying zeros or blank fields. Examples: Antarctica, Western Sahara, some Pacific island territories.

---

## AI Features

**Q9: Which AI model powers PulseEarth?**
All AI features use `claude-haiku-4-5-20251001` (Anthropic's Claude Haiku) via the `@anthropic-ai/sdk`. Claude Haiku was chosen for its speed (1.5–3s response time) and cost efficiency for high-frequency queries. Gemini Flash is also supported as an optional alternative for investment reports if a `GEMINI_API_KEY` is configured.

**Q10: Can the AI hallucinate economic facts?**
The AI prompts are explicitly grounded in verified World Bank data passed directly to the model. The brief and anchor prompts require citing at least 2 specific numbers from the verified data, and the prompts explicitly prohibit vague language without numerical backing. However, like all LLMs, Claude Haiku can occasionally produce inaccuracies — treat AI-generated analysis as a starting point, not a final source.

**Q11: What happens if the AI is unavailable?**
Every AI feature has a fallback that produces real, useful output:
- Investment Report: deterministic engine runs first and always produces a complete report with no placeholder text
- Brief Me: shows a data-based fallback script built from WB metrics
- Insight Stream: shows a graceful empty state after 20-second timeout
- AI Anchor: shows text without audio if TTS is unavailable

**Q12: How does the Investment Report guarantee real output?**
The `buildDeterministicReport()` function generates a complete investment report — recommendation, strengths, risks, trade analysis, sector opportunities, growth outlook — purely from World Bank metrics and a 60-country sector lookup table, with no AI dependency. Claude Haiku then attempts to enhance this with richer prose. If Claude fails or produces invalid JSON, the deterministic report is returned. The user never sees "Data is being analyzed. Please retry."

**Q13: Is the AI Anchor voice real?**
The AI Anchor avatar is a custom-drawn SVG illustration (not a photo or AI-generated image). The audio voice uses Kokoro TTS or Parler TTS via HuggingFace, which requires a `HUGGING_FACE_TOKEN`. Without this token, the AI Anchor shows text only (all other features work identically). The text script is always generated regardless of TTS availability.

**Q14: What does "AI Insight Stream" do?**
InsightStream is a 110-word streaming text briefing, rendered token-by-token as Claude Haiku generates it. It appears at the bottom of both country and city panels. It supports four modes: `brief` (default economic analysis), `anchor` (Bloomberg-style live report), `news` (3 notable economic developments), and `investment` (sector opportunity + risk brief). It has a 20-second hard timeout.

**Q15: Can I use my own AI model?**
The API routes call Anthropic's API directly. Swapping the model requires updating the `model` parameter in each AI route. The JSON prefill technique used in the report route is specific to Anthropic's API format.

---

## Product & Features

**Q16: What are the 6 Intelligence Layers?**
Economic Heatmap (GDP per capita gradient with polygon elevation), Trade Routes (30 bilateral corridors), City Network (50+ city corridors), Investment Signal (risk-adjusted buy/sell overlay), Economic News (live RSS panel), and Historical Timeline (year slider 2015–2025). All are toggleable via the Layer Control panel on the left edge of the globe.

**Q17: How does Compare Mode work?**
Click the "Compare" button in any country panel, then click or search another country. A side-by-side panel appears with center-out bar charts for all 7 World Bank metrics. The winning country on each metric is highlighted in gold. Close by clicking the X in the compare panel.

**Q18: What is the Heatmap's color scale?**
Five tiers based on GDP per capita percentile rank (log-normalized): top 10% → electric cyan-green, top 25% → vivid green, middle 35% → gold/amber, bottom 25% → deep orange-red, bottom 10% → vivid crimson. Polygon elevation is also proportional to wealth, so richer countries physically tower above poorer ones.

**Q19: How does Demo Mode work?**
Click the 🎬 Demo button (bottom-right). PulseEarth auto-cycles through 6 curated countries (US, China, India, UAE, Germany, Singapore) with an 11-second dwell per country. A progress bar and clickable dots allow manual navigation. Demo Mode auto-enables Trade Routes and News layers for maximum visual impact. All country headlines in Demo Mode are factually verified.

**Q20: Can I search by city name?**
Yes. The search bar simultaneously searches countries, country capitals, and the 29 cities in DynamoDB. Results are type-coded (country/capital/city) with flag emoji. City searches open the City Intelligence panel. Capital searches navigate to the country panel.

---

## Technical

**Q21: Why does the globe use Three.js and react-globe.gl?**
react-globe.gl provides a high-level API for common globe visualization patterns (polygon layers, arc layers, point layers, HTML overlays) built on Three.js. The Three.js renderer is configured with ACESFilmic tone mapping and a custom exposure (3.5) to achieve cinematic rendering quality not available in the default configuration.

**Q22: Why DynamoDB for city data instead of a flat file?**
DynamoDB allows city data to be queried by `countryCode` (when a country is selected, only its cities are fetched), updated without redeployment, and scaled if more cities are added. The flat-file alternative (`seed-cities.json`) exists for seeding and serves as the source of truth for initial data.

**Q23: Why Next.js 16 App Router?**
The `await params` pattern (required in Next.js 15+) is used throughout. App Router enables streaming responses for the Insight Stream endpoint, and route-level cache control (`revalidate`) for the heatmap and trade endpoints. Server Components reduce client bundle size for non-interactive parts of the layout.

**Q24: How are RSS feeds parsed?**
A custom `parseRss()` function handles RSS 2.0 XML with full CDATA support. Items are filtered by country name using exact match and a `COUNTRY_ALIASES` map (e.g., "United Arab Emirates" → ["uae", "dubai", "abu dhabi", "emirati", "difc"]). Missing `pubDate` fields are treated as score 65 (not 0), preventing valid articles from being discarded.

**Q25: What is the freshness scoring system for news?**
Articles are scored 0–100 based on age: missing/invalid dates → 65, under 6 hours → 100, under 24 hours → 88, under 48 hours → 72, under 72 hours → 58, under 7 days → 30, under 30 days → 10, older → 2. This prevents the news panel from going empty when a country has limited recent coverage, while still surfacing fresh articles first.

---

## Business

**Q26: What is the monetization model?**
PulseEarth is currently open-source. Monetization paths include: a freemium tier with usage limits, a Pro tier with API access and PDF exports, enterprise white-label licensing, and B2B integration for asset managers and corporate strategy teams. The World Bank data is free and Creative Commons licensed, so there are no data licensing costs at the core.

**Q27: What makes PulseEarth different from Bloomberg Terminal?**
Bloomberg Terminal costs ~$6,000/user/year and serves institutional professionals. PulseEarth uses the same underlying World Bank data combined with AI synthesis — delivering 80% of the insight for an analyst, strategist, or researcher at near-zero marginal cost. The globe-first UX is also qualitatively different: spatial exploration surfaces patterns that data tables hide.

**Q28: Can PulseEarth be embedded in other products?**
Not yet. The roadmap includes embeddable globe widgets (iframe or npm package) and a public API for country intelligence data. This is a medium-term goal.

**Q29: What regulatory or compliance considerations exist?**
The AI-generated content (Brief Me, AI Anchor, Investment Report) is for informational purposes only and does not constitute financial advice. The World Bank data is Creative Commons Attribution licensed — display requires attribution, which PulseEarth provides via source labels on every metric. News article display from BBC and Reuters is for informational use with attribution.

**Q30: What is the current data coverage?**
190 countries covered by the globe's geographic layer. ~170 countries have at least some World Bank macroeconomic data. ~35 countries have full trade partner data. 29 cities have detailed DynamoDB city intelligence. ~10 territories/regions return DataUnavailable (no WB indicators). News coverage is strongest for G20 economies; niche country coverage depends on RSS feed availability.
