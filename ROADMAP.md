# Roadmap

PulseEarth development priorities across three horizons.

---

## Current State (v0.1 — Launch)

**Shipped:**
- Interactive 3D globe with 190 countries (react-globe.gl + Three.js)
- 6 intelligence layers: Heatmap, Trade Routes, City Network, Investment Signal, News, Timeline
- Country panel: 7 World Bank metrics with data vintage transparency
- Brief Me: AI text briefing (Claude Haiku)
- AI Anchor: Bloomberg-style video presenter with structured briefing
- Investment Report Generator: deterministic engine + AI enhancement, PDF export
- Compare Mode: side-by-side country comparison with center-out bars
- Historical Timeline: World Bank data for 2015–2025
- Demo Mode: auto-cycle showcase of 6 economies
- City Intelligence: 29 cities with economic scoring
- Global Search: countries, capitals, cities
- AI Insight Stream: streaming economic briefings
- News Panel: multi-source RSS with freshness scoring
- DataUnavailable: graceful handling for territories with no WB data
- Data source transparency: vintage year on every WB metric

---

## Near-Term (v0.2 — Next 3 Months)

### Mobile Responsive Layout
The current layout is desktop-only. The sidebar and globe need adaptive layouts for tablet (768px) and mobile (375px) viewports. Target: fully functional on mobile Safari and Chrome for Android.

### User Authentication + Watchlists
Implement NextAuth.js with GitHub/Google OAuth. Allow users to save country watchlists, export report history, and persist layer preferences. Store user data in DynamoDB (new table) or PostgreSQL via Vercel Postgres.

### IMF Data Integration
The IMF World Economic Outlook database provides GDP nowcasts and forecasts, debt-to-GDP ratios, current account balances, and fiscal data not available in World Bank. Add as a second data source for countries where WB data lags significantly.

### Additional Economic Indicators
- Debt to GDP ratio (IMF/WB)
- Foreign Direct Investment inflows (WB BX.KLT.DINV.CD.WD)
- Current account balance (BN.CAB.XOKA.CD)
- Government effectiveness score (WB IQ.GOV.RNKL)
- Ease of doing business (World Bank historical dataset)

### Alert System
Allow users to set threshold alerts: "Notify me when India's inflation exceeds 7%" or "Alert when Turkey's Risk Score crosses 70." Deliver via email (Resend) or push notification.

### City Data Expansion
Expand from 29 to 100 cities. Add more granular data: major industry clusters, university count, airport connectivity score, tech ecosystem density.

---

## Medium-Term (v0.3 — 6 Months)

### Natural Language Querying
A text input at the globe level: "Show me the fastest-growing economies in Sub-Saharan Africa," "Compare the G7 on inflation," "Which countries have Risk Score under 20 and GDP growth over 5%?" Claude Haiku interprets the query, filters/highlights countries on the globe, and explains the selection.

### WebSocket Live Data Integration
Move from polling to persistent WebSocket connections for currency rates (forex), commodity prices (oil, copper, gold), and equity index levels. These are leading indicators that precede the lagging World Bank data.

### Embeddable Globe Widget
An `<iframe>` or npm package (`@pulseearth/globe`) that any site can embed. Configuration: which layers to show, which countries to highlight, which metrics to display. A "Powered by PulseEarth" attribution link.

### PDF Report Enhancement
- Country flag and branding on the PDF cover
- Charts: GDP trend line 2015–2024, inflation vs. target, risk score history
- Comparison section: how this country ranks among its regional peers
- Analyst signature block with date and methodology footnote

### Trade Flow Visualization 2.0
Replace hardcoded trade route coordinates with live bilateral trade data. Show bilateral trade values on arc hover. Add filter: "Show only US trade relationships" or "Show commodity-specific flows."

### Multi-Language Support
Primary target: Arabic (UAE/Saudi market), Mandarin (China), Spanish (Latin America). Affects UI labels, AI prompt language, and news source expansion.

---

## Long-Term (v1.0 — 12 Months)

### Enterprise API Tier
A REST API with authentication, rate limiting, and SLA:
- `GET /v1/country/{code}` — real-time country intelligence
- `GET /v1/compare` — multi-country comparison
- `POST /v1/report/{code}` — investment report generation
- `GET /v1/heatmap` — bulk scoring for all countries
- Webhooks for threshold alerts

Pricing: per-request or monthly subscription tiers. Target customers: asset managers, hedge funds, corporate treasury teams, consulting firms.

### AI Country Risk Ratings
PulseEarth-proprietary risk ratings: `PE-AAA` through `PE-D`. Methodology: combination of WB macroeconomic indicators, governance scores, political stability data, and news sentiment analysis. Updated quarterly. Positioned as an accessible alternative to Moody's/S&P for the teams priced out of agency ratings.

### Regulatory & ESG Data Layer
- Carbon intensity (tons CO2 per GDP)
- ESG scoring per country (S&P, MSCI methodology)
- Regulatory environment index
- Anti-money laundering compliance scores (FATF ratings)
- Foreign ownership restrictions by sector

### Satellite Economic Indicators
Integrate alternative data as leading indicators:
- Nighttime light intensity (GDP proxy for unreported economies)
- Ship AIS tracking (trade volume leading indicator)
- Flight density (business travel / economic activity proxy)

### White-Label Licensing
A white-label version of PulseEarth for financial institutions, consulting firms, and media organizations. Configurable branding, data sources, and feature set. Hosted on customer infrastructure or as a dedicated Vercel deployment.

### Institutional Data Integration
Paid integrations with premium data providers:
- Bloomberg B-PIPE for real-time pricing
- Refinitiv Eikon for earnings and corporate data
- Oxford Economics for macroeconomic forecasts
- MSCI for factor and risk model data

---

## Not Planned

These are explicitly out of scope:

- **Cryptocurrency data:** Out of product focus (macroeconomic, not crypto).
- **Individual stock data:** PulseEarth is country-level, not equity-level.
- **Trading execution:** PulseEarth provides intelligence, not brokerage. No order placement will ever be added.
- **Real-time news ticker:** News is intentionally summarized, not firehose-fed. The goal is insight, not information overload.
