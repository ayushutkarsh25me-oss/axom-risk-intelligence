import { PageHeader } from '@/components/page-header'
import { SettingsClient } from '@/components/settings-client'

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure alert thresholds, notification channels and data mode."
        showStatus={false}
      />
      <main className="flex-1 p-5 lg:p-8">
        <SettingsClient />
      </main>
    </>
  )
}
