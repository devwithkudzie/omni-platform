import Link from 'next/link'
import { facilityTour } from '@/features/about/data/about'

export default function SiteTourCallout() {
  return (
    <section className="solution-anchor sx-band" id="site-tour">
      <div className="site-container">
        <article className="sx-feature">
          <div className="sx-feature__copy">
            <p className="sx-label">Virtual site tour</p>
            <h3 className="sx-feature__title">Step inside OmniContact. From anywhere.</h3>
            <p className="sx-feature__body">
              Explore our operational environment in 360° and see where teams, technology,
              and customer operations come together — before you book a physical visit.
            </p>
            <Link className="hx-btn hx-btn--primary" href="/site-tour" prefetch>
              <span>Take a site tour</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="sx-feature__media">
            <img alt="" src={facilityTour.poster} />
          </div>
        </article>
      </div>
    </section>
  )
}
