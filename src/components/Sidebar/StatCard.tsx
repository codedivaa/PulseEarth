'use client'

import { motion } from 'framer-motion'

interface Props {
  label: string
  value: string | number
  color?: string
  delay?: number
}

export default function StatCard({ label, value, color = '#FFD166', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
      className="rounded-lg p-4 border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.035] transition-colors"
    >
      <p className="text-[10px] text-white/35 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
    </motion.div>
  )
}