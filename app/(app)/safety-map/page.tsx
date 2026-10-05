import { PageHeader } from '@/components/page-header'
import { SafetyMapContainer } from '@/components/safety-map-container'

export default function SafetyMapPage() {
  return (
    <>
      <PageHeader
        title="Safety Map"
        subtitle="Visualize landslide-risk areas and compare routes with lower modeled risk exposure."
      />
      <main className="flex-1 p-5 lg:p-8">
        <SafetyMapContainer />
      </main>
    </>
  )
}
