import { PageHeader } from '@/components/page-header'
import { RiskSimulator } from '@/components/risk-simulator'

export default function SimulatorPage() {
  return (
    <>
      <PageHeader
        title="Risk Simulator"
        subtitle="Model how changing environmental conditions affect landslide risk for a hypothetical site."
        showStatus={false}
      />
      <main className="flex-1 p-5 lg:p-8">
        <RiskSimulator />
      </main>
    </>
  )
}
