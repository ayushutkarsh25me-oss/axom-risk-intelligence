import {
  CloudRain,
  Droplets,
  Activity,
  TriangleAlert,
  Trees,
  MountainSnow,
} from 'lucide-react'
import type { LocationData } from '@/lib/data'
import { cn } from '@/lib/utils'

interface Metric {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

export function buildMetrics(loc: LocationData): Metric[] {
  return [
    { label: 'Rainfall', value: `${loc.rainfall} mm`, icon: CloudRain },
    { label: 'Soil Saturation', value: `${loc.soilSaturation}%`, icon: Droplets },
    { label: 'Slope', value: `${loc.slope}°`, icon: MountainSnow },
    { label: 'Seismic Activity', value: loc.seismic, icon: Activity },
    { label: 'Vegetation Cover', value: `${loc.vegetation}%`, icon: Trees },
    { label: 'Confidence', value: `${Math.round(loc.confidence * 100)}%`, icon: TriangleAlert },
  ]
}

export function EnvMetricsGrid({
  loc,
  columns = 2,
  className,
}: {
  loc: LocationData
  columns?: 2 | 3
  className?: string
}) {
  const metrics = buildMetrics(loc)
  return (
    <div
      className={cn(
        'grid gap-2',
        columns === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
        className,
      )}
    >
      {metrics.map((m) => {
        const Icon = m.icon
        return (
          <div key={m.label} className="rounded-md border border-border/60 bg-panel/60 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Icon className="size-3.5" />
              {m.label}
            </div>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{m.value}</p>
          </div>
        )
      })}
    </div>
  )
}
