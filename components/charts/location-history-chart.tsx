'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function LocationHistoryChart({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => {
    const hour = (i + 24 - (data.length - 1)) % 24
    return { time: `${String(hour).padStart(2, '0')}:00`, score: v }
  })

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: 'var(--border)' }}
          interval={4}
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
          formatter={(value: any) => [Number(value).toFixed(2), 'Risk score']}
        />
        <ReferenceLine y={0.8} stroke="var(--risk-critical)" strokeDasharray="4 4" />
        <ReferenceLine y={0.6} stroke="var(--risk-high)" strokeDasharray="4 4" />
        <Area type="monotone" dataKey="score" stroke={color} strokeWidth={2} fill="url(#histGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
