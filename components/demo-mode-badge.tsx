import { FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DemoModeBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-risk-moderate/40 bg-risk-moderate/12 px-2 py-1 text-[11px] font-semibold tracking-wide text-risk-moderate uppercase',
        className,
      )}
      title="Sensor data is simulated for demonstration"
    >
      <FlaskConical className="size-3.5" />
      Demo Mode
    </span>
  )
}
