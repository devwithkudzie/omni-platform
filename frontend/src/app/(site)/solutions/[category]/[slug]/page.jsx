import { notFound } from 'next/navigation'
import SiteShell from '@/components/layout/SiteShell'
import AramsProductPage from '@/features/solutions/components/AramsProductPage'
import SolutionChildPage from '@/features/solutions/components/SolutionChildPage'
import { getSolutionChildPage, solutionChildParams } from '@/features/solutions/data/solutions'

export function generateStaticParams() {
  return solutionChildParams
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const page = getSolutionChildPage(resolvedParams.category, resolvedParams.slug)
  if (!page) return {}

  return {
    title: `${page.title} | OmniContact`,
    description: page.seoDescription || page.subtitle || page.intro?.body,
  }
}

export default async function SolutionChildRoute({ params }) {
  const resolvedParams = await params
  const page = getSolutionChildPage(resolvedParams.category, resolvedParams.slug)
  if (!page) notFound()

  const isArams = resolvedParams.category === 'enterprise-platforms' && resolvedParams.slug === 'arams'

  return (
    <SiteShell chrome="static">
      <main>
        {isArams ? <AramsProductPage page={page} /> : <SolutionChildPage page={page} />}
      </main>
    </SiteShell>
  )
}
