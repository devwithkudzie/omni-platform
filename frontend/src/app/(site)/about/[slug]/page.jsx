import { notFound } from 'next/navigation'
import SiteShell from '@/components/layout/SiteShell'
import AboutPage from '@/features/about/components/AboutPage'
import { aboutSlugs, getAboutPage } from '@/features/about/data/about'


export function generateStaticParams() {
  return aboutSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const page = getAboutPage(resolvedParams.slug)
  if (!page) return {}

  return {
    title: `${page.title} | OmniContact`,
    description: page.seoDescription || page.subtitle || page.intro?.body,
  }
}

export default async function AboutSlugRoute({ params }) {
  const resolvedParams = await params
  const page = getAboutPage(resolvedParams.slug)
  if (!page) notFound()

  return (
    <SiteShell chrome="static">
      <main>
        <AboutPage page={page} slug={resolvedParams.slug} />
      </main>
    </SiteShell>
  )
}
