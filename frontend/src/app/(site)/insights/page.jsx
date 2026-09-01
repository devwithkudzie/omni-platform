import SiteShell from '@/components/layout/SiteShell'
import InsightsIndex from '@/features/insights/components/InsightsIndex'

export const metadata = {
  title: 'Insights | OmniContact',
  description: 'Articles, updates, and expert views from OmniContact.',
}

export default function InsightsRoute() {
  return (
    <SiteShell chrome="static">
      <main>
        <InsightsIndex />
      </main>
    </SiteShell>
  )
}
