import { notFound } from 'next/navigation'
import SiteShell from '@/components/layout/SiteShell'
import AboutPage from '@/features/about/components/AboutPage'
import { getAboutPage } from '@/features/about/data/about'

export const metadata = {
  title: 'About OmniContact | OmniContact',
  description:
    'Learn about OmniContact, our customer operations work, values, community impact, and careers.',
}

export default function AboutRoute() {
  const page = getAboutPage()
  if (!page) notFound()

  return (
    <SiteShell>
      <main>
        <AboutPage page={page} />
      </main>
    </SiteShell>
  )
}
