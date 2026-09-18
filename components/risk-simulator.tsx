'use client'

import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FactorBarChart } from '@/components/charts/factor-bar-chart'
import { RiskBadge } from '@/components/risk-badge'
import { RISK_META, simulateRisk } from '@/lib/data'
import { calculateRiskScore, type RiskPredictionResult } from '@/lib/api'
import { cn } from '@/lib/utils'

interface SliderDef {
  key: 'rainfall' | 'soilSaturation' | 'slope' | 'seismic' | 'vegetation'
  label: string
  min: number
  max: number
  step: number
  unit: string
}

const SLIDERS: SliderDef[] = [
  { key: 'rainfall', label: 'Rainfall (24h)', min: 0, max: 300, step: 5, unit: 'mm' },
  { key: 'soilSaturation', label: 'Soil Saturation', min: 0, max: 100, step: 1, unit: '%' },
  { key: 'slope', label: 'Slope', min: 0, max: 60, step: 1, unit: '°' },
  { key: 'seismic', label: 'Seismic Activity', min: 0, max: 100, step: 1, unit: 'idx' },
  { key: 'vegetation', label: 'Vegetation Cover', min: 0, max: 100, step: 1, unit: '%' },
]

const DEFAULTS = {
  rainfall: 90,
  soilSaturation: 60,
  slope: 30,
  seismic: 35,
  vegetation: 55,
}

function Gauge({ score, color }: { score: number; color: string }) {
  const radius = 78
  const circumference = Math.PI * radius // half circle
  const offset = circumference * (1 - score)
  return (
    <div className="relative mx-auto w-[200px]">
      <svg viewBox="0 0 200 110" className="w-full">
        <path
          d="M 22 100 A 78 78 0 0 1 178 100"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 22 100 A 78 78 0 0 1 178 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="font-mono text-4xl font-bold tabular-nums" style={{ color }}>
          {score.toFixed(2)}
        </span>
        <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
          Risk Score
        </span>
      </div>
    </div>
  )
}

export function RiskSimulator() {
  const [values, setValues] = useState(DEFAULTS)
  const [backendResult, setBackendResult] = useState<RiskPredictionResult | null>(null)

  const localResult = useMemo(
    () =>
      simulateRisk({
        rainfall: values.rainfall,
        soilSaturation: values.soilSaturation,
        slope: values.slope,
        seismic: values.seismic,
        vegetation: values.vegetation,
      }),
    [values],
  )

  useEffect(() => {
    let isMounted = true
    calculateRiskScore(values).then((res) => {
      if (isMounted) {
        setBackendResult(res)
      }
    })
    return () => {
      isMounted = false
    }
  }, [values])

  const result = backendResult ?? localResult
  const meta = RISK_META[result.risk]

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader className="flex-row items-center justify-between border-b border-border/60">
          <div>
            <CardTitle className="text-sm">Environmental Inputs</CardTitle>
            <p className="text-xs text-muted-foreground">
              Adjust conditions to see the model response
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setValues(DEFAULTS)}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {SLIDERS.map((s) => (
            <div key={s.key}>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor={s.key} className="text-sm font-medium">
                  {s.label}
                </label>
                <span className="font-mono text-sm font-semibold tabular-nums text-primary">
                  {values[s.key]}
                  <span className="ml-0.5 text-xs text-muted-foreground">{s.unit}</span>
                </span>
              </div>
              <input
                id={s.key}
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={values[s.key]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
                }
                className="w-full accent-primary"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-sm">Predicted Risk</CardTitle>
            <p className="text-xs text-muted-foreground">
              Prototype inference — placeholder for the Random Forest model
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <Gauge score={result.score} color={meta.token} />
            <div className="mt-4 flex items-center justify-center">
              <RiskBadge level={result.risk} className="text-sm" />
            </div>
            <div
              className={cn(
                'mt-4 rounded-md border p-3 text-center text-sm text-pretty',
                meta.bg,
                meta.border,
              )}
            >
              {result.risk === 'critical' &&
                'Critical conditions — immediate evacuation advisory would be triggered.'}
              {result.risk === 'high' &&
                'High risk — enhanced monitoring and response teams would be pre-positioned.'}
              {result.risk === 'moderate' &&
                'Moderate risk — continued monitoring recommended.'}
              {result.risk === 'low' && 'Low risk — conditions within normal range.'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-sm">Factor Contribution</CardTitle>
            <p className="text-xs text-muted-foreground">Normalized input intensity</p>
          </CardHeader>
          <CardContent className="pt-4">
            <FactorBarChart data={result.contributions} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
