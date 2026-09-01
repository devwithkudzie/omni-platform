import Link from 'next/link'
import { facilityTour } from '@/features/about/data/about'

export default function SiteTourCallout() {
  return (
    <section className="solution-anchor solution-group solution-group--dark" id="site-tour">
      <div className="site-container">
        <article className="overview-feature site-tour-callout">
          <div className="overview-feature__copy">
            <span className="outcome-card__bar" aria-hidden="true" />
            <p className="outcome-card__label">Virtual site tour</p>
            <h3>Step inside OmniContact. From anywhere.</h3>
            <p className="overview-feature__body">
              Explore our operational environment in 360° and see where teams, technology,
              and customer operations come together — before you book a physical visit.
            </p>
            <Link className="site-tour-callout__cta" href="/site-tour" prefetch>
              <span>Take a site tour</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="overview-feature__media">
            <img alt="" src={facilityTour.poster} />
          </div>
        </article>
      </div>
    </section>
  )
}
