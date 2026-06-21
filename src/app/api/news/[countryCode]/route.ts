// Real-time economic news — multiple RSS sources, scored by freshness + source quality.
// force-dynamic prevents caching failed responses across requests.

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export interface NewsArticle {
  title: string
  source: string
  url: string
  pubDate: string
  summary: string
  ageLabel: string
}

// Country code → display name for search queries
const NAMES: Record<string, string> = {
  US: 'United States', IN: 'India', CN: 'China', GB: 'United Kingdom',
  DE: 'Germany', JP: 'Japan', FR: 'France', BR: 'Brazil', KR: 'South Korea',
  CA: 'Canada', AU: 'Australia', RU: 'Russia', MX: 'Mexico', ID: 'Indonesia',
  SA: 'Saudi Arabia', TR: 'Turkey', AR: 'Argentina', ZA: 'South Africa',
  NG: 'Nigeria', EG: 'Egypt', PK: 'Pakistan', AE: 'United Arab Emirates',
  SG: 'Singapore', TH: 'Thailand', MY: 'Malaysia', PH: 'Philippines',
  VN: 'Vietnam', IT: 'Italy', ES: 'Spain', NL: 'Netherlands',
  CH: 'Switzerland', SE: 'Sweden', NO: 'Norway', PL: 'Poland',
  UA: 'Ukraine', IR: 'Iran', IL: 'Israel', CL: 'Chile', CO: 'Colombia',
  PE: 'Peru', BD: 'Bangladesh', KZ: 'Kazakhstan', QA: 'Qatar',
  MA: 'Morocco', KE: 'Kenya', ET: 'Ethiopia', GH: 'Ghana',
  CZ: 'Czech Republic', HU: 'Hungary', RO: 'Romania', GR: 'Greece',
  PT: 'Portugal', BE: 'Belgium', AT: 'Austria', DK: 'Denmark',
  FI: 'Finland', NZ: 'New Zealand', IQ: 'Iraq', KW: 'Kuwait',
  OM: 'Oman', TZ: 'Tanzania', LK: 'Sri Lanka', MM: 'Myanmar', NP: 'Nepal',
  ZW: 'Zimbabwe', TN: 'Tunisia', SN: 'Senegal', CI: 'Ivory Coast',
}

// Country-specific Google News search queries — simple and effective
const COUNTRY_QUERIES: Record<string, string> = {
  IN: 'India economy GDP RBI finance inflation 2025',
  AE: 'UAE economy Dubai Abu Dhabi GDP trade finance 2025',
  SG: 'Singapore economy MAS GDP trade finance 2025',
  AU: 'Australia economy RBA GDP trade finance 2025',
  MY: 'Malaysia economy Bank Negara GDP trade finance 2025',
  GB: 'UK economy Bank of England GDP sterling finance 2025',
  JP: 'Japan economy Bank of Japan GDP yen finance 2025',
  KR: 'South Korea economy GDP Bank of Korea finance 2025',
  DE: 'Germany economy Bundesbank GDP DAX finance 2025',
  FR: 'France economy GDP ECB euro finance 2025',
  CN: 'China economy PBOC GDP yuan finance 2025',
  BR: 'Brazil economy GDP real finance inflation 2025',
  SA: 'Saudi Arabia economy oil GDP Vision 2030 finance 2025',
  NG: 'Nigeria economy naira GDP CBN finance 2025',
  ZA: 'South Africa economy GDP rand SARB finance 2025',
  KE: 'Kenya economy shilling GDP finance 2025',
  GH: 'Ghana economy cedi GDP IMF finance 2025',
  EG: 'Egypt economy pound GDP IMF finance 2025',
  PK: 'Pakistan economy rupee GDP IMF finance 2025',
  BD: 'Bangladesh economy taka GDP garments finance 2025',
  TR: 'Turkey economy lira GDP inflation finance 2025',
  ID: 'Indonesia economy rupiah GDP finance 2025',
  TH: 'Thailand economy baht GDP finance 2025',
  VN: 'Vietnam economy dong GDP manufacturing trade 2025',
  PH: 'Philippines economy peso GDP BSP finance 2025',
  MX: 'Mexico economy peso Banxico GDP finance 2025',
  AR: 'Argentina economy peso GDP inflation IMF 2025',
  CL: 'Chile economy peso copper GDP finance 2025',
  CO: 'Colombia economy peso GDP finance 2025',
  PE: 'Peru economy sol copper GDP finance 2025',
  IL: 'Israel economy shekel GDP tech finance 2025',
  QA: 'Qatar economy LNG GDP finance 2025',
  KW: 'Kuwait economy dinar oil GDP finance 2025',
  OM: 'Oman economy riyal oil GDP finance 2025',
  RU: 'Russia economy ruble GDP sanctions finance 2025',
  UA: 'Ukraine economy hryvnia GDP reconstruction 2025',
  KZ: 'Kazakhstan economy tenge GDP finance 2025',
  LK: 'Sri Lanka economy rupee GDP IMF 2025',
  NL: 'Netherlands economy euro GDP finance trade 2025',
  CH: 'Switzerland economy franc GDP finance 2025',
  SE: 'Sweden economy krona GDP finance 2025',
  NO: 'Norway economy krone oil GDP finance 2025',
  DK: 'Denmark economy krone GDP finance 2025',
  FI: 'Finland economy euro GDP finance 2025',
  PL: 'Poland economy zloty GDP finance 2025',
  IT: 'Italy economy euro GDP finance ECB 2025',
  ES: 'Spain economy euro GDP finance ECB 2025',
  GR: 'Greece economy euro GDP finance 2025',
  PT: 'Portugal economy euro GDP finance 2025',
  BE: 'Belgium economy euro GDP finance 2025',
  AT: 'Austria economy euro GDP finance 2025',
  NZ: 'New Zealand economy RBNZ GDP finance 2025',
  IR: 'Iran economy rial GDP sanctions finance 2025',
  IQ: 'Iraq economy dinar oil GDP finance 2025',
  MA: 'Morocco economy dirham GDP finance 2025',
  ET: 'Ethiopia economy birr GDP finance 2025',
  TZ: 'Tanzania economy shilling GDP finance 2025',
  TN: 'Tunisia economy dinar GDP finance 2025',
  SN: 'Senegal economy CFA franc GDP finance 2025',
  CI: 'Ivory Coast economy CFA franc GDP finance 2025',
  MM: 'Myanmar economy kyat GDP finance 2025',
  NP: 'Nepal economy rupee GDP finance 2025',
  ZW: 'Zimbabwe economy dollar GDP finance 2025',
}

// Country-specific RSS feeds — tried alongside standard sources
const EXTRA_FEEDS: Record<string, string[]> = {
  IN: [
    'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
    'https://www.business-standard.com/rss/latest.rss',
  ],
  AE: [
    'https://www.arabianbusiness.com/rss',
    'https://gulfnews.com/rss/business',
  ],
  SG: [
    'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416',
  ],
  AU: [
    'https://www.abc.net.au/news/feed/51892/rss.xml',
  ],
  JP: [
    'https://www.japantimes.co.jp/feed/business/',
  ],
  KR: [
    'https://businesskorea.co.kr/rss/allArticles.xml',
  ],
  SA: [
    'https://www.arabnews.com/taxonomy/term/5/feed',
  ],
  NG: [
    'https://businessday.ng/feed/',
  ],
  ZA: [
    'https://businesstech.co.za/news/feed/',
  ],
  KE: [
    'https://businessdailyafrica.com/rss/bd',
  ],
  GH: [
    'https://www.ghanaweb.com/GhanaHomePage/business/rss/business.rss',
  ],
  TR: [
    'https://www.hurriyetdailynews.com/rss/rss_business.xml',
  ],
  ID: [
    'https://www.thejakartapost.com/news/rss/business.xml',
  ],
  TH: [
    'https://www.bangkokpost.com/rss/data/business.xml',
  ],
  LK: [
    'https://economynext.com/feed/',
  ],
  PK: [
    'https://www.dawn.com/feeds/business',
  ],
  BD: [
    'https://thefinancialexpress.com.bd/feed',
  ],
  IL: [
    'https://en.globes.co.il/en/rss.aspx',
  ],
}

// Source quality scores (0-100)
const SOURCE_QUALITY: [RegExp, number][] = [
  [/reuters/i, 100],
  [/bloomberg/i, 100],
  [/financial times|ft\.com/i, 98],
  [/wall street journal|wsj/i, 95],
  [/associated press|ap news/i, 95],
  [/economist/i, 92],
  [/cnbc/i, 88],
  [/bbc/i, 85],
  [/new york times|nytimes/i, 85],
  [/guardian/i, 82],
  [/economic times/i, 85],      // India
  [/business standard/i, 82],   // India
  [/mint|livemint/i, 80],       // India
  [/arabian business/i, 82],    // UAE
  [/gulf news/i, 80],           // UAE
  [/channel newsasia|cna/i, 80], // Singapore
  [/straits times/i, 80],        // Singapore
  [/japan times/i, 82],          // Japan
  [/businessday/i, 78],          // Nigeria
  [/hurriyet daily|daily sabah/i, 75], // Turkey
  [/jakarta post/i, 76],         // Indonesia
  [/bangkok post/i, 76],         // Thailand
  [/globe and mail/i, 82],       // Canada
  [/afr|australian financial/i, 85], // Australia
  [/arab news/i, 78],            // Saudi Arabia
  [/dawn\.com/i, 78],            // Pakistan
  [/economy next/i, 75],         // Sri Lanka
  [/marketwatch/i, 78],
  [/yahoo finance/i, 72],
  [/fortune/i, 75],
  [/business insider/i, 72],
]

function sourceScore(source: string): number {
  for (const [re, score] of SOURCE_QUALITY) {
    if (re.test(source)) return score
  }
  return 55 // default
}

function freshnessScore(pubDateStr: string): number {
  // Missing or invalid date → treat as ~36h old (acceptable, not stale)
  if (!pubDateStr) return 65
  try {
    const d = new Date(pubDateStr)
    if (isNaN(d.getTime())) return 65  // unparseable date → treat as recent-ish
    const ageH = (Date.now() - d.getTime()) / 3_600_000
    if (ageH < 0)   return 70           // future date (clock skew) → treat as fresh
    if (ageH < 6)   return 100
    if (ageH < 24)  return 88
    if (ageH < 48)  return 72
    if (ageH < 72)  return 58
    if (ageH < 168) return 30   // 1 week
    if (ageH < 720) return 10   // 1 month
    return 2                    // older — show if nothing else available
  } catch { return 65 }
}

function combinedScore(a: NewsArticle): number {
  return freshnessScore(a.pubDate) * 2.2 + sourceScore(a.source)
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ').trim()
}

function ageLabel(pubDateStr: string): string {
  if (!pubDateStr) return 'recently'
  try {
    const d = new Date(pubDateStr)
    if (isNaN(d.getTime())) return 'recently'
    const ms = Date.now() - d.getTime()
    if (ms < 0) return 'just now'
    const h = ms / 3_600_000
    if (h < 1) return `${Math.round(ms / 60000)}m ago`
    if (h < 24) return `${Math.round(h)}h ago`
    const days = Math.round(h / 24)
    return days === 1 ? 'yesterday' : `${days}d ago`
  } catch { return 'recently' }
}

function parseRss(xml: string, maxItems = 10): NewsArticle[] {
  const out: NewsArticle[] = []
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []
  for (const item of items.slice(0, maxItems)) {
    try {
      const title = stripHtml(
        item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
        item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''
      )
      const url =
        item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ??
        item.match(/<feedburner:origLink>([\s\S]*?)<\/feedburner:origLink>/)?.[1]?.trim() ?? ''
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? ''
      const source = stripHtml(
        item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? 'News'
      )
      const raw = stripHtml(
        item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ??
        item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? ''
      )
      const summary = raw.replace(/^\s*[\d.\-•]+\s*/, '').slice(0, 200)
      if (title.length > 8 && url) {
        out.push({ title, source, url, pubDate, summary, ageLabel: ageLabel(pubDate) })
      }
    } catch { /* skip malformed */ }
  }
  return out
}

const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'

async function tryFetch(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'User-Agent': CHROME_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    })
    if (!res.ok) return null
    const text = await res.text()
    return text.includes('<item>') ? text : null
  } catch { return null }
}

async function fetchGoogleNews(query: string): Promise<NewsArticle[]> {
  const q = encodeURIComponent(query)
  const xml = await tryFetch(`https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`)
  return xml ? parseRss(xml) : []
}

// Aliases for country names that rarely appear literally in financial news
const COUNTRY_ALIASES: Record<string, string[]> = {
  'united arab emirates': ['uae', 'dubai', 'abu dhabi', 'emirati', 'adgm', 'difc'],
  'united states':        ['american', 'u.s.', 'us economy', 'federal reserve', 'wall street', 'nasdaq', 'new york fed'],
  'united kingdom':       ['uk', 'british', 'england', 'sterling', 'bank of england', 'ftse', 'london stock'],
  'south korea':          ['korea', 'korean'],
  'saudi arabia':         ['saudi', 'aramco', 'riyadh'],
  'new zealand':          ['kiwi', 'rbnz'],
  'hong kong':            ['hksar', 'hkex'],
  'ivory coast':          ["côte d'ivoire", 'cote divoire', 'ivorian'],
  'south africa':         ['south african', 'rand', 'sarb', 'johannesburg'],
  'czech republic':       ['czech', 'czechia', 'prague'],
  'sri lanka':            ['colombo', 'ceylon'],
  'new caledonia':        ['noumea'],
}

async function fetchRssFiltered(feedUrl: string, name: string): Promise<NewsArticle[]> {
  const xml = await tryFetch(feedUrl)
  if (!xml) return []
  const all = parseRss(xml, 20)
  const nl = name.toLowerCase()
  const aliases = COUNTRY_ALIASES[nl] ?? []
  return all.filter(a => {
    const title   = a.title.toLowerCase()
    const summary = a.summary.toLowerCase()
    return title.includes(nl)     || summary.includes(nl) ||
           aliases.some(alias => title.includes(alias) || summary.includes(alias))
  })
}

async function fetchExtraFeeds(code: string, name: string): Promise<NewsArticle[]> {
  const feeds = EXTRA_FEEDS[code] ?? []
  if (feeds.length === 0) return []
  const results = await Promise.allSettled(feeds.map(url => tryFetch(url, 6000)))
  const articles: NewsArticle[] = []
  const seen = new Set<string>()
  for (const r of results) {
    if (r.status !== 'fulfilled' || !r.value) continue
    for (const a of parseRss(r.value, 15)) {
      const key = a.title.toLowerCase().slice(0, 40)
      if (!seen.has(key)) { seen.add(key); articles.push(a) }
    }
  }
  // Extra feeds are country-specific — return all articles regardless of name match
  return articles
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ countryCode: string }> }
) {
  const { countryCode } = await params
  const code = countryCode.toUpperCase()
  const name = NAMES[code] ?? decodeURIComponent(countryCode)
  const customQuery = COUNTRY_QUERIES[code] ?? `${name} economy GDP finance`

  try {
    // Run all sources in parallel — custom query + generic backup + BBC + Reuters + country feeds
    const [googleArticles, googleGeneric, bbcArticles, reutersArticles, extraArticles] = await Promise.all([
      fetchGoogleNews(customQuery),
      fetchGoogleNews(`${name} economy GDP finance`),
      fetchRssFiltered('https://feeds.bbci.co.uk/news/business/rss.xml', name),
      fetchRssFiltered('https://feeds.reuters.com/reuters/businessNews', name),
      fetchExtraFeeds(code, name),
    ])

    // Merge and deduplicate by title prefix (country feeds first for relevance)
    const seen = new Set<string>()
    const merged: NewsArticle[] = []
    for (const a of [...extraArticles, ...googleArticles, ...googleGeneric, ...bbcArticles, ...reutersArticles]) {
      const key = a.title.toLowerCase().slice(0, 40)
      if (!seen.has(key)) { seen.add(key); merged.push(a) }
    }

    // Sort: freshness × 2.2 + source quality (combined score)
    const sorted = merged.sort((a, b) => combinedScore(b) - combinedScore(a))

    // Only report unavailable if truly nothing exists (even within 30 days)
    // score >= 2 means within ~30 days (scores: 10=1mo, 2=older-but-present)
    const hasAnyContent = sorted.some(a => freshnessScore(a.pubDate) >= 2)
    if (!hasAnyContent) {
      return NextResponse.json({
        articles: [], country: name,
        fetchedAt: new Date().toISOString(),
        unavailable: true, noRecent: true,
      })
    }

    // Tiered selection: prefer <72h, fall back to <7d, then <30d, then whatever exists
    const within72h  = sorted.filter(a => freshnessScore(a.pubDate) >= 58)
    const within7d   = sorted.filter(a => freshnessScore(a.pubDate) >= 30)
    const within30d  = sorted.filter(a => freshnessScore(a.pubDate) >= 10)
    const articles   = (
      within72h.length  >= 3 ? within72h  :
      within7d.length   >= 3 ? within7d   :
      within30d.length  >= 2 ? within30d  :
      sorted
    ).slice(0, 8)

    return NextResponse.json({
      articles, country: name,
      fetchedAt: new Date().toISOString(),
      unavailable: articles.length === 0,
      noRecent: within72h.length === 0 && within7d.length === 0,
    })
  } catch (err) {
    console.error('[news route]', err)
    return NextResponse.json({ articles: [], unavailable: true })
  }
}
