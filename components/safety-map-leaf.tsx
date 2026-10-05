'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { LocationData, RISK_META, RiskLevel } from '@/lib/data'
import { RoutePair } from '@/lib/safety-routes'

interface SafetyMapLeafProps {
  locations: LocationData[]
  selectedRoutePair: RoutePair | null
  showZones: boolean
  showRoutes: boolean
  selectedLocationId?: string | null
  onSelectLocation?: (loc: LocationData) => void
  activeRouteType?: 'all' | 'direct' | 'alternative'
}

// Controller component to automatically pan/zoom map to fit route or location
function MapAutoFit({
  selectedRoutePair,
  selectedLocationId,
  locations,
}: {
  selectedRoutePair: RoutePair | null
  selectedLocationId?: string | null
  locations: LocationData[]
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedRoutePair) {
      const coords = [
        ...selectedRoutePair.directRoute.coordinates,
        ...selectedRoutePair.alternativeRoute.coordinates,
      ]
      const bounds = L.latLngBounds(coords.map(([lat, lng]) => [lat, lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10, animate: true })
    } else if (selectedLocationId) {
      const loc = locations.find((l) => l.id === selectedLocationId)
      if (loc) {
        map.setView([loc.lat, loc.lng], 9, { animate: true })
      }
    }
  }, [selectedRoutePair, selectedLocationId, locations, map])

  return null
}

function createCustomMarkerIcon(risk: RiskLevel, isSelected: boolean) {
  const colorMap: Record<RiskLevel, string> = {
    low: '#10b981',
    moderate: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  }
  const color = colorMap[risk]
  const size = isSelected ? 24 : 18
  const isHighOrCritical = risk === 'high' || risk === 'critical'

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px;">
      ${
        isHighOrCritical
          ? `<div style="position: absolute; width: ${size * 2}px; height: ${
              size * 2
            }px; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ''
      }
      <div style="position: relative; width: ${size}px; height: ${size}px; border-radius: 50%; background-color: ${color}; border: 2.5px solid #0d141f; box-shadow: 0 0 12px ${color}80; display: flex; align-items: center; justify-content: center;">
        <div style="width: 5px; height: 5px; border-radius: 50%; background-color: #ffffff;"></div>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function SafetyMapLeaf({
  locations,
  selectedRoutePair,
  showZones,
  showRoutes,
  selectedLocationId,
  onSelectLocation,
  activeRouteType = 'all',
}: SafetyMapLeafProps) {
  const defaultCenter: [number, number] = [25.8, 92.5]
  const defaultZoom = 7

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-[#0d141f]">
      <style jsx global>{`
        .leaflet-container {
          background-color: #0b111a !important;
          font-family: inherit;
        }
        .custom-leaflet-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          background-color: #111827 !important;
          color: #f3f4f6 !important;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6) !important;
          padding: 4px !important;
        }
        .leaflet-popup-tip {
          background-color: #111827 !important;
        }
        .leaflet-tooltip {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 6px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 3px 8px !important;
        }
        @keyframes ping {
          75%,
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapAutoFit
          selectedRoutePair={selectedRoutePair}
          selectedLocationId={selectedLocationId}
          locations={locations}
        />

        {/* Landslide Risk Zones (glowing transparent hazard buffers) */}
        {showZones &&
          locations.map((loc) => {
            if (loc.risk === 'low') return null
            const colorMap: Record<RiskLevel, string> = {
              low: '#10b981',
              moderate: '#f59e0b',
              high: '#f97316',
              critical: '#ef4444',
            }
            const color = colorMap[loc.risk]
            const radiusMeters = loc.risk === 'critical' ? 22000 : loc.risk === 'high' ? 16000 : 10000

            return (
              <Circle
                key={`zone-${loc.id}`}
                center={[loc.lat, loc.lng]}
                radius={radiusMeters}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: loc.risk === 'critical' ? 0.22 : 0.15,
                  weight: 1.5,
                  dashArray: loc.risk === 'critical' ? '4, 4' : undefined,
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 min-w-[200px]">
                    <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1">
                      <span className="font-semibold text-xs text-foreground">{loc.name} Risk Zone</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: color }}
                      >
                        {loc.risk} Risk
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Modeled landslide susceptibility zone (~{(radiusMeters / 1000).toFixed(0)}km radius).
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-border/30">
                      <div><span className="text-muted-foreground">Rainfall:</span> <strong className="text-foreground">{loc.rainfall} mm</strong></div>
                      <div><span className="text-muted-foreground">Saturation:</span> <strong className="text-foreground">{loc.soilSaturation}%</strong></div>
                      <div><span className="text-muted-foreground">Slope:</span> <strong className="text-foreground">{loc.slope}°</strong></div>
                      <div><span className="text-muted-foreground">Score:</span> <strong className="text-foreground">{(loc.riskScore * 100).toFixed(0)}/100</strong></div>
                    </div>
                  </div>
                </Popup>
              </Circle>
            )
          })}

        {/* Route Polylines */}
        {showRoutes && selectedRoutePair && (
          <>
            {/* Direct Route (Passes through high-risk areas) */}
            {(activeRouteType === 'all' || activeRouteType === 'direct') && (
              <Polyline
                positions={selectedRoutePair.directRoute.coordinates}
                pathOptions={{
                  color: '#ef4444',
                  weight: 4,
                  dashArray: '8, 8',
                  opacity: 0.9,
                }}
              >
                <Tooltip sticky>
                  <span>⚠️ Direct Route — {selectedRoutePair.directRoute.riskExposure} Risk Exposure</span>
                </Tooltip>
                <Popup>
                  <div className="p-1.5 space-y-2 min-w-[220px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-red-400">Direct Route</span>
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded text-[10px] font-bold uppercase">
                        {selectedRoutePair.directRoute.riskExposure} Exposure
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedRoutePair.directRoute.description}
                    </p>
                    <div className="text-[11px] font-mono space-y-0.5 pt-1 border-t border-border/40">
                      <div>Distance: <strong>{selectedRoutePair.directRoute.distanceKm} km</strong></div>
                      <div>Risk Zones Encountered: <strong className="text-red-400">{selectedRoutePair.directRoute.zonesEncountered}</strong></div>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            )}

            {/* Alternative Safer Route */}
            {(activeRouteType === 'all' || activeRouteType === 'alternative') && (
              <Polyline
                positions={selectedRoutePair.alternativeRoute.coordinates}
                pathOptions={{
                  color: '#10b981',
                  weight: 5,
                  opacity: 0.95,
                }}
              >
                <Tooltip sticky>
                  <span>🛡️ Lower-Risk Route — {selectedRoutePair.alternativeRoute.riskExposure} Risk</span>
                </Tooltip>
                <Popup>
                  <div className="p-1.5 space-y-2 min-w-[220px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-400">Lower-Risk Route</span>
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-bold uppercase">
                        {selectedRoutePair.alternativeRoute.riskExposure} Exposure
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedRoutePair.alternativeRoute.description}
                    </p>
                    <div className="text-[11px] font-mono space-y-0.5 pt-1 border-t border-border/40">
                      <div>Distance: <strong>{selectedRoutePair.alternativeRoute.distanceKm} km</strong></div>
                      <div>Risk Zones Encountered: <strong className="text-emerald-400">{selectedRoutePair.alternativeRoute.zonesEncountered}</strong></div>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            )}
          </>
        )}

        {/* Monitored Location Markers */}
        {locations.map((loc) => {
          const isSelected = selectedLocationId === loc.id
          const meta = RISK_META[loc.risk]

          return (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={createCustomMarkerIcon(loc.risk, isSelected)}
              eventHandlers={{
                click: () => onSelectLocation?.(loc),
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 min-w-[220px]">
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
                    <div>
                      <h4 className="font-bold text-xs text-foreground leading-tight">{loc.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{loc.state}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white shadow-xs"
                      style={{ backgroundColor: meta.token }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="bg-secondary/40 p-1.5 rounded border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Risk Score</span>
                      <span className="font-mono font-bold text-foreground">
                        {(loc.riskScore * 100).toFixed(0)}/100
                      </span>
                    </div>
                    <div className="bg-secondary/40 p-1.5 rounded border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Rainfall (24h)</span>
                      <span className="font-mono font-bold text-foreground">{loc.rainfall} mm</span>
                    </div>
                    <div className="bg-secondary/40 p-1.5 rounded border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Soil Saturation</span>
                      <span className="font-mono font-bold text-foreground">{loc.soilSaturation}%</span>
                    </div>
                    <div className="bg-secondary/40 p-1.5 rounded border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Slope Angle</span>
                      <span className="font-mono font-bold text-foreground">{loc.slope}°</span>
                    </div>
                  </div>

                  <p className="text-[10px] italic text-muted-foreground bg-card/60 p-1.5 rounded border border-border/30 leading-snug">
                    "{loc.recommendation}"
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
