# PulseEarth — Repository Audit

> Generated from static analysis of the actual codebase.  
> No automated tools — manual inspection of every source file.  
> Priority: **P1** = fix before production · **P2** = clean up next sprint · **P3** = low urgency

---

## Summary

| Category | Count | Impact |
|---|---|---|
| Dead code / unused files | 6 | Low — clutters repo, no functional impact |
| Duplicate dependencies | 1 | Low — wastes install time, adds ~0 runtime cost |
| Empty directories | 4 | Low — confusing for new contributors |
| Stale documentation | 1 | Low — one README section describes old behavior |
| Missing configuration | 1 | **P1** — `output: 'standalone'` was absent (now fixed) |
| Technical debt | 3 | P2/P3 — architectural notes for next sprint |
| Placeholder data | 1 | P2 — empty GeoJSON file |

---

## 1. Dead Code / Unused Files

### 1.1 `public/data/countries.geojson` — Empty File
**Priority:** P2  
**File:** `public/data/countries.geojson`  
**Issue:** File contains `{"type":"FeatureCollection","features":[]}` — an empty GeoJSON. The globe loads its actual country polygons from an external CDN (jsDelivr `ne_110m_admin_0_countries.geojson`), not from this file.  
**Impact:** Zero — file is never fetched by any component.  
**Action:** Delete the file. If a future self-hosted GeoJSON is needed, populate it then.

```bash
# Fix:
rm public/data/countries.geojson
rmdir public/data  # if no other files remain
```

---

### 1.2 Default Next.js SVG Assets — Unused
**Priority:** P3  
**Files:**
- `public/file.svg`
- `public/globe.svg`
- `public/next.svg`
- `public/vercel.svg`
- `public/window.svg`

**Issue:** These are Next.js scaffolding defaults. None are referenced in any component (`grep` confirms zero imports).  
**Impact:** Zero functional impact. Adds ~15KB to the public directory.  
**Action:** Delete all five files.

```bash
# Fix:
rm public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

---

### 1.3 `src/components/Sidebar/StatCard.tsx` — Shadowed by Inline Component
**Priority:** P2  
**File:** `src/components/Sidebar/StatCard.tsx`  
**Issue:** `CountryView.tsx` defines its own inline `StatCard` function (line 176) with a richer prop interface (`suffix`, `prefix`, `decimals`, `source`). The standalone `StatCard.tsx` file has a simpler interface and is **never imported** anywhere.  
**Impact:** Zero — dead file. Could confuse contributors who find `StatCard.tsx` and assume it's canonical.  
**Action:** Either delete `StatCard.tsx` and keep the inline version, or promote the inline version to a proper exported component and import it.

```bash
# Option A — delete dead file:
rm src/components/Sidebar/StatCard.tsx

# Option B — extract inline StatCard from CountryView.tsx into StatCard.tsx,
# then import it in CountryView.tsx
```

---

## 2. Empty API Route Directories (Dead Stubs)

**Priority:** P2  
**Directories:**
```
src/app/api/cities/city/       (empty — no route.ts)
src/app/api/cities/country/    (empty — no route.ts)
src/app/api/cities/insight/    (empty — no route.ts)
src/app/api/cities/search/     (empty — no route.ts)
```

**Issue:** These directories exist under `/api/cities/` but contain no `route.ts` files. They appear to be stubs from an earlier API design that was superseded by:
- `/api/city/[cityId]/route.ts` (single city lookup)
- `/api/search/route.ts` (search including cities)
- `/api/insight/[entityId]/route.ts` (city insights)

Next.js will not error on these — they simply do nothing. But they mislead contributors who see them in the directory tree.  
**Action:** Delete all four empty directories.

```bash
# Fix:
rm -rf src/app/api/cities/city \
        src/app/api/cities/country \
        src/app/api/cities/insight \
        src/app/api/cities/search
```

---

## 3. Duplicate / Phantom Dependency

**Priority:** P2  
**File:** `package.json`  
**Issue:** Two Anthropic packages are listed:
```json
"@anthropic-ai/sdk": "^0.105.0",   ← actual SDK used everywhere
"anthropic": "^0.0.0",              ← version 0.0.0 — phantom / placeholder
```
The codebase uses `import Anthropic from '@anthropic-ai/sdk'` exclusively. The `"anthropic": "^0.0.0"` entry resolves to an essentially empty package and contributes nothing.  
**Action:** Remove `"anthropic": "^0.0.0"` from `dependencies`.

```bash
npm uninstall anthropic
```

---

## 4. Potentially Unused Package Dependencies

**Priority:** P3  
**Packages:** `swr`, `zod`

**`swr` (^2.4.1):**  
No usage of `import useSWR from 'swr'` or `import { ... } from 'swr'` found in any source file. All data fetching uses raw `fetch()` inside `useEffect`. SWR may be a leftover from an early prototype.  
**Action:** Verify with `grep -r "from 'swr'" src/` — if zero results, remove.

```bash
npm uninstall swr
```

**`zod` (^4.4.3):**  
No usage of `import { z } from 'zod'` or schema validation found in source files. May be a planned addition.  
**Action:** Verify with `grep -r "from 'zod'" src/` — if zero results, remove or keep as intentional future dependency.

```bash
npm uninstall zod
```

---

## 5. Stale Documentation

### 5.1 README News Pipeline Description
**Priority:** P3  
**File:** `README.md`, section "News Pipeline"  
**Issue:** The README documents the old news fallback behavior:
```
→ tiered selection: 72h window → 7d → 30d fallback
```
The 30-day fallback was removed in a recent fix. The updated behavior is:
```
→ tiered selection: 72h window → 7d → noRecent: true (never show articles >7 days)
→ Google News now uses when:3d query parameter
```
**Action:** Update the README news pipeline section to reflect the current implementation.

---

## 6. Technical Debt

### 6.1 `next.config.ts` Missing `output: 'standalone'`
**Priority:** P1 — **FIXED**  
`output: 'standalone'` was absent, making the Docker multi-stage build non-functional. Added in this audit cycle.

---

### 6.2 World Bank In-Memory Cache — Not Shared Across Serverless Instances
**Priority:** P2 (architectural)  
**Files:** `src/lib/worldbank.ts`, `src/lib/restcountries.ts`  
**Issue:** Both files use a module-level `Map` for 24-hour caching:
```typescript
const indicatorCache = new Map<string, CacheEntry<number | null>>()
```
In Vercel's serverless environment, each function instance has its own memory. Under concurrent load, multiple cold-start instances will all miss cache and hit the World Bank API simultaneously.  
**Impact:** Low today (World Bank is fast and free), but wasteful at scale.  
**Solution:** Replace with Upstash Redis or Vercel KV for shared cross-instance caching.

---

### 6.3 Trade Partner Data is Fully Static
**Priority:** P3 (data quality)  
**File:** `src/app/api/trade/[countryCode]/route.ts`  
**Issue:** The `PARTNERS` record is a hardcoded list of bilateral trade partners for ~45 countries. It reflects approximate 2023 trade relationships and will become stale without maintenance.  
**Impact:** Incorrect partner display for countries with evolving trade relationships.  
**Solution:** Replace with COMTRADE API or World Bank bilateral trade data.

---

### 6.4 City Metrics are Reference Estimates, Not Live Data
**Priority:** P2 (data accuracy)  
**File:** `src/data/seed-cities.json`  
**Issue:** City-level metrics (GDP, startups, trade volume) are manually estimated reference figures seeded once into DynamoDB. They are labelled "(Est.)" in the UI, which is correct, but they never refresh.  
**Impact:** Correct labelling prevents misinformation. No production bug.  
**Solution:** Implement a Lambda + EventBridge scheduled refresh pulling from city-level data sources (e.g., Brookings, Oxford Economics).

---

### 6.5 No Rate Limiting on AI Endpoints
**Priority:** P2 (cost risk)  
**Routes:** `POST /api/anchor/[code]`, `POST /api/report/[code]`, `GET /api/insight/[id]`  
**Issue:** These routes call paid AI APIs (Anthropic/Gemini) with no rate limiting, authentication, or usage cap. A crawler or malicious actor could generate thousands of API calls.  
**Impact:** Potential runaway costs on the Anthropic or Gemini account.  
**Solution:** Add Vercel Edge middleware with IP-based rate limiting, or require an API key for AI endpoints.

---

### 6.6 `CRON_SECRET` is Defined but No Cron Route Exists
**Priority:** P3  
**File:** `.env.example`  
**Issue:** `CRON_SECRET` is documented as "Auth for scheduled jobs" but no `/api/cron/` route exists in the codebase. The variable is currently unused.  
**Action:** Either implement a cron route (city data refresh) or remove `CRON_SECRET` from `.env.example` to avoid confusion.

---

## 7. Security Notes (Non-Breaking)

| Item | Status | Notes |
|---|---|---|
| API secrets server-side only | ✅ Correct | No `NEXT_PUBLIC_` prefix on any secret |
| Input validation | ✅ Present | All routes validate inputs before use |
| AbortSignal timeouts | ✅ Present | All external fetches have timeout guards |
| Non-root Docker user | ✅ Added | Dockerfile creates `nextjs:nodejs` system user |
| `.env.local` in `.gitignore` | ✅ Verify | Confirm `.gitignore` excludes `.env.local` |
| AI endpoints rate limiting | ❌ Missing | See §6.5 above |
| HTTPS enforcement | ✅ Vercel | Automatic on Vercel deployment |

---

## Cleanup Checklist

```
[ ] rm public/data/countries.geojson
[ ] rmdir public/data
[ ] rm public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
[ ] rm src/components/Sidebar/StatCard.tsx  (or promote to proper component)
[ ] rm -rf src/app/api/cities/{city,country,insight,search}
[ ] npm uninstall anthropic
[ ] npm uninstall swr          (if confirmed unused)
[ ] npm uninstall zod          (if confirmed unused)
[ ] Update README news pipeline section (30d fallback removed)
[ ] Remove or implement CRON_SECRET
[ ] Add rate limiting to AI routes (P2, before public launch)
[ ] Plan shared cache strategy (Upstash/KV) for World Bank data (P2)
```

---

## What is Working Correctly

The following are **not** issues — they are intentional design choices:

- `StatCard` inline in `CountryView.tsx` — keeps the component self-contained
- `COUNTRY_ALIASES` in the news route — handles country name variants correctly
- `buildDeterministicReport()` in report route — intentional safety net, not dead code
- `yearCache` Map in `worldbank.ts` — correctly tracks data vintage per indicator
- `when:3d` in Google News queries — intentional freshness filter, not a bug
- `force-dynamic` on all AI routes — correctly prevents stale cached AI responses
- `maxDuration = 55` on anchor/report routes — Vercel Pro limit for long AI calls
