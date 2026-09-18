import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FactorBarChart } from '@/components/charts/factor-bar-chart'
import { RiskTrendChart } from '@/components/charts/risk-trend-chart'
import { PageHeader } from '@/components/page-header'
import { RiskDistributionBar } from '@/components/stat-cards'
import { ENV_FACTORS } from '@/lib/data'

const MODEL_STATS = [
  { label: 'Model', value: 'Random Forest', note: 'Ensemble classifier' },
  { label: 'Mean Confidence', value: '83%', note: 'Across monitored sites' },
  { label: 'Features', value: '5', note: 'Weighted environmental inputs' },
  { label: 'Refresh', value: '15 min', note: 'Target inference cadence' },
]

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Risk Analytics"
        subtitle="Fleet-wide trends and the environmental factors driving the AI risk model."
      />
      <main className="flex-1 space-y-4 p-5 lg:p-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {MODEL_STATS.map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {s.label}
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-sm">24-Hour Fleet Risk Trend</CardTitle>
            <p className="text-xs text-muted-foreground">
              Peak vs. average risk score across all monitored sites
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <RiskTrendChart />
            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-4 rounded-full bg-risk-critical" /> Peak risk
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-4 rounded-full bg-primary" /> Fleet average
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-sm">Environmental Factor Weights</CardTitle>
              <p className="text-xs text-muted-foreground">
                Average contribution to current risk scores
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <FactorBarChart data={[...ENV_FACTORS]} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-sm">Risk Distribution</CardTitle>
              <p className="text-xs text-muted-foreground">
                24 monitored sites by classification
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <RiskDistributionBar />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
