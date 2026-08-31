import { notFound } from 'next/navigation'
import SiteShell from '@/components/layout/SiteShell'
import IndustryIndexPage from '@/features/industries/components/IndustryIndexPage'
import { industryIndexPage } from '@/features/industries/data/industries'

export const metadata = {
  title: 'Industries | OmniContact',
  description:
    'Explore OmniContact industry solutions for financial services, insurance, healthcare, education, technology, and travel operations.',
}

export default function IndustriesPage() {
  if (!industryIndexPage) notFound()

  return (
    <SiteShell chrome="static">
      <main>
        <IndustryIndexPage page={industryIndexPage} />
      </main>
    </SiteShell>
  )
}
