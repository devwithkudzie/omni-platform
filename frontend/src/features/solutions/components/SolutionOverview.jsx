import Link from 'next/link'
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
    <div className="overview-board">
      <h2 className="overview-board__heading">{headingLabel}</h2>

      <article className="overview-feature">
        <div className="overview-feature__copy">
          <span className="outcome-card__bar" aria-hidden="true" />
          <p className="outcome-card__label">{featureLabel}</p>
          {heading ? <h3>{heading}</h3> : null}
          {body ? <p className="overview-feature__body">{body}</p> : null}
        </div>
        {media || image ? (
          <div className="overview-feature__media">
            {media || <img alt="" src={image} />}
          </div>
        ) : null}
      </article>

      {items.length ? (
        <div className="overview-cards">
          {items.map((item, index) => {
            const inner = (
              <>
                <span className="outcome-card__bar" aria-hidden="true" />
                <p className="outcome-card__label">
                  {item.label || `Focus ${String(index + 1).padStart(2, '0')}`}
                </p>
                <h3>{item.title}</h3>
                {item.detail ? <p>{item.detail}</p> : null}
              </>
            )

            if (item.href) {
              return (
                <Link href={item.href} key={item.title}>
                  {inner}
                </Link>
              )
            }

            return <article key={item.title}>{inner}</article>
          })}
        </div>
      ) : null}

      <SolutionTrust quote={quote} />
    </div>
  )
}
