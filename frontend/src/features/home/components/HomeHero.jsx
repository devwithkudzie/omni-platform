'use client'

import Link from 'next/link'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'
import { LandingIcon } from '@/features/landing/icons'

const benefits = [
  { icon: 'gear', title: 'AI-Enabled', text: 'customer operations' },
  { icon: 'team', title: 'Human-to-Human', text: 'service philosophy' },
  { icon: 'bars', title: 'Flexible, scalable', text: 'delivery' },
  { icon: 'globe', title: 'Part of the Econet', text: 'innovation ecosystem' },
]

export default function HomeHero() {
  return (
    <section className="hx-hero">
      <div className="hx-hero__visual" aria-hidden="true">
        <img src="/home/visuals/hero-1.png" alt="" />
        <span className="hx-hero__arc" />
        <span className="hx-hero__stroke" />
      </div>

      <div className="site-container hx-hero__grid">
        <div className="hx-hero__copy">
          <p className="hx-eyebrow hx-eyebrow--pipe">AI-Powered CX. Human-Centred Impact.</p>
          <h1>
            <span className="hx-hero__line">Smarter Customer Experiences.</span>{' '}
            <span className="hx-hero__line">Powered by AI.</span>{' '}
            <span className="hx-hero__line hx-hero__accent">Driven by People.</span>
          </h1>
          <p className="hx-hero__lede">
            Yamurai OmniContact helps organisations deliver better customer experiences and run smarter
            operations through AI-powered customer engagement, intelligent business processes and scalable
            support services. We combine advanced technology with the human touch to help businesses grow
            without growing their overheads.
          </p>
          <div className="hx-hero__actions">
            <AssessmentModalButton className="hx-btn hx-btn--primary" step="meeting">
              Talk to Our Experts <span aria-hidden="true">→</span>
            </AssessmentModalButton>
            <Link className="hx-btn hx-btn--outline" href="#solutions">
              Explore Our Solutions
            </Link>
          </div>
        </div>

        <div className="hx-hero__bottom">
          <ul className="hx-hero__benefits" aria-label="Built for scale. Designed for people.">
            {benefits.map((item) => (
              <li key={item.title}>
                <span className="hx-ring">
                  <LandingIcon name={item.icon} tone="plain" />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          <aside className="hx-hero__card">
            <LandingIcon name="chart" tone="plain" />
            <p>African expertise. Global ambition. Human-centred delivery.</p>
          </aside>
        </div>
      </div>
    </section>
  )
}
