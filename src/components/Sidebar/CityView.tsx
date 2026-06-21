'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import InsightStream from './InsightStream'
import type { CityMetrics } from '@/types/city'

export default function CityView({ cityId }: { cityId: string }) {
  const [city, setCity] = useState<CityMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true); setCity(null)
    fetch(`/api/city/${encodeURIComponent(cityId)}`)
      .then(r => r.json())
      .then(d => { if (d.success) setCity(d.city) })
      .finally(() => setLoading(false))
  }, [cityId])

  if (loading) return (
    <div className="p-4 space-y-3">
      {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-white/[0.03] animate-pulse" />)}
    </div>
  )
  if (!city) return <p className="p-6 text-center text-white/30 text-sm">City intelligence unavailable.</p>

  const riskColor  = city.risk_score < 30 ? '#22c55e' : city.risk_score < 60 ? '#FFD166' : '#FB8500'
  const pulseColor = `rgba(255,${Math.round(209 * city.pulse_intensity)},${Math.round(102 * city.pulse_intensity)},1)`

  // Derived scores (computed from DynamoDB city data)
  const startupScore = Math.min(100, Math.round(
    (city.startup_count / 50) * 40 + (city.gdp_billion / 300) * 30 + city.pulse_intensity * 30
  ))
  const econScore = Math.min(100, Math.round(
    city.pulse_intensity * 35 + (city.gdp_billion / 500) * 35 + (100 - city.risk_score) * 0.30
  ))
  const growthSignal = city.pulse_intensity > 0.7 ? 'High Growth' : city.pulse_intensity > 0.45 ? 'Moderate Growth' : 'Stable'
  const growthColor  = city.pulse_intensity > 0.7 ? '#22c55e' : city.pulse_intensity > 0.45 ? '#FFD166' : '#94a3b8'

  return (
    <div className="p-4 space-y-3">

      {/* Pulse hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-4 border border-[#FFD166]/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex items-center gap-4"
      >
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="absolute inset-0 rounded-full animate-ping opacity-40"
            style={{ background: pulseColor }} />
          <div className="absolute inset-0 rounded-full animate-pulse"
            style={{ background: `radial-gradient(circle,${pulseColor} 0%,transparent 70%)` }} />
          <div className="absolute inset-2 rounded-full"
            style={{ background: pulseColor }} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-white/35 uppercase tracking-widest mb-0.5">Economic Pulse</p>
          <p className="text-2xl font-bold text-[#FFD166] tabular-nums">
            {Math.round(city.pulse_intensity * 100)}
            <span className="text-xs text-white/30 font-normal ml-1">/ 100</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
            style={{ color: growthColor, background: `${growthColor}18`, border: `1px solid ${growthColor}30` }}>
            {growthSignal}
          </span>
        </div>
      </motion.div>

      {/* Core metrics grid — estimated values, not official statistics */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'GDP (Est.)', value: `~$${city.gdp_billion}B`, color: '#FFD166' },
          { label: 'Population (Est.)', value: `~${city.population_m}M`, color: '#FFD166' },
          { label: 'Startups (Est.)', value: `~${city.startup_count.toLocaleString()}`, color: '#FB8500' },
          { label: 'Trade Volume (Est.)', value: `~$${city.trade_volume_b}B`, color: '#FFB703' },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02]"
          >
            <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1.5">{label}</p>
            <p className="text-lg font-bold" style={{ color }}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Score bars */}
      {[
        { label: 'Startup Ecosystem', value: startupScore, color: '#FB8500' },
        { label: 'Economic Score',    value: econScore,    color: '#FFB703' },
        { label: 'Geopolitical Risk', value: city.risk_score, color: riskColor, invert: true },
      ].map(({ label, value, color, invert }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 + i * 0.06 }}
          className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02]"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/35 uppercase tracking-widest">{label}</p>
            <span className="text-sm font-bold" style={{ color }}>
              {value}/100 {invert && value < 30 && '✓'}
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${value}%` }}
              transition={{ delay: 0.35 + i * 0.08, duration: 0.9, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg,${color}88,${color})` }}
            />
          </div>
        </motion.div>
      ))}

      {/* Derived metrics — calculated from estimated base figures */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.40 }}
        className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02]"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-white/35 uppercase tracking-widest">City Intelligence</p>
          <span className="text-[8px] text-white/20 tracking-wide">derived from estimates</span>
        </div>
        <div className="space-y-2 text-[12px] text-white/55">
          <div className="flex items-center justify-between">
            <span>GDP per capita (est.)</span>
            <span className="text-[#FFD166] font-medium">
              ~${city.population_m > 0 ? Math.round(city.gdp_billion * 1000 / city.population_m / 1000) : '—'}K
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Startup density (est.)</span>
            <span className="text-[#FB8500] font-medium">
              ~{city.population_m > 0 ? Math.round(city.startup_count / city.population_m) : '—'} / 1M pop.
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Trade per capita (est.)</span>
            <span className="text-[#FFB703] font-medium">
              ~${city.population_m > 0 ? Math.round(city.trade_volume_b * 1000 / city.population_m / 1000) : '—'}K
            </span>
          </div>
        </div>
        <p className="text-[8.5px] text-white/18 mt-3 leading-relaxed">
          City-level metrics are estimates for contextual reference. For verified national data, view the country dashboard.
        </p>
      </motion.div>

      {/* AI city intelligence brief */}
      <InsightStream entityId={cityId} entityType="city" cityCountry={city.country} />
    </div>
  )
}
