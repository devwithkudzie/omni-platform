'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

const services = [
  {
    title: 'ARAMS',
    text: 'School management software for academics, fees, records, attendance, and parent communication.',
    href: '/arams',
    image: '/home/visuals/arams-service.png',
  },
  {
    title: 'Marketing as a Service',
    text: 'Strategy, creative, digital campaigns, and reporting in one managed marketing team.',
    href: '/marketing-as-a-service',
    image: '/home/visuals/maas-service.png',
  },
  {
    title: 'BPO Services',
    text: 'Reliable back-office, claims, healthcare admin, and impact-sourcing operations.',
    href: '/solutions/business-process-outsourcing',
    image: '/home/visuals/bpo-service.png',
  },
  {
    title: 'Media Services',
    text: 'Content, creative production, and campaign media that support measurable growth.',
    href: '/marketing-as-a-service',
    image: '/home/visuals/media-service.png',
  },
]

export default function ServicesSection() {
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
    <section className="reference-section reference-section--services">
      <div className="site-container">
        <div className="reference-section__head">
          <p className="reference-section__eyebrow">
            <span aria-hidden="true" />
            What we deliver
          </p>
          <h2>Featured Services</h2>
        </div>
        <div className="home-service-grid" aria-label="Featured services" ref={listRef}>
          {services.map((service, index) => (
            <Link
              className="home-service-card"
              data-reveal
              href={service.href}
              key={service.title}
              style={{ '--how-delay': `${index * 90}ms` }}
            >
              <img src={service.image} alt="" />
              <div className="home-service-card__body">
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <strong>
                  Explore <span aria-hidden="true">→</span>
                </strong>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
