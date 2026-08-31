import { notFound, redirect } from 'next/navigation'
import SiteShell from '@/components/layout/SiteShell'
import { getIndustryPage } from '@/features/industries/data/industries'
import PublicPage from '@/features/public-pages/components/PublicPage'
import { getAllPublicSlugs, getPublicPage } from '@/features/public-pages/data/pages'

export function generateStaticParams() {
  return getAllPublicSlugs()
    .filter((slug) => slug !== 'solutions' && !slug.startsWith('solutions/'))
    .map((slug) => ({
      slug: slug.split('/'),
    }))
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')
  const legacySolutionRedirects = {
    'ai-technology-solutions': '/solutions/ai-technology-solutions',
    'customer-experience-solutions': '/solutions/customer-experience-solutions',
    'business-process-outsourcing': '/solutions/business-process-outsourcing',
    'test-center': '/solutions/assessment-certification-services',
  }
  const legacyAboutRedirects = {
    'community-engagement': '/about/community-impact',
    'impact-sourcing': '/about/impact-sourcing',
    project_ignite: '/about/project-ignite',
    'project-ignite': '/about/project-ignite',
  }
  if (slug === 'posts') {
    return {
      title: 'Insights | OmniContact',
      alternates: {
        canonical: '/insights',
      },
    }
  }
  if (slug === 'discovery') {
    return {
      title: 'Book Discovery | OmniContact',
      alternates: {
        canonical: '/',
      },
    }
  }
  if (resolvedParams.slug[0] === 'post' && resolvedParams.slug[1]) {
    return {
      title: 'Insight | OmniContact',
      alternates: {
        canonical: `/insights/${resolvedParams.slug[1]}`,
      },
    }
  }

  if (legacySolutionRedirects[slug]) {
    return {
      title: 'OmniContact Solutions',
      alternates: {
        canonical: legacySolutionRedirects[slug],
      },
    }
  }
  if (legacyAboutRedirects[slug]) {
    return {
      title: 'About OmniContact',
      alternates: {
        canonical: legacyAboutRedirects[slug],
      },
    }
  }

  const industryPage = getIndustryPage(slug)
  if (industryPage) {
    return {
      title: `${industryPage.title} | OmniContact`,
      description: industryPage.seoDescription || industryPage.subtitle || industryPage.intro?.body,
      alternates: {
        canonical: `/industries/${slug}`,
      },
    }
  }

  const page = industryPage || getPublicPage(resolvedParams.slug)
  if (!page) return {}

  return {
    title: `${page.title} | OmniContact`,
    description: page.seoDescription || page.subtitle || page.intro,
  }
}

export default async function Page({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug.join('/')
  const legacySolutionRedirects = {
    'ai-technology-solutions': '/solutions/ai-technology-solutions',
    'customer-experience-solutions': '/solutions/customer-experience-solutions',
    'business-process-outsourcing': '/solutions/business-process-outsourcing',
    'test-center': '/solutions/assessment-certification-services',
  }
  const legacyAboutRedirects = {
    'community-engagement': '/about/community-impact',
    'impact-sourcing': '/about/impact-sourcing',
    project_ignite: '/about/project-ignite',
    'project-ignite': '/about/project-ignite',
  }
  if (slug === 'posts') redirect('/insights')
  if (slug === 'discovery') redirect('/?discovery=1')
  if (resolvedParams.slug[0] === 'post' && resolvedParams.slug[1]) {
    redirect(`/insights/${resolvedParams.slug[1]}`)
  }

  if (legacySolutionRedirects[slug]) redirect(legacySolutionRedirects[slug])
  if (legacyAboutRedirects[slug]) redirect(legacyAboutRedirects[slug])

  const industryPage = getIndustryPage(slug)
  if (industryPage) redirect(`/industries/${slug}`)

  const page = getPublicPage(resolvedParams.slug)
  if (!page) notFound()

  return (
    <SiteShell>
      <main>
        <PublicPage page={page} />
      </main>
    </SiteShell>
  )
}
