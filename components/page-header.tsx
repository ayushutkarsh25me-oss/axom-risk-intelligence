import { DemoModeBadge } from '@/components/demo-mode-badge'
import { LAST_UPDATED, NEXT_UPDATE } from '@/lib/data'

export function StatusStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
      <span className="inline-flex items-center gap-1.5 font-semibold text-risk-low">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-risk-low opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-risk-low" />
        </span>
        SYSTEM ONLINE
      </span>
      <span className="text-muted-foreground">
        Last updated <span className="font-mono text-foreground">{LAST_UPDATED}</span>
      </span>
      <span className="text-muted-foreground">
        Next update <span className="font-mono text-foreground">{NEXT_UPDATE}</span>
      </span>
      <DemoModeBadge />
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
  showStatus = true,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  showStatus?: boolean
}) {
  return (
    <header className="border-b border-border bg-card/40 px-5 py-4 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="pl-10 lg:pl-0">
          <h1 className="text-balance text-xl font-bold tracking-tight lg:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground text-pretty">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {showStatus && <div className="mt-3">{<StatusStrip />}</div>}
    </header>
  )
}
