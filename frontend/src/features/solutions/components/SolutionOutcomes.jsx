export default function SolutionOutcomes({
  items = [],
  stats = [],
  image,
  heading = 'Outcomes we support',
}) {
  if (!items.length) return null

  const outcomes = items.map((item) => ({
    title: Array.isArray(item) ? item[0] : item,
    detail: Array.isArray(item) ? item[1] : null,
  }))
  const [featured, ...rest] = outcomes
  const leadStat = stats[0]

  return (
    <div className="outcome-board">
      {heading ? <h2 className="outcome-board__heading">{heading}</h2> : null}

      {featured ? (
        <article className="outcome-feature">
          <div className="outcome-feature__copy">
            <span className="outcome-card__bar" aria-hidden="true" />
            <p className="outcome-card__label">What changes</p>
            <h3>{featured.title}</h3>
            {featured.detail ? <p className="outcome-feature__body">{featured.detail}</p> : null}
          </div>
          {leadStat ? (
            <div className="outcome-feature__stat">
              <p>{leadStat[0]}</p>
              <span>{leadStat[1]}</span>
            </div>
          ) : null}
        </article>
      ) : null}

      {rest.length ? (
        <div className="outcome-grid">
          {rest.map((item, index) => {
            const withPhoto = Boolean(image) && index === 0
            return (
              <article className={`outcome-card${withPhoto ? ' outcome-card--photo' : ''}`} key={item.title}>
                <div className="outcome-card__copy">
                  <span className="outcome-card__bar" aria-hidden="true" />
                  <p className="outcome-card__label">{`Outcome ${String(index + 2).padStart(2, '0')}`}</p>
                  <h3>{item.title}</h3>
                  {item.detail ? <p>{item.detail}</p> : null}
                </div>
                {withPhoto ? <img alt="" src={image} /> : null}
              </article>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
