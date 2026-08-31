'use client'

import { useEffect, useRef } from 'react'

const transformationSteps = [
  { title: 'Business Challenge', description: 'Clarify the pressure, customer friction, or growth barrier that needs to change.' },
  { title: 'Business Assessment', description: 'Understand the current state with enough context to see what creates value.' },
  { title: 'Opportunity Roadmap', description: 'Prioritize practical moves that improve speed, quality, cost, and resilience.' },
  { title: 'Solution Delivery', description: 'Put the right people, technology, and operating model around the opportunity.' },
  { title: 'Operational Excellence', description: 'Strengthen routines so improvement becomes visible, repeatable, and scalable.' },
  { title: 'Continuous Growth', description: 'Use operational insight to keep finding the next area of advantage.' },
  { title: 'Start the Assessment', description: 'Get a tailored 3-minute assessment for this solution area.', cta: true },
]

export default function TransformationPath({ assessmentGoal, assessmentContext, illustration }) {
  const listRef = useRef(null)

  function openAssessment() {
    window.dispatchEvent(new CustomEvent('omni:open-assessment', {
      detail: { goal: assessmentGoal, context: assessmentContext },
    }))
  }

  useEffect(() => {
    const items = listRef.current?.querySelectorAll('[data-path-step]')
    if (!items?.length) return undefined

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.28, rootMargin: '0px 0px -10% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="solution-anchor transformation-path" id="path">
      {illustration ? (
        <div
          aria-hidden="true"
          className="transformation-path__art"
          style={{ backgroundImage: `url("${illustration}")` }}
        />
      ) : null}
      <div className="site-container">
        <div className="transformation-path__intro">
          <p>Transformation path</p>
          <h2>From Opportunity to Impact</h2>
          <p className="transformation-path__copy">
            A practical journey from today&apos;s business pressure to measurable operational improvement.
          </p>
        </div>

        <ol className="transformation-path__rail" ref={listRef}>
          {transformationSteps.map((item, index) => {
            const side = index % 2 === 0 ? 'is-left' : 'is-right'

            return (
              <li
                className={`transformation-path__step ${side}${item.cta ? ' is-cta' : ''}`}
                data-path-step
                key={item.title}
                style={{ '--step-delay': `${index * 70}ms` }}
              >
                <span className="transformation-path__node" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <article className="transformation-path__card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.cta ? (
                    <button className="transformation-path__cta" type="button" onClick={openAssessment}>
                      {assessmentContext?.cta || 'Start Assessment'} <span aria-hidden="true">→</span>
                    </button>
                  ) : null}
                </article>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
