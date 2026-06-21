'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InsightStream from './InsightStream'
import NewsPanel from './NewsPanel'
import InvestmentReport from './InvestmentReport'
import { useCountUp } from '@/hooks/useCountUp'
import type { CountryData } from '@/types/country'
import type { AnchorBriefing } from '@/app/api/anchor/[countryCode]/route'

interface Props {
  countryCode: string
  countryName: string
  showNews?: boolean
  timelineYear?: number
  onCompare?: () => void
}

// ─── Brief Me — text-only executive summary card ─────────────────────────────
function BriefSection({ countryCode, countryName, data }: {
  countryCode: string; countryName: string; data: CountryData | null
}) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [brief,   setBrief]   = useState<AnchorBriefing | null>(null)
  const [error,   setError]   = useState(false)

  const handleBrief = useCallback(async () => {
    if (open) { setOpen(false); return }
    setOpen(true)
    if (brief) return   // already fetched — just re-open
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/anchor/${encodeURIComponent(countryCode)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryName,
          articles: [],
          capital:      data?.capital      ?? null,
          region:       data?.region       ?? null,
          gdp:          data?.gdp_billion  ?? null,
          gdpGrowth:    data?.gdpGrowth    ?? null,
          population:   data?.population_m ?? null,
          inflation:    data?.inflation    ?? null,
          unemployment: data?.unemployment ?? null,
          gdpPerCapita: data?.gdpPerCapita ?? null,
        }),
      })
      if (!res.ok) throw new Error('error')
      setBrief(await res.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [countryCode, countryName, data, open, brief])

  // Reset when country changes
  useEffect(() => { setOpen(false); setBrief(null); setError(false) }, [countryCode])

  return (
    <div>
      {/* Trigger button */}
      <motion.button
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        onClick={handleBrief}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#FFD166]/18 bg-[#FFD166]/[0.05] hover:bg-[#FFD166]/[0.10] transition-all group"
      >
        <span className="text-sm">{open ? '▾' : '📋'}</span>
        <span className="text-[12px] font-medium text-[#FFD166]/70 group-hover:text-[#FFD166] transition-colors">Brief Me</span>
        <span className="text-[9px] text-white/20 ml-auto">Text summary</span>
      </motion.button>

      {/* Expanded text card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-xl p-4 space-y-3 border border-[#FFD166]/10"
              style={{ background: 'rgba(12,20,38,0.97)' }}
            >
              {loading && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1 h-1 rounded-full bg-[#FFD166]/50"
                        style={{ animationName: 'peWaveBar', animationDuration: '0.8s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDirection: 'alternate' as React.CSSProperties['animationDirection'], animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <span className="text-[11px] text-white/35">Generating executive summary…</span>
                </div>
              )}

              {error && (
                <p className="text-[11px] text-white/35 py-1">Summary unavailable. Try the AI Anchor below for a full audio briefing.</p>
              )}

              {brief && !loading && (
                <>
                  {/* Breaking headline */}
                  <p className="text-[10px] text-[#FFD166]/60 uppercase tracking-wider font-medium leading-snug">
                    {brief.headline}
                  </p>

                  {/* Script paragraph */}
                  <p className="text-[11.5px] text-white/65 leading-relaxed">{brief.script}</p>

                  {/* Key takeaways */}
                  {brief.keyTakeaways.length > 0 && (
                    <div>
                      <p className="text-[9px] text-white/28 uppercase tracking-wider mb-1.5">Key Takeaways</p>
                      <div className="space-y-1">
                        {brief.keyTakeaways.map((t, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-[#FFD166]/45 text-[9px] flex-shrink-0 mt-0.5">▸</span>
                            <p className="text-[10.5px] text-white/55 leading-snug">{t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investment outlook */}
                  {brief.investmentOutlook && (
                    <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,209,102,0.05)', border: '1px solid rgba(255,209,102,0.12)' }}>
                      <p className="text-[9px] text-[#FFD166]/40 uppercase tracking-wider mb-0.5">Investment Outlook 2025</p>
                      <p className="text-[10.5px] text-[#FFD166]/72 leading-snug">{brief.investmentOutlook}</p>
                    </div>
                  )}

                  {/* Risks + opportunities */}
                  {(brief.risks.length > 0 || brief.opportunities.length > 0) && (
                    <div className="grid grid-cols-2 gap-2">
                      {brief.risks.length > 0 && (
                        <div>
                          <p className="text-[9px] text-red-400/40 uppercase tracking-wider mb-1">Risks</p>
                          {brief.risks.map((r, i) => (
                            <p key={i} className="text-[9.5px] text-white/38 leading-snug flex items-start gap-1">
                              <span className="text-red-400/45 flex-shrink-0">•</span>{r}
                            </p>
                          ))}
                        </div>
                      )}
                      {brief.opportunities.length > 0 && (
                        <div>
                          <p className="text-[9px] text-emerald-400/40 uppercase tracking-wider mb-1">Opportunities</p>
                          {brief.opportunities.map((o, i) => (
                            <p key={i} className="text-[9.5px] text-white/38 leading-snug flex items-start gap-1">
                              <span className="text-emerald-400/45 flex-shrink-0">•</span>{o}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Animated number card ────────────────────────────────────────────────────
function StatCard({ label, value, suffix = '', prefix = '', color = '#FFD166', delay = 0, decimals = 0, source }: {
  label: string; value: number; suffix?: string; prefix?: string
  color?: string; delay?: number; decimals?: number; source?: string
}) {
  const animated = useCountUp(Math.round(value * Math.pow(10, decimals)), 1000, delay)
  const display  = decimals > 0
    ? (animated / Math.pow(10, decimals)).toFixed(decimals)
    : animated.toLocaleString()
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 + 0.1 }}
      className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.035] transition-colors"
    >
      <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-lg font-bold tabular-nums" style={{ color }}>{prefix}{display}{suffix}</p>
      {source && <p className="text-[8px] text-white/16 mt-1 tracking-wide">· {source}</p>}
    </motion.div>
  )
}

function BarCard({ label, value, max = 100, unit = '', delay = 0, color = '#FFB703', source }: {
  label: string; value: number; max?: number; unit?: string; delay?: number; color?: string; source?: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 + 0.1 }}
      className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02]"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-white/35 uppercase tracking-widest">{label}</p>
        <span className="text-sm font-bold" style={{ color }}>{value}{unit}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ delay: delay / 1000 + 0.4, duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg,${color}99,${color})` }}
        />
      </div>
      {source && <p className="text-[8px] text-white/16 mt-1.5 tracking-wide">· {source}</p>}
    </motion.div>
  )
}

function Dash({ label }: { label: string }) {
  return (
    <div className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02]">
      <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-lg font-bold text-white/15">—</p>
    </div>
  )
}

// ─── Investment signal badge ──────────────────────────────────────────────────
function InvestmentBadge({ risk }: { risk: number }) {
  const s = risk < 30
    ? { emoji: '🟢', label: 'Strong Opportunity', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.22)' }
    : risk < 60
    ? { emoji: '🟡', label: 'Moderate Risk',      color: '#FFD166', bg: 'rgba(255,209,102,0.07)', border: 'rgba(255,209,102,0.20)' }
    : { emoji: '🔴', label: 'High Risk Market',   color: '#FB8500', bg: 'rgba(251,133,0,0.08)', border: 'rgba(251,133,0,0.22)' }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="rounded-lg px-4 py-3 flex items-center gap-3 border"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <span className="text-base">{s.emoji}</span>
      <div className="flex-1">
        <p className="text-[9px] text-white/28 uppercase tracking-widest">Investment Signal</p>
        <p className="text-[13px] font-semibold" style={{ color: s.color }}>{s.label}</p>
      </div>
      <span className="text-[11px] font-bold tabular-nums" style={{ color: s.color }}>{risk}/100</span>
    </motion.div>
  )
}

// ─── Trade Intelligence ───────────────────────────────────────────────────────
interface TradeData {
  exports_b: number | null
  imports_b: number | null
  balance_b: number | null
  trade_pct: number | null
  partners: string[]
}
function TradePanel({ countryCode }: { countryCode: string }) {
  const [data, setData] = useState<TradeData | null>(null)
  useEffect(() => {
    fetch(`/api/trade/${encodeURIComponent(countryCode)}`)
      .then(r => r.json()).then(setData).catch(() => {})
  }, [countryCode])

  if (!data) return (
    <div className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02] animate-pulse h-28" />
  )

  const balanceColor = !data.balance_b ? '#FFD166'
    : data.balance_b >= 0 ? '#22c55e' : '#ef4444'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02]"
    >
      <p className="text-[10px] text-white/35 uppercase tracking-widest mb-3">Trade Intelligence</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Exports', v: data.exports_b, suffix: 'B', prefix: '$' },
          { label: 'Imports', v: data.imports_b, suffix: 'B', prefix: '$' },
          { label: 'Balance', v: data.balance_b, suffix: 'B', prefix: data.balance_b != null && data.balance_b >= 0 ? '+$' : '$', color: balanceColor },
        ].map(({ label, v, suffix, prefix, color }) => (
          <div key={label} className="text-center">
            <p className="text-[9px] text-white/28 uppercase tracking-widest">{label}</p>
            <p className="text-[13px] font-bold tabular-nums" style={{ color: color ?? '#FFD166' }}>
              {v != null ? `${prefix}${Math.abs(v)}${suffix}` : '—'}
            </p>
          </div>
        ))}
      </div>

      {data.trade_pct != null && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-white/30 uppercase tracking-widest">Trade openness</span>
            <span className="text-[11px] font-semibold text-[#FFB703]">{data.trade_pct}% of GDP</span>
          </div>
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FFB703]/60 to-[#FFB703]"
              style={{ width: `${Math.min(100, data.trade_pct)}%` }}
            />
          </div>
        </div>
      )}

      {/* Top partners */}
      {data.partners.length > 0 && (
        <div>
          <p className="text-[9px] text-white/28 uppercase tracking-widest mb-2">Top Trade Partners</p>
          <div className="flex flex-wrap gap-1.5">
            {data.partners.slice(0, 7).map((p, i) => (
              <span
                key={p}
                className="text-[10px] px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: `rgba(255,183,3,${0.35 - i * 0.04})`,
                  color: `rgba(255,209,102,${0.80 - i * 0.08})`,
                  background: `rgba(255,183,3,${0.04 - i * 0.004})`,
                }}
              >{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Trade routes globe hint */}
      <div className="mt-3 pt-3 border-t border-white/[0.05]">
        <p className="text-[9px] text-white/22 leading-relaxed">
          ✦ Enable <span className="text-[#FFB703]/50">Trade Routes</span> in the layer panel to visualise live bilateral flows on the globe.
          Routes are weighted by trade volume — thicker arcs indicate higher dependency.
        </p>
      </div>
    </motion.div>
  )
}

// ─── Investment Intelligence — 🟢🟡🔴 signals from real metrics ──────────────
function InvestmentIntelligence({ data, countryName }: { data: CountryData | null; countryName: string }) {
  if (!data) return null

  const gdpGrowth    = data.gdpGrowth    ?? 0
  const inflation    = data.inflation    ?? 5
  const unemployment = data.unemployment ?? 5
  const gdpPerCap    = data.gdpPerCapita ?? 0
  const risk         = data.risk_score   ?? 50
  const innovation   = data.innovationScore ?? 50

  // Derived signals — each is: { label, status: 'green'|'yellow'|'red', detail }
  const signals: { emoji: string; label: string; detail: string; color: string }[] = []

  // GDP Growth signal
  if (gdpGrowth > 5)
    signals.push({ emoji: '🟢', label: 'Strong GDP Growth', detail: `+${gdpGrowth.toFixed(1)}% — above-average expansion`, color: '#22c55e' })
  else if (gdpGrowth > 2)
    signals.push({ emoji: '🟡', label: 'Moderate Growth', detail: `+${gdpGrowth.toFixed(1)}% — stable but not accelerating`, color: '#FFD166' })
  else if (gdpGrowth > 0)
    signals.push({ emoji: '🟡', label: 'Slow Growth', detail: `+${gdpGrowth.toFixed(1)}% — economy decelerating`, color: '#FFD166' })
  else
    signals.push({ emoji: '🔴', label: 'GDP Contraction', detail: `${gdpGrowth.toFixed(1)}% — recessionary conditions`, color: '#ef4444' })

  // Inflation signal
  if (inflation < 4)
    signals.push({ emoji: '🟢', label: 'Controlled Inflation', detail: `${inflation.toFixed(1)}% — within target range`, color: '#22c55e' })
  else if (inflation < 8)
    signals.push({ emoji: '🟡', label: 'Elevated Inflation', detail: `${inflation.toFixed(1)}% — above target, CB watchful`, color: '#FFD166' })
  else
    signals.push({ emoji: '🔴', label: 'High Inflation Risk', detail: `${inflation.toFixed(1)}% — purchasing power erosion`, color: '#ef4444' })

  // Labour market
  if (unemployment < 5)
    signals.push({ emoji: '🟢', label: 'Strong Labour Market', detail: `${unemployment.toFixed(1)}% unemployment — near full employment`, color: '#22c55e' })
  else if (unemployment < 10)
    signals.push({ emoji: '🟡', label: 'Moderate Unemployment', detail: `${unemployment.toFixed(1)}% — slack in labour market`, color: '#FFD166' })
  else
    signals.push({ emoji: '🔴', label: 'High Unemployment', detail: `${unemployment.toFixed(1)}% — structural labour challenges`, color: '#ef4444' })

  // Income level
  if (gdpPerCap > 25000)
    signals.push({ emoji: '🟢', label: 'High-Income Economy', detail: `$${gdpPerCap.toLocaleString()} per capita`, color: '#22c55e' })
  else if (gdpPerCap > 5000)
    signals.push({ emoji: '🟡', label: 'Middle-Income Economy', detail: `$${gdpPerCap.toLocaleString()} per capita — development potential`, color: '#FFD166' })
  else if (gdpPerCap > 0)
    signals.push({ emoji: '🔴', label: 'Low-Income Economy', detail: `$${gdpPerCap.toLocaleString()} per capita — frontier market`, color: '#ef4444' })

  // Overall opportunity
  const score = innovation - risk + gdpGrowth * 3
  if (score > 40)
    signals.push({ emoji: '🟢', label: 'High Investment Appeal', detail: 'Strong composite: growth + innovation + low risk', color: '#22c55e' })
  else if (score > 5)
    signals.push({ emoji: '🟡', label: 'Selective Opportunity', detail: 'Moderate composite — selective sector plays', color: '#FFD166' })
  else
    signals.push({ emoji: '🔴', label: 'Elevated Risk Profile', detail: 'Risk factors outweigh current growth signals', color: '#ef4444' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}
      className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02]"
    >
      <p className="text-[10px] text-white/35 uppercase tracking-widest mb-3">Investment Intelligence</p>
      <div className="space-y-2">
        {signals.slice(0, 5).map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.06 }}
            className="flex items-start gap-2.5"
          >
            <span className="text-sm flex-shrink-0 mt-0.5">{s.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium leading-tight" style={{ color: s.color }}>{s.label}</p>
              <p className="text-[10px] text-white/32 mt-0.5 leading-snug">{s.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Business Value section — Who Should Care ────────────────────────────────
function BusinessValueSection({ data, countryName }: { data: CountryData; countryName: string }) {
  const gdpGrowth    = data.gdpGrowth    ?? 0
  const inflation    = data.inflation    ?? 5
  const risk         = data.risk_score   ?? 50
  const innovation   = data.innovationScore ?? 50
  const gdpPerCap    = data.gdpPerCapita ?? 0
  const pop          = data.population_m ?? 0

  type Signal = { icon: string; role: string; color: string; headline: string; detail: string }
  const signals: Signal[] = []

  // Institutional Investors
  if (risk < 30 && gdpGrowth > 3)
    signals.push({ icon: '🏦', role: 'Institutional Investors', color: '#22c55e',
      headline: 'High-conviction entry point',
      detail: `+${gdpGrowth.toFixed(1)}% GDP growth with risk score ${risk}/100 — favourable risk-adjusted returns.` })
  else if (gdpGrowth > 5)
    signals.push({ icon: '🏦', role: 'Institutional Investors', color: '#FFD166',
      headline: 'Growth story, manage risk',
      detail: `${countryName} is one of the fastest-growing economies at +${gdpGrowth.toFixed(1)}%. Risk score ${risk}/100 demands premium.` })
  else if (risk > 65)
    signals.push({ icon: '🏦', role: 'Institutional Investors', color: '#fb923c',
      headline: 'Risk premium required',
      detail: `Risk score ${risk}/100 signals elevated volatility. Hedge exposure; favour hard-currency instruments.` })
  else
    signals.push({ icon: '🏦', role: 'Institutional Investors', color: '#FFD166',
      headline: 'Selective opportunity',
      detail: `Moderate macro at +${gdpGrowth.toFixed(1)}% growth. Sector selection matters; avoid broad index.` })

  // Exporters & Traders
  if (gdpPerCap > 20000 && pop > 20)
    signals.push({ icon: '🚢', role: 'Exporters & Trade Desks', color: '#22c55e',
      headline: 'High-income, high-volume market',
      detail: `$${gdpPerCap.toLocaleString()} per capita with ${pop.toFixed(0)}M consumers — strong demand for premium imports.` })
  else if (gdpGrowth > 5 && pop > 50)
    signals.push({ icon: '🚢', role: 'Exporters & Trade Desks', color: '#FFD166',
      headline: 'Rising demand, rapid middle class',
      detail: `${pop.toFixed(0)}M population expanding at +${gdpGrowth.toFixed(1)}% GDP. Consumer goods and capital equipment in demand.` })
  else
    signals.push({ icon: '🚢', role: 'Exporters & Trade Desks', color: '#fb923c',
      headline: 'Niche opportunity',
      detail: `Market size or growth limits scale. Focus on specialised B2B segments and government procurement.` })

  // Founders & Startups
  if (innovation > 60 && gdpPerCap > 10000)
    signals.push({ icon: '🚀', role: 'Founders & Startups', color: '#22c55e',
      headline: 'Strong ecosystem for scaling',
      detail: `Innovation index ${innovation}/100 with $${gdpPerCap.toLocaleString()} per capita — deep talent pool and addressable market.` })
  else if (pop > 100 && gdpGrowth > 4)
    signals.push({ icon: '🚀', role: 'Founders & Startups', color: '#FFD166',
      headline: 'Large market, early innings',
      detail: `${pop.toFixed(0)}M users growing at +${gdpGrowth.toFixed(1)}% — consumer internet and fintech opportunity at low CAC.` })
  else
    signals.push({ icon: '🚀', role: 'Founders & Startups', color: '#fb923c',
      headline: 'Frontier market — high risk, high reward',
      detail: `Limited ecosystem depth. Bootstrap-friendly; avoid venture-scale burn rates. B2B SaaS and govtech viable.` })

  // Consultants & Advisors
  if (gdpGrowth > 5 || innovation > 65)
    signals.push({ icon: '📊', role: 'Consultants & Advisors', color: '#22c55e',
      headline: 'High advisory demand',
      detail: `Rapid structural change (${countryName} at +${gdpGrowth.toFixed(1)}%) creates demand for strategy, policy, and digital transformation advisory.` })
  else
    signals.push({ icon: '📊', role: 'Consultants & Advisors', color: '#FFD166',
      headline: 'Steady advisory market',
      detail: `Stable macro environment supports compliance, finance, and operational advisory mandates.` })

  // Supply Chain
  if (inflation < 5 && risk < 50)
    signals.push({ icon: '⚙️', role: 'Supply Chain Operators', color: '#22c55e',
      headline: 'Stable sourcing environment',
      detail: `Inflation at ${inflation.toFixed(1)}% with risk score ${risk}/100. Predictable input costs and operational continuity.` })
  else if (inflation > 8)
    signals.push({ icon: '⚙️', role: 'Supply Chain Operators', color: '#ef4444',
      headline: 'Cost pressure & volatility risk',
      detail: `${inflation.toFixed(1)}% inflation erodes margin. Hedge FX, diversify suppliers, or pass costs to downstream contracts.` })
  else
    signals.push({ icon: '⚙️', role: 'Supply Chain Operators', color: '#FFD166',
      headline: 'Manageable — monitor closely',
      detail: `${inflation.toFixed(1)}% inflation and risk score ${risk}/100 warrant quarterly cost reviews. Dual-source critical inputs.` })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="rounded-lg border border-white/[0.05] bg-white/[0.02] overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.04]">
        <p className="text-[10px] text-white/35 uppercase tracking-widest">Who Should Care?</p>
        <span className="text-[8.5px] text-[#FFD166]/30 tracking-wide">Derived from real metrics</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {signals.map((s, i) => (
          <motion.div
            key={s.role}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.52 + i * 0.05 }}
            className="flex items-start gap-3 px-4 py-3"
          >
            <span className="text-base flex-shrink-0 mt-0.5">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[11px] font-semibold text-white/55">{s.role}</p>
                <span className="text-[9px] font-semibold" style={{ color: s.color }}>{s.headline}</span>
              </div>
              <p className="text-[10px] text-white/32 mt-0.5 leading-snug">{s.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Territory info lookup ────────────────────────────────────────────────────
const TERRITORY_INFO: Record<string, {
  type: string; geo: string; note: string; stations?: string; coverage: string
}> = {
  AQ: { type: 'Uninhabited Continent', geo: 'South Pole · 14.2 million km²', note: 'Governed under the Antarctic Treaty System (1959). No permanent civilian population.', stations: '70+ international research stations (COMNAP)', coverage: 'No World Bank economic indicators' },
  GL: { type: 'Autonomous Territory of Denmark', geo: 'North Atlantic & Arctic Ocean', note: 'Largest island on Earth. Self-governing within the Kingdom of Denmark since 2009.', coverage: 'Partially reported within Danish national accounts' },
  GF: { type: 'French Overseas Region', geo: 'Northern South America', note: 'Bordered by Brazil and Suriname. Part of the EU via France.', coverage: 'Included in French national accounts' },
  NC: { type: 'French Special Collectivity', geo: 'South Pacific Ocean', note: 'Major nickel producer. Significant French territory in Melanesia.', coverage: 'Partial — included in French overseas data' },
  PF: { type: 'French Overseas Collectivity', geo: 'South Pacific Ocean', note: 'Includes Tahiti. Tourism and pearl exports dominate the economy.', coverage: 'Partial data available' },
  TF: { type: 'French Southern Territories', geo: 'Southern Indian & Antarctic Ocean', note: 'Uninhabited administrative territory. Important for French EEZ claims.', coverage: 'No economic data published' },
  EH: { type: 'Disputed Territory', geo: 'Northwest Africa', note: 'Administered by Morocco, claimed by the Sahrawi Arab Democratic Republic. Phosphate deposits are economically significant.', coverage: 'Not independently tracked by World Bank' },
  XK: { type: 'Partially Recognised State', geo: 'Southeast Europe · Balkans', note: 'Declared independence from Serbia in 2008. Recognised by ~100 UN members.', coverage: 'Limited World Bank data available' },
  PS: { type: 'Palestinian Territory', geo: 'Levant, Middle East', note: 'Includes West Bank and Gaza Strip. Economy affected by ongoing conflict.', coverage: 'World Bank publishes limited indicators for Palestinian territories' },
  TW: { type: 'Self-Governing Territory', geo: 'East Asia, Pacific Ocean', note: 'High-income economy. Major semiconductor and electronics manufacturer.', coverage: 'Not reported in World Bank dataset (political status)' },
  HK: { type: 'Special Administrative Region of China', geo: 'South China Sea', note: 'Major global financial centre. "One country, two systems" framework.', coverage: 'Reported separately by some organisations; not standard World Bank' },
  MO: { type: 'Special Administrative Region of China', geo: 'South China, Pearl River Delta', note: 'Highest GDP per capita in Asia. Casino and tourism economy.', coverage: 'Limited World Bank reporting' },
  GU: { type: 'US Territory', geo: 'Western Pacific Ocean', note: 'US military strategic hub. Tourism and US federal spending dominate.', coverage: 'Reported within US economic aggregates' },
  PR: { type: 'US Commonwealth Territory', geo: 'Caribbean Sea', note: 'Fiscally autonomous. Large pharmaceutical and manufacturing sector.', coverage: 'Partial World Bank data' },
  VI: { type: 'US Virgin Islands', geo: 'Caribbean Sea', note: 'Tourism-driven economy. US dollar currency.', coverage: 'Reported within US aggregates' },
  CW: { type: 'Constituent Country of Netherlands', geo: 'Southern Caribbean Sea', note: 'Oil refining hub. Part of the Kingdom of the Netherlands.', coverage: 'Limited' },
  SS: { type: 'Sovereign State', geo: 'East-Central Africa', note: 'World\'s newest country (2011). Oil-dependent economy severely affected by conflict.', coverage: 'Very limited World Bank data due to instability' },
}

// ─── No-data state ────────────────────────────────────────────────────────────
function DataUnavailable({ name, countryCode }: { name: string; countryCode?: string }) {
  const info = countryCode ? TERRITORY_INFO[countryCode.toUpperCase()] : undefined
  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <span className="text-3xl opacity-50">🗺</span>
        <div>
          <p className="text-[15px] font-semibold text-white/60">{name}</p>
          {info && <p className="text-[11px] text-[#FFD166]/50 mt-0.5">{info.type}</p>}
        </div>
      </div>

      {/* Geographic info */}
      {info && (
        <div className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02] space-y-3">
          <p className="text-[9px] text-white/28 uppercase tracking-widest">Geographic Information</p>
          <div className="space-y-2 text-[12px] text-white/50">
            <div className="flex gap-2"><span className="text-white/25">📍</span><span>{info.geo}</span></div>
            <p className="text-white/40 leading-relaxed">{info.note}</p>
            {info.stations && (
              <div className="flex gap-2"><span className="text-white/25">🔬</span><span>{info.stations}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Data coverage */}
      <div className="rounded-lg p-4 border border-amber-500/10 bg-amber-500/[0.03]">
        <p className="text-[9px] text-amber-400/40 uppercase tracking-widest mb-2">Data Coverage Status</p>
        <p className="text-[12px] text-white/35 leading-relaxed">
          {info?.coverage ?? 'World Bank does not publish economic indicators for this territory, uninhabited region, or disputed area.'}
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CountryView({
  countryCode, countryName, showNews = false, timelineYear, onCompare,
}: Props) {
  const [data,    setData]    = useState<CountryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true); setData(null)
    const url = timelineYear
      ? `/api/country/${encodeURIComponent(countryCode)}?year=${timelineYear}`
      : `/api/country/${encodeURIComponent(countryCode)}`
    fetch(url)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.country) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [countryCode, timelineYear])

  if (loading) return (
    <div className="p-4 space-y-3">
      {[...Array(7)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-white/[0.03] animate-pulse" />)}
    </div>
  )

  // Detect territories with no economic data
  const hasData = (data?.gdp_billion ?? 0) > 0 || (data?.population_m ?? 0) > 0
  if (!hasData) return <DataUnavailable name={countryName} countryCode={countryCode} />

  const pop        = data?.population_m ?? 0
  const gdp        = data?.gdp_billion  ?? 0
  const risk       = data?.risk_score   ?? 50
  const riskColor  = risk < 30 ? '#22c55e' : risk < 60 ? '#FFD166' : '#FB8500'
  const innovation = data?.innovationScore ?? 0
  // Data vintage — shown on each World Bank stat for transparency
  const wbYear     = data?.dataYear ? ` ${data.dataYear}` : ''
  const wbSrc      = (indicator: string) => `World Bank${wbYear} · ${indicator}`

  return (
    <div className="p-4 space-y-3">

      {/* Meta header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-2">
        {data?.flag && <span className="text-2xl leading-none">{data.flag}</span>}
        <span className="text-[10px] px-2.5 py-1 rounded-full border border-[#FFD166]/20 text-[#FFD166]/60 uppercase tracking-wider">{data?.region ?? 'Unknown'}</span>
        {data?.capital && <span className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-white/35 uppercase tracking-wider">🏛 {data.capital}</span>}
        {data?.currency && <span className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-white/35 tracking-wide">{data.currency}</span>}
        {timelineYear && <span className="text-[10px] px-2.5 py-1 rounded-full border border-[#FFB703]/20 text-[#FFB703]/50 tracking-wide">📅 {timelineYear}</span>}
        {/* Verified data badge — shows actual World Bank vintage year */}
        <span
          className="text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1.5 ml-auto"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', color: '#22c55e' }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3 5.5L6.5 2" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Verified · World Bank{wbYear}
        </span>
      </motion.div>

      {/* Investment signal */}
      <InvestmentBadge risk={risk} />

      {/* Brief Me — inline text executive summary */}
      <BriefSection countryCode={countryCode} countryName={countryName} data={data} />

      {/* Investment Report Generator */}
      <InvestmentReport
        countryCode={countryCode}
        countryName={countryName}
        countryData={data}
        flag={data?.flag ?? ''}
      />

      {/* Compare button */}
      {onCompare && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          onClick={onCompare}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/08 hover:border-[#FFD166]/20 text-white/35 hover:text-white/60 transition-all text-[12px]"
        >
          <span>⚖</span> Compare with another country
        </motion.button>
      )}

      {/* Core macro stats */}
      <div className="grid grid-cols-2 gap-3">
        {pop > 0
          ? <StatCard label="Population" value={pop} suffix="M" delay={0} source={wbSrc('SP.POP.TOTL')} />
          : <Dash label="Population" />}
        {gdp > 0
          ? <StatCard label="GDP" value={parseFloat((gdp / 1000).toFixed(2))} prefix="$" suffix="T" decimals={2} color="#FFD166" delay={80} source={wbSrc('NY.GDP.MKTP.CD')} />
          : <Dash label="GDP" />}
        {data?.gdpPerCapita != null
          ? <StatCard label="GDP / Capita" value={data.gdpPerCapita} prefix="$" delay={160} color="#FFB703" source={wbSrc('NY.GDP.PCAP.CD')} />
          : <Dash label="GDP / Capita" />}
        {data?.gdpGrowth != null
          ? <StatCard label="GDP Growth" value={data.gdpGrowth} suffix="%" decimals={1} delay={240}
              color={data.gdpGrowth >= 0 ? '#22c55e' : '#ef4444'} source={wbSrc('NY.GDP.MKTP.KD.ZG')} />
          : <Dash label="GDP Growth" />}
        {data?.inflation != null
          ? <StatCard label="Inflation (CPI)" value={data.inflation} suffix="%" decimals={1} delay={320}
              color={data.inflation > 8 ? '#FB8500' : data.inflation > 4 ? '#FFD166' : '#22c55e'} source={wbSrc('FP.CPI.TOTL.ZG')} />
          : <Dash label="Inflation" />}
        {data?.unemployment != null
          ? <StatCard label="Unemployment" value={data.unemployment} suffix="%" decimals={1} delay={400}
              color={data.unemployment > 10 ? '#FB8500' : data.unemployment > 6 ? '#FFD166' : '#22c55e'} source={wbSrc('SL.UEM.TOTL.ZS')} />
          : <Dash label="Unemployment" />}
      </div>

      {/* ── ECONOMIC NEWS — placed high so it's seen immediately ── */}
      <AnimatePresence>
        {showNews && (
          <motion.div key="news" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <NewsPanel countryCode={countryCode} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Life expectancy */}
      {data?.lifeExpectancy != null && (
        <BarCard label="Life Expectancy" value={data.lifeExpectancy} max={90} unit=" yrs" delay={450} color="#06b6d4" source={wbSrc('SP.DYN.LE00.IN')} />
      )}

      {/* Risk / Innovation */}
      <BarCard label="Risk Score"       value={risk}       max={100} unit="/100" delay={500} color={riskColor} source="PulseEarth composite · inflation + unemployment + GDP growth" />
      {innovation > 0 && (
        <BarCard label="Innovation Index" value={innovation} max={100} unit="/100" delay={550} color="#FFB703" source="PulseEarth composite · GDP per capita + life expectancy" />
      )}

      {/* ── WHO SHOULD CARE — business value signals ── */}
      {data && <BusinessValueSection data={data} countryName={countryName} />}

      {/* ── INVESTMENT INTELLIGENCE — 🟢🟡🔴 signals ── */}
      <InvestmentIntelligence data={data} countryName={countryName} />

      {/* Trade Intelligence */}
      <TradePanel countryCode={countryCode} />

      {/* City hubs */}
      {data?.cities && data.cities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02]"
        >
          <p className="text-[10px] text-white/35 uppercase tracking-widest mb-3">Economic Hubs</p>
          <div className="space-y-2.5">
            {data.cities.slice(0, 6).map((city, i) => (
              <motion.div
                key={city.cityId}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.58 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-[13px] text-white/65 flex-1">{city.name}</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-0.5 rounded-full"
                    style={{ width: `${Math.round(city.pulse_intensity * 64)}px`, background: `rgba(255,209,102,${0.2 + city.pulse_intensity * 0.8})` }} />
                  <span className="text-[10px] text-white/25 w-6 text-right">{Math.round(city.pulse_intensity * 100)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Economic Intelligence */}
      <InsightStream entityId={`${countryCode}:${countryName}`} entityType="country" countryData={data} />
    </div>
  )
}
