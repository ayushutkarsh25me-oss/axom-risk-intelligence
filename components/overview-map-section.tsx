'use client'

import { useState } from 'react'
import { LocationInfoPanel } from '@/components/location-info-panel'
import { RiskMap } from '@/components/risk-map'
import { LOCATIONS, type LocationData } from '@/lib/data'

export function OverviewMapSection() {
  const [selected, setSelected] = useState<LocationData | null>(
    LOCATIONS.find((l) => l.risk === 'critical') ?? null,
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <RiskMap selectedId={selected?.id} onSelect={setSelected} />
      <LocationInfoPanel loc={selected} />
    </div>
  )
}
