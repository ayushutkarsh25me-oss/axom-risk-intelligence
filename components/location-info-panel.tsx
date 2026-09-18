'use client'

import Link from 'next/link'
import { ArrowRight, BellRing, MapPinned } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EnvMetricsGrid } from '@/components/env-metrics'
import { RiskBadge } from '@/components/risk-badge'
import { useToast } from '@/components/toast'
import { RISK_META, type LocationData } from '@/lib/data'

export function LocationInfoPanel({ loc }: { loc: LocationData | null }) {
  const { toast } = useToast()

  if (!loc) {
    return (
      <Card className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
        <CardContent className="flex flex-col items-center gap-3 pt-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <MapPinned className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold">No location selected</p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground text-pretty">
              Select a marker on the risk map to inspect environmental factors and the AI risk
              assessment.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const meta = RISK_META[loc.risk]

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-2 border-b border-border/60">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold tracking-tight">{loc.name}</h3>
            <p className="text-xs text-muted-foreground">{loc.state}</p>
          </div>
          <RiskBadge level={loc.risk} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
            Risk Score
          </span>
          <span className="font-mono text-3xl font-bold tabular-nums" style={{ color: meta.token }}>
            {loc.riskScore.toFixed(2)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${loc.riskScore * 100}%`, backgroundColor: meta.token }}
          />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-4">
        <EnvMetricsGrid loc={loc} columns={2} />

        <div className="rounded-md border-l-2 border-l-primary bg-primary/5 p-3">
          <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
            Recommended Action
          </p>
          <p className="mt-1 text-sm text-pretty">{loc.recommendation}</p>
        </div>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() =>
              toast({
                title: `Alert issued for ${loc.name}`,
                description: `${meta.label} advisory dispatched to district authorities.`,
                variant: loc.risk === 'critical' ? 'critical' : 'warning',
              })
            }
          >
            <BellRing className="size-4" />
            Issue Alert
          </Button>
          <Button
            size="sm"
            className="flex-1"
            nativeButton={false}
            render={<Link href={`/locations/${loc.id}`} />}
          >
            View Location Details
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
