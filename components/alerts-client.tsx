'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { BellRing, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RiskBadge } from '@/components/risk-badge'
import { useToast } from '@/components/toast'
import { ALERTS, RISK_META, type AlertData, type RiskLevel } from '@/lib/data'
import { fetchAlerts, acknowledgeAlertApi } from '@/lib/api'
import { cn } from '@/lib/utils'

type FilterValue = RiskLevel | 'all' | 'active'

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Moderate', value: 'moderate' },
]

export function AlertsClient() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<AlertData[]>(ALERTS)
  const [filter, setFilter] = useState<FilterValue>('all')

  useEffect(() => {
    let isMounted = true
    fetchAlerts().then((data) => {
      if (isMounted && data && data.length > 0) {
        setAlerts(data)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts
    if (filter === 'active') return alerts.filter((a) => a.status === 'active')
    return alerts.filter((a) => a.severity === filter)
  }, [alerts, filter])

  const activeCount = alerts.filter((a) => a.status === 'active').length

  const acknowledge = (alert: AlertData) => {
    acknowledgeAlertApi(alert.id)
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, status: 'acknowledged' } : a)),
    )
    toast({
      title: `${alert.location} acknowledged`,
      description: 'Alert marked as reviewed.',
      variant: 'success',
    })
  }

  const acknowledgeAll = () => {
    alerts.filter((a) => a.status === 'active').forEach((a) => acknowledgeAlertApi(a.id))
    setAlerts((prev) => prev.map((a) => ({ ...a, status: 'acknowledged' as const })))
    toast({
      title: 'All alerts acknowledged',
      description: `${activeCount} active alert${activeCount === 1 ? '' : 's'} cleared.`,
      variant: 'success',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f.value
                  ? 'border-primary/40 bg-primary/12 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={acknowledgeAll} disabled={activeCount === 0}>
          <Check className="size-4" />
          Acknowledge all
        </Button>
      </div>

      <Card className="divide-y divide-border overflow-hidden">
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No alerts match this filter.
          </p>
        )}
        {filtered.map((alert) => {
          const meta = RISK_META[alert.severity]
          const pulsing = alert.severity === 'critical' || alert.severity === 'high'
          return (
            <div
              key={alert.id}
              className="flex items-center gap-4 border-l-2 px-4 py-4 sm:px-5"
              style={{ borderLeftColor: meta.token }}
            >
              <span className="relative flex size-3 shrink-0">
                {pulsing && alert.status === 'active' && (
                  <span
                    className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
                    style={{ backgroundColor: meta.token }}
                  />
                )}
                <span
                  className="relative inline-flex size-3 rounded-full"
                  style={{ backgroundColor: meta.token }}
                />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{alert.location}</p>
                  <RiskBadge level={alert.severity} withDot={false} />
                  {alert.status === 'acknowledged' && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                      Acknowledged
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{alert.message}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  {alert.time} · score {alert.riskScore.toFixed(2)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {alert.status === 'active' && (
                  <Button size="icon-sm" variant="ghost" onClick={() => acknowledge(alert)}>
                    <Check className="size-4" />
                    <span className="sr-only">Acknowledge {alert.location}</span>
                  </Button>
                )}
                <Button
                  size="icon-sm"
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href={`/locations/${alert.locationId}`} />}
                >
                  <ExternalLink className="size-4" />
                  <span className="sr-only">View {alert.location}</span>
                </Button>
              </div>
            </div>
          )
        })}
      </Card>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BellRing className="size-3.5" />
        {activeCount} active alert{activeCount === 1 ? '' : 's'} of {alerts.length} total.
      </p>
    </div>
  )
}
