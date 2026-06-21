export interface CountryData {
  countryCode: string
  name: string
  region: string
  capital?: string
  currency?: string
  flag?: string

  // Population in millions
  population_m: number
  // GDP in billions USD
  gdp_billion: number
  // GDP growth rate (%)
  gdpGrowth?: number
  // GDP per capita USD
  gdpPerCapita?: number
  // Inflation rate (%)
  inflation?: number
  // Unemployment rate (%)
  unemployment?: number
  // Life expectancy (years)
  lifeExpectancy?: number
  // Human Development Index (0–1)
  hdi?: number

  risk_score: number
  innovationScore?: number
  // Vintage year of World Bank data (e.g. 2022, 2023) — for display transparency
  dataYear?: number

  cities?: Array<{
    cityId: string
    name: string
    lat: number
    lng: number
    pulse_intensity: number
    country: string
  }>
}
