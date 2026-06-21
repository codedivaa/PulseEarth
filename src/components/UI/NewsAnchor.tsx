'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SelectedEntity } from '@/types/globe'
import type { CountryData } from '@/types/country'
import type { AnchorBriefing } from '@/app/api/anchor/[countryCode]/route'

// ── Presenter SVG — portrait-style, compact (for 88px display width) ─────────
function PresenterSVG({ isOnAir }: { isOnAir: boolean }) {
  return (
    <svg viewBox="0 0 88 116" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="ps-bg" cx="50%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#152238" />
          <stop offset="100%" stopColor="#060e1c" />
        </radialGradient>
        <radialGradient id="ps-face" cx="48%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#f8cead" />
          <stop offset="65%" stopColor="#eaaa78" />
          <stop offset="100%" stopColor="#d4956a" />
        </radialGradient>
        <linearGradient id="ps-hair" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#331608" />
          <stop offset="100%" stopColor="#110600" />
        </linearGradient>
        <linearGradient id="ps-suit" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a3560" />
          <stop offset="100%" stopColor="#0c1d38" />
        </linearGradient>
        <linearGradient id="ps-desk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0c1e34" />
          <stop offset="100%" stopColor="#050d18" />
        </linearGradient>
        <radialGradient id="ps-light" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="rgba(255,220,150,0.10)" />
          <stop offset="100%" stopColor="rgba(255,220,150,0)" />
        </radialGradient>
      </defs>

      {/* Studio backdrop */}
      <rect width="88" height="116" fill="url(#ps-bg)" />
      <rect width="88" height="116" fill="url(#ps-light)" />

      {/* Desk */}
      <path d="M0,90 L88,90 L88,116 L0,116 Z" fill="url(#ps-desk)" />
      <line x1="0" y1="90" x2="88" y2="90" stroke="rgba(255,209,102,0.18)" strokeWidth="0.5" />

      {/* Suit body */}
      <path d="M8,85 Q24,68 44,64 Q64,68 80,85 L88,116 L0,116 Z" fill="url(#ps-suit)" />
      {/* Lapels */}
      <path d="M37,70 L44,64 L51,70 L49,84 L39,84 Z" fill="rgba(255,255,255,0.07)" />
      <path d="M40,72 L44,64 L48,72 L47,82 L41,82 Z" fill="rgba(255,255,255,0.07)" />

      {/* Neck */}
      <rect x="37" y="54" width="14" height="13" rx="5" fill="url(#ps-face)" />

      {/* Face */}
      <ellipse cx="44" cy="36" rx="21" ry="23" fill="url(#ps-face)" />

      {/* Hair — back */}
      <path d="M23,33 Q23,13 44,11 Q65,13 65,33 Q66,22 62,15 Q54,6 44,5 Q34,6 26,15 Q22,22 23,33 Z" fill="url(#ps-hair)" />
      {/* Hair sides */}
      <path d="M23,31 Q19,40 21,52 Q23,58 27,62 Q25,52 26,44 Q24,37 25,31 Z" fill="url(#ps-hair)" />
      <path d="M65,31 Q69,40 67,52 Q65,58 61,62 Q63,52 62,44 Q64,37 63,31 Z" fill="url(#ps-hair)" />

      {/* Ears */}
      <ellipse cx="24" cy="37" rx="2.8" ry="3.8" fill="#eaaa78" />
      <ellipse cx="64" cy="37" rx="2.8" ry="3.8" fill="#eaaa78" />
      {/* Earrings */}
      <circle cx="23" cy="39" r="1.4" fill="#FFD166" opacity="0.9" />
      <circle cx="65" cy="39" r="1.4" fill="#FFD166" opacity="0.9" />

      {/* Eyebrows */}
      <path d="M30,27 Q36,24 41,27" stroke="#331608" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M47,27 Q52,24 58,27" stroke="#331608" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="36" cy="33" rx="5" ry="3.8" fill="white" />
      <ellipse cx="52" cy="33" rx="5" ry="3.8" fill="white" />
      <circle cx="37" cy="33.5" r="2.8" fill="#4a2810" />
      <circle cx="53" cy="33.5" r="2.8" fill="#4a2810" />
      <circle cx="37" cy="33.5" r="1.6" fill="#110604" />
      <circle cx="53" cy="33.5" r="1.6" fill="#110604" />
      <circle cx="38" cy="32" r="0.9" fill="white" opacity="0.95" />
      <circle cx="54" cy="32" r="0.9" fill="white" opacity="0.95" />
      {/* Lash line */}
      <path d="M31,30 Q36,27 41,30" stroke="#220e06" strokeWidth="1.2" fill="none" />
      <path d="M47,30 Q52,27 57,30" stroke="#220e06" strokeWidth="1.2" fill="none" />

      {/* Nose */}
      <path d="M41,42 Q40,46 39,48 Q44,49 49,48 Q48,46 47,42 Z" fill="rgba(160,90,55,0.20)" />

      {/* Lips */}
      <path d="M37,51 Q40,48 44,51 Q48,48 51,51 Q48,55 44,54 Q40,55 37,51 Z" fill="#a84535" />
      <path d="M39,51 Q44,53 49,51" stroke="rgba(240,170,150,0.30)" strokeWidth="0.6" fill="none" />

      {/* Blush */}
      <ellipse cx="32" cy="42" rx="7" ry="4" fill="rgba(220,90,70,0.06)" />
      <ellipse cx="56" cy="42" rx="7" ry="4" fill="rgba(220,90,70,0.06)" />

      {/* Microphone — lapel */}
      <rect x="49" y="72" width="3.5" height="6" rx="1.75" fill="#888" opacity="0.85" />

      {/* Lower third */}
      <rect x="4" y="94" width="56" height="16" rx="3" fill="rgba(255,209,102,0.07)" stroke="rgba(255,209,102,0.18)" strokeWidth="0.5" />
      <text x="32" y="103.5" textAnchor="middle" fill="#FFD166" fontSize="5" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="700" letterSpacing="1.2">PULSEEARTH</text>
      <text x="32" y="108" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="3.8" fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="0.5">ECONOMIC INTELLIGENCE</text>

      {/* LIVE badge */}
      <rect x="64" y="94" width="20" height="16" rx="3" fill="rgba(239,68,68,0.10)" stroke="rgba(239,68,68,0.28)" strokeWidth="0.5" />
      <circle cx="69" cy="100" r="2" fill="#ef4444">
        {isOnAir && (
          <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
        )}
      </circle>
      <text x="76" y="103.5" textAnchor="middle" fill="#ef4444" fontSize="4.5" fontFamily="system-ui,-apple-system,sans-serif" fontWeight="700">LIVE</text>
      <text x="74" y="108" textAnchor="middle" fill="rgba(255,255,255,0.30)" fontSize="3.5" fontFamily="system-ui,-apple-system,sans-serif">ON AIR</text>
    </svg>
  )
}

// ── Audio waveform — zero React warnings (individual animation properties) ────
const BAR_HEIGHTS = [2, 6, 4, 9, 5, 8, 3, 10, 5, 7, 3, 8, 5, 6, 2]

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[1.5px] h-4" aria-hidden="true">
      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-[1.5px] rounded-full bg-[#FFD166]"
          style={{
            height: active ? `${h * 1.6}px` : '2px',
            opacity: active ? 0.88 : 0.22,
            transition: 'height 0.15s ease, opacity 0.15s ease',
            // Individual animation properties — no `animation` shorthand → zero React warnings
            animationName: active ? 'peWaveBar' : 'none',
            animationDuration: `${0.48 + (i % 4) * 0.10}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate' as React.CSSProperties['animationDirection'],
            animationDelay: `${i * 0.045}s`,
          }}
        />
      ))}
    </div>
  )
}

// ── Inject CSS keyframe once ──────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('pe-wave-style')) {
  const s = document.createElement('style')
  s.id = 'pe-wave-style'
  s.textContent = '@keyframes peWaveBar{0%{transform:scaleY(0.35)}100%{transform:scaleY(1)}}'
  document.head.appendChild(s)
}

// ── Country flag emoji ────────────────────────────────────────────────────────
function flagOf(code?: string): string {
  if (!code || code.length !== 2 || code === '-99') return ''
  try { return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))) }
  catch { return '' }
}

// ── Female voice for Web Speech fallback ─────────────────────────────────────
function getFemaleVoice(): Promise<SpeechSynthesisVoice | null> {
  return new Promise(resolve => {
    if (typeof window === 'undefined' || !window.speechSynthesis) { resolve(null); return }
    const pick = () => {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return null
      const preferred = ['Samantha', 'Victoria', 'Karen', 'Moira', 'Zira', 'Jenny', 'Aria', 'Sonia', 'Susan']
      for (const name of preferred) {
        const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'))
        if (v) return v
      }
      return voices.find(v => v.lang.startsWith('en')) ?? voices[0] ?? null
    }
    const v = pick()
    if (v) { resolve(v); return }
    const handler = () => { resolve(pick()); window.speechSynthesis.removeEventListener('voiceschanged', handler) }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    setTimeout(() => resolve(pick()), 1500)
  })
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'fetching' | 'generating' | 'ready' | 'error'

interface AnchorState {
  phase: Phase
  briefing: AnchorBriefing | null
}

interface Props {
  selectedEntity: SelectedEntity | null
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NewsAnchor({ selectedEntity }: Props) {
  const [isOpen,    setIsOpen]    = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [state,     setState]     = useState<AnchorState>({ phase: 'idle', briefing: null })

  const audioRef  = useRef<HTMLAudioElement | null>(null)
  const abortRef  = useRef<AbortController | null>(null)

  // Stop all playback
  const stopPlayback = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    setIsPlaying(false)
  }, [])

  // Play HTML5 audio from base64
  const playAudio = useCallback((base64: string, mimeType: string) => {
    stopPlayback()
    const audio = new Audio(`data:${mimeType};base64,${base64}`)
    audioRef.current = audio
    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => setIsPlaying(false)
    audio.play().catch(() => setIsPlaying(false))
    setIsPlaying(true)
  }, [stopPlayback])

  // Web Speech fallback
  const speakText = useCallback(async (text: string) => {
    stopPlayback()
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const voice = await getFemaleVoice()
    const utt = new SpeechSynthesisUtterance(text)
    if (voice) utt.voice = voice
    utt.rate = 0.93; utt.pitch = 1.05
    utt.onend = () => setIsPlaying(false)
    utt.onerror = () => setIsPlaying(false)
    window.speechSynthesis.speak(utt)
    setIsPlaying(true)
  }, [stopPlayback])

  // Core: fetch news + metrics → call anchor API
  const triggerBriefing = useCallback(async () => {
    if (!selectedEntity || selectedEntity.type === 'city') return
    stopPlayback()
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setIsOpen(true)
    setState({ phase: 'fetching', briefing: null })

    const code = selectedEntity.countryCode ?? selectedEntity.id
    const name = selectedEntity.name

    // Parallel: news + country metrics
    let articles: string[] = []
    let metrics: Partial<CountryData> = {}
    try {
      const [nRes, mRes] = await Promise.allSettled([
        fetch(`/api/news/${encodeURIComponent(code)}`, { signal: ctrl.signal }),
        fetch(`/api/country/${encodeURIComponent(code)}`, { signal: ctrl.signal }),
      ])
      if (nRes.status === 'fulfilled' && nRes.value.ok) {
        const d = await nRes.value.json()
        articles = (d.articles ?? []).slice(0, 3).map((a: { title: string }) => a.title)
      }
      if (mRes.status === 'fulfilled' && mRes.value.ok) {
        const d = await mRes.value.json()
        metrics = d.country ?? d
      }
    } catch { /* continue with empty */ }

    if (ctrl.signal.aborted) return
    setState(s => ({ ...s, phase: 'generating' }))

    try {
      const res = await fetch(`/api/anchor/${encodeURIComponent(code)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryName:  name,
          articles,
          capital:      (metrics as CountryData).capital      ?? null,
          region:       (metrics as CountryData).region       ?? null,
          gdp:          (metrics as CountryData).gdp_billion  ?? null,
          gdpGrowth:    (metrics as CountryData).gdpGrowth    ?? null,
          population:   (metrics as CountryData).population_m ?? null,
          inflation:    (metrics as CountryData).inflation     ?? null,
          unemployment: (metrics as CountryData).unemployment ?? null,
          gdpPerCapita: (metrics as CountryData).gdpPerCapita ?? null,
        }),
        signal: ctrl.signal,
      })

      if (!res.ok) throw new Error('anchor API error')
      const briefing: AnchorBriefing = await res.json()

      if (ctrl.signal.aborted) return
      setState({ phase: 'ready', briefing })

      // Auto-play
      if (briefing.audioBase64) {
        playAudio(briefing.audioBase64, briefing.audioMimeType)
      } else if (briefing.script) {
        speakText(briefing.script)
      }
    } catch (err) {
      if (ctrl.signal.aborted) return
      setState(s => ({
        phase: 'error',
        briefing: s.briefing ?? {
          headline: `Economic Update: ${name}`,
          script: `${name} economic briefing temporarily unavailable.`,
          keyTakeaways: [], investmentOutlook: '',
          risks: [], opportunities: [], sectors: [],
          audioBase64: null, audioMimeType: 'audio/wav', hasAudio: false,
        },
      }))
    }
  }, [selectedEntity, stopPlayback, playAudio, speakText])

  // Reset when country changes
  useEffect(() => {
    stopPlayback()
    setState({ phase: 'idle', briefing: null })
    setIsOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntity?.id])

  const togglePlay = useCallback(() => {
    const b = state.briefing
    if (!b) return
    if (isPlaying) {
      stopPlayback()
    } else if (b.audioBase64) {
      playAudio(b.audioBase64, b.audioMimeType)
    } else if (b.script) {
      speakText(b.script)
    }
  }, [isPlaying, state.briefing, stopPlayback, playAudio, speakText])

  if (!selectedEntity || selectedEntity.type === 'city') return null

  const { phase, briefing } = state
  const isLoading   = phase === 'fetching' || phase === 'generating'
  const isReady     = phase === 'ready' || phase === 'error'
  const flag        = flagOf(selectedEntity.countryCode)

  const phaseLabel =
    phase === 'fetching'   ? 'Fetching latest headlines…' :
    phase === 'generating' ? 'Generating briefing…'       : ''

  return (
    <>
      {/* ── Floating trigger pill — only when card is closed ─────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="anchor-pill"
            initial={{ opacity: 0, y: 14, scale: 0.92 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit=   {{ opacity: 0, y: 14, scale: 0.92 }}
            transition={{ duration: 0.22 }}
            onClick={triggerBriefing}
            className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full cursor-pointer select-none"
            style={{
              background:  'linear-gradient(135deg,rgba(12,22,40,0.97) 0%,rgba(7,14,26,0.97) 100%)',
              border:      '1px solid rgba(255,209,102,0.28)',
              boxShadow:   '0 6px 28px rgba(0,0,0,0.60),0 0 18px rgba(255,209,102,0.07)',
            }}
          >
            {/* Mic icon */}
            <div className="relative w-6 h-6 rounded-full bg-[#FFD166]/10 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="3.5" y="0.5" width="5" height="7" rx="2.5" fill="#FFD166" />
                <path d="M1.5 6c0 2.485 2.015 4.5 4.5 4.5S10.5 8.485 10.5 6" stroke="#FFD166" strokeWidth="1.1" fill="none" strokeLinecap="round" />
                <line x1="6" y1="10.5" x2="6" y2="12" stroke="#FFD166" strokeWidth="1.1" strokeLinecap="round" />
                <line x1="4.5" y1="12" x2="7.5" y2="12" stroke="#FFD166" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500">
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-70" />
              </span>
            </div>
            <div className="leading-none">
              <div className="text-[9px] text-[#FFD166]/45 uppercase tracking-widest font-medium">AI Anchor · Audio</div>
              <div className="text-[12px] text-white/80 font-medium mt-0.5">{flag} {selectedEntity.name}</div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Floating anchor card — compact, bottom-right ──────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="anchor-card"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit=   {{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-6 left-6 z-40 w-[340px] rounded-2xl overflow-hidden"
            style={{
              background:  'linear-gradient(160deg,rgba(10,18,32,0.99) 0%,rgba(6,11,22,0.99) 100%)',
              border:      '1px solid rgba(255,209,102,0.16)',
              boxShadow:   '0 28px 80px rgba(0,0,0,0.85),0 0 0 1px rgba(255,209,102,0.06)',
            }}
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div
              className="flex items-center px-3.5 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 flex-shrink-0">
                {isPlaying && <span className="block w-full h-full rounded-full bg-red-500 animate-ping opacity-70" />}
              </span>
              <span className="text-[9px] text-white/35 uppercase tracking-[0.2em] flex-1">
                PulseEarth · Live Briefing
              </span>
              <span className="text-[13px] mr-1.5">{flag}</span>
              <span className="text-[11px] text-white/55 font-medium mr-3 max-w-[90px] truncate">
                {selectedEntity.name}
              </span>
              <button
                onClick={() => { stopPlayback(); setIsOpen(false) }}
                className="w-5 h-5 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/08 transition-colors text-sm leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* ── Body: avatar + content ──────────────────────────────────── */}
            <div className="flex">
              {/* Presenter portrait */}
              <div className="w-[88px] flex-shrink-0">
                <PresenterSVG isOnAir={isPlaying} />
              </div>

              {/* Right content */}
              <div className="flex-1 flex flex-col justify-between p-3 min-w-0">
                {isLoading ? (
                  /* Loading state */
                  <div className="flex flex-col justify-center h-full py-2">
                    <div className="flex items-center gap-1.5 mb-3">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full bg-[#FFD166]/50"
                          style={{
                            animationName: 'peWaveBar',
                            animationDuration: '0.8s',
                            animationTimingFunction: 'ease-in-out',
                            animationIterationCount: 'infinite',
                            animationDirection: 'alternate' as React.CSSProperties['animationDirection'],
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                      <span className="text-[10px] text-white/35 ml-1">{phaseLabel}</span>
                    </div>
                    <div className="h-[2px] rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FFD166]/45"
                        style={{
                          width: phase === 'fetching' ? '32%' : '72%',
                          transition: 'width 1.5s ease',
                        }}
                      />
                    </div>
                  </div>
                ) : isReady && briefing ? (
                  /* Ready state */
                  <div>
                    {/* Headline */}
                    <p className="text-[9px] text-[#FFD166]/45 uppercase tracking-wider mb-0.5">
                      {briefing.headline || `Economic Update: ${selectedEntity.name}`}
                    </p>

                    {/* Audio controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={togglePlay}
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: isPlaying ? 'rgba(255,209,102,0.18)' : 'rgba(255,209,102,0.10)',
                          border: '1px solid rgba(255,209,102,0.25)',
                        }}
                      >
                        {isPlaying ? (
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="#FFD166">
                            <rect x="0.5" y="0.5" width="3" height="8" rx="0.5" />
                            <rect x="5.5" y="0.5" width="3" height="8" rx="0.5" />
                          </svg>
                        ) : (
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="#FFD166">
                            <polygon points="1.5,0.5 8.5,4.5 1.5,8.5" />
                          </svg>
                        )}
                      </button>
                      <Waveform active={isPlaying} />
                      <button
                        onClick={triggerBriefing}
                        className="ml-auto text-[9px] text-white/22 hover:text-white/45 transition-colors uppercase tracking-wide"
                      >
                        ↺
                      </button>
                    </div>

                    {/* TTS method */}
                    <p className="text-[8.5px] text-white/18 mt-1.5">
                      {briefing.hasAudio ? 'Kokoro neural voice' : 'Web Speech · system voice'}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* ── Script preview ──────────────────────────────────────────── */}
            <AnimatePresence>
              {isReady && briefing?.script && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.25 }}
                  className="px-3.5 pb-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <p className="text-[9px] text-white/25 uppercase tracking-wider mt-2.5 mb-1">Transcript</p>
                  <p className="text-[11px] text-white/52 leading-relaxed line-clamp-3">{briefing.script}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Executive summary ───────────────────────────────────────── */}
            <AnimatePresence>
              {isReady && briefing && (briefing.keyTakeaways.length > 0 || briefing.investmentOutlook) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                  className="px-3.5 py-3 space-y-2.5"
                >
                  {/* Key takeaways */}
                  {briefing.keyTakeaways.length > 0 && (
                    <div>
                      <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1.5">Key Takeaways</p>
                      <div className="space-y-1">
                        {briefing.keyTakeaways.map((t, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-[#FFD166]/50 text-[9px] flex-shrink-0 mt-px">▸</span>
                            <p className="text-[10px] text-white/55 leading-snug">{t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investment outlook */}
                  {briefing.investmentOutlook && (
                    <div
                      className="rounded-lg px-3 py-2"
                      style={{ background: 'rgba(255,209,102,0.05)', border: '1px solid rgba(255,209,102,0.12)' }}
                    >
                      <p className="text-[9px] text-[#FFD166]/40 uppercase tracking-wider mb-0.5">Investment Outlook 2025</p>
                      <p className="text-[10px] text-[#FFD166]/75 leading-snug">{briefing.investmentOutlook}</p>
                    </div>
                  )}

                  {/* Risks + opportunities side by side */}
                  {(briefing.risks.length > 0 || briefing.opportunities.length > 0) && (
                    <div className="grid grid-cols-2 gap-2">
                      {briefing.risks.length > 0 && (
                        <div>
                          <p className="text-[9px] text-red-400/45 uppercase tracking-wider mb-1">Risks</p>
                          {briefing.risks.map((r, i) => (
                            <p key={i} className="text-[9.5px] text-white/40 leading-snug flex items-start gap-1">
                              <span className="text-red-400/50">•</span>{r}
                            </p>
                          ))}
                        </div>
                      )}
                      {briefing.opportunities.length > 0 && (
                        <div>
                          <p className="text-[9px] text-emerald-400/45 uppercase tracking-wider mb-1">Opportunities</p>
                          {briefing.opportunities.map((o, i) => (
                            <p key={i} className="text-[9.5px] text-white/40 leading-snug flex items-start gap-1">
                              <span className="text-emerald-400/50">•</span>{o}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key sectors */}
                  {briefing.sectors.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {briefing.sectors.map((s, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(255,209,102,0.06)',
                            border: '1px solid rgba(255,209,102,0.15)',
                            color: 'rgba(255,209,102,0.60)',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
