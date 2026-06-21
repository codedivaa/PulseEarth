'use client'

import { motion } from 'framer-motion'
import CityView from './CityView'
import CountryView from './CountryView'
import ComparePanel from './ComparePanel'
import type { SelectedEntity } from '@/types/globe'

function getFlagEmoji(code?: string): string {
  if (!code || code === '-99' || code.length !== 2) return '🌍'
  try { return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))) }
  catch { return '🌍' }
}

interface Props {
  entity: SelectedEntity
  compareEntity?: SelectedEntity | null
  onClose: () => void
  onCloseCompare?: () => void
  onStartCompare?: () => void
  showNews?: boolean
  timelineYear?: number
}

export default function SidebarPanel({
  entity, compareEntity, onClose, onCloseCompare, onStartCompare,
  showNews = false, timelineYear,
}: Props) {
  const flag    = (entity.type === 'country' || entity.type === 'capital') ? getFlagEmoji(entity.countryCode) : null
  const isCity  = entity.type === 'city'
  const hasCompare = compareEntity && compareEntity.countryCode && entity.countryCode

  // Width expands for compare mode
  const panelWidth = hasCompare ? 'w-[680px] max-w-[92vw]' : 'w-[400px] max-w-[88vw]'

  const countryCodeA = entity.countryCode && entity.countryCode !== '-99'
    ? entity.countryCode : entity.id
  const countryCodeB = compareEntity?.countryCode && compareEntity.countryCode !== '-99'
    ? compareEntity.countryCode : compareEntity?.id ?? ''

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className={`absolute top-0 right-0 h-full z-20 flex flex-col ${panelWidth}`}
    >
      <div className="h-full glass flex flex-col border-l border-[#FFD166]/10 overflow-hidden">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-[#FFD166]/08 flex-shrink-0"
        >
          <div className="flex items-start gap-3">
            {flag && <span className="text-3xl leading-none mt-0.5">{flag}</span>}
            <div>
              <p className="text-[10px] text-[#FFD166]/50 uppercase tracking-[0.18em] mb-1.5">
                {isCity ? entity.country : hasCompare ? 'Country Comparison' : 'Economic Overview'}
                {timelineYear && !hasCompare && (
                  <span className="ml-2 text-[#FFD166]/30">· {timelineYear}</span>
                )}
              </p>
              <h2 className="text-[20px] font-bold text-white leading-tight">
                {hasCompare ? `${entity.name} vs ${compareEntity!.name}` : entity.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasCompare && onCloseCompare && (
              <button
                onClick={onCloseCompare}
                className="text-[11px] px-3 py-1 rounded-full border border-white/10 text-white/35 hover:text-[#FFD166]/60 hover:border-[#FFD166]/20 transition-all"
              >
                Exit Compare
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-[#FFD166] hover:border-[#FFD166]/40 transition-all text-lg leading-none"
            >
              ×
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {hasCompare ? (
            <ComparePanel
              codeA={countryCodeA}
              nameA={entity.name}
              codeB={countryCodeB}
              nameB={compareEntity!.name}
              onClose={onCloseCompare ?? onClose}
            />
          ) : isCity ? (
            <CityView cityId={entity.id} />
          ) : (
            <CountryView
              countryCode={countryCodeA}
              countryName={entity.name}
              showNews={showNews}
              timelineYear={timelineYear}
              onCompare={onStartCompare}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}
