import { Badge } from '@/components/ui/badge'
import { RISK_META, type RiskLevel } from '@/lib/data'
import { cn } from '@/lib/utils'

export function RiskBadge({
  level,
  className,
  withDot = true,
}: {
  level: RiskLevel
  className?: string
  withDot?: boolean
}) {
  const meta = RISK_META[level]
  return (
    <Badge className={cn(meta.bg, meta.border, meta.text, className)}>
      {withDot && <span className={cn('size-1.5 rounded-full', meta.dot)} aria-hidden />}
      {meta.label}
    </Badge>
  )
}
