'use client'

import { useMemo, useState } from 'react'
import { LocationInfoPanel } from '@/components/location-info-panel'
import { RiskMap } from '@/components/risk-map'
import { RiskBadge } from '@/components/risk-badge'
import { LOCATIONS, RISK_META, type LocationData, type RiskLevel } from '@/lib/data'
import { cn } from '@/lib/utils'

const FILTERS: { label: string; value: RiskLevel | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Low', value: 'low' },
]

export function RiskMapExplorer() {
  const [selected, setSelected] = useState<LocationData | null>(
    LOCATIONS.find((l) => l.risk === 'critical') ?? LOCATIONS[0],
  )
  const [filter, setFilter] = useState<RiskLevel | 'all'>('all')

  const sorted = useMemo(
    () => [...LOCATIONS].sort((a, b) => b.riskScore - a.riskScore),
    [],
  )
  const visible = filter === 'all' ? sorted : sorted.filter((l) => l.risk === filter)

  return (
    <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
      <div className="space-y-4">
        <RiskMap selectedId={selected?.id} onSelect={setSelected} className="min-h-[520px]" />

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f.value
                  ? 'border-primary/40 bg-primary/12 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {visible.map((loc) => {
            const meta = RISK_META[loc.risk]
            const active = selected?.id === loc.id
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelected(loc)}
                className={cn(
                  'flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 text-left transition-colors hover:border-primary/30',
                  active ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border',
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.token }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{loc.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{loc.state}</p>
                </div>
                <span
                  className="font-mono text-sm font-bold tabular-nums"
                  style={{ color: meta.token }}
                >
                  {loc.riskScore.toFixed(2)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <LocationInfoPanel loc={selected} />
      </div>
    </div>
  )
}
