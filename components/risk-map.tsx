'use client'

import { Crosshair, Layers } from 'lucide-react'
import { LOCATIONS, projectToMap, RISK_META, type LocationData, type RiskLevel } from '@/lib/data'
import { cn } from '@/lib/utils'

const RISK_ORDER: RiskLevel[] = ['low', 'moderate', 'high', 'critical']

export function RiskMap({
  selectedId,
  onSelect,
  className,
}: {
  selectedId?: string
  onSelect?: (loc: LocationData) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-[#0d141f]',
        className,
      )}
    >
      {/* Terrain backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: 'url(/ne-india-relief.png)' }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b111a]/80 via-transparent to-[#0b111a]/40" aria-hidden />

      {/* Coordinate graticule */}
      <svg className="absolute inset-0 size-full text-primary/10" aria-hidden>
        <defs>
          <pattern id="grid" width="10%" height="12.5%" patternUnits="userSpaceOnUse">
            <path d="M 1000 0 L 0 0 0 1000" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Corner coordinate readouts */}
      <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] text-primary/60">
        28.7°N / 88.0°E
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 font-mono text-[10px] text-primary/60">
        22.4°N / 97.6°E
      </div>

      {/* Region label */}
      <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-md border border-border/60 bg-background/60 px-2.5 py-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase backdrop-blur-sm">
        North Eastern Region · Geospatial Grid
      </div>

      {/* Markers */}
      <div className="relative aspect-[4/3] w-full min-h-[420px]">
        {LOCATIONS.map((loc) => {
          const { x, y } = projectToMap(loc.lat, loc.lng)
          const meta = RISK_META[loc.risk]
          const selected = selectedId === loc.id
          const pulsing = loc.risk === 'critical' || loc.risk === 'high'
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => onSelect?.(loc)}
              className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={`${loc.name} — ${meta.label} risk`}
              aria-pressed={selected}
            >
              <span className="relative flex items-center justify-center">
                {pulsing && (
                  <span
                    className="absolute inline-flex size-8 animate-ping rounded-full opacity-40"
                    style={{ backgroundColor: meta.token }}
                  />
                )}
                <span
                  className={cn(
                    'relative flex size-4 items-center justify-center rounded-full ring-2 ring-background transition-transform group-hover:scale-125',
                    selected && 'scale-150',
                  )}
                  style={{ backgroundColor: meta.token }}
                >
                  <span className="size-1.5 rounded-full bg-background/70" />
                </span>
              </span>
              <span
                className={cn(
                  'absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded border border-border/60 bg-background/85 px-1.5 py-0.5 text-[10px] font-medium text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100',
                  selected && 'opacity-100',
                )}
              >
                {loc.name}
              </span>
            </button>
          )
        })}

        <div className="pointer-events-none absolute bottom-3 left-3">
          <Crosshair className="size-4 text-primary/40" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 bg-background/70 px-4 py-2.5 backdrop-blur-sm">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          <Layers className="size-3.5" /> Risk
        </span>
        {RISK_ORDER.map((level) => {
          const meta = RISK_META[level]
          return (
            <span key={level} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: meta.token }} />
              {meta.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
