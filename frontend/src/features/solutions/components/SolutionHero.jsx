import Link from 'next/link'

export default function SolutionHero({
  breadcrumbs = [],
  eyebrow,
  title,
  subtitle,
  image,
  variant = 'default',
  children,
}) {
  const isArticle = variant === 'article'

  return (
    <section className={`sx-hero${isArticle ? ' sx-hero--article' : ''}`}>
      {image ? (
        <div className="sx-hero__visual" aria-hidden="true">
          <span className="sx-hero__arc" />
          <img src={image} alt="" />
        </div>
      ) : null}

      <div className="site-container sx-hero__inner">
        <div className="sx-hero__copy">
          {breadcrumbs.length ? (
            <nav aria-label="Breadcrumb" className="sx-breadcrumbs">
              <Link href="/">Home</Link>
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1
                return (
                  <span key={`${crumb.label}-${index}`}>
                    <span aria-hidden="true" className="sx-breadcrumbs__sep">/</span>
                    {last || !crumb.href ? (
                      <span aria-current={last ? 'page' : undefined}>{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href}>{crumb.label}</Link>
                    )}
                  </span>
                )
              })}
            </nav>
          ) : null}

          {eyebrow ? <p className="hx-eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          {subtitle ? <p className="sx-hero__lede">{subtitle}</p> : null}
          {children ? <div className="sx-hero__actions">{children}</div> : null}
        </div>
      </div>
    </section>
  )
}
