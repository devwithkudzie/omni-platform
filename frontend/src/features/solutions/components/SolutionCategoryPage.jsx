import TransformationPath from './TransformationPath'
import SolutionHero from './SolutionHero'
import SolutionFaq from './SolutionFaq'
import SolutionOutcomes from './SolutionOutcomes'
import SolutionOverview from './SolutionOverview'
import SolutionSectionNav from './SolutionSectionNav'
import { SolutionClosingCta, SolutionEngagement } from './SolutionSections'

export default function SolutionCategoryPage({
  page,
  breadcrumbs,
  cardLabel = 'Service',
}) {
  return (
    <>
      <SolutionHero
        breadcrumbs={
          breadcrumbs || [
            { label: 'Solutions', href: '/solutions/ai-technology-solutions' },
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
            items={page.capabilities.map(([title, detail, href]) => ({
              title,
              detail,
              href,
              label: cardLabel,
            }))}
            quote={page.quote}
          />
        </div>
      </section>

      <section className="solution-anchor solution-group solution-group--dark" id="outcomes">
        <div className="site-container">
          <p className="solution-group__eyebrow">Outcomes</p>
          <SolutionOutcomes image={page.secondaryImage || page.image} items={page.outcomes} stats={page.stats} />
        </div>
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
