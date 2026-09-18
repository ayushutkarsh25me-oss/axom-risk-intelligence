import { Activity, BellRing, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SUMMARY } from '@/lib/data'
import { cn } from '@/lib/utils'

const STATS = [
  {
    label: 'Monitored Sites',
    value: SUMMARY.monitored,
    icon: Activity,
    accent: 'text-primary',
    ring: 'ring-primary/20',
    note: 'Across 8 states',
  },
  {
    label: 'High Risk',
    value: SUMMARY.high,
    icon: ShieldAlert,
    accent: 'text-risk-high',
    ring: 'ring-risk-high/20',
    note: 'Enhanced monitoring',
  },
  {
    label: 'Critical Risk',
    value: SUMMARY.critical,
    icon: ShieldAlert,
    accent: 'text-risk-critical',
    ring: 'ring-risk-critical/25',
    note: 'Evacuation advisory',
  },
  {
    label: 'Active Alerts',
    value: SUMMARY.activeAlerts,
    icon: BellRing,
    accent: 'text-risk-moderate',
    ring: 'ring-risk-moderate/20',
    note: 'Awaiting action',
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {STATS.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </p>
                <p className={cn('mt-1 font-mono text-3xl font-bold tabular-nums', stat.accent)}>
                  {stat.value}
                </p>
              </div>
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-md bg-muted ring-1',
                  stat.ring,
                  stat.accent,
                )}
              >
                <Icon className="size-4.5" />
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{stat.note}</p>
          </Card>
        )
      })}
    </div>
  )
}

export function RiskDistributionBar() {
  const total = SUMMARY.low + SUMMARY.moderate + SUMMARY.high + SUMMARY.critical
  const segments = [
    { level: 'low', count: SUMMARY.low, token: 'var(--risk-low)', label: 'Low' },
    { level: 'moderate', count: SUMMARY.moderate, token: 'var(--risk-moderate)', label: 'Moderate' },
    { level: 'high', count: SUMMARY.high, token: 'var(--risk-high)', label: 'High' },
    { level: 'critical', count: SUMMARY.critical, token: 'var(--risk-critical)', label: 'Critical' },
  ]
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {segments.map((s) => (
          <div
            key={s.level}
            style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.token }}
            title={`${s.label}: ${s.count}`}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {segments.map((s) => (
          <div key={s.level} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: s.token }} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-mono text-sm font-semibold tabular-nums">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
