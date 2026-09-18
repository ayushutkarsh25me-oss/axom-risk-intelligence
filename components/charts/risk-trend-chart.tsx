'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RISK_TREND_24H } from '@/lib/data'

export function RiskTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={RISK_TREND_24H} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--risk-critical)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--risk-critical)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'var(--border)' }}
          interval={3}
        />
        <YAxis
          domain={[0, 1]}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => v.toFixed(1)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--popover)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--popover-foreground)',
          }}
          labelStyle={{ color: 'var(--muted-foreground)' }}
          formatter={(value: any, name: any) => [
            Number(value).toFixed(2),
            name === 'peak' ? 'Peak risk' : 'Fleet average',
          ]}
        />
        <Area
          type="monotone"
          dataKey="peak"
          stroke="var(--risk-critical)"
          strokeWidth={2}
          fill="url(#peakGrad)"
        />
        <Area
          type="monotone"
          dataKey="average"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#avgGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
