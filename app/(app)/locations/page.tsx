import Link from 'next/link'
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Sparkline } from '@/components/charts/sparkline'
import { PageHeader } from '@/components/page-header'
import { RiskBadge } from '@/components/risk-badge'
import { LOCATIONS, RISK_META } from '@/lib/data'

export default function LocationsPage() {
  const sorted = [...LOCATIONS].sort((a, b) => b.riskScore - a.riskScore)

  return (
    <>
      <PageHeader
        title="Monitored Locations"
        subtitle="Instrumented sites ranked by current risk score. Select any site for a full assessment."
      />
      <main className="flex-1 p-5 lg:p-8">
        <Card className="overflow-hidden">
          {/* Header row (desktop) */}
          <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr_auto] gap-4 border-b border-border bg-panel/50 px-5 py-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:grid">
            <span>Location</span>
            <span>Risk Score</span>
            <span>Classification</span>
            <span>24h Trend</span>
            <span>Confidence</span>
            <span className="sr-only">Action</span>
          </div>

          <ul className="divide-y divide-border">
            {sorted.map((loc) => {
              const meta = RISK_META[loc.risk]
              const rising = loc.trendDelta >= 0
              return (
                <li key={loc.id}>
                  <Link
                    href={`/locations/${loc.id}`}
                    className="grid grid-cols-2 items-center gap-4 px-5 py-4 transition-colors hover:bg-panel/40 lg:grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr_auto]"
                  >
                    <div className="col-span-2 lg:col-span-1">
                      <p className="text-sm font-semibold">{loc.name}</p>
                      <p className="text-xs text-muted-foreground">{loc.state}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-lg font-bold tabular-nums"
                        style={{ color: meta.token }}
                      >
                        {loc.riskScore.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <RiskBadge level={loc.risk} />
                    </div>

                    <div className="flex items-center gap-2">
                      <Sparkline
                        data={loc.history}
                        color={meta.token}
                        className="h-8 w-24"
                      />
                      <span
                        className="inline-flex items-center gap-0.5 text-xs font-medium"
                        style={{ color: rising ? 'var(--risk-high)' : 'var(--risk-low)' }}
                      >
                        {rising ? (
                          <TrendingUp className="size-3.5" />
                        ) : (
                          <TrendingDown className="size-3.5" />
                        )}
                        {rising ? '+' : ''}
                        {loc.trendDelta.toFixed(2)}
                      </span>
                    </div>

                    <div className="font-mono text-sm tabular-nums text-muted-foreground">
                      {Math.round(loc.confidence * 100)}%
                    </div>

                    <ArrowRight className="hidden size-4 text-muted-foreground lg:block" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      </main>
    </>
  )
}
