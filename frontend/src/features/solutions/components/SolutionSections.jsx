import Link from 'next/link'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'
import SectionHead from '@/components/layout/SectionHead'

export function SolutionRelated({
  items,
  eyebrow = 'Related services',
  heading = 'Other ways teams work with us',
  cardLabel = 'Related service',
  linkLabel = 'View service',
}) {
  if (!items?.length) return null

  return (
    <div className="sx-related">
      <div className="site-container">
        <SectionHead eyebrow={eyebrow}>{heading}</SectionHead>
        <div className="sx-related__grid">
          {items.map((item) => (
            <Link className="sx-card sx-card--link" href={item.href} key={item.href}>
              <p className="sx-label">{cardLabel}</p>
              <h3>{item.title}</h3>
              {item.subtitle ? <p>{item.subtitle}</p> : null}
              <span className="hx-link">
                {linkLabel.replace(/\s*→$/, '')} <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SolutionClosingCta({ page }) {
  return (
    <section className="solution-anchor sx-closing" id="start">
      <div className="site-container">
        <div className="sx-closing__panel">
          <div className="sx-closing__copy">
            <p className="hx-eyebrow">Next step</p>
            <h2>{page.cta.heading}</h2>
            {page.cta.text ? <p>{page.cta.text}</p> : null}
          </div>
          <div className="sx-closing__card">
            <h3>Start with a 30-minute discovery session</h3>
            <p>We will map your goals, current operations, and the right delivery model before recommending next steps.</p>
            <div className="sx-closing__actions">
              <AssessmentModalButton
                className="hx-btn hx-btn--primary"
                context={page.assessmentContext}
                goal={page.assessmentGoal}
                step="meeting"
              >
                Book a Discovery Call <span aria-hidden="true">→</span>
              </AssessmentModalButton>
              <AssessmentModalButton
                className="hx-btn hx-btn--outline"
                context={page.assessmentContext}
                goal={page.assessmentGoal}
              >
                {page.assessmentContext?.cta || 'Start assessment'}
              </AssessmentModalButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
