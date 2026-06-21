import Anthropic from '@anthropic-ai/sdk'

export async function GET(req: Request, { params }: { params: Promise<{ entityId: string }> }) {
  const { entityId } = await params
  const id  = decodeURIComponent(entityId)
  const url = new URL(req.url)
  const type = url.searchParams.get('type') || 'city'
  const mode = url.searchParams.get('mode') || 'brief'

  // Real metrics passed from the frontend after country data loads
  const population   = url.searchParams.get('population')
  const gdp          = url.searchParams.get('gdp')
  const gdpGrowth    = url.searchParams.get('gdpGrowth')
  const gdpPerCap    = url.searchParams.get('gdpPerCapita')
  const inflation    = url.searchParams.get('inflation')
  const unemployment = url.searchParams.get('unemployment')
  const lifeExp      = url.searchParams.get('lifeExpectancy')
  const capital      = url.searchParams.get('capital')
  const currency     = url.searchParams.get('currency')
  const region       = url.searchParams.get('region')
  const risk         = url.searchParams.get('risk')

  let prompt: string

  // News headlines passed from client (h0..h4)
  const headlines: string[] = []
  for (let i = 0; i < 5; i++) {
    const h = url.searchParams.get(`h${i}`)
    if (h) headlines.push(h)
  }

  if (type === 'country') {
    const dataLines: string[] = []
    if (region)       dataLines.push(`Region: ${region}`)
    if (capital)      dataLines.push(`Capital: ${capital}`)
    if (currency)     dataLines.push(`Currency: ${currency}`)
    if (population)   dataLines.push(`Population: ${population}M`)
    if (gdp)          dataLines.push(`GDP: $${gdp}B`)
    if (gdpGrowth)    dataLines.push(`GDP Growth: ${gdpGrowth}%`)
    if (gdpPerCap)    dataLines.push(`GDP per Capita: $${gdpPerCap}`)
    if (inflation)    dataLines.push(`Inflation: ${inflation}%`)
    if (unemployment) dataLines.push(`Unemployment: ${unemployment}%`)
    if (lifeExp)      dataLines.push(`Life Expectancy: ${lifeExp} years`)
    if (risk)         dataLines.push(`Risk Score: ${risk}/100`)

    const dataBlock = dataLines.length > 0
      ? `\n\nVerified economic data (World Bank):\n${dataLines.join('\n')}`
      : ''

    const headlineBlock = headlines.length > 0
      ? `\n\nLatest news headlines:\n${headlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
      : ''

    if (mode === 'anchor') {
      // Bloomberg-style anchor briefing grounded in real data + real headlines
      prompt = `You are a Bloomberg TV economic anchor delivering a live 45-second briefing on ${id}. Use ONLY the verified data and headlines below. Speak in present tense. Open with the most significant current development. Include GDP trajectory, one key risk, and one opportunity. Close with a 2025 outlook sentence. 90-130 words. No bullet points. Start immediately — no greeting.${headlineBlock}${dataBlock}`
    } else if (mode === 'news') {
      prompt = `You are an economic journalist. List exactly 3 notable economic developments for ${id} as of 2024–2025. For each: one bold headline, one supporting sentence. Format exactly:\n• [Headline]: [detail sentence]\n• [Headline]: [detail sentence]\n• [Headline]: [detail sentence]\nBase facts on real known events. Do not fabricate.${dataBlock}`
    } else if (mode === 'investment') {
      prompt = `Investment strategist brief for ${id} — 90 words: top sector opportunity, key structural risk, one near-term catalyst. Be specific. Use numbers from data. No generic statements.${dataBlock}`
    } else {
      // Default: Bloomberg intelligence brief
      prompt = `You are an economic intelligence analyst. Write a concise 110-word briefing for ${id} strictly based on the data below. Do NOT invent figures. Highlight growth trajectory, a key structural advantage, the top risk factor, and one investment theme. Bloomberg Terminal voice. No bullet points. Start immediately with content — no title, no preamble.${dataBlock}`
    }
  } else {
    // City brief
    const country = url.searchParams.get('country') || ''
    prompt = `Economic intelligence brief for ${id}${country ? `, ${country}` : ''} (city). In 110 words: economic role in the region, dominant industries, investment appeal, one overlooked strength, growth trajectory. Bloomberg Terminal voice. No bullet points. Start directly with content — no title.`
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('API key not configured', { status: 500 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const encoder = new TextEncoder()

  const body = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 280,
          messages: [{ role: 'user', content: prompt }],
        })

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } catch {
        // API failure — close cleanly so client doesn't hang
      } finally {
        controller.close()
      }
    },
  })

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
