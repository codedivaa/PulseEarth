'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { CountryData } from '@/types/country'

interface Props {
  codeA: string
  nameA: string
  codeB: string
  nameB: string
  onClose: () => void
}

function getFlagEmoji(code?: string): string {
  if (!code || code.length !== 2) return '🌍'
  try { return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))) }
  catch { return '🌍' }
}

function useCountry(code: string) {
  const [data, setData] = useState<CountryData | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!code) { setLoading(false); return }
    setLoading(true); setData(null)
    fetch(`/api/country/${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.country) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [code])
  return { data, loading }
}

// ── Metric row: value A  [←bar][bar→]  value B  (bars grow from centre outward)
interface MetricRowProps {
  label: string
  a: number | null | undefined
  b: number | null | undefined
  suffix?: string
  prefix?: string
  decimals?: number
  higherIsBetter?: boolean
}

function MetricRow({ label, a, b, suffix = '', prefix = '', decimals = 0, higherIsBetter = true }: MetricRowProps) {
  const fmt = (v: number | null | undefined) => {
    if (v == null) return '—'
    const n = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
    return `${prefix}${n}${suffix}`
  }

  const aNum = a ?? null
  const bNum = b ?? null
  const diff = aNum != null && bNum != null ? aNum - bNum : null
  const aWins = diff != null ? (higherIsBetter ? diff > 0 : diff < 0) : null
  const bWins = diff != null ? (higherIsBetter ? diff < 0 : diff > 0) : null

  const maxVal = Math.max(Math.abs(aNum ?? 0), Math.abs(bNum ?? 0), 0.001)
  const aPct = aNum != null ? Math.min(100, (Math.abs(aNum) / maxVal) * 100) : 0
  const bPct = bNum != null ? Math.min(100, (Math.abs(bNum) / maxVal) * 100) : 0

  const aColor = aWins ? '#FFD166' : 'rgba(255,255,255,0.22)'
  const bColor = bWins ? '#FFB703' : 'rgba(255,255,255,0.22)'

  return (
    <div className="py-2.5 border-b border-white/[0.04] last:border-0">
      <p className="text-[9px] text-white/28 uppercase tracking-widest text-center mb-2">{label}</p>
      <div className="flex items-center gap-0">

        {/* Country A — value right-aligned, bar grows toward centre (RTL) */}
        <div className="flex-1 flex items-center justify-end gap-2 pr-2">
          <span
            className="text-[12px] font-bold tabular-nums"
            style={{ color: aWins ? '#FFD166' : 'rgba(255,255,255,0.58)' }}
          >
            {fmt(aNum)}
          </span>
          {/* Bar container: RTL so bar anchors at right (centre) */}
          <div className="w-16 h-[3px] bg-white/[0.07] rounded-full overflow-hidden" style={{ direction: 'rtl' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${aPct}%`, background: aColor }}
            />
          </div>
        </div>

        {/* Centre divider */}
        <div className="w-px h-6 bg-white/[0.10] flex-shrink-0" />

        {/* Country B — bar grows toward centre (LTR), value left-aligned */}
        <div className="flex-1 flex items-center gap-2 pl-2">
          <div className="w-16 h-[3px] bg-white/[0.07] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${bPct}%`, background: bColor }}
            />
          </div>
          <span
            className="text-[12px] font-bold tabular-nums"
            style={{ color: bWins ? '#FFB703' : 'rgba(255,255,255,0.58)' }}
          >
            {fmt(bNum)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Investment score helper ────────────────────────────────────────────────────
function investScore(d: CountryData): number {
  return (d.innovationScore ?? 50) - (d.risk_score ?? 50) + (d.gdpGrowth ?? 0) * 2
}

export default function ComparePanel({ codeA, nameA, codeB, nameB, onClose }: Props) {
  const A = useCountry(codeA)
  const B = useCountry(codeB)

  const flagA = getFlagEmoji(codeA)
  const flagB = getFlagEmoji(codeB)
  const loading = A.loading || B.loading

  return (
    <div className="flex flex-col h-full">

      {/* Column headers (sticky) */}
      <div className="flex items-center px-4 py-3 border-b border-white/[0.05] flex-shrink-0 bg-[rgba(5,5,5,0.60)]">
        {/* A label */}
        <div className="flex-1 flex items-center justify-end gap-2 pr-3">
          <span className="text-[12px] font-semibold text-[#FFD166]/80 truncate">{nameA}</span>
          <span className="text-lg">{flagA}</span>
        </div>
        <div className="w-px h-5 bg-white/10 flex-shrink-0" />
        {/* B label */}
        <div className="flex-1 flex items-center gap-2 pl-3">
          <span className="text-lg">{flagB}</span>
          <span className="text-[12px] font-semibold text-[#FFB703]/80 truncate">{nameB}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex-1 overflow-y-auto px-4 py-1">
        {loading ? (
          <div className="space-y-3 pt-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-10 bg-white/[0.03] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

            <MetricRow
              label="GDP"
              a={A.data?.gdp_billion ? A.data.gdp_billion / 1000 : null}
              b={B.data?.gdp_billion ? B.data.gdp_billion / 1000 : null}
              prefix="$" suffix="T" decimals={2}
            />
            <MetricRow
              label="Population"
              a={A.data?.population_m} b={B.data?.population_m}
              suffix="M"
            />
            <MetricRow
              label="GDP per Capita"
              a={A.data?.gdpPerCapita} b={B.data?.gdpPerCapita}
              prefix="$"
            />
            <MetricRow
              label="GDP Growth"
              a={A.data?.gdpGrowth} b={B.data?.gdpGrowth}
              suffix="%" decimals={1}
            />
            <MetricRow
              label="Inflation"
              a={A.data?.inflation} b={B.data?.inflation}
              suffix="%" decimals={1} higherIsBetter={false}
            />
            <MetricRow
              label="Unemployment"
              a={A.data?.unemployment} b={B.data?.unemployment}
              suffix="%" decimals={1} higherIsBetter={false}
            />
            <MetricRow
              label="Life Expectancy"
              a={A.data?.lifeExpectancy} b={B.data?.lifeExpectancy}
              suffix=" yrs" decimals={1}
            />
            <MetricRow
              label="Risk Score  (lower = better)"
              a={A.data?.risk_score} b={B.data?.risk_score}
              suffix="/100" higherIsBetter={false}
            />
            <MetricRow
              label="Innovation Index"
              a={A.data?.innovationScore} b={B.data?.innovationScore}
              suffix="/100"
            />

            {/* Investment verdict */}
            {A.data && B.data && (() => {
              const sA = investScore(A.data!)
              const sB = investScore(B.data!)
              const aWins = sA >= sB
              return (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="mt-4 rounded-xl p-4 border border-[#FFD166]/12 bg-[#FFD166]/[0.04]"
                >
                  <p className="text-[9px] text-[#FFD166]/40 uppercase tracking-widest mb-2">Investment Verdict</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{aWins ? flagA : flagB}</span>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: aWins ? '#FFD166' : '#FFB703' }}>
                        {aWins ? nameA : nameB}
                      </p>
                      <p className="text-[11px] text-white/45 mt-0.5">
                        Stronger composite signals — growth, risk, and innovation.
                      </p>
                    </div>
                    <span
                      className="ml-auto text-[11px] font-bold tabular-nums px-2.5 py-1 rounded-full"
                      style={{
                        color: aWins ? '#FFD166' : '#FFB703',
                        background: aWins ? 'rgba(255,209,102,0.08)' : 'rgba(255,183,3,0.08)',
                        border: `1px solid ${aWins ? 'rgba(255,209,102,0.22)' : 'rgba(255,183,3,0.22)'}`,
                      }}
                    >
                      {Math.round(Math.abs(sA - sB))} pt edge
                    </span>
                  </div>
                </motion.div>
              )
            })()}

            {/* Loading state for one side */}
            {(!A.data || !B.data) && !loading && (
              <p className="text-center text-[12px] text-white/28 py-6">
                Data unavailable for one or both countries.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
