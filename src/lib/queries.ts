import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { getDb, TABLE_NAME } from './dynamo'
import type { CityMetrics, CityDot } from '@/types/city'

export async function getAllCityDots(): Promise<CityDot[]> {
  const result = await getDb().send(
    new ScanCommand({
      TableName: TABLE_NAME(),
      ProjectionExpression: 'cityId, #n, country, countryCode, lat, lng, pulse_intensity',
      ExpressionAttributeNames: { '#n': 'name' },
    })
  )

  const items = (result.Items ?? []) as CityMetrics[]
  const latest = new Map<string, CityMetrics>()
  for (const item of items) {
    const existing = latest.get(item.cityId)
    if (!existing || item.timestamp > existing.timestamp) {
      latest.set(item.cityId, item)
    }
  }

  return Array.from(latest.values()).map((c) => ({
    cityId: c.cityId,
    name: c.name,
    country: c.country,
    countryCode: c.countryCode,
    lat: c.lat,
    lng: c.lng,
    pulse_intensity: c.pulse_intensity,
  }))
}

export async function getCityById(cityId: string): Promise<CityMetrics | null> {
  const result = await getDb().send(
    new QueryCommand({
      TableName: TABLE_NAME(),
      KeyConditionExpression: 'cityId = :id',
      ExpressionAttributeValues: { ':id': cityId },
      ScanIndexForward: false,
      Limit: 1,
    })
  )
  return (result.Items?.[0] as CityMetrics) ?? null
}

export async function getCitiesByCountryCode(countryCode: string): Promise<CityDot[]> {
  const all = await getAllCityDots()
  return all.filter((c) => c.countryCode === countryCode)
}


