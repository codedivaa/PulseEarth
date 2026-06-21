// World Bank indicator API — free, no auth
// https://api.worldbank.org/v2/country/{code}/indicator/{id}?format=json&mrv=5
// In-memory cache: 24h TTL

const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const BASE = 'https://api.worldbank.org/v2'

interface CacheEntry<T> { data: T; ts: number }
const indicatorCache = new Map<string, CacheEntry<number | null>>()
// Tracks the vintage year of each cached indicator (e.g. "2022", "2023")
const yearCache = new Map<string, string>()

function getCached(key: string): number | null | undefined {
  const e = indicatorCache.get(key)
  if (!e) return undefined
  if (Date.now() - e.ts > CACHE_TTL_MS) { indicatorCache.delete(key); yearCache.delete(key); return undefined }
  return e.data
}
function setCached(key: string, val: number | null) {
  indicatorCache.set(key, { data: val, ts: Date.now() })
}

async function fetchIndicator(countryCode: string, indicator: string, year?: number): Promise<number | null> {
  const key = `${countryCode}:${indicator}:${year ?? 'latest'}`
  const hit = getCached(key)
  if (hit !== undefined) return hit

  try {
    const url = year
      ? `${BASE}/country/${countryCode}/indicator/${indicator}?format=json&date=${year}&per_page=1`
      : `${BASE}/country/${countryCode}/indicator/${indicator}?format=json&mrv=5&per_page=5`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) { setCached(key, null); return null }

    const json = await res.json()
    // WB response: [{ page, pages, ... }, [ { date, value, ... }, ... ]]
    const rows: any[] = json?.[1] ?? []

    for (const row of rows) {
      if (row.value !== null && row.value !== undefined) {
        const v = parseFloat(row.value)
        if (!isNaN(v)) {
          if (row.date) yearCache.set(key, String(row.date))  // record data vintage
          setCached(key, v)
          return v
        }
      }
    }
    setCached(key, null)
    return null
  } catch {
    return null
  }
}

// World Bank indicator codes
const IND = {
  population:     'SP.POP.TOTL',        // total population
  gdp:            'NY.GDP.MKTP.CD',     // GDP current USD
  gdpGrowth:      'NY.GDP.MKTP.KD.ZG', // GDP growth % annual
  gdpPerCapita:   'NY.GDP.PCAP.CD',    // GDP per capita current USD
  inflation:      'FP.CPI.TOTL.ZG',    // CPI inflation %
  unemployment:   'SL.UEM.TOTL.ZS',    // unemployment % of labour force
  lifeExpectancy: 'SP.DYN.LE00.IN',    // life expectancy at birth
}

export interface WorldBankData {
  population_m:   number | null   // millions
  gdp_billion:    number | null   // billions USD
  gdpGrowth:      number | null   // %
  gdpPerCapita:   number | null   // USD
  inflation:      number | null   // %
  unemployment:   number | null   // %
  lifeExpectancy: number | null   // years
  dataYear:       number | null   // vintage year of the GDP indicator (proxy for all indicators)
}

export async function getWorldBankData(countryCode: string, year?: number): Promise<WorldBankData> {
  const code = countryCode.toUpperCase()

  const [pop, gdp, gdpG, gdpPC, inf, unemp, lifeExp] = await Promise.all([
    fetchIndicator(code, IND.population, year),
    fetchIndicator(code, IND.gdp, year),
    fetchIndicator(code, IND.gdpGrowth, year),
    fetchIndicator(code, IND.gdpPerCapita, year),
    fetchIndicator(code, IND.inflation, year),
    fetchIndicator(code, IND.unemployment, year),
    fetchIndicator(code, IND.lifeExpectancy, year),
  ])

  // Use GDP year as the representative vintage (available for most countries)
  const gdpKey = `${code}:${IND.gdp}:${year ?? 'latest'}`
  const rawYear = yearCache.get(gdpKey)
  const dataYear = rawYear ? parseInt(rawYear, 10) : null

  return {
    population_m:   pop     !== null ? Math.round(pop / 1e4) / 100   : null,
    gdp_billion:    gdp     !== null ? Math.round(gdp / 1e7) / 100   : null,
    gdpGrowth:      gdpG    !== null ? Math.round(gdpG * 10) / 10    : null,
    gdpPerCapita:   gdpPC   !== null ? Math.round(gdpPC)              : null,
    inflation:      inf     !== null ? Math.round(inf * 10) / 10      : null,
    unemployment:   unemp   !== null ? Math.round(unemp * 10) / 10   : null,
    lifeExpectancy: lifeExp !== null ? Math.round(lifeExp * 10) / 10  : null,
    dataYear,
  }
}
