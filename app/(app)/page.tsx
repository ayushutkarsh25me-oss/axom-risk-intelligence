import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ActiveAlerts } from '@/components/active-alerts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModelExplanation } from '@/components/model-explanation'
import { OverviewMapSection } from '@/components/overview-map-section'
import { PageHeader } from '@/components/page-header'
import { RiskDistributionBar, StatCards } from '@/components/stat-cards'

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        title="AI Landslide Risk Intelligence"
        subtitle="Early-warning command centre for the North Eastern Region of India — SIH26001 prototype."
      />

      <main className="flex-1 space-y-6 p-5 lg:p-8">
        <StatCards />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Live Risk Map
            </h2>
          </div>
          <OverviewMapSection />
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b border-border/60">
              <div>
                <CardTitle className="text-sm">Active Alerts</CardTitle>
                <p className="text-xs text-muted-foreground">Prioritized by severity</p>
              </div>
              <Link
                href="/alerts"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowUpRight className="size-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              <ActiveAlerts limit={5} />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="border-b border-border/60">
                <CardTitle className="text-sm">Fleet Risk Distribution</CardTitle>
                <p className="text-xs text-muted-foreground">
                  24 monitored sites by current classification
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <RiskDistributionBar />
              </CardContent>
            </Card>
            <ModelExplanation />
          </div>
        </div>
      </main>
    </>
  )
}
