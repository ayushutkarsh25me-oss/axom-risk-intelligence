'use client'

import { BellRing, CheckCircle2, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast'
import { RISK_META, type RiskLevel } from '@/lib/data'

export function LocationActions({
  locationName,
  risk,
}: {
  locationName: string
  risk: RiskLevel
}) {
  const { toast } = useToast()
  const meta = RISK_META[risk]

  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <Button
        size="sm"
        className="flex-1"
        onClick={() =>
          toast({
            title: `Alert dispatched — ${locationName}`,
            description: `${meta.label} advisory sent to district authorities.`,
            variant: risk === 'critical' ? 'critical' : 'warning',
          })
        }
      >
        <BellRing className="size-4" />
        Issue Alert
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={() =>
          toast({
            title: `${locationName} acknowledged`,
            description: 'Marked as reviewed by the operator on duty.',
            variant: 'success',
          })
        }
      >
        <CheckCircle2 className="size-4" />
        Acknowledge
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          toast({
            title: 'Report queued',
            description: `Situation report for ${locationName} is being generated.`,
          })
        }
      >
        <FileDown className="size-4" />
        Report
      </Button>
    </div>
  )
}
