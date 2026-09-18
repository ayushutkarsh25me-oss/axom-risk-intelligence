'use client'

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import type { FactorWeight } from '@/lib/data'

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function FactorBarChart({ data }: { data: FactorWeight[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 46)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
        barCategoryGap={12}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: 'var(--foreground)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} background={{ fill: 'var(--muted)', radius: 4 }}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: any) => `${v}%`}
            style={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
