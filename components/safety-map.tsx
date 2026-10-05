'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { LocationData } from '@/lib/data'
import { RoutePair } from '@/lib/safety-routes'

interface SafetyMapProps {
  locations: LocationData[]
  selectedRoutePair: RoutePair | null
  showZones: boolean
  showRoutes: boolean
  selectedLocationId?: string | null
  onSelectLocation?: (loc: LocationData) => void
  activeRouteType?: 'all' | 'direct' | 'alternative'
  className?: string
}

const SafetyMapLeaf = dynamic(() => import('./safety-map-leaf'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[460px] w-full flex-col items-center justify-center rounded-lg border border-border bg-[#0d141f] text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="mt-3 text-xs font-medium tracking-wide">Initializing Leaflet Geospatial Engine...</p>
    </div>
  ),
})

export function SafetyMap(props: SafetyMapProps) {
  return (
    <div className={props.className || 'h-full min-h-[460px] w-full'}>
      <SafetyMapLeaf {...props} />
    </div>
  )
}
