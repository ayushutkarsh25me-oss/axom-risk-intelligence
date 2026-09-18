import { CircleDot, Clock, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { DATA_SOURCES } from '@/lib/data'

export default function DataSourcesPage() {
  return (
    <>
      <PageHeader
        title="Data Sources"
        subtitle="Government and satellite feeds that power the AXOM risk model."
      />
      <main className="flex-1 space-y-4 p-5 lg:p-8">
        <Card className="border-l-2 border-l-primary bg-primary/5">
          <CardContent className="flex items-start gap-3 pt-4">
            <Database className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">Integration status</p>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                This prototype runs on simulated data. The connectors below define the production
                data pipeline planned for the pilot deployment across the North Eastern Region.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {DATA_SOURCES.map((src) => (
            <Card key={src.id}>
              <CardHeader className="border-b border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">{src.name}</CardTitle>
                  <span className="inline-flex items-center gap-1 rounded-md border border-risk-moderate/40 bg-risk-moderate/12 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-risk-moderate uppercase">
                    <CircleDot className="size-3" />
                    {src.status}
                  </span>
                </div>
                <p className="font-mono text-[11px] tracking-wide text-primary uppercase">
                  {src.provides}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  {src.detail}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {src.cadence}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
