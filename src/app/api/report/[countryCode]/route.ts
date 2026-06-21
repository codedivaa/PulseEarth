// Investment Report Generator — Goldman Sachs / McKinsey consulting tone.
// Grounded in real World Bank metrics + live news headlines.
// Returns structured JSON; never generic, always country-specific.
// DETERMINISTIC FALLBACK: buildDeterministicReport() always produces a complete report
// from available World Bank data — zero AI dependency.

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 55

export interface SectorOutlook {
  name: string
  outlook: string
  signal: 'positive' | 'neutral' | 'negative'
}

export interface InvestmentReport {
  country: string
  generatedAt: string
  dataYear: string
  executiveSummary: string
  economicStrengths: string[]
  economicRisks: string[]
  tradeAnalysis: string
  investmentOpportunities: string[]
  keySectors: SectorOutlook[]
  growthOutlook: string
  overallRecommendation: 'STRONG BUY' | 'BUY' | 'HOLD' | 'UNDERWEIGHT' | 'AVOID'
  recommendationRationale: string
  confidenceScore: number
}

interface ReportRequest {
  countryName: string
  countryCode: string
  articles: string[]
  capital?: string | null
  region?: string | null
  gdp?: number | null
  gdpGrowth?: number | null
  population?: number | null
  inflation?: number | null
  unemployment?: number | null
  gdpPerCapita?: number | null
  riskScore?: number | null
  innovationScore?: number | null
  tradePartners?: string[]
  exports?: number | null
  imports?: number | null
  tradeBalance?: number | null
  tradeOpenness?: number | null
}

// ── Country → key sectors lookup ─────────────────────────────────────────────
const COUNTRY_SECTORS: Record<string, [string, string, string]> = {
  US: ['Technology & AI',          'Healthcare & Biotech',       'Financial Services'],
  CN: ['Manufacturing & Export',   'Technology & Consumer',      'Green Energy Transition'],
  IN: ['IT Services & SaaS',       'Pharmaceuticals & Generics', 'Infrastructure & Construction'],
  DE: ['Automotive & Engineering', 'Chemicals & Industrial',     'Renewable Energy'],
  JP: ['Advanced Manufacturing',   'Robotics & Automation',      'Financial Services'],
  GB: ['Financial Services',       'Life Sciences & CRO',        'Creative Industries'],
  FR: ['Luxury & Consumer Goods',  'Aerospace & Defense',        'Nuclear Energy'],
  KR: ['Semiconductors',           'Consumer Electronics',       'Shipbuilding'],
  CA: ['Energy & Natural Gas',     'Financial Services',         'Technology & AI'],
  AU: ['Mining & Resources',       'Agriculture & Food',         'Financial Services'],
  BR: ['Agriculture & Commodities','Oil & Gas (pre-salt)',       'Digital Fintech'],
  MX: ['Manufacturing & Auto',     'Oil & Gas (Pemex)',          'Tourism & Services'],
  SA: ['Oil & Gas',                'Vision 2030 Projects',       'Tourism & Hospitality'],
  AE: ['Financial Services & FinTech','Real Estate & Construction','Tourism & Aviation'],
  SG: ['Financial Services',       'Biotechnology & Medtech',    'Logistics & Trade Hub'],
  ZA: ['Mining & Platinum',        'Financial Services',         'Agriculture & Food'],
  NG: ['Oil & Gas',                'Fintech & Digital Banking',  'Agriculture'],
  KE: ['Financial Services (M-Pesa)','Agriculture & Floriculture','Technology & BPO'],
  TR: ['Tourism & Hospitality',    'Manufacturing & Textiles',   'Energy & Defense'],
  ID: ['Digital Economy',          'Nickel & Battery Metals',    'Palm Oil & Agriculture'],
  TH: ['Tourism & Hospitality',    'Automotive OEM',             'Electronics Manufacturing'],
  VN: ['Electronics Manufacturing','Tourism & Hospitality',      'Agriculture & Seafood'],
  PH: ['BPO & IT Services',        'Remittances & Fintech',      'Mining & Nickel'],
  PK: ['Textiles & Garments',      'Agriculture',                'IT & Software Export'],
  BD: ['Garments & RMG',           'Remittances',                'Digital Services'],
  IL: ['Technology & Cybersecurity','Life Sciences & MedTech',   'Agri-Tech & Water'],
  QA: ['LNG & Energy Export',      'Financial Services',         'Construction & Real Estate'],
  AR: ['Agriculture & Soy',        'Lithium & Battery Metals',   'Technology'],
  CL: ['Copper & Mining',          'Agriculture & Wine Export',  'Financial Services'],
  CO: ['Oil & Gas',                'Coffee & Floriculture',      'Technology Hubs'],
  PL: ['Manufacturing',            'IT Services & Outsourcing',  'Agriculture'],
  NL: ['Financial Services',       'High-Tech Agriculture',      'Logistics & Port (Rotterdam)'],
  CH: ['Financial Services',       'Pharmaceuticals & MedTech',  'Luxury & Precision Goods'],
  SE: ['Technology & Gaming',      'Green Energy & Clean Tech',  'Engineering & Industrials'],
  NO: ['Oil & Gas (North Sea)',     'Seafood & Aquaculture',      'Maritime Services'],
  DK: ['Pharmaceuticals (Novo)',   'Wind Energy (Ørsted)',       'Shipping & Logistics'],
  FI: ['Technology & Telecom',     'Forest & Paper Industries',  'Maritime & Shipping'],
  MY: ['Palm Oil & Oleochemicals', 'Semiconductors & E&E',       'Tourism & Hospitality'],
  NZ: ['Agriculture & Dairy',      'Tourism',                    'Technology'],
  RU: ['Oil & Gas',                'Mining & Metals',            'Defense & Aerospace'],
  EG: ['Suez Canal & Logistics',   'Tourism',                    'Natural Gas & Energy'],
  IR: ['Oil & Gas',                'Petrochemicals',             'Agriculture'],
  UA: ['Agriculture & Grain',      'Steel & Metals',             'IT & Software'],
  OM: ['Oil & Gas',                'Logistics & Port',           'Tourism & Fisheries'],
  KW: ['Oil & Petrochemicals',     'Financial Services',         'Real Estate'],
  GH: ['Oil & Cocoa',              'Gold Mining',                'Financial Services'],
  MA: ['Phosphates & Chemicals',   'Tourism',                    'Auto & Aerospace'],
  ET: ['Coffee & Agriculture',     'Manufacturing',              'Aviation (Ethiopian)'],
  TZ: ['Tourism & Safari',         'Agriculture & Coffee',       'Natural Gas'],
  ZW: ['Mining (Platinum/Chrome)', 'Agriculture (Tobacco)',      'Financial Services'],
  TN: ['Tourism',                  'Olive Oil & Agriculture',    'ICT & Outsourcing'],
  SN: ['Mining (Gold/Phosphates)', 'Tourism & Hospitality',      'Fisheries'],
  CI: ["Cocoa & Coffee",           'Oil & Gas',                  'Financial Services'],
  KZ: ['Oil & Gas',                'Mining & Metals',            'Financial Services'],
  LK: ['Tourism',                  'Garments & Textiles',        'Tea & Agriculture'],
  MM: ['Natural Gas',              'Agriculture',                'Jade & Gems'],
  NP: ['Hydropower',               'Tourism',                    'Remittances'],
}

function getCountrySectors(code: string, region: string | null | undefined): [string, string, string] {
  if (COUNTRY_SECTORS[code]) return COUNTRY_SECTORS[code]
  const r = (region ?? '').toLowerCase()
  if (r.includes('sub-saharan') || r.includes('africa')) return ['Mining & Resources', 'Agriculture & Food', 'Financial Services']
  if (r.includes('middle east') || r.includes('north africa')) return ['Oil & Energy', 'Financial Services', 'Real Estate & Construction']
  if (r.includes('latin') || r.includes('caribbean')) return ['Commodities & Resources', 'Agriculture', 'Digital Economy']
  if (r.includes('south asia')) return ['Textiles & Garments', 'Agriculture', 'IT Services']
  if (r.includes('east asia')) return ['Manufacturing & Export', 'Technology', 'Financial Services']
  if (r.includes('southeast asia')) return ['Manufacturing', 'Tourism', 'Agriculture']
  if (r.includes('europe')) return ['Manufacturing', 'Financial Services', 'Tourism']
  return ['Services & Trade', 'Agriculture & Resources', 'Manufacturing']
}

// ── Derive overall recommendation from macro metrics ──────────────────────────
function deriveRecommendation(r: ReportRequest): InvestmentReport['overallRecommendation'] {
  const risk     = r.riskScore   ?? 50
  const growth   = r.gdpGrowth   ?? 0
  const inflation = r.inflation  ?? 5
  const innov    = r.innovationScore ?? 40

  // Score: 0-100 composite of growth (max 35), low-risk (max 35), low-inflation (max 20), innovation (max 10)
  const growthPts  = Math.min(Math.max(growth * 5, -15), 35)
  const riskPts    = Math.max(0, 35 - risk * 0.35)
  const inflPts    = inflation < 2.5 ? 18 : inflation < 5 ? 15 : inflation < 8 ? 10 : inflation < 15 ? 4 : 0
  const innovPts   = Math.min(innov * 0.1, 10)
  const total      = growthPts + riskPts + inflPts + innovPts

  if (total >= 72) return 'STRONG BUY'
  if (total >= 58) return 'BUY'
  if (total >= 40) return 'HOLD'
  if (total >= 22) return 'UNDERWEIGHT'
  return 'AVOID'
}

// ── Deterministic report — always complete, never empty ───────────────────────
function buildDeterministicReport(r: ReportRequest): Omit<InvestmentReport, 'country' | 'generatedAt' | 'dataYear'> {
  const gdpStr   = r.gdp          ? `$${(r.gdp / 1000).toFixed(2)}T`                                    : null
  const growthStr = r.gdpGrowth  != null ? `${r.gdpGrowth > 0 ? '+' : ''}${r.gdpGrowth.toFixed(1)}%`   : null
  const inflStr  = r.inflation   != null ? `${r.inflation.toFixed(1)}%`                                  : null
  const unemplStr = r.unemployment != null ? `${r.unemployment.toFixed(1)}%`                             : null
  const perCapStr = r.gdpPerCapita ? `$${r.gdpPerCapita.toLocaleString('en-US')}`                       : null
  const growth   = r.gdpGrowth   ?? 0
  const risk     = r.riskScore   ?? 50
  const innov    = r.innovationScore ?? 40
  const inflation = r.inflation  ?? 5
  const [sec1, sec2, sec3] = getCountrySectors(r.countryCode, r.region)
  const rec = deriveRecommendation(r)

  // ── Executive summary ────────────────────────────────────────────────────────
  const summaryParts: string[] = []
  if (gdpStr && growthStr) {
    summaryParts.push(`${r.countryName} maintains a ${gdpStr} economy expanding at ${growthStr} YoY — ${growth > 5 ? 'placing it among the world\'s fastest-growing major economies' : growth > 2 ? 'tracking above the global 2.5% average' : growth > 0 ? 'in moderate expansion territory' : 'in a contraction or stagnation phase'}.`)
  } else if (gdpStr) {
    summaryParts.push(`${r.countryName} operates a ${gdpStr} economy with a macro profile that warrants close investor monitoring.`)
  } else {
    summaryParts.push(`${r.countryName} presents a macro profile shaped by regional dynamics and structural factors.`)
  }
  if (inflStr) {
    summaryParts.push(`CPI inflation of ${inflStr} ${inflation > 10 ? 'is a dominant policy challenge — central bank credibility and real yield compression are key investor risks' : inflation > 6 ? 'remains elevated, creating real-income pressure and monetary policy uncertainty' : inflation < 2.5 ? 'is well-anchored, supporting real returns and bond market stability' : 'sits within a manageable range, supporting monetary policy flexibility'}.`)
  }
  if (perCapStr) {
    summaryParts.push(`At ${perCapStr} per capita, ${rec === 'STRONG BUY' || rec === 'BUY' ? 'the risk-adjusted opportunity set favors selective overweight positioning' : rec === 'HOLD' ? 'a balanced, benchmark-weight allocation is appropriate' : 'elevated macro risks argue for caution and underweight positioning'}.`)
  }
  if (summaryParts.length === 0) {
    summaryParts.push(`${r.countryName} presents a macro profile requiring careful data-driven analysis across multiple risk and return dimensions.`)
  }

  // ── Economic strengths (4 required) ──────────────────────────────────────────
  const strengths: string[] = []
  if (growthStr && growth > 1) strengths.push(`GDP growth of ${growthStr} YoY positions ${r.countryName} ${growth > 5 ? `as one of the world's highest-growth major economies, outpacing the ~2.5% global average by ${(growth - 2.5).toFixed(1)} percentage points` : growth > 2.5 ? 'above the global 2.5% trend, signaling structural economic momentum' : 'in positive expansion territory, delivering real income gains'}.`)
  if (perCapStr && r.gdpPerCapita && r.gdpPerCapita > 8000) strengths.push(`Per-capita income of ${perCapStr} supports a ${r.gdpPerCapita > 30000 ? 'high-income consumer economy with sophisticated demand patterns' : 'growing middle class, expanding domestic consumption and retail opportunity'}.`)
  if (r.tradeOpenness && r.tradeOpenness > 40) strengths.push(`Trade openness of ${r.tradeOpenness}% of GDP reflects deep global integration — ${r.tradeOpenness > 100 ? 'a hallmark of entrepôt economies with structural current-account strength' : 'supporting export competitiveness and FDI attraction'}.`)
  if (r.innovationScore && r.innovationScore > 48) strengths.push(`Innovation index of ${r.innovationScore}/100 indicates a competitive knowledge economy, driving productivity growth and high-value-added sector development.`)
  if (r.tradeBalance && r.tradeBalance > 0) strengths.push(`Positive trade balance of +$${r.tradeBalance.toFixed(0)}B underlines export competitiveness and provides a structural buffer against external funding vulnerabilities.`)
  if (r.population && r.population > 60) strengths.push(`A population of ${r.population.toFixed(0)}M provides a large domestic labor force and consumer market — a structural advantage for long-term growth compounding.`)
  if (r.exports && r.exports > 100) strengths.push(`Export base of $${r.exports.toFixed(0)}B demonstrates significant production capacity and integration into global value chains.`)
  // Ensure exactly 4
  const strengthFallbacks = [
    `${sec1} serves as a structural backbone of ${r.countryName}'s economy, providing resilience through commodity and trade cycles.`,
    `Regional positioning in ${r.region ?? 'the global economy'} confers strategic trade, diplomatic, and financial-flow advantages.`,
    `Institutional market frameworks and regulatory infrastructure support continued FDI inflows and capital market development.`,
    `Demographic and urbanization trends provide a multi-decade structural tailwind for domestic consumption and services growth.`,
    `Natural resource endowments and geographic positioning underpin long-term export revenue and economic diversification potential.`,
  ]
  for (const fb of strengthFallbacks) {
    if (strengths.length >= 4) break
    strengths.push(fb)
  }

  // ── Economic risks (3 required) ───────────────────────────────────────────────
  const risks: string[] = []
  if (inflation > 7 && inflStr) risks.push(`Inflation at ${inflStr} exceeds most central banks' 2–4% policy target, compressing real household purchasing power and complicating monetary policy normalization.`)
  if (risk > 55) risks.push(`Composite risk score of ${risk}/100 reflects meaningful exposure to geopolitical, governance, or credit-cycle risks that institutional investors must price into discount rates.`)
  if (r.unemployment && r.unemployment > 8 && unemplStr) risks.push(`Unemployment at ${unemplStr} points to structural labor-market inefficiencies, fiscal drag from social spending, and constrained household income growth.`)
  if (growth < 1 && growthStr) risks.push(`GDP growth of ${growthStr} sits below the global 2.5% trend — raising questions about structural reform momentum and medium-term earnings growth prospects.`)
  if (r.tradeBalance && r.tradeBalance < -20) risks.push(`Trade deficit of $${Math.abs(r.tradeBalance).toFixed(0)}B creates persistent current-account vulnerability and dependency on external capital inflows.`)
  const riskFallbacks = [
    `Global monetary tightening and elevated real rates present material refinancing risk for sovereign and corporate borrowers.`,
    `Currency volatility and commodity price cycles create earnings uncertainty across export-dependent sectors.`,
    `Geopolitical tensions and supply-chain realignment may constrain FDI and trade growth in the medium term.`,
    `Fiscal consolidation pressures may limit public investment capacity, acting as a structural headwind on growth.`,
  ]
  for (const fb of riskFallbacks) {
    if (risks.length >= 3) break
    risks.push(fb)
  }

  // ── Trade analysis ─────────────────────────────────────────────────────────────
  let tradeAnalysis = ''
  if (r.exports && r.imports) {
    const bal = r.tradeBalance ?? (r.exports - r.imports)
    tradeAnalysis = `${r.countryName} recorded exports of $${r.exports.toFixed(0)}B against imports of $${r.imports.toFixed(0)}B — a trade balance of ${bal >= 0 ? '+' : ''}$${bal.toFixed(0)}B.`
    if (r.tradePartners?.length) tradeAnalysis += ` Key partners — ${r.tradePartners.slice(0, 4).join(', ')} — anchor the country's external revenue base and define its geopolitical-economic alignment.`
    if (r.tradeOpenness) tradeAnalysis += ` At ${r.tradeOpenness}% of GDP, trade openness ${r.tradeOpenness > 80 ? 'is extremely high, making the economy highly sensitive to global demand conditions' : r.tradeOpenness > 40 ? 'reflects meaningful global integration with structural export diversification upside' : 'indicates a domestically-oriented economy with room to deepen trade relationships'}.`
  } else if (r.tradePartners?.length) {
    tradeAnalysis = `${r.countryName}'s trade architecture is anchored by relationships with ${r.tradePartners.slice(0, 5).join(', ')}, shaping its external account dynamics, FX exposure, and vulnerability to partner-country cycles.`
  } else {
    tradeAnalysis = `${r.countryName}'s external sector reflects its position within ${r.region ?? 'the global economy'} — balancing commodity exports, services flows, and strategic trade partnerships that define long-term current-account sustainability.`
  }

  // ── Investment opportunities (3 required) ──────────────────────────────────────
  const opportunities: string[] = []
  if (innov > 55 && growthStr) {
    opportunities.push(`${sec1}: Innovation index of ${innov}/100 combined with ${growthStr} GDP expansion creates compelling opportunities in high-value-added, knowledge-intensive subsectors.`)
  } else if (growth > 4 && growthStr) {
    opportunities.push(`${sec1}: ${growthStr} economic expansion is driving above-trend sectoral revenue growth, rewarding early and growth-stage positioning.`)
  } else {
    opportunities.push(`${sec1}: Structural demand and policy support create selective alpha opportunities for patient, long-horizon capital.`)
  }

  if (perCapStr && r.gdpPerCapita && r.gdpPerCapita < 15000) {
    opportunities.push(`${sec2}: At ${perCapStr} per capita, ${r.countryName} remains in the economic convergence phase — creating a rare window for infrastructure, productivity catch-up, and consumer market entry.`)
  } else if (r.tradeOpenness && r.tradeOpenness > 60) {
    opportunities.push(`${sec2}: High trade openness creates platform advantages — companies using ${r.countryName} as a regional hub can access significantly larger addressable markets.`)
  } else {
    opportunities.push(`${sec2}: Policy tailwinds and sectoral reforms are opening new opportunities for strategic capital allocation.`)
  }
  opportunities.push(`${sec3}: Regional integration momentum and ${r.countryName}'s trade network position enhance revenue diversification and risk-adjusted return profiles for cross-border investors.`)

  // ── Key sectors ─────────────────────────────────────────────────────────────────
  const secSignals: [string, 'positive' | 'neutral' | 'negative'][] = [
    [sec1, (growth > 2 && innov > 45) || growth > 5 ? 'positive' : 'neutral'],
    [sec2, inflation < 7 && risk < 60 ? 'positive' : inflation > 10 || risk > 70 ? 'negative' : 'neutral'],
    [sec3, risk < 55 ? 'neutral' : 'negative'],
  ]
  const keySectors: SectorOutlook[] = secSignals.map(([name, signal]) => ({
    name,
    outlook: signal === 'positive'
      ? `Positive macro tailwinds and structural demand support above-trend sector performance through 2026.`
      : signal === 'neutral'
      ? `Mixed macro signals warrant selective positioning; monitor policy and external conditions closely.`
      : `Elevated headwinds — macro volatility and risk discount apply; caution advised pending stabilization.`,
    signal,
  }))

  // ── Growth outlook ───────────────────────────────────────────────────────────────
  let growthOutlook = ''
  if (growthStr) {
    growthOutlook = `${r.countryName}'s near-term path hinges on sustaining ${growthStr} GDP momentum while ${inflStr ? `managing ${inflStr} inflation and its impact on monetary policy` : 'navigating global macro headwinds'}.`
    growthOutlook += ` Over the next 12–18 months, ${
      growth > 5 ? 'the growth engine appears well-fueled — barring a sharp external shock, above-trend expansion should persist, driven by domestic investment and export demand'
      : growth > 2.5 ? 'moderate but steady expansion is the base case, contingent on policy continuity and stable external demand from key trading partners'
      : growth > 0 ? 'recovery remains modest and dependent on structural reform execution, fiscal credibility, and sustained FDI inflows'
      : 'renewed contraction risk warrants defensive positioning — monitor IMF program compliance and central bank policy for turning-point signals'
    }.`
  } else {
    growthOutlook = `${r.countryName}'s growth outlook is shaped by structural reform progress, commodity cycle positioning, and external demand from key trading partners over the next 12–18 months.`
  }

  // ── Recommendation rationale ─────────────────────────────────────────────────────
  const rationale = [
    `Our ${rec} rating reflects a composite macro assessment: risk score of ${risk}/100, GDP growth of ${growthStr ?? 'limited data'}, and inflation of ${inflStr ?? 'limited data'}.`,
    rec === 'STRONG BUY'  ? `The convergence of strong growth, controlled inflation, and manageable risk creates a high-conviction risk-adjusted entry point for long-horizon allocations.`
    : rec === 'BUY'       ? `Despite pockets of macro uncertainty, the growth trajectory and sector opportunity set justify overweight exposure for mandates with 2–4 year time horizons.`
    : rec === 'HOLD'      ? `Balanced risk-reward argues for maintaining current exposure at or near benchmark weight while monitoring policy evolution and external sector developments.`
    : rec === 'UNDERWEIGHT' ? `Elevated macro risks and uncertain growth visibility recommend reducing exposure below benchmark until a clearer stabilization signal emerges.`
    :                       `Severe macro imbalances or elevated political risk warrant avoiding new positions until a definitive stabilization catalyst is confirmed.`,
  ].join(' ')

  // ── Confidence score — based on data completeness ──────────────────────────────
  const dataFields = [r.gdp, r.gdpGrowth, r.inflation, r.unemployment, r.gdpPerCapita, r.riskScore, r.innovationScore, r.exports, r.imports]
  const filledCount = dataFields.filter(f => f != null).length
  const confidenceScore = Math.max(4, Math.round(3 + (filledCount / dataFields.length) * 6))

  return {
    executiveSummary:        summaryParts.join(' '),
    economicStrengths:       strengths.slice(0, 4),
    economicRisks:           risks.slice(0, 3),
    tradeAnalysis,
    investmentOpportunities: opportunities.slice(0, 3),
    keySectors:              keySectors.slice(0, 3),
    growthOutlook,
    overallRecommendation:   rec,
    recommendationRationale: rationale,
    confidenceScore,
  }
}

// ── AI prompt builder ─────────────────────────────────────────────────────────
function buildReportPrompt(r: ReportRequest): string {
  const metrics: string[] = []
  if (r.region)            metrics.push(`Region: ${r.region}`)
  if (r.capital)           metrics.push(`Capital: ${r.capital}`)
  if (r.population)        metrics.push(`Population: ${r.population.toFixed(1)}M`)
  if (r.gdp)               metrics.push(`GDP: $${(r.gdp / 1000).toFixed(3)}T`)
  if (r.gdpGrowth != null) metrics.push(`GDP Growth: ${r.gdpGrowth > 0 ? '+' : ''}${r.gdpGrowth.toFixed(2)}% YoY`)
  if (r.gdpPerCapita)      metrics.push(`GDP per Capita: $${r.gdpPerCapita.toLocaleString('en-US')}`)
  if (r.inflation != null) metrics.push(`CPI Inflation: ${r.inflation.toFixed(2)}%`)
  if (r.unemployment != null) metrics.push(`Unemployment Rate: ${r.unemployment.toFixed(2)}%`)
  if (r.riskScore != null) metrics.push(`Risk Score: ${r.riskScore}/100 (PulseEarth composite)`)
  if (r.innovationScore != null) metrics.push(`Innovation Index: ${r.innovationScore}/100`)
  if (r.exports != null)   metrics.push(`Exports: $${r.exports}B`)
  if (r.imports != null)   metrics.push(`Imports: $${r.imports}B`)
  if (r.tradeBalance != null) metrics.push(`Trade Balance: ${r.tradeBalance >= 0 ? '+' : ''}$${r.tradeBalance}B`)
  if (r.tradeOpenness != null) metrics.push(`Trade/GDP: ${r.tradeOpenness}%`)
  if (r.tradePartners?.length) metrics.push(`Top Partners: ${r.tradePartners.slice(0, 5).join(', ')}`)

  const headlines = r.articles.length > 0
    ? r.articles.slice(0, 5).map((h, i) => `${i + 1}. ${h}`).join('\n')
    : 'No current market headlines — base analysis on macro data only'

  return `You are a Managing Director at a Tier-1 investment bank writing an institutional research note on ${r.countryName}.

This report will be read by sovereign wealth funds, hedge funds, and institutional LPs. Every claim must be anchored to the verified data below. No filler. No generic language.

VERIFIED MACRO DATA (World Bank / IMF):
${metrics.join('\n') || 'Data limited'}

CURRENT MARKET INTELLIGENCE:
${headlines}

Return ONLY valid JSON (no markdown, no code fences) with exactly this structure:
{"executiveSummary":"2-3 sentences citing real numbers","economicStrengths":["metric-specific strength 1","metric-specific strength 2","metric-specific strength 3","metric-specific strength 4"],"economicRisks":["quantified risk 1","quantified risk 2","quantified risk 3"],"tradeAnalysis":"1 paragraph on trade position with actual figures","investmentOpportunities":["sector-specific opportunity 1","sector-specific opportunity 2","sector-specific opportunity 3"],"keySectors":[{"name":"Sector 1","outlook":"1-sentence outlook","signal":"positive"},{"name":"Sector 2","outlook":"1-sentence outlook","signal":"neutral"},{"name":"Sector 3","outlook":"1-sentence outlook","signal":"negative"}],"growthOutlook":"2 sentences on 12-18 month forward view","overallRecommendation":"BUY","recommendationRationale":"2 sentences citing risk score and growth","confidenceScore":7}`
}

// ── Parse AI response; fall through to deterministic on any failure ────────────
function parseReport(raw: string, r: ReportRequest): Omit<InvestmentReport, 'country' | 'generatedAt' | 'dataYear'> {
  const clean = raw.replace(/^```(?:json)?\n?/gm, '').replace(/^```\s*$/gm, '').trim()
  try {
    const p = JSON.parse(clean)
    const rec = ['STRONG BUY', 'BUY', 'HOLD', 'UNDERWEIGHT', 'AVOID']

    // Validate — if AI gave us empty or non-specific content, use deterministic
    const hasContent =
      typeof p.executiveSummary === 'string' && p.executiveSummary.length > 30 &&
      Array.isArray(p.economicStrengths) && p.economicStrengths.length >= 3 &&
      Array.isArray(p.economicRisks) && p.economicRisks.length >= 2 &&
      typeof p.tradeAnalysis === 'string' && p.tradeAnalysis.length > 20 &&
      Array.isArray(p.keySectors) && p.keySectors.length >= 1

    if (!hasContent) {
      console.log('[report] AI output incomplete — using deterministic report')
      return buildDeterministicReport(r)
    }

    // Merge AI with deterministic to fill any missing arrays/fields
    const deterministic = buildDeterministicReport(r)
    return {
      executiveSummary:        p.executiveSummary,
      economicStrengths:       Array.isArray(p.economicStrengths) && p.economicStrengths.length >= 3 ? p.economicStrengths.slice(0, 4) : deterministic.economicStrengths,
      economicRisks:           Array.isArray(p.economicRisks) && p.economicRisks.length >= 2 ? p.economicRisks.slice(0, 3) : deterministic.economicRisks,
      tradeAnalysis:           typeof p.tradeAnalysis === 'string' && p.tradeAnalysis.length > 20 ? p.tradeAnalysis : deterministic.tradeAnalysis,
      investmentOpportunities: Array.isArray(p.investmentOpportunities) && p.investmentOpportunities.length >= 2 ? p.investmentOpportunities.slice(0, 3) : deterministic.investmentOpportunities,
      keySectors:              Array.isArray(p.keySectors) && p.keySectors.length >= 1 ? p.keySectors.slice(0, 3) : deterministic.keySectors,
      growthOutlook:           typeof p.growthOutlook === 'string' && p.growthOutlook.length > 20 ? p.growthOutlook : deterministic.growthOutlook,
      overallRecommendation:   rec.includes(p.overallRecommendation) ? p.overallRecommendation : deterministic.overallRecommendation,
      recommendationRationale: typeof p.recommendationRationale === 'string' && p.recommendationRationale.length > 20 ? p.recommendationRationale : deterministic.recommendationRationale,
      confidenceScore:         typeof p.confidenceScore === 'number' ? Math.min(10, Math.max(1, Math.round(p.confidenceScore))) : deterministic.confidenceScore,
    }
  } catch {
    // JSON parse failed — always use deterministic report (never show placeholder)
    console.log('[report] JSON parse failed — using deterministic report from World Bank metrics')
    return buildDeterministicReport(r)
  }
}

// ── AI generation (Claude Haiku with JSON prefill) ────────────────────────────
async function generateViaGemini(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1400,
            temperature: 0.60,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(22000),
      }
    )
    if (!res.ok) return null
    const result = await res.json()
    return result.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch { return null }
}

async function generateViaClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('No ANTHROPIC_API_KEY')
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1400,
    messages: [
      { role: 'user', content: prompt },
      { role: 'assistant', content: '{' },   // JSON prefill — forces valid JSON start
    ],
  })
  const block = msg.content[0]
  if (block.type !== 'text') throw new Error('Bad content block')
  return '{' + block.text  // re-prepend the { used as prefill
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  let body: ReportRequest
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // 1. Build deterministic report immediately (always works, zero network calls)
  const deterministicReport = buildDeterministicReport(body)

  // 2. Try AI enhancement (Gemini first, Claude fallback, 22s budget)
  let rawText = ''
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) rawText = (await generateViaGemini(buildReportPrompt(body), geminiKey)) ?? ''
  if (!rawText) {
    try { rawText = await generateViaClaude(buildReportPrompt(body)) }
    catch (e) {
      console.log('[report] Claude fallback failed:', e)
      // Fine — we have the deterministic report ready
    }
  }

  // 3. Parse AI output; fall through to deterministic if anything fails
  const parsed = rawText ? parseReport(rawText, body) : deterministicReport

  const report: InvestmentReport = {
    country: body.countryName,
    generatedAt: new Date().toISOString(),
    dataYear: '2023',
    ...parsed,
  }

  return NextResponse.json(report)
}
