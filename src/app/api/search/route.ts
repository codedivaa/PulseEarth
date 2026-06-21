import { NextResponse } from 'next/server'
import { getAllCityDots } from '@/lib/queries'
import { getAllCountries } from '@/lib/restcountries'

export const revalidate = 300

interface SearchResult {
  id: string
  name: string
  subtitle: string
  lat: number
  lng: number
  type: 'country' | 'capital' | 'city'
  countryCode?: string
  flag?: string
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.toLowerCase().trim() || ''
  if (q.length < 2) return NextResponse.json({ results: [] })

  try {
    const [countries, cities] = await Promise.all([
      getAllCountries(),
      getAllCityDots(),
    ])

    const results: SearchResult[] = []
    const seenIds = new Set<string>()

    const push = (r: SearchResult) => {
      if (!r.id || seenIds.has(r.id)) return
      seenIds.add(r.id)
      results.push(r)
    }

    // 1. Countries matched by name
    for (const c of countries) {
      if (!c.code || !c.name) continue
      if (c.name.toLowerCase().includes(q)) {
        push({
          id: c.code,
          name: `${c.flag} ${c.name}`.trim(),
          subtitle: c.region,
          lat: c.lat,
          lng: c.lng,
          type: 'country',
          countryCode: c.code,
          flag: c.flag,
        })
      }
    }

    // 2. Capitals matched by name (always a unique id: 'cap:{code}')
    for (const c of countries) {
      if (!c.code || !c.capital) continue
      if (c.capital.toLowerCase().includes(q)) {
        push({
          id: `cap:${c.code}`,
          name: `${c.flag} ${c.capital}`.trim(),
          subtitle: `Capital · ${c.name}`,
          lat: c.lat,
          lng: c.lng,
          type: 'capital',
          countryCode: c.code,
          flag: c.flag,
        })
      }
    }

    // 3. DynamoDB cities
    for (const c of cities) {
      if (!c.cityId) continue
      if (c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)) {
        push({
          id: c.cityId,
          name: c.name,
          subtitle: c.country,
          lat: c.lat,
          lng: c.lng,
          type: 'city',
        })
      }
    }

    // Sort: exact name-start matches first, then by type priority
    const typeOrder = { country: 0, capital: 1, city: 2 }
    results.sort((a, b) => {
      const clean = (s: string) => s.toLowerCase().replace(/^[^\w]+/, '')
      const aExact = clean(a.name).startsWith(q) ? 0 : 1
      const bExact = clean(b.name).startsWith(q) ? 0 : 1
      if (aExact !== bExact) return aExact - bExact
      return (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3)
    })

    return NextResponse.json({ results: results.slice(0, 10) })
  } catch (err) {
    console.error('[search route]', err)
    return NextResponse.json({ results: [] })
  }
}
