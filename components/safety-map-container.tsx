'use client'

import { useEffect, useState } from 'react'
import { LOCATIONS, LocationData } from '@/lib/data'
import { DEMO_ROUTE_PAIRS, getRoutePair, RoutePair, STARTING_LOCATIONS } from '@/lib/safety-routes'
import { SafetyMap } from '@/components/safety-map'
import { SafetyRoutePanel } from '@/components/safety-route-panel'

export function SafetyMapContainer() {
  const [locations, setLocations] = useState<LocationData[]>(LOCATIONS)
  const [originId, setOriginId] = useState<string>('guwahati')
  const [destinationId, setDestinationId] = useState<string>('east-khasi-hills')
  const [selectedRoutePair, setSelectedRoutePair] = useState<RoutePair | null>(
    DEMO_ROUTE_PAIRS[0],
  )
  const [showZones, setShowZones] = useState<boolean>(true)
  const [showRoutes, setShowRoutes] = useState<boolean>(true)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [activeRouteType, setActiveRouteType] = useState<'all' | 'direct' | 'alternative'>('all')

  // Fetch locations from backend if available, fallback to local dataset
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch('/api/locations')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setLocations(data)
          }
        }
      } catch {
        // Safe fallback to lib/data.ts LOCATIONS
      }
    }
    fetchLocations()
  }, [])

  const handleFindRoute = () => {
    if (!originId || !destinationId) return
    const pair = getRoutePair(originId, destinationId)
    if (pair) {
      setSelectedRoutePair(pair)
    }
  }

  const handleSelectPresetRoute = (pair: RoutePair) => {
    setOriginId(pair.originId)
    setDestinationId(pair.destinationId)
    setSelectedRoutePair(pair)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Side Panel: Route controls, assessment cards, and legend */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <SafetyRoutePanel
          locations={locations}
          startingLocations={STARTING_LOCATIONS}
          originId={originId}
          destinationId={destinationId}
          onOriginChange={(id) => setOriginId(id)}
          onDestinationChange={(id) => setDestinationId(id)}
          onFindRoute={handleFindRoute}
          selectedRoutePair={selectedRoutePair}
          showZones={showZones}
          showRoutes={showRoutes}
          onToggleZones={setShowZones}
          onToggleRoutes={setShowRoutes}
          activeRouteType={activeRouteType}
          onRouteTypeChange={setActiveRouteType}
          onSelectPresetRoute={handleSelectPresetRoute}
        />
      </div>

      {/* Main Interactive Map View */}
      <div className="lg:col-span-7 flex flex-col min-h-[550px]">
        <SafetyMap
          locations={locations}
          selectedRoutePair={selectedRoutePair}
          showZones={showZones}
          showRoutes={showRoutes}
          selectedLocationId={selectedLocationId}
          onSelectLocation={(loc) => setSelectedLocationId(loc.id)}
          activeRouteType={activeRouteType}
          className="h-full w-full min-h-[550px] rounded-lg border border-border shadow-sm"
        />
      </div>
    </div>
  )
}
