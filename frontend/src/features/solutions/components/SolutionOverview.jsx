import Link from 'next/link'
import SectionHead from '@/components/layout/SectionHead'
import { SolutionTrust } from './SolutionProof'

export default function SolutionOverview({
  heading,
  body,
  image,
  media,
  items = [],
  quote,
  headingLabel = 'Overview',
  featureLabel = 'What this covers',
}) {
  return (
    <div className="sx-overview">
      <SectionHead eyebrow={headingLabel}>{heading || headingLabel}</SectionHead>

      <article className={`sx-feature${media || image ? '' : ' sx-feature--text-only'}`}>
        <div className="sx-feature__copy">
          <p className="sx-label">{featureLabel}</p>
          {body ? <p className="sx-feature__body">{body}</p> : null}
        </div>
        {media || image ? (
          <div className="sx-feature__media">
            {media || <img alt="" src={image} />}
          </div>
        ) : null}
      </article>

      {items.length ? (
        <div className="sx-cards">
          {items.map((item, index) => {
            const inner = (
              <>
                <p className="sx-label">
                  {item.label || `Focus ${String(index + 1).padStart(2, '0')}`}
                </p>
                <h3>{item.title}</h3>
                {item.detail ? <p>{item.detail}</p> : null}
                {item.href ? (
                  <span className="hx-link">
                    Find out more <span aria-hidden="true">→</span>
                  </span>
                ) : null}
              </>
            )

            if (item.href) {
              return (
                <Link className="sx-card sx-card--link" href={item.href} key={item.title}>
                  {inner}
                </Link>
              )
            }

            return (
              <article className="sx-card" key={item.title}>
                {inner}
              </article>
            )
          })}
        </div>
      ) : null}

      <SolutionTrust quote={quote} />
    </div>
  )
}
