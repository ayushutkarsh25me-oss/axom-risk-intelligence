import { AlertsClient } from '@/components/alerts-client'
import { PageHeader } from '@/components/page-header'

export default function AlertsPage() {
  return (
    <>
      <PageHeader
        title="Alert Centre"
        subtitle="Every advisory raised by the risk model, prioritized by severity."
      />
      <main className="flex-1 p-5 lg:p-8">
        <AlertsClient />
      </main>
    </>
  )
}
