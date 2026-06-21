'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { CountryData } from '@/types/country'

interface Props {
  entityId: string
  entityType: 'city' | 'country'
  countryData?: CountryData | null
  cityCountry?: string
}

export default function InsightStream({ entityId, entityType, countryData, cityCountry }: Props) {
  const [text, setText] = useState('')
  const [streaming, setStreaming] = useState(true)

  useEffect(() => {
    setText('')
    setStreaming(true)
    const ctrl = new AbortController()

    // Build URL with real data params so the AI prompt is grounded
    const p = new URLSearchParams({ type: entityType })

    if (entityType === 'country' && countryData) {
      const d = countryData
      if (d.region)          p.set('region', d.region)
      if (d.capital)         p.set('capital', d.capital)
      if (d.currency)        p.set('currency', d.currency)
      if (d.population_m)    p.set('population', String(d.population_m))
      if (d.gdp_billion)     p.set('gdp', String(d.gdp_billion))
      if (d.gdpGrowth != null)     p.set('gdpGrowth', String(d.gdpGrowth))
      if (d.gdpPerCapita != null)  p.set('gdpPerCapita', String(d.gdpPerCapita))
      if (d.inflation != null)     p.set('inflation', String(d.inflation))
      if (d.unemployment != null)  p.set('unemployment', String(d.unemployment))
      if (d.lifeExpectancy != null) p.set('lifeExpectancy', String(d.lifeExpectancy))
      if (d.risk_score != null)    p.set('risk', String(d.risk_score))
    }

    if (entityType === 'city' && cityCountry) {
      p.set('country', cityCountry)
    }

    // 20s hard timeout — never stays loading forever
    const timer = setTimeout(() => ctrl.abort(), 20000)

    fetch(`/api/insight/${encodeURIComponent(entityId)}?${p.toString()}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok || !res.body) return
        const reader = res.body.getReader()
        const dec = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          setText(prev => prev + dec.decode(value))
        }
      })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); setStreaming(false) })

    return () => ctrl.abort()
  }, [entityId, entityType, countryData, cityCountry])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-1 rounded-lg p-4 border border-[#FFD166]/08 bg-white/[0.02]"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD166] animate-pulse flex-shrink-0" />
        <p className="text-[10px] text-[#FFD166]/50 uppercase tracking-[0.18em]">AI Economic Intelligence</p>
        {streaming && <span className="ml-auto text-[10px] text-white/20">analyzing</span>}
      </div>
      <p className="text-[13px] text-white/65 leading-relaxed">
        {text || <span className="text-white/20">Analyzing economic signals...</span>}
        {streaming && text && (
          <span className="inline-block w-0.5 h-3.5 bg-[#FFD166]/60 ml-0.5 animate-pulse align-middle" />
        )}
      </p>
    </motion.div>
  )
}
