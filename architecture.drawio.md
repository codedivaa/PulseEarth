# PulseEarth — Draw.io Architecture Diagram Spec

> This file is the **exact reproduction spec** for the PulseEarth architecture diagram in Draw.io.  
> Target: 1600×900px · Left-to-right flow · Investor/judge-ready  
> Estimated time to reproduce: 15 minutes

---

## Canvas Setup

```
File → Page Setup:
  Width:  1600 px
  Height: 900 px
  Grid:   10 px
  Background: #0A0A0F (near-black — dark SaaS look)

Export:
  Format: PNG
  Scale:  2x (for retina)
  Size:   3200 × 1800 px (display at 1600×900)
```

---

## Color Palette

| Name | Hex | Used For |
|---|---|---|
| `bg-dark` | `#0A0A0F` | Canvas background |
| `bg-panel` | `#12121A` | Group panel fills |
| `aws-orange` | `#FF9900` | AWS DynamoDB boxes |
| `aws-dark` | `#232F3E` | AWS section header |
| `ai-purple` | `#6B21A8` | AI / Claude boxes |
| `ai-light` | `#9333EA` | AI section header |
| `vercel-black` | `#000000` | Vercel boxes |
| `green-data` | `#059669` | External data source boxes |
| `blue-frontend` | `#1E40AF` | Frontend / Next.js boxes |
| `gold-accent` | `#FFD166` | Arrow highlights, key labels |
| `text-white` | `#FFFFFF` | Primary text |
| `text-muted` | `#94A3B8` | Secondary/subtitle text |
| `border-subtle` | `#2D2D3A` | Group borders |

---

## Layout Grid (columns × rows)

```
Row 1 (y=40):   [USER]
Row 2 (y=130):  [FRONTEND — full width]
Row 3 (y=290):  [VERCEL API LAYER — full width]
Row 4 (y=450):  [AWS] [AI LAYER] [EXTERNAL DATA]
Row 5 (y=700):  [FEATURES PANEL] [SCALE PANEL]
```

---

## Section 1 — USER (Row 1)

**Box: User**
```
Label:      👤  User
Sublabel:   Browser / Desktop App
Position:   x=700, y=40
Size:       200 × 60
Fill:       #1E293B
Border:     #3B82F6
Text:       #FFFFFF bold
Font size:  14px
Shape:      rounded rectangle (r=8)
```

**Arrow: User → Frontend**
```
From:   bottom of User box
To:     top of Frontend box
Label:  HTTPS / WebGL
Color:  #FFD166
Style:  solid, 2px, arrow end
```

---

## Section 2 — NEXT.JS FRONTEND (Row 2)

**Group container:**
```
Label:      🖥️  PulseEarth Frontend  ·  Next.js 16 + React 19
Position:   x=40, y=130
Size:       1520 × 140
Fill:       #1E40AF (10% opacity — use rgba #1E40AF1A)
Border:     #3B82F6
Text:       #93C5FD (light blue)
Font:       bold 13px, top-left
Shape:      rounded rectangle
```

**Inside the group — 5 boxes side by side:**

| Label | Sublabel | x | Width |
|---|---|---|---|
| 3D Globe\n`react-globe.gl`\n`Three.js r184` | WebGL Earth | 60 | 210 |
| Layer Control\n6 Intelligence\nOverlays | heatmap · trade · cities\ninvestment · news · timeline | 290 | 200 |
| Search Bar\n173 countries\ncapitals + cities | <50ms instant | 510 | 190 |
| AI Anchor Widget\nFloating presenter\n+ audio playback | Claude + Kokoro TTS | 720 | 210 |
| Intelligence Sidebar\nCountry · City · Compare\nBrief Me · News · Report | 5 view modes | 950 | 570 |

**All 5 inner boxes:**
```
Fill:       #1E3A6E
Border:     #3B82F6
Text:       #FFFFFF
Font:       12px
Shape:      rounded rectangle (r=6)
Height:     100px
y-offset:   25 (inside group)
```

---

## Section 3 — VERCEL API LAYER (Row 3)

**Group container:**
```
Label:      ⚡  Vercel Serverless API Routes  ·  force-dynamic  ·  Auto-scaling
Position:   x=40, y=290
Size:       1520 × 140
Fill:       #1A1A2E (dark blue-grey)
Border:     #6366F1
Text:       #A5B4FC
Font:       bold 13px
```

**Inside — 8 route boxes (evenly spaced):**

| Route | Method | Color accent |
|---|---|---|
| `/api/search` | GET | #10B981 |
| `/api/country` | GET | #3B82F6 |
| `/api/news` | GET | #F59E0B |
| `/api/anchor` | POST | #8B5CF6 |
| `/api/report` | POST | #8B5CF6 |
| `/api/insight` | GET SSE | #8B5CF6 |
| `/api/heatmap` | GET | #06B6D4 |
| `/api/trade` | GET | #F97316 |

**Box spec (each):**
```
Fill:   #0F172A
Border: [method color above]
Text:   #FFFFFF (route name, bold 11px)
        #94A3B8 (method tag, 10px)
Size:   175 × 100
Shape:  rounded rectangle (r=6)
Spacing: 15px between boxes
y:      25 (inside group)
```

---

## Section 4 — AWS DYNAMODB (Row 4, left)

**Group container:**
```
Label:      Amazon DynamoDB
Position:   x=40, y=450
Size:       340 × 220
Fill:       #1A0F00
Border:     #FF9900
Header bg:  #232F3E
Text:       #FF9900 bold
Font:       14px
Shape:      rounded rectangle
```

**AWS logo placement:**
```
Icon:    AWS DynamoDB icon (orange cylinder)
Size:    48 × 48
Position: top-right of group header
Source:  https://icon.icepanel.io/AWS/svg/Database/DynamoDB.svg
```

**Inner content box:**
```
Label (multiline):
  Table: city-metrics
  Partition Key: cityId (String)
  ─────────────────────────
  29 Global Economic Hubs
  ─────────────────────────
  • name · country · countryCode
  • lat · lng
  • gdp_billion · population_m
  • startup_count · trade_volume_b
  • risk_score · pulse_intensity
  • ai_insight

Fill:   #0D0D00
Border: #FF9900 (50% opacity)
Text:   #FCD34D (light amber)
Font:   11px
Size:   310 × 160
```

---

## Section 5 — AI LAYER (Row 4, center)

**Group container:**
```
Label:      🤖  AI Layer
Position:   x=410, y=450
Size:       580 × 220
Fill:       #1A0A2E
Border:     #9333EA
Text:       #C084FC bold
Font:       14px
Shape:      rounded rectangle
```

**Three AI boxes inside:**

**Box 1 — Claude Haiku (primary)**
```
Label:   Claude Haiku
         claude-haiku-4-5-20251001
Sublabel: Brief Me · AI Anchor
          Investment Reports
          Insight Stream (SSE)
Fill:    #3B0764
Border:  #9333EA
Text:    #FFFFFF
Size:    250 × 90
x:       30, y: 30
```

**Box 2 — Gemini Flash (optional)**
```
Label:   Gemini 1.5 Flash
         (Optional)
Sublabel: Tried first for
          Anchor + Reports
Fill:    #1E3A5F
Border:  #4285F4
Text:    #93C5FD
Size:    250 × 90
x:       300, y: 30
```

**Box 3 — TTS Audio (bottom)**
```
Label:   Kokoro-82M TTS
         + Parler TTS fallback
Sublabel: HuggingFace Inference
          AI Anchor audio output
Fill:    #1A2E1A
Border:  #22C55E
Text:    #86EFAC
Size:    520 × 60
x:       30, y: 140
```

---

## Section 6 — EXTERNAL DATA SOURCES (Row 4, right)

**Group container:**
```
Label:      🌐  External Data Sources  (all free)
Position:   x=1020, y=450
Size:       540 × 220
Fill:       #0A1A0A
Border:     #059669
Text:       #6EE7B7 bold
Font:       14px
```

**Four boxes inside (2×2 grid):**

| Label | Fill | Border |
|---|---|---|
| World Bank API\n7 Macro Indicators\n173 Countries · Free | #052E1C | #059669 |
| Google News RSS\n`when:3d` freshness\n60+ country queries | #1C1A00 | #D97706 |
| BBC + Reuters RSS\nCountry-filtered\nQuality scoring | #1C0A0A | #DC2626 |
| 17 Country Feeds\nEconomic Times · Dawn\nJapan Times · etc | #0A0A1C | #6366F1 |

**Each box size:** 240 × 80 · Font 11px · Spacing 10px

---

## Section 7 — FEATURES PANEL (Row 5, left)

**Box:**
```
Label:      PulseEarth Features
Position:   x=40, y=700
Size:       500 × 160
Fill:       #0F172A
Border:     #FFD166
Header:     #FFD166 bold 13px
```

**Content (2-column list):**
```
Left column:              Right column:
✓ 3D Economic Globe       ✓ Investment Reports
✓ Country Intelligence    ✓ Trade Route Arcs
✓ AI Briefings            ✓ Economic Heatmap
✓ AI News Anchor          ✓ Compare Countries
✓ Investment Intelligence ✓ City Network (29 hubs)
                          ✓ Real-Time News (7d max)
```

Font: 11px · Color: #E2E8F0 · Checkmarks in #22C55E

---

## Section 8 — SCALE PANEL (Row 5, center)

**Box:**
```
Label:      Built for Scale
Position:   x=570, y=700
Size:       360 × 160
Fill:       #0F172A
Border:     #6366F1
Header:     #A5B4FC bold 13px
```

**Content:**
```
✓ Stateless Serverless APIs
✓ DynamoDB On-Demand Auto-Scaling
✓ Vercel Global Edge (100+ PoPs)
✓ Next.js ISR + 24h WB Cache
✓ Zero Cold-Start for Static Search
✓ Docker + Self-Hostable
```

Font: 11px · Color: #CBD5E1 · Checkmarks in #818CF8

---

## Section 9 — DEPLOYMENT PANEL (Row 5, right)

**Box:**
```
Label:      🚀 Deployment
Position:   x=960, y=700
Size:       600 × 160
Fill:       #0F172A
Border:     #FFFFFF
```

**Three sub-boxes inside:**

| Label | Fill | Border |
|---|---|---|
| GitHub\nSource · CI trigger | #161B22 | #6E7681 |
| → git push → | transparent | none (arrow label) |
| Vercel\nEdge Deploy\nGlobal CDN | #000000 | #FFFFFF |
| → auto → | transparent | none |
| Docker\nSelf-hosted\nAlpine ~150MB | #2496ED (10% opacity) | #2496ED |

---

## Arrows (All Connections)

```
Arrow style:
  Default: solid, 2px, orthogonal routing, gold (#FFD166) arrowhead
  Data flow arrows: slightly thicker (2.5px)

Connection list:
  User → Frontend                 [label: HTTPS / WebGL]
  Frontend → API Layer            [label: fetch() + SSE stream]
  API Layer → DynamoDB            [label: AWS SDK v3]
  API Layer → AI Layer            [label: Anthropic SDK]
  API Layer → External Data       [label: fetch() no-store]
  DynamoDB → API Layer            [bidirectional]
  AI Layer → Frontend             [label: JSON / audio / stream]
  External Data → API Layer       [bidirectional]
  GitHub → Vercel Deploy          [label: git push]  (in deployment panel)

Key data flow path (highlight in #FFD166, 3px):
  External Data → API Layer → AI Layer → Frontend → User
```

---

## Typography

```
Group headers:  Inter / Helvetica Neue  14px  Bold  uppercase
Box titles:     Inter / Helvetica Neue  12px  Bold
Box subtitles:  Inter / Helvetica Neue  11px  Regular  muted
Arrow labels:   Inter / Helvetica Neue  10px  Regular  #94A3B8
```

---

## Recommended AWS Icons

Download from [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/):

| Icon | Use |
|---|---|
| `Arch_Amazon-DynamoDB_48.svg` | DynamoDB group header |
| `Arch_AWS-Lambda_48.svg` | If serverless functions shown |
| `Arch_Amazon-CloudFront_48.svg` | CDN note |

Place icons at 32×32px in the top-right of their respective group boxes.

---

## Recommended Vercel / Other Icons

| Icon | Source | Use |
|---|---|---|
| Vercel logo (▲) | [vercel.com/design](https://vercel.com/design) | Deployment box |
| Next.js logo | [nextjs.org/static/favicon](https://nextjs.org) | Frontend box |
| Three.js logo | N/A — use text label | Globe box |
| Docker whale | Docker official | Docker panel |
| Anthropic logo | [anthropic.com](https://anthropic.com) | Claude box |

---

## Export Checklist

```
[ ] Canvas: 1600 × 900 px
[ ] Background: #0A0A0F
[ ] All group labels readable at 1x zoom
[ ] All arrow labels visible
[ ] AWS orange (#FF9900) used only for DynamoDB
[ ] Purple (#9333EA) used only for AI
[ ] Gold (#FFD166) used for accent arrows and feature checkmarks
[ ] Export at 2x → 3200 × 1800 PNG for README use
[ ] Export at 1x → 1600 × 900 PNG for slide decks
[ ] Save .drawio file alongside the PNG
```

---

## Excalidraw Layout

For teams using Excalidraw instead of Draw.io:

```
Style: "hand-drawn" mode OFF — use clean geometric style
Roughness: 0 (smooth)
Background: #1a1a2e
Stroke width: 2
Font: Nunito or system default

Same layout structure:
- Rows from top to bottom: User → Frontend → API → Data+AI → Panels
- Use Excalidraw's frame feature to group sections
- Use arrow labels from the connections list above
- Color code: orange = AWS, purple = AI, teal = data, blue = frontend
```

---

## Figma Layout

```
Frame: 1600 × 900 (16:9 — presentation format)
Components to build:
  - "Service box" component: icon + title + subtitle + border
  - "Group panel" component: title + border + background
  - "Arrow with label" component

Suggested plugin: "AWS Kit" for AWS icons
Layer organization:
  Frame/
    Background/
    Row 1 - User/
    Row 2 - Frontend/
    Row 3 - API/
    Row 4 - Data & AI/
    Row 5 - Panels/
    Arrows/
```
