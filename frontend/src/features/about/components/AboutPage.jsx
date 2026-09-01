import ProjectIgniteLanding from './ProjectIgniteLanding'
import SiteTourCallout from './SiteTourCallout'
import SolutionHero from '@/features/solutions/components/SolutionHero'
import SolutionOverview from '@/features/solutions/components/SolutionOverview'
import SolutionOutcomes from '@/features/solutions/components/SolutionOutcomes'
import SolutionSectionNav from '@/features/solutions/components/SolutionSectionNav'
import { SolutionClosingCta, SolutionRelated } from '@/features/solutions/components/SolutionSections'
import { aboutPages, aboutSlugs } from '@/features/about/data/about'

function aboutLinks(showTour) {
  const links = [
    { href: '#overview', label: 'Overview' },
    { href: '#detail', label: 'In practice' },
  ]

  if (showTour) {
    links.splice(1, 0, { href: '#site-tour', label: 'Site tour' })
  }

  return links
}

export default function AboutPage({ page, slug = 'about' }) {
  if (page.variant === 'project-ignite') {
    return <ProjectIgniteLanding page={page} />
  }

  const breadcrumbs =
    slug === 'about'
      ? [{ label: 'About' }]
      : [
          { label: 'About', href: '/about' },
          { label: page.title },
        ]

  return (
    <>
      <SolutionHero
        breadcrumbs={breadcrumbs}
        image={page.image}
        subtitle={page.subtitle}
        title={page.title}
      />

      <SolutionSectionNav
        assessmentContext={page.assessmentContext}
        assessmentGoal={page.assessmentGoal}
        ctaLabel={page.navCta}
        links={aboutLinks(slug === 'who-we-are')}
        title={page.title}
      />

      <section className="solution-anchor solution-group solution-group--navy" id="overview">
        <div className="site-container">
          <SolutionOverview
            body={page.intro.body}
            heading={page.intro.heading}
            headingLabel={page.eyebrow || 'Overview'}
            image={page.image}
            items={page.highlights.map(([title, detail], index) => ({
              title,
              detail,
              label: `Focus ${String(index + 1).padStart(2, '0')}`,
            }))}
          />
        </div>
      </section>

      {slug === 'who-we-are' ? <SiteTourCallout /> : null}

      <section className="solution-anchor solution-group solution-group--dark" id="detail">
        <div className="site-container">
          <SolutionOutcomes
            eyebrow="In practice"
            heading={page.detailHeading || page.sections?.[0]?.[0] || 'How we work'}
            image={page.image}
            items={page.sections}
          />
        </div>
        <SolutionRelated
          cardLabel="About"
          eyebrow="More from OmniContact"
          heading="Other pages in this section"
          items={aboutSlugs
            .filter((item) => item !== slug)
            .slice(0, 3)
            .map((item) => ({
              title: aboutPages[item].title,
              href: `/about/${item}`,
            }))}
          linkLabel="View page →"
        />
      </section>

      <SolutionClosingCta page={page} />
    </>
  )
}
