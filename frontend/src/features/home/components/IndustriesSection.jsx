'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { industryIcons } from '@/features/industries/data/industryIcons'

const industries = [
  { title: 'Financial Services', href: '/industries/financial-services', slug: 'financial-services', icon: '▥', text: 'Secure support models for regulated customer operations.' },
  { title: 'Insurance', href: '/industries/insurance', slug: 'insurance', icon: '◇', text: 'Policyholder journeys supported across service, claims, and retention.' },
  { title: 'Health', href: '/industries/health', slug: 'health', icon: '⌁', text: 'Responsive patient and member engagement for care teams.' },
  { title: 'Technology', href: '/industries/technology', slug: 'technology', icon: '▣', text: 'Digital-first assistance for products, platforms, and users.' },
  { title: 'Travel & Hospitality', href: '/industries/travel-hospitality', slug: 'travel-hospitality', icon: '↗', text: 'Guest and traveller support built for peaks, changes, and recovery.' },
  { title: 'Retail & E-commerce', href: '/industries/retail-ecommerce', slug: 'retail-ecommerce', icon: '▤', text: 'Omnichannel help for orders, fulfilment, returns, and loyalty.' },
  { title: 'Education', href: '/industries/education', slug: 'education', icon: '□', text: 'Learner, candidate, and institution support with reliable reporting.' },
]

function SectionEyebrow({ children }) {
  return (
    <p className="reference-section__eyebrow">
      <span aria-hidden="true" />
      {children}
    </p>
  )
}

export default function IndustriesSection() {
  const listRef = useRef(null)

  useEffect(() => {
    const cards = listRef.current?.querySelectorAll('[data-reveal]')
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

  return (
    <section className="reference-section reference-section--industries">
      <div className="site-container">
        <div className="reference-section__head">
          <SectionEyebrow>Where we work</SectionEyebrow>
          <h2>Industry-aware operations built for measurable service.</h2>
        </div>
        <div className="reference-industries" aria-label="Industries" ref={listRef}>
          {industries.map((industry, index) => (
            <Link
              className="reference-industry-card"
              data-reveal
              href={industry.href}
              key={industry.title}
              style={{ '--how-delay': `${index * 90}ms` }}
            >
              <span className="reference-industry-card__icon" aria-hidden="true">
                {industryIcons[industry.slug] ? (
                  <img src={industryIcons[industry.slug]} alt="" />
                ) : (
                  industry.icon
                )}
              </span>
              <h3>{industry.title}</h3>
              <p>{industry.text}</p>
              <strong>See solutions <span aria-hidden="true">→</span></strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
