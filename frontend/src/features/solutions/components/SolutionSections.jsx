'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'
import SectionHead from '@/components/layout/SectionHead'

const howCardColors = ['#2c328c', '#ed0000', '#0039A6', '#AA0050']
const howCardImages = [
  '/illustrations/how-discovery.svg',
  '/illustrations/how-standup.svg',
  '/illustrations/how-operate.svg',
  '/illustrations/how-report.svg',
]

const relatedCardColors = ['#2c328c', '#ed0000', '#0039A6', '#AA0050']

function useRevealOnScroll() {
  const ref = useRef(null)

  useEffect(() => {
    const cards = ref.current?.querySelectorAll('[data-reveal]')
    if (!cards?.length) return undefined

    if (!('IntersectionObserver' in window)) {
      cards.forEach((card) => card.classList.add('is-in'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.28, rootMargin: '0px 0px -8% 0px' },
    )

    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  return ref
}

export function SolutionEngagement({
  items,
  eyebrow = 'How it works',
  heading = 'How we work with your team',
  copy = 'Dedicated, shared, or surge capacity. Scope is set against channels, hours, language mix, and SLA targets after discovery — not a generic rate card.',
}) {
  const listRef = useRevealOnScroll()

  if (!items?.length) return null

  return (
    <section className="bg-[#171b31] py-[clamp(56px,7vw,96px)] text-white">
      <div className="site-container">
        <SectionHead className="section-head--on-dark" copy={copy} eyebrow={eyebrow}>
          {heading}
        </SectionHead>
        <div className="how-cards" ref={listRef}>
          {items.map(([title, detail], index) => (
            <article
              className="how-card"
              data-reveal
              key={title}
              style={{
                '--how-card-color': howCardColors[index % howCardColors.length],
                '--how-delay': `${index * 90}ms`,
              }}
              tabIndex={0}
            >
              <img alt="" className="how-card__art" src={howCardImages[index % howCardImages.length]} />
              <div className="how-card__shade" aria-hidden="true" />
              <div className="how-card__copy">
                <h3>{title}</h3>
                <p>{detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SolutionRelated({
  items,
  eyebrow = 'Related services',
  heading = 'Other ways teams work with us',
  cardLabel = 'Related service',
  linkLabel = 'View service →',
}) {
  const listRef = useRevealOnScroll()

  if (!items?.length) return null

  return (
    <section className="bg-[#111425] py-[clamp(40px,5vw,64px)] text-white">
      <div className="site-container">
        <SectionHead className="section-head--on-dark" eyebrow={eyebrow}>
          {heading}
        </SectionHead>
        <div
          className="related-cards"
          ref={listRef}
          style={{ '--related-count': Math.max(items.length, 1) }}
        >
          {items.map((item, index) => (
              <Link
                className="related-card"
                data-reveal
                href={item.href}
                key={item.href}
                style={{
                  '--related-color': relatedCardColors[index % relatedCardColors.length],
                  '--how-delay': `${index * 90}ms`,
                }}
              >
                <div className="related-card__copy">
                  <div>
                    <p>{cardLabel}</p>
                    <h3>{item.title}</h3>
                  </div>
                  <span className="related-card__link">{linkLabel}</span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  )
}

export function SolutionClosingCta({ page }) {
  return (
    <section className="solution-anchor bg-[#171b31] py-[clamp(40px,5vw,64px)] text-white" id="start">
      <div className="site-container grid items-center gap-8 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <SectionHead className="section-head--on-dark" copy={page.cta.text} eyebrow="Next step">
            {page.cta.heading}
          </SectionHead>
        </div>
        <div className="rounded-[10px] bg-white p-6 text-[#101728] shadow-[0_20px_50px_rgba(0,0,0,.18)]">
          <h3 className="m-0 text-xl font-semibold">Start with a 30-minute discovery session</h3>
          <p className="mt-2 m-0 text-sm font-normal leading-[1.6] text-[rgba(16,23,40,.64)]">
            We will map channels, SLAs, staffing, and reporting before recommending a delivery model.
          </p>
          <div className="mt-5 grid gap-3">
            <AssessmentModalButton
              className="btn-omni w-full"
              context={page.assessmentContext}
              goal={page.assessmentGoal}
              step="meeting"
            >
              Book a discovery call
            </AssessmentModalButton>
            <AssessmentModalButton
              className="grid min-h-[44px] place-items-center rounded-[10px] border-2 border-[#2c3280] px-4 py-2 font-semibold text-[#2c3280]"
              context={page.assessmentContext}
              goal={page.assessmentGoal}
            >
              {page.assessmentContext?.cta || 'Start assessment'}
            </AssessmentModalButton>
          </div>
        </div>
      </div>
    </section>
  )
}
