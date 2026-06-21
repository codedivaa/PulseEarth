'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SelectedEntity } from '@/types/globe'

interface Result {
  id: string
  name: string
  subtitle: string
  lat: number
  lng: number
  type: 'city' | 'country' | 'capital'
  countryCode?: string
  flag?: string
}
interface Props { onSelect: (lat: number, lng: number, entity: SelectedEntity) => void }

const TYPE_COLORS: Record<string, string> = {
  country: 'text-[#FFD166]/60 border-[#FFD166]/25',
  capital: 'text-[#FB8500]/60 border-[#FB8500]/25',
  city:    'text-white/35   border-white/15',
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const d = await r.json()
        setResults(d.results || [])
      } finally { setLoading(false) }
    }, 280)
    return () => clearTimeout(t)
  }, [query])

  const pick = (r: Result) => {
    setQuery('')
    setResults([])
    setOpen(false)

    // For capitals, treat them as countries in the sidebar (open country panel)
    const entityType: SelectedEntity['type'] =
      r.type === 'capital' ? 'country' : r.type

    const entityId = r.type === 'capital' && r.countryCode
      ? r.countryCode
      : r.id

    onSelect(r.lat, r.lng, {
      id: entityId,
      type: entityType,
      name: r.name.replace(/^\S+\s/, ''), // strip leading emoji
      countryCode: r.countryCode,
      lat: r.lat,
      lng: r.lng,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="absolute top-5 left-1/2 -translate-x-1/2 w-[380px] max-w-[88vw] z-30"
    >
      <div className="relative flex items-center">
        <svg className="absolute left-3.5 w-3.5 h-3.5 text-[#FFD166]/35 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search countries, capitals, cities..."
          className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-white/75 placeholder-white/20 outline-none border border-[#FFD166]/0 focus:border-[#FFD166]/20 transition-all"
        />
        {loading && (
          <div className="absolute right-3.5 w-3 h-3 border border-[#FFD166]/30 border-t-[#FFD166]/70 rounded-full animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1.5 w-full glass rounded-xl overflow-hidden border border-[#FFD166]/10"
          >
            {results.map((r, i) => (
              <button
                key={`${r.type}-${r.id ?? i}`}
                onMouseDown={() => pick(r)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFD166]/[0.04] transition-colors border-b border-[#FFD166]/[0.04] last:border-0 text-left"
              >
                <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wide flex-shrink-0 ${TYPE_COLORS[r.type] ?? TYPE_COLORS.city}`}>
                  {r.type}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] text-white/75 truncate">{r.name}</p>
                  <p className="text-[11px] text-white/28 truncate">{r.subtitle}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
