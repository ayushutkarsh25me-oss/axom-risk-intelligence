import { PageHeader } from '@/components/page-header'
import { RiskMapExplorer } from '@/components/risk-map-explorer'

export default function RiskMapPage() {
  return (
    <>
      <PageHeader
        title="Regional Risk Map"
        subtitle="Interactive geospatial view of monitored sites. Select a marker to inspect its assessment."
      />
      <main className="flex-1 p-5 lg:p-8">
        <RiskMapExplorer />
      </main>
    </>
  )
}
