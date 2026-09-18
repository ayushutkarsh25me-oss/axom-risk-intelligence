export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'

export type SeismicLevel = 'Low' | 'Moderate' | 'High'

export interface LocationData {
  id: string
  name: string
  state: string
  lat: number
  lng: number
  riskScore: number
  risk: RiskLevel
  confidence: number
  rainfall: number // mm (24h)
  soilSaturation: number // %
  slope: number // degrees
  seismic: SeismicLevel
  vegetation: number // %
  recommendation: string
  trendDelta: number // change vs previous cycle
  history: number[] // last 24h risk scores
}

export interface AlertData {
  id: string
  locationId: string
  location: string
  severity: RiskLevel
  riskScore: number
  message: string
  time: string
  status: 'active' | 'acknowledged'
}

// Geographic bounding box for the North Eastern Region map projection
export const MAP_BOUNDS = {
  minLng: 88,
  maxLng: 97.6,
  minLat: 22.4,
  maxLat: 28.7,
}

/** Project lat/lng to a 0-100 percentage position within the map bounds. */
export function projectToMap(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100
  return { x, y }
}

export function classifyRisk(score: number): RiskLevel {
  if (score >= 0.8) return 'critical'
  if (score >= 0.6) return 'high'
  if (score >= 0.4) return 'moderate'
  return 'low'
}

export const RISK_META: Record<
  RiskLevel,
  { label: string; token: string; text: string; bg: string; border: string; dot: string }
> = {
  low: {
    label: 'LOW',
    token: 'var(--risk-low)',
    text: 'text-risk-low',
    bg: 'bg-risk-low/12',
    border: 'border-risk-low/40',
    dot: 'bg-risk-low',
  },
  moderate: {
    label: 'MODERATE',
    token: 'var(--risk-moderate)',
    text: 'text-risk-moderate',
    bg: 'bg-risk-moderate/12',
    border: 'border-risk-moderate/40',
    dot: 'bg-risk-moderate',
  },
  high: {
    label: 'HIGH',
    token: 'var(--risk-high)',
    text: 'text-risk-high',
    bg: 'bg-risk-high/12',
    border: 'border-risk-high/40',
    dot: 'bg-risk-high',
  },
  critical: {
    label: 'CRITICAL',
    token: 'var(--risk-critical)',
    text: 'text-risk-critical',
    bg: 'bg-risk-critical/15',
    border: 'border-risk-critical/50',
    dot: 'bg-risk-critical',
  },
}

function makeHistory(base: number): number[] {
  const pts: number[] = []
  let v = Math.max(0.05, base - 0.28)
  for (let i = 0; i < 24; i++) {
    const drift = (base - v) * 0.12
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * 0.015
    v = Math.min(0.97, Math.max(0.03, v + drift + noise))
    pts.push(Number(v.toFixed(3)))
  }
  pts[pts.length - 1] = base
  return pts
}

export const LOCATIONS: LocationData[] = [
  {
    id: 'east-khasi-hills',
    name: 'East Khasi Hills',
    state: 'Meghalaya',
    lat: 25.45,
    lng: 91.75,
    riskScore: 0.82,
    risk: 'critical',
    confidence: 0.91,
    rainfall: 142,
    soilSaturation: 87,
    slope: 34,
    seismic: 'Moderate',
    vegetation: 41,
    recommendation:
      'Immediate evacuation advisory. Avoid slope-side roads and notify district authorities.',
    trendDelta: 0.14,
    history: makeHistory(0.82),
  },
  {
    id: 'aizawl',
    name: 'Aizawl',
    state: 'Mizoram',
    lat: 23.72,
    lng: 92.72,
    riskScore: 0.68,
    risk: 'high',
    confidence: 0.86,
    rainfall: 108,
    soilSaturation: 74,
    slope: 38,
    seismic: 'Low',
    vegetation: 55,
    recommendation:
      'Enhanced monitoring recommended. Pre-position response teams and restrict heavy vehicles on hill roads.',
    trendDelta: 0.08,
    history: makeHistory(0.68),
  },
  {
    id: 'gangtok',
    name: 'Gangtok',
    state: 'Sikkim',
    lat: 27.33,
    lng: 88.61,
    riskScore: 0.64,
    risk: 'high',
    confidence: 0.83,
    rainfall: 96,
    soilSaturation: 71,
    slope: 41,
    seismic: 'High',
    vegetation: 49,
    recommendation:
      'Enhanced monitoring recommended. Inspect known landslide-prone stretches along NH-10.',
    trendDelta: 0.05,
    history: makeHistory(0.64),
  },
  {
    id: 'itanagar',
    name: 'Itanagar',
    state: 'Arunachal Pradesh',
    lat: 27.08,
    lng: 93.6,
    riskScore: 0.61,
    risk: 'high',
    confidence: 0.8,
    rainfall: 88,
    soilSaturation: 69,
    slope: 29,
    seismic: 'Moderate',
    vegetation: 62,
    recommendation:
      'Enhanced monitoring recommended. Issue advisory to communities near cut slopes.',
    trendDelta: 0.03,
    history: makeHistory(0.61),
  },
  {
    id: 'kohima',
    name: 'Kohima',
    state: 'Nagaland',
    lat: 25.67,
    lng: 94.11,
    riskScore: 0.46,
    risk: 'moderate',
    confidence: 0.78,
    rainfall: 61,
    soilSaturation: 58,
    slope: 27,
    seismic: 'Low',
    vegetation: 66,
    recommendation: 'Continue monitoring. No action required beyond routine surveillance.',
    trendDelta: -0.02,
    history: makeHistory(0.46),
  },
  {
    id: 'shillong',
    name: 'Shillong',
    state: 'Meghalaya',
    lat: 25.57,
    lng: 91.88,
    riskScore: 0.44,
    risk: 'moderate',
    confidence: 0.79,
    rainfall: 58,
    soilSaturation: 55,
    slope: 22,
    seismic: 'Moderate',
    vegetation: 60,
    recommendation: 'Continue monitoring. Watch rainfall accumulation over the next 12 hours.',
    trendDelta: 0.01,
    history: makeHistory(0.44),
  },
  {
    id: 'guwahati',
    name: 'Guwahati',
    state: 'Assam',
    lat: 26.14,
    lng: 91.73,
    riskScore: 0.41,
    risk: 'moderate',
    confidence: 0.82,
    rainfall: 52,
    soilSaturation: 53,
    slope: 14,
    seismic: 'Moderate',
    vegetation: 47,
    recommendation: 'Continue monitoring. Localized risk concentrated on Nilachal and hillside colonies.',
    trendDelta: -0.03,
    history: makeHistory(0.41),
  },
  {
    id: 'imphal',
    name: 'Imphal',
    state: 'Manipur',
    lat: 24.81,
    lng: 93.94,
    riskScore: 0.28,
    risk: 'low',
    confidence: 0.84,
    rainfall: 34,
    soilSaturation: 42,
    slope: 11,
    seismic: 'Low',
    vegetation: 58,
    recommendation: 'No action required. Conditions stable within normal range.',
    trendDelta: -0.04,
    history: makeHistory(0.28),
  },
]

export function getLocation(id: string): LocationData | undefined {
  return LOCATIONS.find((l) => l.id === id)
}

// Fleet-wide summary (24 monitored locations; 8 are individually instrumented demo sites)
export const SUMMARY = {
  monitored: 24,
  low: 10,
  moderate: 6,
  high: 6,
  critical: 2,
  activeAlerts: 8,
}

export const ALERTS: AlertData[] = [
  {
    id: 'alert-01',
    locationId: 'east-khasi-hills',
    location: 'East Khasi Hills',
    severity: 'critical',
    riskScore: 0.82,
    message: 'Immediate evacuation advisory',
    time: '10:42 PM',
    status: 'active',
  },
  {
    id: 'alert-02',
    locationId: 'aizawl',
    location: 'Aizawl',
    severity: 'high',
    riskScore: 0.68,
    message: 'Enhanced monitoring recommended',
    time: '10:37 PM',
    status: 'active',
  },
  {
    id: 'alert-03',
    locationId: 'gangtok',
    location: 'Gangtok',
    severity: 'high',
    riskScore: 0.64,
    message: 'Inspect NH-10 landslide-prone stretches',
    time: '10:33 PM',
    status: 'active',
  },
  {
    id: 'alert-04',
    locationId: 'kohima',
    location: 'Kohima',
    severity: 'moderate',
    riskScore: 0.46,
    message: 'Continue monitoring',
    time: '10:30 PM',
    status: 'active',
  },
  {
    id: 'alert-05',
    locationId: 'itanagar',
    location: 'Itanagar',
    severity: 'high',
    riskScore: 0.61,
    message: 'Advisory to communities near cut slopes',
    time: '10:24 PM',
    status: 'active',
  },
  {
    id: 'alert-06',
    locationId: 'shillong',
    location: 'Shillong',
    severity: 'moderate',
    riskScore: 0.44,
    message: 'Watch rainfall accumulation',
    time: '10:19 PM',
    status: 'acknowledged',
  },
  {
    id: 'alert-07',
    locationId: 'guwahati',
    location: 'Guwahati',
    severity: 'moderate',
    riskScore: 0.41,
    message: 'Localized hillside-colony risk',
    time: '10:11 PM',
    status: 'acknowledged',
  },
  {
    id: 'alert-08',
    locationId: 'east-khasi-hills',
    location: 'East Khasi Hills',
    severity: 'critical',
    riskScore: 0.79,
    message: 'Soil saturation threshold exceeded',
    time: '09:58 PM',
    status: 'active',
  },
]

// Aggregated 24-hour fleet risk trend for the analytics charts
export const RISK_TREND_24H = Array.from({ length: 24 }, (_, i) => {
  const hour = (i + 23) % 24
  const label = `${String(hour).padStart(2, '0')}:00`
  const wave = Math.sin((i / 24) * Math.PI * 1.6)
  const critical = Number((0.34 + wave * 0.16 + (i / 24) * 0.22).toFixed(3))
  const average = Number((0.28 + wave * 0.1 + (i / 24) * 0.12).toFixed(3))
  return {
    time: label,
    average: Math.max(0.05, average),
    peak: Math.min(0.95, Math.max(average + 0.05, critical)),
  }
})

export interface FactorWeight {
  name: string
  value: number // 0-100 contribution/intensity
}

export const ENV_FACTORS: FactorWeight[] = [
  { name: 'Rainfall', value: 92 },
  { name: 'Soil Saturation', value: 87 },
  { name: 'Slope', value: 68 },
  { name: 'Seismic Activity', value: 31 },
  { name: 'Vegetation', value: 41 },
]

export const DATA_SOURCES = [
  {
    id: 'imd',
    name: 'India Meteorological Department (IMD)',
    short: 'IMD',
    provides: 'Rainfall data',
    detail:
      'Real-time and forecast precipitation, cumulative rainfall thresholds and nowcast warnings feeding the rainfall-intensity feature.',
    cadence: 'Every 15 min (planned)',
    status: 'planned',
  },
  {
    id: 'isro-bhuvan',
    name: 'ISRO Bhuvan / Sentinel',
    short: 'ISRO',
    provides: 'Elevation, slope and land-cover information',
    detail:
      'Digital elevation models, derived slope/aspect and multispectral land-cover classification for terrain and vegetation features.',
    cadence: 'Daily / per-pass (planned)',
    status: 'planned',
  },
  {
    id: 'gsi-bhukosh',
    name: 'GSI Bhukosh',
    short: 'GSI',
    provides: 'Historical landslide inventory and susceptibility information',
    detail:
      'National landslide inventory, susceptibility zonation and geological substrate used to calibrate the model baseline.',
    cadence: 'Periodic (planned)',
    status: 'planned',
  },
  {
    id: 'cwc',
    name: 'Central Water Commission',
    short: 'CWC',
    provides: 'Soil moisture / hydrology information',
    detail:
      'River stage, reservoir levels and modelled soil-moisture indices contributing to the saturation feature.',
    cadence: 'Hourly (planned)',
    status: 'planned',
  },
] as const

export const LAST_UPDATED = '10:45 PM'
export const NEXT_UPDATE = '11:00 PM'

/**
 * Prototype inference stub. Produces a deterministic pseudo risk score from
 * environmental inputs so the simulator behaves plausibly. This is a
 * placeholder for the Random Forest model that will be connected later.
 */
export function simulateRisk(input: {
  rainfall: number
  soilSaturation: number
  slope: number
  seismic: number
  vegetation: number
}): { score: number; risk: RiskLevel; contributions: FactorWeight[] } {
  const rainfallN = input.rainfall / 300
  const soilN = input.soilSaturation / 100
  const slopeN = input.slope / 60
  const seismicN = input.seismic / 100
  const vegProtection = input.vegetation / 100

  const weighted =
    rainfallN * 0.34 +
    soilN * 0.28 +
    slopeN * 0.22 +
    seismicN * 0.16 -
    vegProtection * 0.12

  const score = Math.min(0.98, Math.max(0.02, weighted + 0.06))

  const contributions: FactorWeight[] = [
    { name: 'Rainfall', value: Math.round(rainfallN * 100) },
    { name: 'Soil Saturation', value: Math.round(soilN * 100) },
    { name: 'Slope', value: Math.round(slopeN * 100) },
    { name: 'Seismic Activity', value: Math.round(seismicN * 100) },
    { name: 'Vegetation Cover', value: Math.round(vegProtection * 100) },
  ]

  return { score: Number(score.toFixed(2)), risk: classifyRisk(score), contributions }
}
