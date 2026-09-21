'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/components/theme-provider'
import { useToast } from '@/components/toast'
import { cn } from '@/lib/utils'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted',
      )}
    >
      <span
        className={cn(
          'inline-block size-4 rounded-full bg-background transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

const CHANNELS = [
  { key: 'sms', label: 'SMS to district authorities', desc: 'Text alerts for High and Critical events' },
  { key: 'email', label: 'Email digest', desc: 'Hourly summary to the operations desk' },
  { key: 'push', label: 'Push notifications', desc: 'Real-time alerts to the mobile app' },
] as const

export function SettingsClient() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [highThreshold, setHighThreshold] = useState(0.6)
  const [criticalThreshold, setCriticalThreshold] = useState(0.8)
  const [refresh, setRefresh] = useState('15')
  const [channels, setChannels] = useState({ sms: true, email: true, push: false })
  const [demoMode, setDemoMode] = useState(true)

  const save = () => {
    toast({
      title: 'Settings saved',
      description: 'Alert thresholds and notification preferences updated.',
      variant: 'success',
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-sm">Alert Thresholds</CardTitle>
          <p className="text-xs text-muted-foreground">
            Risk-score boundaries that trigger each advisory tier
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="high" className="text-sm font-medium text-risk-high">
                High advisory
              </label>
              <span className="font-mono text-sm font-semibold tabular-nums">
                {highThreshold.toFixed(2)}
              </span>
            </div>
            <input
              id="high"
              type="range"
              min={0.4}
              max={0.75}
              step={0.01}
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
              className="w-full accent-[var(--risk-high)]"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="critical" className="text-sm font-medium text-risk-critical">
                Critical advisory
              </label>
              <span className="font-mono text-sm font-semibold tabular-nums">
                {criticalThreshold.toFixed(2)}
              </span>
            </div>
            <input
              id="critical"
              type="range"
              min={0.75}
              max={0.95}
              step={0.01}
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="w-full accent-[var(--risk-critical)]"
            />
          </div>
          <div>
            <label htmlFor="refresh" className="mb-2 block text-sm font-medium">
              Inference refresh interval
            </label>
            <select
              id="refresh"
              value={refresh}
              onChange={(e) => setRefresh(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="5">Every 5 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-sm">Notification Channels</CardTitle>
            <p className="text-xs text-muted-foreground">
              Where advisories are dispatched when triggered
            </p>
          </CardHeader>
          <CardContent className="divide-y divide-border pt-2">
            {CHANNELS.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
                <Toggle
                  checked={channels[c.key]}
                  onChange={(v) => setChannels((prev) => ({ ...prev, [c.key]: v }))}
                  label={c.label}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-sm">Appearance</CardTitle>
            <p className="text-xs text-muted-foreground">
              Dashboard visual presentation
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Dark theme</p>
                <p className="text-xs text-muted-foreground text-pretty">
                  {theme === 'dark'
                    ? 'Command-centre dark palette with deep charcoal surfaces'
                    : 'Clean high-contrast light palette for bright environments'}
                </p>
              </div>
              <Toggle
                checked={theme === 'dark'}
                onChange={(dark) => setTheme(dark ? 'dark' : 'light')}
                label="Dark theme"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-sm">Data Mode</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Demo mode</p>
                <p className="text-xs text-muted-foreground text-pretty">
                  Use simulated sensor data. Disable to connect live government and satellite feeds
                  (planned).
                </p>
              </div>
              <Toggle checked={demoMode} onChange={setDemoMode} label="Demo mode" />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={save}>
          <Save className="size-4" />
          Save changes
        </Button>
      </div>
    </div>
  )
}
