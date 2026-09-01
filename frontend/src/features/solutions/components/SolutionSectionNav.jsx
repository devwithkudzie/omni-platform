'use client'

import { useEffect, useRef, useState } from 'react'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'

const defaultLinks = [
  { href: '#overview', label: 'Overview' },
  { href: '#outcomes', label: 'Outcomes' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#path', label: 'Transformation path' },
  { href: '#faq', label: 'FAQ' },
]

export default function SolutionSectionNav({
  title,
  assessmentGoal,
  assessmentContext,
  links = defaultLinks,
  ctaLabel = 'Book a discovery call',
}) {
  const sentinelRef = useRef(null)
  const [active, setActive] = useState(links[0]?.href || '#overview')
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const ids = links.map((link) => link.href.slice(1))

    function updateActive() {
      const offset = 72
      let current = `#${ids[0]}`

      ids.forEach((id) => {
        const section = document.getElementById(id)
        if (!section) return
        if (section.getBoundingClientRect().top <= offset) {
          current = `#${id}`
        }
      })

      setActive(current)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('hashchange', updateActive)
    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('hashchange', updateActive)
    }
  }, [links])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div aria-hidden="true" className="solution-section-nav__sentinel" ref={sentinelRef} />
      <nav aria-label="On this page" className={`solution-section-nav${stuck ? ' is-stuck' : ''}`}>
        <div className="site-container solution-section-nav__inner">
          {title ? <p className="solution-section-nav__title">{title}</p> : null}

          <div className="solution-section-nav__links">
            {links.map((link) => (
              <a
                className={`solution-section-nav__link${active === link.href ? ' is-active' : ''}`}
                href={link.href}
                key={link.href}
                onClick={() => setActive(link.href)}
              >
                {link.label}
              </a>
            ))}
            <AssessmentModalButton
              className="solution-section-nav__cta"
              context={assessmentContext}
              goal={assessmentGoal}
              step="meeting"
            >
              {ctaLabel}
            </AssessmentModalButton>
          </div>
        </div>
      </nav>
    </>
  )
}
