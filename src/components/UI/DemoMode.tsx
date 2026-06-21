'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SelectedEntity } from '@/types/globe'

// ── Showcase countries for the demo cycle ──────────────────────────────────
const SHOWCASE: {
  code: string; name: string; lat: number; lng: number; altitude: number
  headline: string
}[] = [
  { code: 'US', name: 'United States', lat: 38.9, lng: -77.0, altitude: 1.6,
    headline: "World's largest economy · $27T GDP" },
  { code: 'CN', name: 'China',         lat: 39.9, lng: 116.4, altitude: 1.5,
    headline: "World's 2nd largest economy · $18T GDP · global manufacturing hub" },
  { code: 'IN', name: 'India',         lat: 20.6, lng: 78.9,  altitude: 1.7,
    headline: "Fastest-growing G20 economy · 1.4B people · IT powerhouse" },
  { code: 'AE', name: 'UAE',           lat: 23.4, lng: 53.8,  altitude: 1.4,
    headline: "Global trade hub · AAA-rated financial centre · Vision 2031" },
  { code: 'DE', name: 'Germany',       lat: 51.2, lng: 10.4,  altitude: 1.5,
    headline: "Europe's largest economy · industrial powerhouse · export leader" },
  { code: 'SG', name: 'Singapore',     lat: 1.35, lng: 103.8, altitude: 1.2,
    headline: "Asia-Pacific's financial gateway · AAA sovereign rating · open economy" },
]

const DWELL_MS   = 11_000   // how long on each country
const ADVANCE_MS = 800      // fade between countries

interface Props {
  onSelectCountry: (entity: SelectedEntity, lat: number, lng: number, altitude: number) => void
  isActive: boolean
  onStop: () => void
}

export default function DemoMode({ onSelectCountry, isActive, onStop }: Props) {
  const [currentIdx, setCurrentIdx]         = useState(0)
  const [progress,   setProgress]           = useState(0)
  const [transitioning, setTransitioning]   = useState(false)
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef  = useRef<number>(0)

  const navigateTo = useCallback((idx: number) => {
    const c = SHOWCASE[idx]
    setTransitioning(true)
    setTimeout(() => {
      onSelectCountry(
        { id: c.code, type: 'country', name: c.name, countryCode: c.code, lat: c.lat, lng: c.lng },
        c.lat, c.lng, c.altitude,
      )
      setCurrentIdx(idx)
      setProgress(0)
      startTimeRef.current = Date.now()
      setTransitioning(false)
    }, ADVANCE_MS)
  }, [onSelectCountry])

  // Kick off the cycle when demo becomes active
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current)  clearInterval(intervalRef.current)
      if (progressRef.current)  clearInterval(progressRef.current)
      return
    }

    // Navigate to first country immediately
    navigateTo(0)

    // Progress ticker (every 80ms)
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      setProgress(Math.min(100, (elapsed / DWELL_MS) * 100))
    }, 80)

    // Country-change timer
    intervalRef.current = setInterval(() => {
      setCurrentIdx(prev => {
        const next = (prev + 1) % SHOWCASE.length
        navigateTo(next)
        return prev  // navigateTo will set the real idx after transition
      })
    }, DWELL_MS)

    return () => {
      if (intervalRef.current)  clearInterval(intervalRef.current)
      if (progressRef.current)  clearInterval(progressRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  if (!isActive) return null

  const current = SHOWCASE[currentIdx]

  return (
    <AnimatePresence>
      <motion.div
        key="demo-overlay"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        style={{ width: 520 }}
      >
        <div
          className="rounded-2xl px-5 py-3.5 pointer-events-auto"
          style={{
            background: 'linear-gradient(135deg,rgba(8,14,28,0.97) 0%,rgba(4,8,18,0.97) 100%)',
            border: '1px solid rgba(255,209,102,0.22)',
            boxShadow: '0 20px 64px rgba(0,0,0,0.80), 0 0 0 1px rgba(255,209,102,0.06)',
          }}
        >
          {/* Top row */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative w-2 h-2 rounded-full bg-[#FFD166]">
                <div className="absolute inset-0 rounded-full bg-[#FFD166] animate-ping opacity-60" />
              </div>
              <span className="text-[9.5px] text-[#FFD166]/60 uppercase tracking-[0.22em] font-medium">
                Demo Mode · Live Showcase
              </span>
            </div>
            <button
              onClick={onStop}
              className="text-[10px] text-white/25 hover:text-white/60 transition-colors uppercase tracking-wider"
            >
              Stop ×
            </button>
          </div>

          {/* Country + headline */}
          <AnimatePresence mode="wait">
            {!transitioning && (
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-baseline gap-3 mb-0.5">
                  <h2 className="text-[20px] font-bold text-white leading-none">{current.name}</h2>
                  <span className="text-[11px] text-white/35">{current.code}</span>
                </div>
                <p className="text-[11px] text-white/40">{current.headline}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <div className="mt-3 h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#FFD166]"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.08, ease: 'linear' }}
            />
          </div>

          {/* Country dots */}
          <div className="flex items-center gap-1.5 mt-2.5 justify-center">
            {SHOWCASE.map((c, i) => (
              <button
                key={c.code}
                onClick={() => navigateTo(i)}
                className="transition-all"
                style={{
                  width: i === currentIdx ? 18 : 5,
                  height: 5,
                  borderRadius: 3,
                  background: i === currentIdx ? '#FFD166' : 'rgba(255,209,102,0.22)',
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
