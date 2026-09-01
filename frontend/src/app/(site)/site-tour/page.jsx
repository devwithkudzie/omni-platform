import SiteShell from '@/components/layout/SiteShell'
import SiteTourPage from '@/features/about/components/SiteTourPage'
import { siteTourPage } from '@/features/about/data/siteTour'

export const metadata = {
  title: siteTourPage.seoTitle,
  description: siteTourPage.seoDescription,
}

export default function SiteTourRoute() {
  return (
    <SiteShell chrome="static">
      <main>
        <SiteTourPage />
      </main>
    </SiteShell>
  )
}
