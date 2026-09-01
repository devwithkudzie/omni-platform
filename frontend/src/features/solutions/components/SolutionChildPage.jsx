import TransformationPath from './TransformationPath'
import SolutionHero from './SolutionHero'
import SolutionFaq from './SolutionFaq'
import SolutionOutcomes from './SolutionOutcomes'
import SolutionOverview from './SolutionOverview'
import SolutionSectionNav from './SolutionSectionNav'
import { SolutionClosingCta, SolutionEngagement, SolutionRelated } from './SolutionSections'
import { solutionChildPages } from '@/features/solutions/data/solutions'

export default function SolutionChildPage({
  page,
  breadcrumbs,
  related: relatedProp,
  relatedEyebrow,
  relatedHeading,
  relatedLabel,
}) {
  const related = relatedProp || Object.values(solutionChildPages[page.categorySlug] || {})
    .filter((item) => item.slug && item.slug !== page.slug)
    .slice(0, 3)
    .map((item, index) => ({
      title: item.title,
      subtitle: item.subtitle,
      href: item.href,
      image: index % 2 === 0 ? item.image : item.secondaryImage || item.image,
      secondaryImage: item.secondaryImage,
    }))

  return (
    <>
      <SolutionHero
        breadcrumbs={
          breadcrumbs || [
            { label: 'Solutions', href: '/solutions/ai-technology-solutions' },
            { label: page.parentTitle, href: page.parentHref },
            { label: page.title },
          ]
        }
        image={page.image}
        subtitle={page.subtitle}
        title={page.title}
      />

      <SolutionSectionNav
        assessmentContext={page.assessmentContext}
        assessmentGoal={page.assessmentGoal}
        ctaLabel={page.navCta}
        title={page.title}
      />

      <section className="solution-anchor solution-group solution-group--navy" id="overview">
        <div className="site-container">
          <SolutionOverview
            body={page.intro.body}
            heading={page.intro.heading}
            image={page.secondaryImage || page.image}
            items={page.focusAreas.map(([title, detail], index) => ({
              title,
              detail,
              label: page.focusLabel || `Focus ${String(index + 1).padStart(2, '0')}`,
            }))}
            quote={page.quote}
          />
        </div>
      </section>

      <section className="solution-anchor solution-group solution-group--dark" id="outcomes">
        <div className="site-container">
          <SolutionOutcomes image={page.secondaryImage || page.image} items={page.outcomes} stats={page.stats} />
        </div>
        <SolutionRelated
          cardLabel={relatedLabel}
          eyebrow={relatedEyebrow}
          heading={relatedHeading}
          items={related}
        />
      </section>

      <div className="solution-anchor" id="how-it-works">
        <SolutionEngagement items={page.engagement} />
        <TransformationPath
          assessmentContext={page.assessmentContext}
          assessmentGoal={page.assessmentGoal}
          illustration={page.illustration}
        />
        <SolutionFaq items={page.faqs} />
      </div>

      <SolutionClosingCta page={page} />
    </>
  )
}
