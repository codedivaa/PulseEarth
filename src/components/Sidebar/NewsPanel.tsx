'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { NewsArticle } from '@/app/api/news/[countryCode]/route'

interface Props { countryCode: string }

export default function NewsPanel({ countryCode }: Props) {
  const [articles,  setArticles]  = useState<NewsArticle[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(false)
  const [noRecent,  setNoRecent]  = useState(false)
  const [fetchedAt, setFetchedAt] = useState('')

  useEffect(() => {
    setLoading(true)
    setArticles([])
    setError(false)
    setNoRecent(false)

    fetch(`/api/news/${encodeURIComponent(countryCode)}`)
      .then(r => r.json())
      .then(d => {
        if (d.unavailable || !d.articles?.length) {
          setNoRecent(d.noRecent === true)
          setError(true)
          return
        }
        setArticles(d.articles)
        setFetchedAt(d.fetchedAt ?? '')
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [countryCode])

  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04]">
        <span className="text-sm">📰</span>
        <p className="text-[10px] text-white/40 uppercase tracking-[0.18em] flex-1">
          Economic News
        </p>
        {fetchedAt && (
          <span className="text-[9px] text-white/18">
            {new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {loading && (
          <div className="w-2.5 h-2.5 border border-[#FFD166]/30 border-t-[#FFD166]/80 rounded-full animate-spin" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="skeleton" className="p-3 space-y-2.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 bg-white/[0.04] rounded animate-pulse" style={{ width: `${75 + i * 8}%` }} />
                <div className="h-2.5 bg-white/[0.03] rounded animate-pulse w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-5 text-[12px] text-white/22 text-center"
          >
            {noRecent
              ? 'No recent economic developments available.'
              : 'Latest economic news currently unavailable.'}
          </motion.p>
        ) : (
          <motion.div key="articles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-white/[0.03]">
            {articles.map((a, i) => (
              <motion.a
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="block px-4 py-3 hover:bg-white/[0.025] transition-colors group"
              >
                <p className="text-[12px] text-white/72 leading-snug group-hover:text-white/90 transition-colors line-clamp-2">
                  {a.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-[#FFD166]/55 font-medium">{a.source}</span>
                  <span className="text-[9px] text-white/22">·</span>
                  <span className="text-[9px] text-white/28">{a.ageLabel}</span>
                </div>
                {a.summary && (
                  <p className="text-[10px] text-white/28 mt-1 line-clamp-1">{a.summary}</p>
                )}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
