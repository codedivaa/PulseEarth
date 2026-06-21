# PulseEarth — 3-Minute Demo Script

**For:** Investors, hackathon judges, recruiters, conference demos
**Duration:** 3 minutes (adjustable — see time markers)
**Presenter:** You
**Setup:** Open PulseEarth on a large screen or shared display. Start with the globe auto-rotating.

---

## Opening (0:00–0:20)

*[Globe is rotating. City dots pulse. Trade routes are OFF. Start clean.]*

> "This is PulseEarth. Real-time global economic intelligence on a 3D globe. Every country. Live World Bank data. AI analysis on demand. Let me show you what that looks like."

*[Click the 🎬 Demo button, bottom-right, to start the auto-cycle — or drive manually.]*

---

## Act 1: The Globe Is Alive (0:20–0:50)

*[Click the Layer Control icon on the left edge to open layer panel.]*

> "First — the globe itself. Let me turn on Trade Routes."

*[Toggle Trade Routes ON.]*

> "These are the 30 largest bilateral trade corridors in the global economy — US-China, Germany-UK, Singapore-Japan — all live. Each arc is weighted by trade volume."

*[Toggle City Network ON.]*

> "And the city network — 50 economic corridors between the world's major hubs. You can see at a glance where economic gravity lives."

*[Toggle Economic Heatmap ON.]*

> "Now the heatmap. This is GDP per capita, log-normalized, percentile-ranked. The top 10% are in electric green — Singapore, Switzerland, Norway. The bottom tier is in crimson. The elevation of each country is proportional to its wealth. Pull back and you can literally see prosperity as geography."

---

## Act 2: Country Intelligence (0:50–1:30)

*[Click on India on the globe.]*

> "Let me click India. The sidebar opens instantly."

*[Point to the sidebar.]*

> "Look at the header: flag, region, capital, currency — from the World Bank country API. Then: 'Verified · World Bank 2022.' That's the actual vintage year of this data. We don't hide data lag — we display it."

*[Point to the stat cards.]*

> "1.4 billion people. $3.5 trillion GDP. 8.2% growth. Inflation at 5.7%. Every number pulls from a specific World Bank indicator — the source code is right there on each card."

*[Point to Risk Score and Innovation Index.]*

> "Risk Score — 35 out of 100. That's a composite of inflation, unemployment, growth trajectory, and GDP per capita. Innovation Index — 58. A proxy using GDP per capita and life expectancy."

---

## Act 3: AI Anchor — Instant Briefing (1:30–2:00)

*[Click "Brief Me" button in the sidebar.]*

> "One click — Brief Me. This calls Claude Haiku with the live World Bank data grounding the prompt. No hallucinations — it's citing the exact GDP growth rate we just saw."

*[Wait 2–3 seconds for the briefing to load.]*

> "Look at the structure: breaking headline, a 90-word Bloomberg-style script, key takeaways, 2026 investment outlook, risks, opportunities. This is publishable financial commentary, generated in under 3 seconds."

*[Point to the bottom-left widget.]*

> "And down here — the AI Anchor. Live Bloomberg-style on-air presenter. Country-specific. Different for every country you click."

---

## Act 4: Investment Report (2:00–2:25)

*[Click the Investment Report button — the gold banner below Brief Me.]*

> "Now the investment report. This one is interesting — we built a deterministic report engine. Even without AI, it generates a complete STRONG BUY / BUY / HOLD / UNDERWEIGHT / AVOID report from the World Bank metrics alone. Claude Haiku then enhances it."

*[Wait for report to generate.]*

> "Look — recommendation, confidence score, executive summary, economic strengths, risks, trade analysis, sector opportunities, 12-month growth outlook. Click Download PDF and it prints to a professional PDF."

---

## Act 5: Compare Mode (2:25–2:45)

*[Click the Compare button.]*

> "Compare mode. Let me pick Germany to compare with India."

*[Click Germany on the globe.]*

> "Side by side. Center-out bars — you can see at a glance who wins on GDP per capita, growth, inflation, life expectancy. The gold country leads on each metric."

---

## Act 6: Historical Timeline (2:45–3:00)

*[Click Layer Control → toggle Historical Timeline.]*

> "Last feature — Historical Timeline. Drag back to 2019."

*[Drag the slider to 2019.]*

> "The World Bank data reloads for 2019. GDP, growth, inflation — all recalculate to that year. Click any country and you're looking at 2019 economic reality."

*[Return to present.]*

> "That's PulseEarth. 190 countries. 7 live World Bank indicators per country. 6 intelligence layers. 4 AI-powered features. And a PDF investment report for any economy on earth."

---

## Optional Extensions (if time allows)

**News Panel:** Toggle Economic News layer, click UAE → show country-specific RSS news feed with freshness scoring.

**City Intelligence:** Click a city dot (e.g., Singapore) → show Economic Pulse, Startup Ecosystem score, GDP/capita estimate.

**Demo Mode:** Hit 🎬 Demo — show it auto-cycles through US, China, India, UAE, Germany, Singapore with factual headlines.

**DataUnavailable:** Type "Antarctica" in search — show the graceful DataUnavailable state for territories without WB data.

---

## Common Questions from Audiences

**"Is the data real?"**
> "Yes. Every macroeconomic metric is pulled live from the World Bank's free public API — the same data source used by the IMF, the UN, and Bloomberg. No scraping, no fabrication."

**"Is the AI making things up?"**
> "No. The AI prompt is explicitly grounded in the verified World Bank metrics — it cites the specific GDP growth rate and inflation figure we fetched. We engineered the prompts to enforce Bloomberg TV journalism standards: no vague words without a number backing them."

**"How does the investment report work without AI?"**
> "The deterministic engine uses a scoring formula: growth points, risk-adjusted points, inflation points, and innovation points — totals to a 5-tier recommendation. Claude Haiku then writes richer prose around those scores. If Claude is unavailable, the report still generates."

**"What's next?"**
> "IMF data integration for nowcasting, mobile-responsive layout, user watchlists, and a natural language query interface — 'show me the fastest-growing economies in Southeast Asia.'"
