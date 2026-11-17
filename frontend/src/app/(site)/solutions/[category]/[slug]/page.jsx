import { notFound, redirect } from 'next/navigation'
import SiteShell from '@/components/layout/SiteShell'
import SolutionChildPage from '@/features/solutions/components/SolutionChildPage'
import { getSolutionChildPage, solutionChildParams } from '@/features/solutions/data/solutions'
import { customSeo } from '@/features/landing/custom'

export function generateStaticParams() {
  return solutionChildParams
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const page = getSolutionChildPage(resolvedParams.category, resolvedParams.slug)
  if (!page) return {}
  const seo = customSeo[page.slug]

  return {
    title: seo?.title || `${page.title} | OmniContact`,
    description: seo?.description || page.seoDescription || page.subtitle || page.intro?.body,
    alternates: {
      canonical: page.href,
    },
  }
}

export default async function SolutionChildRoute({ params }) {
  const resolvedParams = await params
  const page = getSolutionChildPage(resolvedParams.category, resolvedParams.slug)
  if (!page) notFound()

  // Prefer canonical short service URLs.
  if (page.href && page.href !== `/solutions/${resolvedParams.category}/${resolvedParams.slug}`) {
    redirect(page.href)
  }

  return (
    <SiteShell chrome="static">
      <main>
        <SolutionChildPage page={page} />
      </main>
    </SiteShell>
  )
}
