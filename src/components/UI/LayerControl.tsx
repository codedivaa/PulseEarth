'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LayerState } from '@/types/layers'

interface Props {
  layers: LayerState
  onToggle: (layer: keyof LayerState) => void
}

const LAYERS: { key: keyof LayerState; label: string; icon: string; desc: string }[] = [
  { key: 'heatmap',     label: 'Economic Heatmap',   icon: '🌡', desc: 'GDP per capita gradient' },
  { key: 'tradeRoutes', label: 'Trade Routes',        icon: '✈',  desc: 'Major bilateral flows' },
  { key: 'cityNetwork', label: 'City Network',        icon: '🏙', desc: 'Economic hub connections' },
  { key: 'investment',  label: 'Investment Signal',   icon: '💡', desc: 'Risk-opportunity overlay' },
  { key: 'news',        label: 'Economic News',       icon: '📰', desc: 'AI-curated country insights' },
  { key: 'timeline',    label: 'Historical Timeline', icon: '📅', desc: 'Year slider 2015–2025' },
]

export default function LayerControl({ layers, onToggle }: Props) {
  const [open, setOpen] = useState(false)
  const activeCount = (Object.keys(layers) as (keyof LayerState)[]).filter(k => layers[k]).length

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.65 }}
      className="absolute left-5 top-1/2 -translate-y-1/2 z-30"
    >
      {/* Toggle handle */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Intelligence Layers"
        className="relative w-10 h-10 glass rounded-xl border border-[#FFD166]/12 hover:border-[#FFD166]/35 flex items-center justify-center transition-all shadow-lg"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3"    width="12" height="1.5" rx="0.75" fill="rgba(255,209,102,0.55)" />
          <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" fill="rgba(255,209,102,0.55)" />
          <rect x="2" y="11.5" width="12" height="1.5" rx="0.75" fill="rgba(255,209,102,0.55)" />
          <circle cx="5.5"  cy="3.75"  r="1.5" fill="#FFD166" />
          <circle cx="10.5" cy="8"     r="1.5" fill="#FFD166" />
          <circle cx="6.5"  cy="12.25" r="1.5" fill="#FFD166" />
        </svg>
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFD166] text-[9px] text-black font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="absolute left-12 top-1/2 -translate-y-1/2 glass border border-[#FFD166]/12 rounded-2xl p-4 w-60 shadow-2xl"
          >
            <p className="text-[9px] text-[#FFD166]/40 uppercase tracking-[0.22em] mb-3 px-0.5">
              Intelligence Layers
            </p>
            <div className="space-y-1">
              {LAYERS.map(({ key, label, icon, desc }) => {
                const active = layers[key]
                return (
                  <button
                    key={key}
                    onClick={() => onToggle(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                      active
                        ? 'bg-[#FFD166]/[0.07] border border-[#FFD166]/18'
                        : 'border border-transparent hover:bg-white/[0.025]'
                    }`}
                  >
                    <span className="text-sm leading-none flex-shrink-0 w-4 text-center">
                      {icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-medium leading-tight ${active ? 'text-[#FFD166]' : 'text-white/50'}`}>
                        {label}
                      </p>
                      <p className="text-[9px] text-white/22 truncate leading-tight mt-0.5">
                        {desc}
                      </p>
                    </div>
                    {/* Mini toggle switch */}
                    <div
                      className={`rounded-full transition-colors flex-shrink-0 relative ${
                        active ? 'bg-[#FFD166]/75' : 'bg-white/12'
                      }`}
                      style={{ width: 28, height: 16 }}
                    >
                      <div
                        className={`absolute top-[3px] w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-all ${
                          active ? 'left-[15px]' : 'left-[3px]'
                        }`}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
