'use client'

import { AlertTriangle, CheckCircle2, Compass, Layers, Navigation, Route, ShieldAlert, ShieldCheck } from 'lucide-react'
import { LocationData, RISK_META, RiskLevel } from '@/lib/data'
import { DEMO_ROUTE_PAIRS, RoutePair, STARTING_LOCATIONS, StartingLocation } from '@/lib/safety-routes'
import { cn } from '@/lib/utils'

interface SafetyRoutePanelProps {
  locations: LocationData[]
  startingLocations?: StartingLocation[]
  originId: string
  destinationId: string
  onOriginChange: (id: string) => void
  onDestinationChange: (id: string) => void
  onFindRoute: () => void
  selectedRoutePair: RoutePair | null
  showZones: boolean
  showRoutes: boolean
  onToggleZones: (val: boolean) => void
  onToggleRoutes: (val: boolean) => void
  activeRouteType: 'all' | 'direct' | 'alternative'
  onRouteTypeChange: (type: 'all' | 'direct' | 'alternative') => void
  onSelectPresetRoute: (pair: RoutePair) => void
}

const RISK_ORDER: RiskLevel[] = ['low', 'moderate', 'high', 'critical']

function getBadgeStyle(risk: string) {
  switch (risk) {
    case 'CRITICAL':
      return 'border-red-500/40 bg-red-500/20 text-red-400'
    case 'HIGH':
      return 'border-orange-500/40 bg-orange-500/20 text-orange-400'
    case 'MODERATE':
      return 'border-amber-500/40 bg-amber-500/20 text-amber-400'
    case 'MODERATE-LOW':
      return 'border-cyan-500/40 bg-cyan-500/20 text-cyan-400'
    default:
      return 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
  }
}

export function SafetyRoutePanel({
  locations,
  startingLocations = STARTING_LOCATIONS,
  originId,
  destinationId,
  onOriginChange,
  onDestinationChange,
  onFindRoute,
  selectedRoutePair,
  showZones,
  showRoutes,
  onToggleZones,
  onToggleRoutes,
  activeRouteType,
  onRouteTypeChange,
  onSelectPresetRoute,
}: SafetyRoutePanelProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Route Selection Card */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Navigation className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Route Planner</h3>
              <p className="text-[11px] text-muted-foreground">Select start & destination to compare modeled risk</p>
            </div>
          </div>
          <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-400 uppercase">
            Branch Trial
          </span>
        </div>

        {/* Inputs */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Start Location
            </label>
            <select
              value={originId}
              onChange={(e) => onOriginChange(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Select Start Location --</option>
              {startingLocations.map((loc) => (
                <option key={`orig-${loc.id}`} value={loc.id}>
                  {loc.name} ({loc.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Destination (Monitored Site)
            </label>
            <select
              value={destinationId}
              onChange={(e) => onDestinationChange(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Select Destination --</option>
              {locations.map((loc) => (
                <option key={`dest-${loc.id}`} value={loc.id}>
                  {loc.name} ({loc.state}) — {loc.risk.toUpperCase()} RISK
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onFindRoute}
          disabled={!originId || !destinationId || originId === destinationId}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Route className="size-4" />
          Find Safer Route
        </button>

        {/* Quick Presets */}
        <div className="mt-4 pt-3 border-t border-border/60">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Suggested Corridor Demos:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_ROUTE_PAIRS.map((pair) => (
              <button
                key={pair.id}
                type="button"
                onClick={() => onSelectPresetRoute(pair)}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors',
                  selectedRoutePair?.id === pair.id
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border/70 bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                {pair.originName} → {pair.destinationName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls & Layer Toggles */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs font-medium">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showZones}
              onChange={(e) => onToggleZones(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-foreground">Show Landslide Risk Zones</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={(e) => onToggleRoutes(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-foreground">Show Routes</span>
          </label>
        </div>

        {selectedRoutePair && (
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-md border border-border/60">
            <button
              type="button"
              onClick={() => onRouteTypeChange('all')}
              className={cn(
                'px-2.5 py-0.5 text-[11px] font-medium rounded transition-colors',
                activeRouteType === 'all'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Both Routes
            </button>
            <button
              type="button"
              onClick={() => onRouteTypeChange('direct')}
              className={cn(
                'px-2.5 py-0.5 text-[11px] font-medium rounded transition-colors',
                activeRouteType === 'direct'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Higher-Risk Only
            </button>
            <button
              type="button"
              onClick={() => onRouteTypeChange('alternative')}
              className={cn(
                'px-2.5 py-0.5 text-[11px] font-medium rounded transition-colors',
                activeRouteType === 'alternative'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Lower-Risk Only
            </button>
          </div>
        )}
      </div>

      {/* Route Assessment Panel */}
      {selectedRoutePair ? (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Route Assessment</h3>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {selectedRoutePair.originName} ↔ {selectedRoutePair.destinationName}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Route A Card */}
            <div className="rounded-md border border-orange-500/30 bg-orange-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5" /> Higher-Risk Route
                </span>
                <span className={cn('rounded border px-2 py-0.5 text-[10px] font-bold uppercase', getBadgeStyle(selectedRoutePair.directRoute.riskExposure))}>
                  {selectedRoutePair.directRoute.riskExposure} EXPOSURE
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {selectedRoutePair.directRoute.name}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Risk Zones</span>
                  <span className="font-bold text-orange-400">
                    {selectedRoutePair.directRoute.zonesEncountered} Encountered
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Distance & Time</span>
                  <span className="font-bold text-foreground">
                    {selectedRoutePair.directRoute.distanceKm} km ({selectedRoutePair.directRoute.estTime})
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/90 border-t border-border/40 pt-1.5 italic">
                "{selectedRoutePair.directRoute.description}"
              </p>
            </div>

            {/* Route B Card */}
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" /> Lower-Risk Alternative
                </span>
                <span className={cn('rounded border px-2 py-0.5 text-[10px] font-bold uppercase', getBadgeStyle(selectedRoutePair.alternativeRoute.riskExposure))}>
                  {selectedRoutePair.alternativeRoute.riskExposure} EXPOSURE
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {selectedRoutePair.alternativeRoute.name}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Risk Zones</span>
                  <span className="font-bold text-emerald-400">
                    {selectedRoutePair.alternativeRoute.zonesEncountered} Encountered
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Distance & Time</span>
                  <span className="font-bold text-foreground">
                    {selectedRoutePair.alternativeRoute.distanceKm} km ({selectedRoutePair.alternativeRoute.estTime})
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/90 border-t border-border/40 pt-1.5 italic">
                "{selectedRoutePair.alternativeRoute.description}"
              </p>
            </div>
          </div>

          {/* Comparison Delta Bar */}
          <div className="rounded-md bg-secondary/40 p-3 border border-border/50 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>
                Lower-Risk Alternative avoids{' '}
                <strong>
                  {Math.max(0, selectedRoutePair.directRoute.zonesEncountered - selectedRoutePair.alternativeRoute.zonesEncountered)}
                </strong>{' '}
                major high-hazard risk zone(s).
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              +{selectedRoutePair.alternativeRoute.distanceKm - selectedRoutePair.directRoute.distanceKm} km detour
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center text-muted-foreground">
          <Route className="mx-auto size-8 text-muted-foreground/60 mb-2" />
          <p className="text-xs font-medium">Select a start location and destination above to calculate route risk assessment.</p>
        </div>
      )}

      {/* Legend Card */}
      <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          <Layers className="size-3.5" /> Map Legend
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase mb-1">
              Landslide Risk
            </span>
            <div className="flex flex-wrap gap-2">
              {RISK_ORDER.map((level) => {
                const meta = RISK_META[level]
                return (
                  <span key={level} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ backgroundColor: meta.token }} />
                    {meta.label}
                  </span>
                )
              })}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase mb-1">
              Routes
            </span>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-4 border-t-2 border-dashed border-orange-500" />
                <span>Higher-Risk Route</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 border-t-2 border-emerald-500" />
                <span>Lower-Risk Alternative</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice Disclaimer */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200/90 flex gap-3 items-start">
        <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300">Safety Notice & Disclaimer</p>
          <p className="text-[11px] leading-relaxed text-amber-200/80">
            Route suggestions are based on available risk information and are intended for situational awareness. They are not a substitute for official emergency or evacuation instructions.
          </p>
        </div>
      </div>
    </div>
  )
}
