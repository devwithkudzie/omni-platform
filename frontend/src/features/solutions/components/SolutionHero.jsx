'use client'

import Link from 'next/link'

export default function SolutionHero({
  breadcrumbs = [],
  title,
  subtitle,
  image,
}) {
  return (
    <section
      className="solution-hero text-white"
      style={{ '--solution-hero-image': `url("${image}")` }}
    >
      <div className="site-container grid min-h-[clamp(400px,52vh,580px)] items-center py-[clamp(48px,6vw,88px)]">
        <div className="max-w-[38rem]">
          {breadcrumbs.length ? (
            <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem] font-medium text-white/70">
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1
                return (
                  <span className="inline-flex items-center gap-2" key={`${crumb.label}-${index}`}>
                    {index > 0 ? <span aria-hidden="true" className="text-white/40">/</span> : null}
                    {last || !crumb.href ? (
                      <span className={last ? 'text-white' : undefined}>{crumb.label}</span>
                    ) : (
                      <Link className="transition hover:text-white" href={crumb.href}>
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                )
              })}
            </nav>
          ) : null}

          <h1 className="m-0 text-[clamp(2.4rem,4.4vw,4.1rem)] font-semibold leading-[1.05] text-white">
            {title}
          </h1>
          <p className="mt-5 max-w-[36rem] text-[clamp(1.02rem,.28vw+0.96rem,1.2rem)] font-normal leading-[1.7] text-white/88">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}
