import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FactorBarChart } from '@/components/charts/factor-bar-chart'
import { LocationHistoryChart } from '@/components/charts/location-history-chart'
import { EnvMetricsGrid } from '@/components/env-metrics'
import { LocationActions } from '@/components/location-actions'
import { PageHeader } from '@/components/page-header'
import { RiskBadge } from '@/components/risk-badge'
import { getLocation, LOCATIONS, RISK_META } from '@/lib/data'

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ id: l.id }))
}

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const loc = getLocation(id)
  if (!loc) notFound()

  const meta = RISK_META[loc.risk]
  const rising = loc.trendDelta >= 0

  const contributions = [
    { name: 'Rainfall', value: Math.min(100, Math.round((loc.rainfall / 200) * 100)) },
    { name: 'Soil Saturation', value: loc.soilSaturation },
    { name: 'Slope', value: Math.round((loc.slope / 60) * 100) },
    {
      name: 'Seismic Activity',
      value: loc.seismic === 'High' ? 80 : loc.seismic === 'Moderate' ? 50 : 22,
    },
    { name: 'Vegetation Cover', value: loc.vegetation },
  ]

  return (
    <>
      <PageHeader
        title={loc.name}
        subtitle={`${loc.state} · ${loc.lat.toFixed(2)}°N, ${loc.lng.toFixed(2)}°E`}
        actions={<RiskBadge level={loc.risk} className="text-xs" />}
      />

      <main className="flex-1 space-y-4 p-5 lg:p-8">
        <Link
          href="/locations"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All locations
        </Link>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          {/* Score panel */}
          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-sm">Current Assessment</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Risk Score
                  </p>
                  <p
                    className="font-mono text-5xl font-bold tabular-nums"
                    style={{ color: meta.token }}
                  >
                    {loc.riskScore.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Confidence
                  </p>
                  <p className="font-mono text-2xl font-semibold tabular-nums">
                    {Math.round(loc.confidence * 100)}%
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${loc.riskScore * 100}%`, backgroundColor: meta.token }}
                />
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span
                  className="inline-flex items-center gap-1 font-medium"
                  style={{ color: rising ? 'var(--risk-high)' : 'var(--risk-low)' }}
                >
                  {rising ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  {rising ? '+' : ''}
                  {loc.trendDelta.toFixed(2)}
                </span>
                <span className="text-muted-foreground">vs previous cycle</span>
              </div>

              <div className="mt-4 rounded-md border-l-2 border-l-primary bg-primary/5 p-3">
                <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
                  Recommended Action
                </p>
                <p className="mt-1 text-sm text-pretty">{loc.recommendation}</p>
              </div>

              <LocationActions locationName={loc.name} risk={loc.risk} />
            </CardContent>
          </Card>

          {/* History chart */}
          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-sm">24-Hour Risk History</CardTitle>
              <p className="text-xs text-muted-foreground">
                Hourly model output for this site
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <LocationHistoryChart data={loc.history} color={meta.token} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-sm">Environmental Factors</CardTitle>
              <p className="text-xs text-muted-foreground">Latest sensor & satellite readings</p>
            </CardHeader>
            <CardContent className="pt-4">
              <EnvMetricsGrid loc={loc} columns={3} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-sm">Factor Contribution</CardTitle>
              <p className="text-xs text-muted-foreground">
                Relative weight driving the current score
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <FactorBarChart data={contributions} />
            </CardContent>
          </Card>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          Coordinates {loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°E · Data simulated for
          demonstration.
        </p>
      </main>
    </>
  )
}
