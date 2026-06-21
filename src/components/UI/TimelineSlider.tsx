'use client'

import { motion } from 'framer-motion'

interface Props {
  year: number
  onChange: (year: number) => void
}

const MARKS = [2015, 2017, 2019, 2021, 2023, 2025]

export default function TimelineSlider({ year, onChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 glass border border-[#FFD166]/12 rounded-2xl px-6 py-4 shadow-2xl"
      style={{ width: 340 }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] text-[#FFD166]/45 uppercase tracking-[0.22em]">
          Historical Timeline
        </p>
        <span className="text-sm font-bold text-[#FFD166] tabular-nums">{year}</span>
      </div>

      <input
        type="range"
        min={2015}
        max={2025}
        step={1}
        value={year}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: '#FFD166' }}
      />

      <div className="flex justify-between mt-2">
        {MARKS.map(m => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`text-[9px] tabular-nums transition-colors ${
              m === year ? 'text-[#FFD166]/75 font-medium' : 'text-white/18 hover:text-white/40'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <p className="text-[9px] text-white/20 mt-2 text-center">
        Data from World Bank · click a country to reload
      </p>
    </motion.div>
  )
}
