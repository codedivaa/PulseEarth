'use client'

export default function LoadingScreen() {
  return (
    <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center z-50">
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border border-[#FFD166]/15 animate-ping" />
        <div className="absolute inset-2 rounded-full border border-[#FFD166]/30 animate-ping [animation-delay:200ms]" />
        <div className="absolute inset-4 rounded-full border border-[#FFD166]/60" />
        <div className="absolute inset-[46%] rounded-full bg-[#FFD166]" />
      </div>
      <h1 className="text-lg font-bold text-gold-gradient mb-1">PulseEarth</h1>
      <p className="text-[10px] text-white/25 tracking-[0.2em] uppercase">Loading Economic Intelligence</p>
    </div>
  )
}