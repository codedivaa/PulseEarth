// Bulk GDP-per-capita scores for all countries — used by heatmap + investment layers.
// Normalized on a log scale (0–1). Cached 24 h.

import { NextResponse } from 'next/server'
import { getAllCountries } from '@/lib/restcountries'

export const revalidate = 86400

export async function GET() {
  try {
    const [countries, gdpRes] = await Promise.all([
      getAllCountries(),
      fetch(
        'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&mrv=1&per_page=400',
        { signal: AbortSignal.timeout(12000) }
      ),
    ])

    // Build a set of valid ISO2 codes from our country list
    const validCodes = new Set(countries.map(c => c.code).filter(Boolean))

    if (!gdpRes.ok) return NextResponse.json({ scores: {} })

    const json = await gdpRes.json()
    const rows: any[] = json?.[1] ?? []

    // Collect raw GDP/capita values, only for real countries
    const raw: Record<string, number> = {}
    for (const row of rows) {
      const iso2: string = row.country?.id
      if (iso2 && validCodes.has(iso2) && row.value !== null && row.value !== undefined) {
        raw[iso2] = row.value
      }
    }

    if (Object.keys(raw).length === 0) return NextResponse.json({ scores: {} })

    // Log-normalize: handles the huge $300 → $130 000 range cleanly
    const logVals = Object.values(raw).map(v => Math.log(v + 1))
    const minLog  = Math.min(...logVals)
    const maxLog  = Math.max(...logVals)
    const range   = maxLog - minLog || 1

    const scores: Record<string, number> = {}
    for (const [iso2, val] of Object.entries(raw)) {
      scores[iso2] = Math.round(((Math.log(val + 1) - minLog) / range) * 1000) / 1000
    }

    return NextResponse.json({ scores })
  } catch (err) {
    console.error('[heatmap route]', err)
    return NextResponse.json({ scores: {} })
  }
}
