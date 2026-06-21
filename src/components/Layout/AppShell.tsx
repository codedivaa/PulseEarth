'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import SidebarPanel from '@/components/Sidebar/SidebarPanel'
import SearchBar from '@/components/UI/SearchBar'
import LoadingScreen from '@/components/UI/LoadingScreen'
import LayerControl from '@/components/UI/LayerControl'
import TimelineSlider from '@/components/UI/TimelineSlider'
import NewsAnchor from '@/components/UI/NewsAnchor'
import DemoMode from '@/components/UI/DemoMode'
import type { SelectedEntity } from '@/types/globe'
import { DEFAULT_LAYERS, type LayerState } from '@/types/layers'

const GlobeContainer = dynamic(() => import('@/components/Globe/GlobeContainer'), {
  ssr: false,
  loading: () => <LoadingScreen />,
})

export default function AppShell() {
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null)
  const [isLoaded,       setIsLoaded]       = useState(false)
  const [flyTo,          setFlyTo]          = useState<{ lat: number; lng: number; altitude?: number } | null>(null)
  const [layers,         setLayers]         = useState<LayerState>(DEFAULT_LAYERS)
  const [timelineYear,   setTimelineYear]   = useState(2025)
  const [demoActive,     setDemoActive]     = useState(false)

  // Compare mode
  const [compareEntity, setCompareEntity] = useState<SelectedEntity | null>(null)
  const [isComparing,   setIsComparing]   = useState(false)

  const handleLoaded = useCallback(() => setIsLoaded(true), [])

  const handleEntitySelect = useCallback((entity: SelectedEntity | null) => {
    if (isComparing && entity && entity.type !== 'city') {
      setCompareEntity(entity)
      setIsComparing(false)
    } else {
      setSelectedEntity(entity)
      setCompareEntity(null)
    }
  }, [isComparing])

  const handleSearchSelect = useCallback((lat: number, lng: number, entity: SelectedEntity) => {
    setFlyTo({ lat, lng, altitude: 1.8 })
    handleEntitySelect(entity)
  }, [handleEntitySelect])

  const toggleLayer = useCallback((key: keyof LayerState) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const startCompare = useCallback(() => { setIsComparing(true); setCompareEntity(null) }, [])
  const closeCompare = useCallback(() => { setCompareEntity(null); setIsComparing(false) }, [])
  const closeSidebar = useCallback(() => { setSelectedEntity(null); setCompareEntity(null); setIsComparing(false) }, [])

  const handleDemoSelect = useCallback((entity: SelectedEntity, lat: number, lng: number, altitude: number) => {
    setFlyTo({ lat, lng, altitude })
    setSelectedEntity(entity)
    setCompareEntity(null)
    // Enable news layer during demo for richer experience
    setLayers(prev => ({ ...prev, news: true }))
  }, [])

  const startDemo = useCallback(() => {
    setDemoActive(true)
    // Enable trade routes for visual impact during demo
    setLayers(prev => ({ ...prev, tradeRoutes: true, news: true }))
  }, [])

  return (
    <div className="relative w-screen h-screen bg-[#050505] overflow-hidden">
      {/* Compare mode banner */}
      <AnimatePresence>
        {isComparing && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 glass border border-[#FFD166]/20 rounded-full px-5 py-2 flex items-center gap-3 shadow-xl">
            <div className="w-2 h-2 rounded-full bg-[#FFD166] animate-pulse" />
            <span className="text-[12px] text-[#FFD166]/75">Click or search a country to compare</span>
            <button onClick={() => setIsComparing(false)} className="text-white/30 hover:text-white/60 ml-1 text-sm">×</button>
          </div>
        )}
      </AnimatePresence>

      <GlobeContainer
        onEntitySelect={handleEntitySelect}
        onLoaded={handleLoaded}
        flyTo={flyTo}
        selectedEntity={selectedEntity}
        layers={layers}
      />

      <AnimatePresence>
        {isLoaded && (
          <>
            <SearchBar onSelect={handleSearchSelect} />
            <LayerControl layers={layers} onToggle={toggleLayer} />

            <AnimatePresence>
              {layers.timeline && (
                <TimelineSlider year={timelineYear} onChange={setTimelineYear} />
              )}
            </AnimatePresence>

            {/* Demo Mode — auto-cycle presentation */}
            <DemoMode
              isActive={demoActive}
              onSelectCountry={handleDemoSelect}
              onStop={() => setDemoActive(false)}
            />

            {/* Demo Mode trigger — bottom-right, away from AI Anchor (bottom-left) */}
            <AnimatePresence>
              {!demoActive && (
                <motion.button
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{ duration: 0.22, delay: 0.5 }}
                  onClick={startDemo}
                  className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full select-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg,rgba(12,22,40,0.96) 0%,rgba(7,14,26,0.96) 100%)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.55)',
                  }}
                >
                  <span className="text-sm">🎬</span>
                  <span className="text-[10px] text-white/40 font-medium tracking-wider uppercase">Demo</span>
                </motion.button>
              )}
            </AnimatePresence>

            <NewsAnchor selectedEntity={selectedEntity} />

            <AnimatePresence mode="wait">
              {selectedEntity && (
                <SidebarPanel
                  key={selectedEntity.id + (compareEntity?.id ?? '')}
                  entity={selectedEntity}
                  compareEntity={compareEntity}
                  onClose={closeSidebar}
                  onCloseCompare={closeCompare}
                  onStartCompare={startCompare}
                  showNews={layers.news}
                  timelineYear={layers.timeline ? timelineYear : undefined}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
