import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { RiskBadge } from '@/components/risk-badge'
import { ALERTS, RISK_META, type AlertData } from '@/lib/data'
import { cn } from '@/lib/utils'

export function AlertRow({ alert }: { alert: AlertData }) {
  const meta = RISK_META[alert.severity]
  return (
    <Link
      href={`/locations/${alert.locationId}`}
      className={cn(
        'group flex items-center gap-3 rounded-md border-l-2 bg-panel/40 px-3 py-2.5 transition-colors hover:bg-panel',
        meta.border,
      )}
      style={{ borderLeftColor: meta.token }}
    >
      <span className="relative flex size-2.5 shrink-0">
        {(alert.severity === 'critical' || alert.severity === 'high') && (
          <span
            className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: meta.token }}
          />
        )}
        <span className="relative inline-flex size-2.5 rounded-full" style={{ backgroundColor: meta.token }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{alert.location}</p>
          {alert.status === 'acknowledged' && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ACK
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{alert.message}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <RiskBadge level={alert.severity} withDot={false} />
        <span className="font-mono text-[10px] text-muted-foreground">{alert.time}</span>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export function ActiveAlerts({ limit }: { limit?: number }) {
  const items = limit ? ALERTS.slice(0, limit) : ALERTS
  return (
    <div className="space-y-2">
      {items.map((alert) => (
        <AlertRow key={alert.id} alert={alert} />
      ))}
    </div>
  )
}
