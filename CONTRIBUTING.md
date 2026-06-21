# Contributing to PulseEarth

Thank you for your interest in contributing. This document covers development setup, code conventions, and the PR process.

---

## Development Setup

### Prerequisites
- Node.js 18+
- An Anthropic API key (for AI features)
- AWS credentials + DynamoDB table (for city data)

### Steps

```bash
git clone https://github.com/your-org/pulseearth.git
cd pulseearth
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run seed          # Seed 29 cities into DynamoDB
npm run dev           # Start dev server at http://localhost:3000
```

---

## Project Structure

```
src/
  app/
    api/              # 11 Next.js serverless API routes
    page.tsx          # Entry point → AppShell
    layout.tsx        # Root layout
  components/
    Globe/            # 3D globe (GlobeCore, GlobeContainer)
    Layout/           # AppShell (main orchestrator)
    Sidebar/          # Country/City/Compare panels + sub-components
    UI/               # Overlays: SearchBar, LayerControl, NewsAnchor, DemoMode, etc.
  data/
    seed-cities.json  # Seed data for DynamoDB
  hooks/
    useCountUp.ts     # Animated number counter
  lib/
    dynamo.ts         # DynamoDB client
    queries.ts        # DynamoDB query helpers
    restcountries.ts  # World Bank country metadata fetcher
    worldbank.ts      # World Bank macroeconomics fetcher
  types/
    city.ts           # City interfaces
    country.ts        # CountryData type
    globe.ts          # SelectedEntity type
    layers.ts         # LayerState type
```

---

## Branch Conventions

| Branch | Purpose |
|---|---|
| `main` | Production-ready code only |
| `dev` | Integration branch — all PRs target here |
| `feature/description` | New features |
| `fix/description` | Bug fixes |
| `data/description` | Data updates (seed files, indicator lists) |
| `docs/description` | Documentation only |

---

## Code Standards

### TypeScript
- All new code must be TypeScript with explicit types.
- No `any` unless truly unavoidable — use `unknown` + type guards instead.
- Run `npx tsc --noEmit` and verify zero errors before opening a PR.

### React / Next.js
- Client components: use `'use client'` directive; keep effects in `useEffect`.
- Server components: default where possible (no interactivity needed).
- API routes: always `await params` (Next.js 16 App Router pattern).
- Use `force-dynamic` on routes that call external APIs or use request headers.

### Styling
- Tailwind CSS only — core utility classes, no custom CSS files.
- Follow the existing dark-theme color palette: `#050505` backgrounds, `#FFD166` primary accent, `#FB8500` secondary.
- Framer Motion for all animations — avoid CSS keyframe animations except for performance-critical cases.

### Data & AI
- Never display placeholder text to users ("Data is being analyzed..." etc.).
- Every AI-powered feature must have a deterministic fallback that produces real output.
- All World Bank data must display the data vintage year on the UI.
- City metrics are estimates — always label them with "(Est.)" and "~" prefix.

---

## Testing

There is currently no automated test suite. Before submitting a PR:

1. Run `npx tsc --noEmit` — must show zero errors.
2. Run `npm run build` — must complete without error.
3. Manually test the features you changed across at least 3 different countries.
4. If you changed the news pipeline, test UAE, UK, and India (alias-sensitive countries).
5. If you changed the globe, test all 6 layer combinations.

---

## Pull Request Process

1. Fork the repo and create a branch: `feature/your-feature-name`
2. Make your changes following the standards above
3. Ensure zero TypeScript errors and a clean build
4. Open a PR against `dev` (not `main`)
5. PR description must include:
   - What changed and why
   - Which features were tested
   - Any known limitations or follow-up work

---

## What We Welcome

- Additional country trade partners in the `PARTNERS` map (`/api/trade/`)
- More city entries in `seed-cities.json` (with accurate GDP and population estimates)
- Additional RSS feed sources for underserved countries
- Bug fixes in data scoring formulas
- Performance improvements on the globe render loop
- Accessibility improvements to the sidebar

---

## What Requires Discussion First

- Changes to the core globe rendering pipeline
- Changes to the AI prompt engineering (anchor, report, insight)
- New intelligence layers
- Modifications to the DynamoDB schema

Open an issue before starting work on any of the above.

---

## Reporting Issues

Use GitHub Issues. Include:
- Which country/city triggered the issue
- What you expected vs. what happened
- Browser and OS
- Any console errors (F12 → Console)
