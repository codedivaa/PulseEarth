'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import Globe from 'react-globe.gl'
import type { CityDot } from '@/types/city'
import type { SelectedEntity } from '@/types/globe'
import type { LayerState } from '@/types/layers'

export interface GlobeCoreProps {
  onEntitySelect: (entity: SelectedEntity | null) => void
  onLoaded: () => void
  flyTo: { lat: number; lng: number; altitude?: number } | null
  selectedEntity: SelectedEntity | null
  layers: LayerState
}

interface GeoFeature {
  type: string
  properties: { ADMIN: string; NAME: string; ISO_A2: string; [key: string]: any }
  geometry: { type: string; coordinates: any }
}

interface ArcDatum {
  startLat: number; startLng: number
  endLat: number; endLng: number
  weight: number
  arcType: 'trade' | 'city'
  isGlow: boolean
  id: string
}

function featureName(f: GeoFeature) {
  return f.properties.ADMIN || f.properties.NAME || f.properties.name || 'Unknown'
}
function featureISO2(f: GeoFeature) {
  const c = f.properties.ISO_A2 || f.properties.iso_a2 || ''
  return c === '-99' ? '' : c
}
function getCentroid(geom: { type: string; coordinates: any }): [number, number] {
  let ring: number[][] = []
  if (geom.type === 'Polygon') ring = geom.coordinates[0]
  else if (geom.type === 'MultiPolygon') {
    let max = 0
    for (const p of geom.coordinates) { if (p[0].length > max) { max = p[0].length; ring = p[0] } }
  }
  if (!ring.length) return [0, 0]
  return [
    ring.reduce((s: number, c: number[]) => s + c[1], 0) / ring.length,
    ring.reduce((s: number, c: number[]) => s + c[0], 0) / ring.length,
  ]
}
function flagOf(code: string) {
  if (!code || code.length !== 2 || code === '-99') return '🌍'
  try { return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))) }
  catch { return '🌍' }
}

// ── Heatmap colour — 5-tier, maximum saturation, near-opaque ─────────────────
// pct = 0 (poorest) → 1 (richest). Each tier is clearly distinct at a glance.
function heatColor(pct: number): string {
  if (pct >= 0.90) return 'rgba(0,255,140,0.99)'    // top 10%    — electric cyan-green
  if (pct >= 0.75) return 'rgba(50,210,80,0.97)'    // top 25%    — bright vivid green
  if (pct >= 0.40) return 'rgba(255,195,0,0.97)'    // middle 35% — strong gold/amber
  if (pct >= 0.25) return 'rgba(255,75,0,0.97)'     // bottom 25% — deep orange-red
  return 'rgba(210,15,15,0.99)'                      // bottom 10% — vivid crimson
}

// ── Trade route data — 30 major bilateral flows ────────────────────────────
// Each route is rendered as two arcs (main + glow) for a bloom effect.
const RAW_ROUTES = [
  // China hub
  { s:[39.9,116.4], e:[38.9,-77.0], v:0.93 }, // ↔ USA
  { s:[39.9,116.4], e:[52.5,13.4],  v:0.81 }, // ↔ Germany
  { s:[39.9,116.4], e:[35.7,139.7], v:0.86 }, // ↔ Japan
  { s:[39.9,116.4], e:[37.5,126.9], v:0.74 }, // ↔ South Korea
  { s:[39.9,116.4], e:[1.3,103.8],  v:0.77 }, // ↔ Singapore
  { s:[39.9,116.4], e:[28.6,77.2],  v:0.70 }, // ↔ India
  { s:[39.9,116.4], e:[24.7,46.7],  v:0.64 }, // ↔ Saudi Arabia
  { s:[39.9,116.4], e:[-33.9,151.2],v:0.62 }, // ↔ Australia
  { s:[39.9,116.4], e:[55.7,37.6],  v:0.66 }, // ↔ Russia
  // USA hub
  { s:[38.9,-77.0], e:[52.5,13.4],  v:0.77 }, // ↔ Germany
  { s:[38.9,-77.0], e:[51.5,-0.1],  v:0.84 }, // ↔ UK
  { s:[38.9,-77.0], e:[35.7,139.7], v:0.72 }, // ↔ Japan
  { s:[38.9,-77.0], e:[19.4,-99.1], v:0.88 }, // ↔ Mexico
  { s:[38.9,-77.0], e:[-15.8,-47.9],v:0.57 }, // ↔ Brazil
  { s:[38.9,-77.0], e:[28.6,77.2],  v:0.63 }, // ↔ India
  { s:[38.9,-77.0], e:[45.4,-75.7], v:0.90 }, // ↔ Canada
  // Europe internal
  { s:[52.5,13.4],  e:[51.5,-0.1],  v:0.66 }, // Germany ↔ UK
  { s:[52.5,13.4],  e:[48.9,2.3],   v:0.65 }, // Germany ↔ France
  { s:[52.5,13.4],  e:[52.4,4.9],   v:0.60 }, // Germany ↔ Netherlands
  { s:[51.5,-0.1],  e:[48.9,2.3],   v:0.58 }, // UK ↔ France
  // India hub
  { s:[28.6,77.2],  e:[24.4,54.4],  v:0.67 }, // ↔ UAE
  { s:[28.6,77.2],  e:[24.7,46.7],  v:0.59 }, // ↔ Saudi Arabia
  { s:[28.6,77.2],  e:[51.5,-0.1],  v:0.53 }, // ↔ UK
  // Singapore hub
  { s:[1.3,103.8],  e:[35.7,139.7], v:0.61 }, // ↔ Japan
  { s:[1.3,103.8],  e:[-33.9,151.2],v:0.55 }, // ↔ Australia
  // Brazil
  { s:[-15.8,-47.9],e:[52.5,13.4],  v:0.52 }, // ↔ Germany
  // Russia
  { s:[55.7,37.6],  e:[52.5,13.4],  v:0.55 }, // ↔ Germany
  { s:[55.7,37.6],  e:[41.0,29.0],  v:0.50 }, // ↔ Turkey
  // Turkey
  { s:[41.0,29.0],  e:[52.5,13.4],  v:0.53 }, // ↔ Germany
  // South Korea
  { s:[37.5,126.9], e:[38.9,-77.0], v:0.65 }, // ↔ USA
]

// Each route → two arc objects (main + glow)
const TRADE_ARCS: ArcDatum[] = RAW_ROUTES.flatMap((r, i) => [
  {
    startLat: r.s[0], startLng: r.s[1],
    endLat: r.e[0], endLng: r.e[1],
    weight: r.v, arcType: 'trade', isGlow: false, id: `t${i}`,
  },
  {
    startLat: r.s[0], startLng: r.s[1],
    endLat: r.e[0], endLng: r.e[1],
    weight: r.v, arcType: 'trade', isGlow: true, id: `t${i}g`,
  },
])

// ── Hardcoded city corridor arcs — always-available city network ─────────────
// Used as fallback when DynamoDB cities are not loaded, and to supplement matched arcs.
const HARDCODED_CITY_ARCS: ArcDatum[] = (() => {
  const corridors: [number, number, number, number, number][] = [
    // [startLat, startLng, endLat, endLng, weight]
    // India
    [19.07, 72.88, 12.97, 77.59, 0.90], // Mumbai–Bangalore
    [28.61, 77.21, 19.07, 72.88, 0.90], // Delhi–Mumbai
    [28.61, 77.21, 17.38, 78.49, 0.82], // Delhi–Hyderabad
    [12.97, 77.59, 13.08, 80.27, 0.80], // Bangalore–Chennai
    [22.57, 88.36, 28.61, 77.21, 0.78], // Kolkata–Delhi
    [19.07, 72.88, 23.22, 72.68, 0.72], // Mumbai–Ahmedabad
    // China
    [31.23, 121.47, 39.90, 116.40, 0.92], // Shanghai–Beijing
    [31.23, 121.47, 22.54, 114.06, 0.88], // Shanghai–Shenzhen
    [23.12, 113.26, 22.54, 114.06, 0.85], // Guangzhou–Shenzhen
    [39.90, 116.40, 23.12, 113.26, 0.80], // Beijing–Guangzhou
    [30.67, 104.07, 31.23, 121.47, 0.72], // Chengdu–Shanghai
    // USA
    [40.71, -74.01, 34.05, -118.24, 0.92], // NYC–LA
    [40.71, -74.01, 41.88, -87.63, 0.90],  // NYC–Chicago
    [34.05, -118.24, 37.77, -122.42, 0.88],// LA–San Francisco
    [41.88, -87.63, 29.76, -95.37, 0.82],  // Chicago–Houston
    [40.71, -74.01, 25.77, -80.19, 0.80],  // NYC–Miami
    [32.78, -96.80, 29.76, -95.37, 0.85],  // Dallas–Houston
    [40.71, -74.01, 43.65, -79.38, 0.88],  // NYC–Toronto
    // Europe
    [51.51, -0.13, 48.86, 2.35, 0.88],    // London–Paris
    [48.86, 2.35, 52.52, 13.40, 0.85],    // Paris–Berlin
    [52.52, 13.40, 50.11, 8.68, 0.82],    // Berlin–Frankfurt
    [40.42, -3.70, 41.39, 2.15, 0.80],    // Madrid–Barcelona
    [41.89, 12.48, 45.46, 9.19, 0.82],    // Rome–Milan
    [51.51, -0.13, 52.38, 4.90, 0.78],    // London–Amsterdam
    [48.14, 11.58, 52.52, 13.40, 0.75],   // Munich–Berlin
    [52.38, 4.90, 50.85, 4.35, 0.72],     // Amsterdam–Brussels
    // Asia-Pacific
    [35.69, 139.69, 34.69, 135.50, 0.90], // Tokyo–Osaka
    [37.57, 126.98, 35.17, 129.07, 0.82], // Seoul–Busan
    [-33.87, 151.21, -37.81, 144.96, 0.88],// Sydney–Melbourne
    [1.28, 103.85, 3.14, 101.69, 0.85],   // Singapore–Kuala Lumpur
    [13.75, 100.52, 1.28, 103.85, 0.80],  // Bangkok–Singapore
    [-6.21, 106.85, 1.28, 103.85, 0.78],  // Jakarta–Singapore
    [14.60, 120.98, 1.28, 103.85, 0.72],  // Manila–Singapore
    [1.28, 103.85, 22.39, 114.11, 0.88],  // Singapore–Hong Kong
    [22.39, 114.11, 31.23, 121.47, 0.85], // Hong Kong–Shanghai
    [-33.87, 151.21, 1.28, 103.85, 0.70], // Sydney–Singapore
    // Middle East
    [25.20, 55.27, 24.45, 54.37, 0.85],   // Dubai–Abu Dhabi
    [25.20, 55.27, 24.69, 46.72, 0.82],   // Dubai–Riyadh
    [24.69, 46.72, 21.54, 39.17, 0.80],   // Riyadh–Jeddah
    [41.01, 28.95, 39.93, 32.86, 0.82],   // Istanbul–Ankara
    // Africa / Americas
    [6.46, 3.39, -1.29, 36.82, 0.78],     // Lagos–Nairobi
    [-23.55, -46.63, -22.91, -43.17, 0.88],// São Paulo–Rio
    [-34.60, -58.38, -33.46, -70.65, 0.78],// Buenos Aires–Santiago
    // Cross-continental
    [19.07, 72.88, 25.20, 55.27, 0.82],   // Mumbai–Dubai
    [51.51, -0.13, 25.20, 55.27, 0.85],   // London–Dubai
    [55.75, 37.62, 41.01, 28.95, 0.78],   // Moscow–Istanbul
    [30.04, 31.24, 6.46, 3.39, 0.72],     // Cairo–Lagos
    [40.71, -74.01, 51.51, -0.13, 0.92],  // NYC–London
    [34.05, -118.24, 35.69, 139.69, 0.85],// LA–Tokyo
    [34.05, -118.24, 37.57, 126.98, 0.82],// LA–Seoul
  ]
  const arcs: ArcDatum[] = []
  corridors.forEach(([startLat, startLng, endLat, endLng, weight], i) => {
    arcs.push({ startLat, startLng, endLat, endLng, weight, arcType: 'city', isGlow: false, id: `hc${i}` })
  })
  return arcs
})()

// ── Component ────────────────────────────────────────────────────────────────
export default function GlobeCore({
  onEntitySelect, onLoaded, flyTo, selectedEntity, layers,
}: GlobeCoreProps) {
  const globeRef = useRef<any>(null)
  const onEntitySelectRef = useRef(onEntitySelect)
  const onLoadedRef       = useRef(onLoaded)
  useEffect(() => { onEntitySelectRef.current = onEntitySelect }, [onEntitySelect])
  useEffect(() => { onLoadedRef.current = onLoaded }, [onLoaded])

  const [countries,       setCountries]       = useState<{ features: GeoFeature[] }>({ features: [] })
  const [cities,          setCities]          = useState<CityDot[]>([])
  const [hoveredCountry,  setHoveredCountry]  = useState<GeoFeature | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<GeoFeature | null>(null)
  const [dims,            setDims]            = useState({ w: 800, h: 600 })
  const [heatmapScores,   setHeatmapScores]   = useState<Record<string, number>>({})
  const heatFetched = useRef(false)
  const setupDone   = useRef(false)

  const { heatmap, tradeRoutes, cityNetwork, investment } = layers

  // Viewport
  useEffect(() => {
    const upd = () => setDims({ w: window.innerWidth, h: window.innerHeight })
    upd(); window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])

  // Data
  useEffect(() => {
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson')
      .then(r => r.json()).then(setCountries)
  }, [])
  useEffect(() => {
    fetch('/api/cities').then(r => r.json()).then(d => { if (d.success) setCities(d.cities) })
  }, [])

  // Heatmap scores — fetched lazily
  useEffect(() => {
    if (!(heatmap || investment) || heatFetched.current) return
    heatFetched.current = true
    fetch('/api/heatmap').then(r => r.json()).then(d => setHeatmapScores(d.scores ?? {})).catch(() => {})
  }, [heatmap, investment])

  // Percentile ranks: convert raw log-normalized scores → 0-1 percentile position
  // This gives exactly 10%/25%/50%/25%/10% bands for visually distinct heatmap tiers.
  const percentileScores = useMemo(() => {
    const entries = Object.entries(heatmapScores)
    if (entries.length === 0) return {} as Record<string, number>
    const sorted = entries.map(([, v]) => v).sort((a, b) => a - b)
    const n = sorted.length
    const result: Record<string, number> = {}
    for (const [k, v] of entries) {
      // Find rightmost position where sorted[pos] <= v
      let lo = 0, hi = n - 1, rank = 0
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (sorted[mid] <= v) { rank = mid; lo = mid + 1 } else hi = mid - 1
      }
      result[k] = n > 1 ? rank / (n - 1) : 0.5
    }
    return result
  }, [heatmapScores])

  // Sync selectedCountry from selectedEntity (handles search + click)
  useEffect(() => {
    if (!countries.features.length) return
    if (!selectedEntity || selectedEntity.type === 'city') { setSelectedCountry(null); return }
    const code = selectedEntity.countryCode
    if (code) {
      const m = countries.features.find(f => featureISO2(f) === code)
      if (m) { setSelectedCountry(m); return }
    }
    const m = countries.features.find(f => featureName(f) === selectedEntity.name)
    if (m) setSelectedCountry(m)
  }, [selectedEntity, countries.features])

  // Inject glow pulse keyframe animation once
  useEffect(() => {
    if (document.getElementById('pe-glow-style')) return
    const s = document.createElement('style')
    s.id = 'pe-glow-style'
    s.textContent = `
      @keyframes peGlowPulse {
        0%,100% { opacity:0.78; transform:translate(-50%,-50%) scale(1.00); }
        50%      { opacity:1.00; transform:translate(-50%,-50%) scale(1.14); }
      }
    `
    document.head.appendChild(s)
  }, [])

  // Glow disc at selected country centroid
  const selectedCentroid = useMemo(() => {
    if (!selectedCountry) return null
    const [lat, lng] = getCentroid(selectedCountry.geometry)
    return { lat, lng }
  }, [selectedCountry])

  const glowData = useMemo(() => selectedCentroid ? [selectedCentroid] : [], [selectedCentroid])

  // ── ONE-TIME Globe setup ──────────────────────────────────────────────────
  useEffect(() => {
    if (!countries.features.length || setupDone.current) return
    setupDone.current = true

    setTimeout(() => {
      if (!globeRef.current) return

      const ctrl = globeRef.current.controls()
      if (ctrl) {
        ctrl.autoRotate = true; ctrl.autoRotateSpeed = 0.25
        ctrl.enableDamping = true; ctrl.dampingFactor = 0.07
        ctrl.minDistance = 160; ctrl.maxDistance = 750
      }
      globeRef.current.pointOfView({ altitude: 2.5 }, 0)

      try {
        const renderer = globeRef.current.renderer()
        if (renderer) {
          renderer.toneMapping = 4                // ACESFilmicToneMapping
          renderer.toneMappingExposure = 3.5      // brighter exposure
          renderer.shadowMap.enabled = true
        }
        const scene = globeRef.current.scene()
        if (scene) {
          scene.traverse((obj: any) => {
            if (obj.isAmbientLight)     { obj.intensity = 5.0; obj.color.setHex(0xfff5e0) }
            if (obj.isDirectionalLight) { obj.intensity = 3.2; obj.color.setHex(0xffe090) }
          })
        }
      } catch (e) { console.warn('THREE setup skipped:', e) }

      onLoadedRef.current()
    }, 800)
  }, [countries.features.length])

  // Auto-rotate
  useEffect(() => {
    if (!setupDone.current) return
    const ctrl = globeRef.current?.controls()
    if (!ctrl) return
    const pause  = () => { ctrl.autoRotate = false }
    const resume = () => { if (!selectedEntity) setTimeout(() => { ctrl.autoRotate = true }, 4000) }
    ctrl.addEventListener('start', pause)
    ctrl.addEventListener('end', resume)
    return () => { ctrl.removeEventListener('start', pause); ctrl.removeEventListener('end', resume) }
  }, [selectedEntity])

  // Fly-to
  useEffect(() => {
    if (!flyTo || !globeRef.current) return
    globeRef.current.controls()?.autoRotate && (globeRef.current.controls().autoRotate = false)
    globeRef.current.pointOfView({ lat: flyTo.lat, lng: flyTo.lng, altitude: flyTo.altitude ?? 1.8 }, 1800)
  }, [flyTo])

  // ── Click handlers ────────────────────────────────────────────────────────
  const handleCountryClick = useCallback((feat: object) => {
    if (!feat || !globeRef.current) return
    const f = feat as GeoFeature
    const ctrl = globeRef.current.controls()
    if (ctrl) ctrl.autoRotate = false

    const [lat, lng] = getCentroid(f.geometry)
    globeRef.current.pointOfView({ lat, lng, altitude: 1.8 }, 1600)
    setSelectedCountry(f)

    const code = featureISO2(f)
    const name = featureName(f)
    onEntitySelectRef.current({
      id: code || name, type: 'country', name,
      countryCode: code || undefined, lat, lng,
    })
  }, [])

  const handleCityClick = useCallback((pt: object) => {
    if (!pt || !globeRef.current) return
    const c = pt as CityDot
    const ctrl = globeRef.current.controls()
    if (ctrl) ctrl.autoRotate = false
    globeRef.current.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.1 }, 1400)
    onEntitySelectRef.current({ id: c.cityId, type: 'city', name: c.name, country: c.country, lat: c.lat, lng: c.lng })
  }, [])

  // ── City network arcs — hardcoded corridors + DynamoDB-matched pairs ────────
  const cityNetArcs = useMemo<ArcDatum[]>(() => {
    if (!cityNetwork) return []
    // Always include hardcoded corridors — visible even if DynamoDB is empty
    return HARDCODED_CITY_ARCS
  }, [cityNetwork])

  const arcsData = useMemo<ArcDatum[]>(() => {
    const out: ArcDatum[] = []
    if (tradeRoutes) out.push(...TRADE_ARCS)
    if (cityNetwork) out.push(...cityNetArcs)
    return out
  }, [tradeRoutes, cityNetwork, cityNetArcs])

  // ── Visual callbacks ──────────────────────────────────────────────────────
  const polyCapColor = useCallback((f: object) => {
    const feat = f as GeoFeature
    // ── Selected: solid gold ──
    if (feat === selectedCountry) return 'rgba(255,215,0,0.96)'
    if (feat === hoveredCountry)  return 'rgba(255,209,102,0.38)'

    const iso2 = featureISO2(feat)
    const pct  = iso2 ? percentileScores[iso2] : undefined

    if (investment && pct !== undefined) {
      if (pct >= 0.75) return 'rgba(34,197,94,0.42)'
      if (pct >= 0.40) return 'rgba(251,191,36,0.32)'
      return 'rgba(239,68,68,0.32)'
    }
    if (heatmap && pct !== undefined) return heatColor(pct)

    return 'rgba(255,255,255,0.04)'
  }, [selectedCountry, hoveredCountry, heatmap, investment, percentileScores])

  const polySideColor = useCallback((f: object) => {
    if (f === selectedCountry) return 'rgba(255,215,0,0.92)'   // solid bright gold sides
    if (f === hoveredCountry)  return 'rgba(255,183,3,0.30)'
    return 'rgba(0,0,0,0)'
  }, [selectedCountry, hoveredCountry])

  const polyStroke = useCallback((f: object) => {
    if (f === selectedCountry) return '#FFE040'
    if (f === hoveredCountry)  return 'rgba(255,209,102,0.65)'
    if (heatmap || investment) return 'rgba(255,255,255,0.08)'
    return 'rgba(255,255,255,0.14)'
  }, [selectedCountry, hoveredCountry, heatmap, investment])

  const polyAlt = useCallback((f: object) => {
    const feat = f as GeoFeature
    if (feat === selectedCountry) return 0.18   // strongly lifted — selected hero
    if (feat === hoveredCountry)  return 0.05
    if (heatmap) {
      const iso2 = featureISO2(feat)
      const pct  = iso2 ? (percentileScores[iso2] ?? 0) : 0
      // Maximum altitude span: poorest ≈ flat, richest towering at 0.08
      return 0.002 + pct * 0.080
    }
    return 0.01
  }, [selectedCountry, hoveredCountry, heatmap, percentileScores])

  const polyLabel = useCallback((f: object) => {
    const feat = f as GeoFeature
    const iso2 = featureISO2(feat)
    const name = featureName(feat)
    const pct  = iso2 ? percentileScores[iso2] : undefined
    const scoreStr = (heatmap || investment) && pct !== undefined
      ? `<span style="margin-left:6px;color:rgba(255,209,102,0.65);font-size:10px">Top ${Math.round((1 - pct) * 100) + 1}%</span>`
      : ''
    return `<div style="pointer-events:none;background:rgba(5,5,5,0.94);border:1px solid rgba(255,209,102,0.28);border-radius:8px;padding:5px 11px;color:rgba(255,255,255,0.90);font-size:12px;font-family:system-ui,sans-serif;display:flex;align-items:center;gap:6px;white-space:nowrap"><span style="font-size:15px">${flagOf(iso2)}</span><span>${name}</span>${scoreStr}</div>`
  }, [heatmap, investment, percentileScores])

  const cityColor = useCallback((pt: object) => {
    const c = pt as CityDot
    if (selectedCountry && c.country === featureName(selectedCountry)) return '#FFD166'
    const i = c.pulse_intensity
    return `rgba(${Math.round(255 * Math.min(1, i * 1.3))},${Math.round(183 * i)},3,${0.6 + i * 0.4})`
  }, [selectedCountry])

  // Arc visuals — premium: vivid cyan city arcs, golden glowing trade routes
  const arcColor = useCallback((d: object) => {
    const a = d as ArcDatum
    if (a.arcType === 'city') {
      // Bright solid cyan — instantly visible even from zoomed out
      return `rgba(0,240,255,${(0.85 + a.weight * 0.14).toFixed(2)})`
    }
    // Trade routes — golden main + wide luminous glow
    return a.isGlow
      ? `rgba(255,210,0,${(0.10 + a.weight * 0.12).toFixed(3)})`
      : `rgba(255,230,50,${(0.72 + a.weight * 0.26).toFixed(2)})`
  }, [])

  const arcStroke = useCallback((d: object) => {
    const a = d as ArcDatum
    if (a.arcType === 'city') return 2.0 + a.weight * 1.2   // thick solid city arc
    if (a.isGlow) return 12 + a.weight * 8                  // wide luminous glow halo
    return 1.0 + a.weight * 1.0                             // bright trade arc
  }, [])

  const arcAlt = useCallback((d: object) => {
    const a = d as ArcDatum
    if (a.arcType === 'city') return 0.05 + a.weight * 0.08
    const dx = Math.abs(a.endLng - a.startLng)
    const dy = Math.abs(a.endLat - a.startLat)
    return 0.06 + Math.min(0.58, Math.sqrt(dx * dx + dy * dy) / 190)
  }, [])

  // HTML glow element — premium pulsing bloom visible from any zoom level
  const makeGlowEl = useCallback(() => {
    const el = document.createElement('div')
    el.style.cssText = `
      width:520px; height:520px; border-radius:50%; pointer-events:none;
      background: radial-gradient(circle,
        rgba(255,215,0,0.52) 0%,
        rgba(255,190,0,0.28) 24%,
        rgba(255,183,3,0.10) 50%,
        transparent 68%
      );
      box-shadow:
        0 0 80px 28px rgba(255,215,0,0.55),
        0 0 160px 60px rgba(255,183,3,0.26),
        0 0 280px 100px rgba(255,183,3,0.10);
      animation: peGlowPulse 2.6s ease-in-out infinite;
      transform: translate(-50%, -50%);
    `
    return el
  }, [])

  return (
    <Globe
      ref={globeRef}
      width={dims.w}
      height={dims.h}

      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
      atmosphereColor="#FFD166"
      atmosphereAltitude={0.30}

      // ── Countries ──────────────────────────────────────────────────────────
      polygonsData={countries.features}
      polygonCapColor={polyCapColor}
      polygonSideColor={polySideColor}
      polygonStrokeColor={polyStroke}
      polygonAltitude={polyAlt}
      polygonLabel={polyLabel}
      onPolygonHover={(f) => setHoveredCountry(f as GeoFeature | null)}
      onPolygonClick={handleCountryClick}

      // ── City dots ─────────────────────────────────────────────────────────
      pointsData={cities}
      pointLat="lat" pointLng="lng"
      pointColor={cityColor}
      pointAltitude={(pt: any) => 0.015 + (pt as CityDot).pulse_intensity * 0.028}
      pointRadius={(pt: any) => 0.32 + (pt as CityDot).pulse_intensity * 0.65}
      pointLabel={(pt: any) =>
        `<span style="pointer-events:none;color:#FFD166;font-size:11px;padding:2px 8px;background:rgba(0,0,0,0.90);border-radius:4px;border:1px solid rgba(255,209,102,0.22)">${(pt as CityDot).name}</span>`
      }
      onPointClick={handleCityClick}

      // ── Pulse rings ────────────────────────────────────────────────────────
      ringsData={cities}
      ringLat="lat" ringLng="lng"
      ringColor={(pt: any) => `rgba(255,209,102,${0.06 + (pt as CityDot).pulse_intensity * 0.20})`}
      ringMaxRadius={(pt: any) => 2.8 + (pt as CityDot).pulse_intensity * 3.8}
      ringPropagationSpeed={1.4}
      ringRepeatPeriod={(pt: any) => 2200 - (pt as CityDot).pulse_intensity * 1100}

      // ── Arcs (trade + city network, each doubled for glow) ────────────────
      arcsData={arcsData}
      arcStartLat="startLat" arcStartLng="startLng"
      arcEndLat="endLat" arcEndLng="endLng"
      arcColor={arcColor}
      arcAltitude={arcAlt}
      arcStroke={arcStroke}
      arcDashLength={(d: any) => (d as ArcDatum).arcType === 'city' ? 1 : 0.50}
      arcDashGap={(d: any) => (d as ArcDatum).arcType === 'city' ? 0 : 1.8}
      arcDashAnimateTime={(d: any) => (d as ArcDatum).arcType === 'city' ? 0 : 2000}

      // ── Country selection glow (HTML element) ─────────────────────────────
      htmlElementsData={glowData}
      htmlLat="lat"
      htmlLng="lng"
      htmlAltitude={0.02}
      htmlElement={makeGlowEl}
      htmlTransitionDuration={0}

      animateIn={true}
    />
  )
}
