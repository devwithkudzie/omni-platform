import { notFound } from 'next/navigation'
import SiteShell from '@/components/layout/SiteShell'
import IndustryPage from '@/features/industries/components/IndustryPage'
import { getIndustryPage, industrySlugs } from '@/features/industries/data/industries'

export function generateStaticParams() {
  return industrySlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const page = getIndustryPage(resolvedParams.slug)
  if (!page) return {}

  return {
    title: `${page.title} | OmniContact`,
    description: page.seoDescription || page.subtitle || page.intro?.body,
  }
}

export default async function IndustrySlugPage({ params }) {
  const resolvedParams = await params
  const page = getIndustryPage(resolvedParams.slug)
  if (!page) notFound()

  return (
    <SiteShell chrome="static">
      <main>
        <IndustryPage page={page} />
      </main>
    </SiteShell>
  )
}
