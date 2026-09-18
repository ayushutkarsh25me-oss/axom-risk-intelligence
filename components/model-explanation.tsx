import { Binary, Cpu, Database, Radio } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STEPS = [
  {
    icon: Database,
    title: 'Ingest',
    body: 'Rainfall, elevation, soil moisture and historical inventory are pulled from IMD, ISRO Bhuvan, CWC and GSI Bhukosh.',
  },
  {
    icon: Binary,
    title: 'Feature Engineering',
    body: 'Signals are normalized into five weighted features: rainfall intensity, soil saturation, slope, seismic activity and vegetation cover.',
  },
  {
    icon: Cpu,
    title: 'Random Forest Inference',
    body: 'An ensemble classifier scores each grid cell from 0 to 1 and assigns a Low / Moderate / High / Critical class with a confidence value.',
  },
  {
    icon: Radio,
    title: 'Alert & Advisory',
    body: 'Scores above threshold trigger tiered advisories with recommended actions routed to district authorities.',
  },
]

export function ModelExplanation() {
  return (
    <Card>
      <CardHeader className="border-b border-border/60">
        <CardTitle className="text-sm">How AXOM Assesses Risk</CardTitle>
        <p className="text-xs text-muted-foreground text-pretty">
          A four-stage pipeline turns multi-source environmental data into an explainable risk score.
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <li
                key={step.title}
                className="relative rounded-md border border-border/60 bg-panel/50 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary/12 text-primary ring-1 ring-primary/25">
                    <Icon className="size-4" />
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    0{i + 1}
                  </span>
                  <h4 className="text-sm font-semibold">{step.title}</h4>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">
                  {step.body}
                </p>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
