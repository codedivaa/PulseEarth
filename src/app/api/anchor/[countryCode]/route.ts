// AI News Anchor — structured JSON briefing via Gemini Flash + Kokoro TTS.
// Falls back to Claude Haiku for script, null audio if HF key absent.
// Returns country-specific briefing that differs meaningfully per country.

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 55

export interface AnchorBriefing {
  headline: string
  script: string
  keyTakeaways: string[]
  investmentOutlook: string
  risks: string[]
  opportunities: string[]
  sectors: string[]
  audioBase64: string | null
  audioMimeType: string
  hasAudio: boolean
}

interface AnchorRequest {
  countryName: string
  articles: string[]           // headline strings from news API
  capital?: string | null
  region?: string | null
  gdp?: number | null          // billion USD
  gdpGrowth?: number | null    // %
  population?: number | null   // millions
  inflation?: number | null    // %
  unemployment?: number | null // %
  gdpPerCapita?: number | null // USD
}

// ── Prompt ───────────────────────────────────────────────────────────────────
function buildPrompt(b: AnchorRequest): string {
  const metricLines: string[] = []
  if (b.region)               metricLines.push(`Region: ${b.region}`)
  if (b.capital)              metricLines.push(`Capital: ${b.capital}`)
  if (b.population)           metricLines.push(`Population: ${b.population.toFixed(1)}M`)
  if (b.gdp)                  metricLines.push(`GDP: $${(b.gdp / 1000).toFixed(3)}T (World Bank)`)
  if (b.gdpGrowth != null)    metricLines.push(`GDP Growth: ${b.gdpGrowth > 0 ? '+' : ''}${b.gdpGrowth.toFixed(2)}% YoY (World Bank)`)
  if (b.inflation != null)    metricLines.push(`CPI Inflation: ${b.inflation.toFixed(2)}% (World Bank)`)
  if (b.unemployment != null) metricLines.push(`Unemployment: ${b.unemployment.toFixed(2)}% (World Bank)`)
  if (b.gdpPerCapita)         metricLines.push(`GDP per Capita: $${b.gdpPerCapita.toLocaleString('en-US')}`)

  const headlinesBlock = b.articles.length > 0
    ? b.articles.slice(0, 4).map((h, i) => `${i + 1}. ${h}`).join('\n')
    : 'No current market headlines available'

  const hookMetric = b.gdpGrowth != null
    ? `GDP expanding at ${b.gdpGrowth > 0 ? '+' : ''}${b.gdpGrowth.toFixed(1)}%`
    : b.inflation != null
    ? `inflation running at ${b.inflation.toFixed(1)}%`
    : b.gdp ? `a $${(b.gdp / 1000).toFixed(1)}T economy` : 'shifting economic conditions'

  return `You are a senior Bloomberg TV economic correspondent. You are ON AIR filing a live report from ${b.capital ?? b.countryName}.

Your mission: Explain the single most important economic story in ${b.countryName} RIGHT NOW — what is happening, WHY it matters to investors, and what they should watch.

VERIFIED MACRO DATA (World Bank / IMF — you MUST cite these exact figures):
${metricLines.join('\n') || 'Data limited — use general context only'}

LIVE MARKET INTELLIGENCE:
${headlinesBlock}

KEY STORY HOOK: ${b.countryName} with ${hookMetric}.

BLOOMBERG TV STANDARDS — non-negotiable:
- script: 85–100 words. Present tense. Authoritative. Specific. ZERO generic filler.
- Cite at least 2 real numbers from the verified data. Explain their investor significance.
- Investor impact: who wins, who loses, what to watch next quarter.
- Never use vague words ("robust", "significant", "notable") without a number backing it.
- Never say "the economy is growing" — say "GDP expanding at +X.X% places ${b.countryName} among the fastest in ${b.region ?? 'the region'}."
- Open with: "From ${b.capital ?? b.countryName} tonight:", "Markets are watching ${b.countryName}:", "Breaking from ${b.capital ?? b.countryName}:", or "Economic Alert — ${b.countryName}:"
- keyTakeaways: 3 bullets. Each cites a real figure. Each under 20 words. Investor-focused.
- investmentOutlook: 1 sentence, 2026 horizon. Specific to ${b.countryName}. No generic language.
- risks: 2 real, quantified risks that institutional investors in ${b.countryName} are pricing in. Under 15 words each.
- opportunities: 2 specific alpha-generating opportunities in ${b.countryName} right now. Under 15 words each.
- sectors: 3 sectors that define ${b.countryName}'s economic story this quarter.

Return ONLY valid JSON. No markdown. No explanation. Exactly:
{"headline":"[12-18 word breaking opener with a real verifiable fact about ${b.countryName}]","script":"[85-100 word live on-air Bloomberg script]","keyTakeaways":["[number-backed point]","[number-backed point]","[number-backed point]"],"investmentOutlook":"[specific 2026 outlook sentence]","risks":["[quantified risk 1]","[quantified risk 2]"],"opportunities":["[specific opportunity 1]","[specific opportunity 2]"],"sectors":["[sector 1]","[sector 2]","[sector 3]"]}`
}

// ── Parse AI response → AnchorBriefing ──────────────────────────────────────
function parseBriefing(raw: string, b: AnchorRequest): Omit<AnchorBriefing, 'audioBase64' | 'audioMimeType' | 'hasAudio'> {
  const clean = raw.replace(/^```(?:json)?\n?/gm, '').replace(/^```\s*$/gm, '').trim()
  try {
    const p = JSON.parse(clean)
    return {
      headline:        typeof p.headline === 'string'         ? p.headline        : `Economic Update: ${b.countryName}`,
      script:          typeof p.script === 'string'           ? p.script          : fallbackScript(b),
      keyTakeaways:    Array.isArray(p.keyTakeaways)          ? p.keyTakeaways.slice(0, 3) : [],
      investmentOutlook: typeof p.investmentOutlook === 'string' ? p.investmentOutlook : '',
      risks:           Array.isArray(p.risks)                 ? p.risks.slice(0, 2)   : [],
      opportunities:   Array.isArray(p.opportunities)        ? p.opportunities.slice(0, 2) : [],
      sectors:         Array.isArray(p.sectors)               ? p.sectors.slice(0, 3) : [],
    }
  } catch {
    return {
      headline: `Economic Update: ${b.countryName}`,
      script: fallbackScript(b),
      keyTakeaways: [], investmentOutlook: '',
      risks: [], opportunities: [], sectors: [],
    }
  }
}

function fallbackScript(b: AnchorRequest): string {
  const { countryName, gdpGrowth, inflation, gdp, population, gdpPerCapita } = b
  const lines: string[] = [`${countryName}'s economy commands attention from global markets.`]
  if (gdpGrowth != null) {
    lines.push(`GDP growth of ${gdpGrowth > 0 ? '+' : ''}${gdpGrowth.toFixed(1)}% signals ${gdpGrowth > 5 ? 'robust expansion above emerging-market benchmarks' : gdpGrowth > 2 ? 'steady moderate momentum' : 'cautious and fragile recovery'}.`)
  }
  if (inflation != null) {
    lines.push(`Inflation at ${inflation.toFixed(1)}% ${inflation > 7 ? 'remains the dominant policy challenge for the central bank' : 'stays within a manageable range for now'}.`)
  }
  if (gdp) {
    lines.push(`With a $${(gdp / 1000).toFixed(1)}T economy${population ? ` and ${population.toFixed(0)} million citizens` : ''}${gdpPerCapita ? ` and per-capita income at $${gdpPerCapita.toLocaleString('en-US')}` : ''}, structural momentum and policy direction will define ${countryName}'s 2025 trajectory.`)
  } else {
    lines.push(`Structural momentum and global headwinds will define ${countryName}'s trajectory through 2025.`)
  }
  return lines.join(' ')
}

// ── Script generation ────────────────────────────────────────────────────────
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
            maxOutputTokens: 600,
            temperature: 0.72,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(14000),
      }
    )
    if (!res.ok) return null
    const result = await res.json()
    return result.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch { return null }
}

async function generateViaClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('No key')
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = msg.content[0]
  if (block.type !== 'text') throw new Error('Bad block')
  return block.text
}

// ── Kokoro TTS ───────────────────────────────────────────────────────────────
async function generateAudio(script: string, hfToken: string): Promise<{ base64: string; mimeType: string } | null> {
  // Primary: Kokoro-82M
  try {
    const r = await fetch('https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: script.slice(0, 500) }),
      signal: AbortSignal.timeout(22000),
    })
    if (r.ok) {
      const buf = await r.arrayBuffer()
      if (buf.byteLength > 2000) {
        return { base64: Buffer.from(buf).toString('base64'), mimeType: r.headers.get('content-type') ?? 'audio/flac' }
      }
    }
  } catch { /* fall through */ }

  // Fallback: Parler TTS mini (female voice)
  try {
    const r = await fetch('https://api-inference.huggingface.co/models/parler-tts/parler-tts-mini-v1', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: script.slice(0, 500),
        parameters: { description: 'A clear professional female news anchor voice, confident and authoritative, studio quality.' },
      }),
      signal: AbortSignal.timeout(28000),
    })
    if (r.ok) {
      const buf = await r.arrayBuffer()
      if (buf.byteLength > 2000) {
        return { base64: Buffer.from(buf).toString('base64'), mimeType: r.headers.get('content-type') ?? 'audio/wav' }
      }
    }
  } catch { /* return null */ }

  return null
}

// ── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  let body: AnchorRequest
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const prompt = buildPrompt(body)

  // 1. Generate structured briefing
  let rawText = ''
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) rawText = (await generateViaGemini(prompt, geminiKey)) ?? ''

  if (!rawText) {
    try { rawText = await generateViaClaude(prompt) }
    catch { /* use empty string — parseBriefing will use fallbacks */ }
  }

  const briefing = parseBriefing(rawText, body)

  // 2. Generate Kokoro audio (optional)
  let audioBase64: string | null = null
  let audioMimeType = 'audio/wav'
  const hfToken = process.env.HUGGING_FACE_TOKEN ?? process.env.HF_TOKEN ?? ''
  if (hfToken && briefing.script) {
    const audio = await generateAudio(briefing.script, hfToken)
    if (audio) { audioBase64 = audio.base64; audioMimeType = audio.mimeType }
  }

  return NextResponse.json({
    ...briefing,
    audioBase64,
    audioMimeType,
    hasAudio: audioBase64 !== null,
  } satisfies AnchorBriefing)
}
