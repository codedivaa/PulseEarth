export interface CityMetrics {
  cityId: string
  timestamp: string
  name: string
  country: string
  countryCode: string
  lat: number
  lng: number
  gdp_billion: number
  population_m: number
  startup_count: number
  trade_volume_b: number
  risk_score: number
  pulse_intensity: number
  ai_insight?: string
  insight_updated?: string
}

export interface CityDot {
  cityId: string
  name: string
  country: string
  countryCode: string
  lat: number
  lng: number
  pulse_intensity: number
}