import { LOCATIONS, LocationData, RiskLevel } from '@/lib/data'

export interface StartingLocation {
  id: string
  name: string
  state: string
  lat: number
  lng: number
  isHub?: boolean
}

export interface RouteOption {
  id: string
  name: string
  riskExposure: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MODERATE-LOW' | 'LOW' | 'LOWER'
  riskScore: number
  zonesEncountered: number
  distanceKm: number
  estTime: string
  description: string
  coordinates: [number, number][] // [lat, lng]
  isAlternative: boolean
}

export interface RoutePair {
  id: string
  originId: string
  originName: string
  destinationId: string
  destinationName: string
  directRoute: RouteOption
  alternativeRoute: RouteOption
}

/**
 * Starting Locations set: Major regional cities and nearby hubs.
 */
export const STARTING_LOCATIONS: StartingLocation[] = [
  { id: 'guwahati', name: 'Guwahati', state: 'Assam', lat: 26.14, lng: 91.73, isHub: true },
  { id: 'shillong', name: 'Shillong', state: 'Meghalaya', lat: 25.57, lng: 91.88, isHub: true },
  { id: 'siliguri', name: 'Siliguri', state: 'West Bengal', lat: 26.72, lng: 88.43, isHub: true },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.57, lng: 88.36, isHub: true },
  { id: 'patna', name: 'Patna', state: 'Bihar', lat: 25.59, lng: 85.13, isHub: true },
  { id: 'dibrugarh', name: 'Dibrugarh', state: 'Assam', lat: 27.47, lng: 94.91, isHub: false },
  { id: 'jorhat', name: 'Jorhat', state: 'Assam', lat: 26.75, lng: 94.22, isHub: false },
  { id: 'tezpur', name: 'Tezpur', state: 'Assam', lat: 26.65, lng: 92.8, isHub: false },
  { id: 'dimapur', name: 'Dimapur', state: 'Nagaland', lat: 25.91, lng: 93.73, isHub: false },
  { id: 'itanagar', name: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.08, lng: 93.6, isHub: false },
]

/**
 * Hand-crafted key prototype route pairs for realistic corridor demos.
 */
export const DEMO_ROUTE_PAIRS: RoutePair[] = [
  {
    id: 'guwahati-east-khasi-hills',
    originId: 'guwahati',
    originName: 'Guwahati',
    destinationId: 'east-khasi-hills',
    destinationName: 'East Khasi Hills',
    directRoute: {
      id: 'dir-guw-ekh',
      name: 'Higher-Risk Route (NH-40 Mountain Corridor)',
      riskExposure: 'CRITICAL',
      riskScore: 0.82,
      zonesEncountered: 2,
      distanceKm: 148,
      estTime: '3h 15m',
      description:
        'Direct mountain corridor traversing steep cut-slopes with active soil saturation in East Khasi Hills.',
      coordinates: [
        [26.14, 91.73],
        [26.11, 91.82],
        [25.9, 91.88],
        [25.65, 91.9],
        [25.57, 91.88],
        [25.5, 91.8],
        [25.45, 91.75],
      ],
      isAlternative: false,
    },
    alternativeRoute: {
      id: 'alt-guw-ekh',
      name: 'Lower-Risk Alternative (West Meghalaya Foothill Detour)',
      riskExposure: 'LOWER',
      riskScore: 0.34,
      zonesEncountered: 0,
      distanceKm: 172,
      estTime: '3h 45m',
      description:
        'Western foothill route avoiding saturated mountain ridges and high landslide hazard areas.',
      coordinates: [
        [26.14, 91.73],
        [26.12, 91.55],
        [25.95, 91.6],
        [25.75, 91.58],
        [25.56, 91.63],
        [25.42, 91.6],
        [25.45, 91.75],
      ],
      isAlternative: true,
    },
  },
  {
    id: 'siliguri-gangtok',
    originId: 'siliguri',
    originName: 'Siliguri',
    destinationId: 'gangtok',
    destinationName: 'Gangtok',
    directRoute: {
      id: 'dir-slg-gtk',
      name: 'Higher-Risk Route (NH-10 Teesta River Pass)',
      riskExposure: 'HIGH',
      riskScore: 0.66,
      zonesEncountered: 2,
      distanceKm: 114,
      estTime: '4h 00m',
      description:
        'Narrow Teesta river gorge highway subject to monsoon rockfalls and active cut-slope movements.',
      coordinates: [
        [26.72, 88.43],
        [26.9, 88.47],
        [27.05, 88.48],
        [27.17, 88.53],
        [27.23, 88.5],
        [27.33, 88.61],
      ],
      isAlternative: false,
    },
    alternativeRoute: {
      id: 'alt-slg-gtk',
      name: 'Lower-Risk Alternative (Pakyong Ridge Corridor)',
      riskExposure: 'MODERATE-LOW',
      riskScore: 0.36,
      zonesEncountered: 1,
      distanceKm: 138,
      estTime: '4h 40m',
      description:
        'Eastern ridge bypass maintaining higher elevation standoff from unstable gorge riverbeds.',
      coordinates: [
        [26.72, 88.43],
        [26.88, 88.73],
        [27.1, 88.68],
        [27.24, 88.6],
        [27.33, 88.61],
      ],
      isAlternative: true,
    },
  },
  {
    id: 'kolkata-shillong',
    originId: 'kolkata',
    originName: 'Kolkata',
    destinationId: 'shillong',
    destinationName: 'Shillong',
    directRoute: {
      id: 'dir-ccu-shl',
      name: 'Higher-Risk Route (NH-12 to GS Road Ascent)',
      riskExposure: 'HIGH',
      riskScore: 0.58,
      zonesEncountered: 1,
      distanceKm: 1080,
      estTime: '22h 30m',
      description:
        'Long interstate route entering Meghalaya plateau via steep Nongpoh mountain grade.',
      coordinates: [
        [22.57, 88.36],
        [24.1, 88.25],
        [25.2, 89.0],
        [26.14, 91.73],
        [25.9, 91.88],
        [25.57, 91.88],
      ],
      isAlternative: false,
    },
    alternativeRoute: {
      id: 'alt-ccu-shl',
      name: 'Lower-Risk Alternative (South-West Meghalaya Bypass)',
      riskExposure: 'LOW',
      riskScore: 0.28,
      zonesEncountered: 0,
      distanceKm: 1125,
      estTime: '23h 45m',
      description:
        'Alternative western approach entering Meghalaya through lower gradient foothills.',
      coordinates: [
        [22.57, 88.36],
        [24.1, 88.25],
        [25.6, 90.0],
        [25.56, 91.2],
        [25.57, 91.88],
      ],
      isAlternative: true,
    },
  },
  {
    id: 'tezpur-itanagar',
    originId: 'tezpur',
    originName: 'Tezpur',
    destinationId: 'itanagar',
    destinationName: 'Itanagar',
    directRoute: {
      id: 'dir-tzp-ita',
      name: 'Higher-Risk Route (Banderdewa Slope Corridor)',
      riskExposure: 'MODERATE',
      riskScore: 0.48,
      zonesEncountered: 1,
      distanceKm: 155,
      estTime: '3h 30m',
      description:
        'Arterial entry passing through hill-cut slopes with moderate soil saturation.',
      coordinates: [
        [26.65, 92.8],
        [26.85, 93.3],
        [27.02, 93.8],
        [27.08, 93.6],
      ],
      isAlternative: false,
    },
    alternativeRoute: {
      id: 'alt-tzp-ita',
      name: 'Lower-Risk Alternative (Holongi Expressway Detour)',
      riskExposure: 'LOW',
      riskScore: 0.22,
      zonesEncountered: 0,
      distanceKm: 172,
      estTime: '3h 55m',
      description:
        'Engineered southern valley corridor with stabilized slope structures.',
      coordinates: [
        [26.65, 92.8],
        [26.92, 93.4],
        [27.0, 93.65],
        [27.08, 93.6],
      ],
      isAlternative: true,
    },
  },
  {
    id: 'dimapur-kohima',
    originId: 'dimapur',
    originName: 'Dimapur',
    destinationId: 'kohima',
    destinationName: 'Kohima',
    directRoute: {
      id: 'dir-dmp-koh',
      name: 'Higher-Risk Route (NH-29 Kaliading Ridge Pass)',
      riskExposure: 'HIGH',
      riskScore: 0.62,
      zonesEncountered: 1,
      distanceKm: 74,
      estTime: '2h 15m',
      description:
        'Steep hill climb highway susceptible to landslips along active geological fault zones.',
      coordinates: [
        [25.91, 93.73],
        [25.82, 93.9],
        [25.74, 94.02],
        [25.67, 94.11],
      ],
      isAlternative: false,
    },
    alternativeRoute: {
      id: 'alt-dmp-koh',
      name: 'Lower-Risk Alternative (Peren Ridge Contour Bypass)',
      riskExposure: 'MODERATE-LOW',
      riskScore: 0.32,
      zonesEncountered: 0,
      distanceKm: 98,
      estTime: '2h 50m',
      description:
        'Gentler ridge detour maintaining safe standoff from active slope failure points.',
      coordinates: [
        [25.91, 93.73],
        [25.7, 93.75],
        [25.58, 93.92],
        [25.67, 94.11],
      ],
      isAlternative: true,
    },
  },
]

/**
 * Returns or generates a pair of distinct routes for any start -> destination combination.
 */
export function getRoutePair(originId: string, destinationId: string): RoutePair | undefined {
  // Check static predefined routes first
  const staticPair = DEMO_ROUTE_PAIRS.find(
    (pair) =>
      (pair.originId === originId && pair.destinationId === destinationId) ||
      (pair.originId === destinationId && pair.destinationId === originId),
  )
  if (staticPair) return staticPair

  // Find coordinates for origin (from STARTING_LOCATIONS or LOCATIONS)
  let origin = STARTING_LOCATIONS.find((s) => s.id === originId)
  if (!origin) {
    const loc = LOCATIONS.find((l) => l.id === originId)
    if (loc) origin = { id: loc.id, name: loc.name, state: loc.state, lat: loc.lat, lng: loc.lng }
  }

  // Find destination (from LOCATIONS)
  const dest = LOCATIONS.find((l) => l.id === destinationId)

  if (!origin || !dest) return undefined

  // Generate dynamic route pair with distinct geometries and varied risk profiles
  const lat1 = origin.lat
  const lng1 = origin.lng
  const lat2 = dest.lat
  const lng2 = dest.lng

  const dLat = lat2 - lat1
  const dLng = lng2 - lng1
  const midLat = (lat1 + lat2) / 2
  const midLng = (lng1 + lng2) / 2

  // Perpendicular offset vectors for geometry differentiation
  const pLat = -dLng * 0.22
  const pLng = dLat * 0.22

  // Determine risk profile based on destination's risk level
  let directRisk: RouteOption['riskExposure'] = 'HIGH'
  let directScore = 0.65
  let directZones = 1

  let altRisk: RouteOption['riskExposure'] = 'LOW'
  let altScore = 0.26
  let altZones = 0

  if (dest.risk === 'critical') {
    directRisk = 'CRITICAL'
    directScore = 0.82
    directZones = 2
    altRisk = 'MODERATE'
    altScore = 0.42
    altZones = 0
  } else if (dest.risk === 'high') {
    directRisk = 'HIGH'
    directScore = 0.64
    directZones = 1
    altRisk = 'LOW'
    altScore = 0.28
    altZones = 0
  } else if (dest.risk === 'moderate') {
    directRisk = 'MODERATE'
    directScore = 0.46
    directZones = 1
    altRisk = 'LOW'
    altScore = 0.22
    altZones = 0
  } else {
    directRisk = 'MODERATE-LOW'
    directScore = 0.36
    directZones = 0
    altRisk = 'LOW'
    altScore = 0.18
    altZones = 0
  }

  // Calculate approximate distance
  const baseDistanceKm = Math.round(
    Math.sqrt((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2) * 110 * 1.25,
  )
  const altDistanceKm = Math.round(baseDistanceKm * 1.18)

  const directHours = Math.floor(baseDistanceKm / 45)
  const directMins = Math.round(((baseDistanceKm / 45) - directHours) * 60)
  const directTimeStr = `${directHours}h ${String(directMins).padStart(2, '0')}m`

  const altHours = Math.floor(altDistanceKm / 42)
  const altMins = Math.round(((altDistanceKm / 42) - altHours) * 60)
  const altTimeStr = `${altHours}h ${String(altMins).padStart(2, '0')}m`

  // Higher-risk Route A geometry (passes near mountain ridge pass)
  const routeACoords: [number, number][] = [
    [lat1, lng1],
    [lat1 + dLat * 0.28 + pLat * 0.35, lng1 + dLng * 0.28 + pLng * 0.35],
    [midLat + pLat * 0.55, midLng + pLng * 0.55],
    [lat1 + dLat * 0.72 + pLat * 0.3, lng1 + dLng * 0.72 + pLng * 0.3],
    [lat2, lng2],
  ]

  // Lower-risk Route B geometry (curves wide via foothill/valley detour)
  const routeBCoords: [number, number][] = [
    [lat1, lng1],
    [lat1 + dLat * 0.25 - pLat * 0.75, lng1 + dLng * 0.25 - pLng * 0.75],
    [midLat - pLat * 1.05, midLng - pLng * 1.05],
    [lat1 + dLat * 0.75 - pLat * 0.5, lng1 + dLng * 0.75 - pLng * 0.5],
    [lat2, lng2],
  ]

  return {
    id: `dyn-${originId}-${destinationId}`,
    originId: origin.id,
    originName: origin.name,
    destinationId: dest.id,
    destinationName: dest.name,
    directRoute: {
      id: `dir-${origin.id}-${dest.id}`,
      name: `Higher-Risk Route (Primary Mountain Corridor)`,
      riskExposure: directRisk,
      riskScore: directScore,
      zonesEncountered: directZones,
      distanceKm: baseDistanceKm,
      estTime: directTimeStr,
      description: `Primary arterial corridor passing near steep slopes and monitored risk zones around ${dest.name}.`,
      coordinates: routeACoords,
      isAlternative: false,
    },
    alternativeRoute: {
      id: `alt-${origin.id}-${dest.id}`,
      name: `Lower-Risk Alternative (Engineered Valley Bypass)`,
      riskExposure: altRisk,
      riskScore: altScore,
      zonesEncountered: altZones,
      distanceKm: altDistanceKm,
      estTime: altTimeStr,
      description: `Alternative valley detour maintaining safe standoff distance from active landslide hazard areas.`,
      coordinates: routeBCoords,
      isAlternative: true,
    },
  }
}
