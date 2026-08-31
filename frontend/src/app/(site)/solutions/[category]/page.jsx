import { notFound } from 'next/navigation'
import SiteShell from '@/components/layout/SiteShell'
import SolutionCategoryPage from '@/features/solutions/components/SolutionCategoryPage'
import {
  getSolutionCategoryPage,
  solutionCategorySlugs,
} from '@/features/solutions/data/solutions'
import PublicPage from '@/features/public-pages/components/PublicPage'
import { getAllPublicSlugs, getPublicPage } from '@/features/public-pages/data/pages'

const publicSolutionSlugs = getAllPublicSlugs()
  .filter((slug) => slug.startsWith('solutions/'))
  .map((slug) => slug.replace('solutions/', ''))

export function generateStaticParams() {
  return [...new Set([...solutionCategorySlugs, ...publicSolutionSlugs])].map((category) => ({ category }))
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const categoryPage = getSolutionCategoryPage(resolvedParams.category)
  const page = categoryPage || getPublicPage(['solutions', resolvedParams.category])
  if (!page) return {}

  return {
    title: `${page.title} | OmniContact`,
    description: page.seoDescription || page.subtitle || page.intro?.body || page.intro,
  }
}

export default async function SolutionCategoryRoute({ params }) {
  const resolvedParams = await params
  const categoryPage = getSolutionCategoryPage(resolvedParams.category)
  const page = categoryPage || getPublicPage(['solutions', resolvedParams.category])
  if (!page) notFound()

  return (
    <SiteShell chrome={categoryPage ? 'static' : undefined}>
      <main>
        {categoryPage ? <SolutionCategoryPage page={categoryPage} /> : <PublicPage page={page} />}
      </main>
    </SiteShell>
  )
}
