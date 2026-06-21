import { NextResponse } from 'next/server'
import { getCityById } from '@/lib/queries'

export async function GET(_req: Request, { params }: { params: Promise<{ cityId: string }> }) {
  const { cityId } = await params
  try {
    const city = await getCityById(decodeURIComponent(cityId))
    if (!city) return NextResponse.json({ success: false }, { status: 404 })
    return NextResponse.json({ success: true, city })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}