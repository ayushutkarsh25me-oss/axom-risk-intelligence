/**
 * AXOM Frontend API Client
 * ------------------------
 * Communicates with the FastAPI backend (default: http://localhost:8000).
 * Every function incorporates graceful fallback to static mock data in lib/data.ts
 * so the application functions seamlessly in both online and offline/demo states.
 */

import {
  LOCATIONS,
  ALERTS,
  SUMMARY,
  simulateRisk,
  type LocationData,
  type AlertData,
  type RiskLevel,
  type FactorWeight,
} from './data'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/** Helper to handle network requests with a timeout */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

export interface BackendHealth {
  status: string
  service: string
  version: string
}

export async function checkBackendHealth(): Promise<BackendHealth | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/health`, { cache: 'no-store' }, 2000)
    if (res.ok) return await res.json()
    return null
  } catch {
    return null
  }
}

/**
 * Fetch all monitored locations from backend /api/locations.
 * Falls back to local LOCATIONS if backend is unavailable.
 */
export async function fetchLocations(): Promise<LocationData[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/locations`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // Map backend snake_case to frontend LocationData format
    return data.map((item: any): LocationData => {
      const existing = LOCATIONS.find((l) => l.id === item.id)
      return {
        id: item.id,
        name: item.name,
        state: item.state,
        lat: item.latitude,
        lng: item.longitude,
        riskScore: item.risk_score,
        risk: (item.risk_level.toLowerCase() as RiskLevel),
        confidence: item.confidence ?? existing?.confidence ?? 0.82,
        rainfall: item.rainfall,
        soilSaturation: item.soil_saturation,
        slope: item.slope,
        seismic: (item.seismic_activity as any) ?? existing?.seismic ?? 'Moderate',
        vegetation: item.vegetation ?? existing?.vegetation ?? 50,
        recommendation: item.recommendation ?? existing?.recommendation ?? '',
        trendDelta: item.trend_delta ?? existing?.trendDelta ?? 0.0,
        history: item.history ?? existing?.history ?? [],
      }
    })
  } catch {
    return LOCATIONS
  }
}

/**
 * Fetch a single location detail from /api/locations/{id}.
 */
export async function fetchLocationDetail(id: string): Promise<LocationData | undefined> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/locations/${id}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const item = await res.json()
    const existing = LOCATIONS.find((l) => l.id === item.id)
    return {
      id: item.id,
      name: item.name,
      state: item.state,
      lat: item.latitude,
      lng: item.longitude,
      riskScore: item.risk_score,
      risk: (item.risk_level.toLowerCase() as RiskLevel),
      confidence: item.confidence ?? existing?.confidence ?? 0.85,
      rainfall: item.rainfall,
      soilSaturation: item.soil_saturation,
      slope: item.slope,
      seismic: (item.seismic_activity as any) ?? existing?.seismic ?? 'Moderate',
      vegetation: item.vegetation ?? existing?.vegetation ?? 50,
      recommendation: item.recommendation ?? existing?.recommendation ?? '',
      trendDelta: item.trend_delta ?? existing?.trendDelta ?? 0.0,
      history: item.history ?? existing?.history ?? [],
    }
  } catch {
    return LOCATIONS.find((l) => l.id === id)
  }
}

export interface RiskPredictionResult {
  score: number
  risk: RiskLevel
  contributions: FactorWeight[]
  recommendation?: string
}

/**
 * Calculates landslide risk by calling POST /api/risk/predict.
 * Falls back to local simulateRisk() if backend is unreachable.
 */
export async function calculateRiskScore(input: {
  rainfall: number
  soilSaturation: number
  slope: number
  seismic: number
  vegetation: number
}): Promise<RiskPredictionResult> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/risk/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rainfall: input.rainfall,
        soil_saturation: input.soilSaturation,
        slope: input.slope,
        seismic_activity: input.seismic,
        vegetation_cover: input.vegetation,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return {
      score: data.risk_score,
      risk: (data.risk_level.toLowerCase() as RiskLevel),
      contributions: data.factors.map((f: any) => ({
        name: f.name,
        value: Math.round(f.contribution_pct),
      })),
      recommendation: data.recommendation,
    }
  } catch {
    return simulateRisk(input)
  }
}

/**
 * Fetch current alerts from /api/alerts.
 */
export async function fetchAlerts(): Promise<AlertData[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/alerts`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.map((a: any) => ({
      id: a.id,
      locationId: a.location_id,
      location: a.location_name,
      severity: (a.severity.toLowerCase() as RiskLevel),
      riskScore: a.risk_score,
      message: a.message,
      time: a.created_at,
      status: a.status,
    }))
  } catch {
    return ALERTS
  }
}

/**
 * Acknowledge an alert via POST /api/alerts/{id}/acknowledge.
 */
export async function acknowledgeAlertApi(alertId: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Fetch analytics summary from /api/analytics/summary.
 */
export async function fetchAnalyticsSummary(): Promise<any> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/analytics/summary`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    return SUMMARY
  }
}
