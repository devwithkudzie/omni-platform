'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { thankYouPages } from './thankYouPages'

export default function ThankYouPage({ pageKey }) {
  const page = thankYouPages[pageKey]

  // Fire one lead event per visit so the conversion shows up in Google
  // Analytics even before a destination goal is configured.
  useEffect(() => {
    const flag = `ty-tracked:${page.path}`
    try {
      if (sessionStorage.getItem(flag)) return
      sessionStorage.setItem(flag, '1')
    } catch {
      // Storage unavailable: still send the event.
    }
    window.gtag?.('event', 'generate_lead', {
      form_name: page.form,
      lead_source: pageKey,
      page_path: page.path,
    })
  }, [page, pageKey])

  return (
    <div className="ty">
      <section className="ty-hero">
        <div className="site-container ty-hero__inner">
          <span className="ty-hero__check" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m6.5 12.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="ms-eyebrow ty-hero__eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="ty-hero__lede">{page.lede}</p>
        </div>
      </section>

      <section className="ty-next">
        <div className="site-container">
          <h2>What Happens Next</h2>
          <ol className="ty-steps">
            {page.steps.map(([title, text], index) => (
              <li key={title}>
                <span className="ms-steps__num">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>

          <div className="ty-actions">
            <Link className="hx-btn ms-btn--navy" href={page.primary.href}>
              {page.primary.label} <span aria-hidden="true">→</span>
            </Link>
            <Link className="hx-btn hx-btn--outline" href={page.secondary.href}>
              {page.secondary.label}
            </Link>
          </div>
          <p className="ty-help">
            Need to reach us sooner? Email <a href="mailto:info@omnicontact.biz">info@omnicontact.biz</a> or call{' '}
            <a href="tel:0774222020">0774 222 020</a>.
          </p>
        </div>
      </section>
    </div>
  )
}
