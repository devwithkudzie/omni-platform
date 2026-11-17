'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'
import { LandingIcon } from '@/features/landing/icons'
import LatestInsights from './LatestInsights'
import { testimonials } from './Testimonials'

const AUTOPLAY_MS = 7000

const partnerLogos = [
  { title: 'Partner 1', image: '/partners/partner (1).jpg' },
  { title: 'Partner 2', image: '/partners/partner (2).png' },
  { title: 'Partner 3', image: '/partners/partner (3).png' },
  { title: 'Partner 4', image: '/partners/partner (4).png' },
  { title: 'Partner 5', image: '/partners/partner (5).png' },
  { title: 'Partner 6', image: '/partners/partner (6).png' },
]

const solutions = [
  {
    icon: 'headset',
    title: 'AI-Powered Customer Experience & BPO',
    text: 'Deliver responsive, personalised customer support across channels with AI-enabled workflows and skilled human teams. Improve service quality, efficiency and customer loyalty.',
    href: '/solutions/customer-experience-solutions',
    image: '/home/visuals/bpo-service.png',
    link: 'Explore CX & BPO',
  },
  {
    icon: 'chart',
    title: 'Marketing as a Service (MaaS)',
    text: 'Access the strategy, creative, campaigns and performance expertise you need to attract customers and accelerate growth, without building a large in-house team.',
    href: '/marketing-as-a-service',
    image: '/home/visuals/maas-service.png',
    link: 'Explore MaaS',
  },
  {
    icon: 'book',
    title: 'ARAMS School Management',
    text: 'Connect school administration, communication and day-to-day processes through one digital platform designed to make education management simpler.',
    href: '/arams',
    image: '/home/visuals/arams-service.png',
    link: 'Explore ARAMS',
  },
  {
    icon: 'coins',
    title: 'AI Data Labelling & Annotation',
    text: 'Support the development of reliable AI systems with accurate, secure and scalable data annotation delivered by trained teams.',
    href: '/data-annotation-labelling',
    image: '/home/visuals/ai-globe.png',
    link: 'Explore Data Services',
  },
]

const whyPoints = [
  { icon: 'gear', title: 'AI with purpose', text: 'Apply intelligent technology to improve speed, consistency and service outcomes.' },
  { icon: 'team', title: 'Human-to-Human by design', text: 'Keep empathy, judgement and meaningful connection at the heart of customer engagement.' },
  { icon: 'globe', title: 'African roots, global outlook', text: 'Combine regional insight with delivery models designed to support organisations worldwide.' },
  { icon: 'bars', title: 'Scale without unnecessary overhead', text: 'Expand capacity and capability through flexible teams, processes and technology.' },
  { icon: 'bulb', title: 'Powered by an innovation ecosystem', text: 'Draw on the credibility and forward-looking ambition of the Econet ecosystem.' },
]

const impactStats = [
  { icon: 'star', value: '30%', label: 'average improvement in customer satisfaction' },
  { icon: 'gear', value: '25%', label: 'increase in operational efficiency' },
  { icon: 'team', value: '100M+', label: 'customer interactions handled annually' },
  { icon: 'check', value: '99%', label: 'client retention rate' },
]

const assessmentItems = [
  'A quick assessment of your current CX maturity',
  'Key opportunities for improvement',
  'Tailored recommendations from our experts',
  'No obligation, just actionable insight',
]

function Check() {
  return (
    <span className="hx-check" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function TrustedBy() {
  return (
    <section className="hx-logos" aria-label="Trusted by leading organisations">
      <div className="site-container">
        <p className="hx-eyebrow">Trusted by leading organisations</p>
        <ul>
          {partnerLogos.map((logo) => (
            <li key={logo.title}>
              <img src={logo.image} alt={logo.title} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function SolutionsSection() {
  return (
    <section className="hx-section hx-section--soft" id="solutions">
      <div className="site-container">
        <div className="hx-head hx-head--split">
          <div>
            <p className="hx-eyebrow">Our solutions</p>
            <h2>Intelligent Solutions. Real Business Outcomes.</h2>
            <p>
              From customer engagement to marketing execution and AI data services, our solutions bring together
              technology, skilled people and practical expertise to help your business operate efficiently, serve
              customers better and scale with confidence.
            </p>
          </div>
          <Link className="hx-link" href="/solutions/customer-experience-solutions">
            View all solutions <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="hx-solution-grid">
          {solutions.map((item) => (
            <article className="hx-solution" key={item.title}>
              <div className="hx-solution__media">
                <img src={item.image} alt="" />
              </div>
              <div className="hx-solution__body">
                <span className="hx-solution__badge">
                  <LandingIcon name={item.icon} tone="plain" />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link className="hx-link" href={item.href}>
                  {item.link} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhySection() {
  return (
    <section className="hx-why">
      <div className="hx-why__media" aria-hidden="true">
        <span className="hx-why__arc" />
        <span className="hx-why__tick" />
        <img src="/home/visuals/bpo-service.png" alt="" />
      </div>

      <div className="site-container hx-why__inner">
        <div className="hx-why__copy">
          <p className="hx-eyebrow">Why Yamurai OmniContact</p>
          <h2>The Intelligence of AI. The Power of Human Connection.</h2>
          <p className="hx-why__lede">
            We believe the future of customer experience is not human or machine. It is the best of both. Our
            Human-to-Human philosophy puts people at the centre while using AI to make every interaction more
            effective.
          </p>
          <ul>
            {whyPoints.map((point) => (
              <li key={point.title}>
                <span className="hx-ring hx-ring--soft">
                  <LandingIcon name={point.icon} tone="plain" />
                </span>
                <span>
                  <strong>{point.title}</strong>
                  {point.text}
                </span>
              </li>
            ))}
          </ul>
          <Link className="hx-btn hx-btn--primary hx-why__cta" href="/about/who-we-are">
            Discover Our Story <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

function ImpactSection() {
  return (
    <section className="hx-impact">
      <div className="site-container">
        <div className="hx-head hx-head--center">
          <p className="hx-eyebrow">Our impact</p>
          <h2>Helping Businesses Grow Beyond Their Boundaries</h2>
          <p className="hx-head__copy">
            We help organisations expand their capabilities, serve more customers and enter new markets without
            needing to grow their physical footprint at the same pace. By combining AI, smart processes and human
            expertise, we make scalable operations more accessible.
          </p>
          <p className="hx-head__tag">Built in Africa. Ready for the world.</p>
        </div>
        <dl className="hx-impact__grid">
          {impactStats.map((stat) => (
            <div key={stat.label}>
              <LandingIcon name={stat.icon} tone="plain" />
              <span>
                <dt>{stat.value}</dt>
                <dd>{stat.label}</dd>
              </span>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const [index, setIndex] = useState(0)
  const active = testimonials[index]
  const dots = Math.min(testimonials.length, 3)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setInterval(() => setIndex((current) => (current + 1) % testimonials.length), AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [])

  function step(direction) {
    setIndex((current) => (current + direction + testimonials.length) % testimonials.length)
  }

  return (
    <section className="hx-quotes">
      <div className="site-container">
        <div className="hx-head hx-head--center">
          <p className="hx-eyebrow">Client experience</p>
          <h2>Trusted to Deliver Where It Matters</h2>
          <p className="hx-head__copy">
            Strong partnerships are built on reliable delivery, responsive support and measurable business value.
          </p>
        </div>

        <div className="hx-quotes__stage">
          <button type="button" className="hx-quotes__nav" onClick={() => step(-1)} aria-label="Previous testimonial">
            <span aria-hidden="true">‹</span>
          </button>
          <figure className="hx-quotes__card">
            <span className="hx-quotes__mark" aria-hidden="true">“</span>
            <blockquote>{active.quote}</blockquote>
            <figcaption>
              <strong>{active.title}</strong>
              <span>{active.company}</span>
            </figcaption>
          </figure>
          <button type="button" className="hx-quotes__nav" onClick={() => step(1)} aria-label="Next testimonial">
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className="hx-quotes__dots">
          {Array.from({ length: dots }, (_, dot) => (
            <span className={index % dots === dot ? 'is-active' : ''} key={dot} />
          ))}
        </div>
      </div>
    </section>
  )
}

function DashboardLaptop() {
  const bars = [34, 52, 40, 66, 48, 74, 58, 82, 62, 90, 70, 96]
  return (
    <svg className="hx-laptop" viewBox="0 0 520 340" aria-hidden="true">
      <rect x="58" y="12" width="404" height="270" rx="14" fill="#1b1f2e" />
      <rect x="70" y="24" width="380" height="246" rx="4" fill="#f5f8fe" />
      <rect x="70" y="24" width="64" height="246" fill="#e9eefa" />
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <rect key={row} x="82" y={48 + row * 26} width={row === 1 ? 40 : 34} height="6" rx="3" fill={row === 1 ? '#2443c7' : '#c9d3e8'} />
      ))}
      <rect x="146" y="36" width="96" height="40" rx="6" fill="#fff" />
      <rect x="252" y="36" width="96" height="40" rx="6" fill="#fff" />
      <rect x="358" y="36" width="80" height="40" rx="6" fill="#fff" />
      <rect x="156" y="58" width="52" height="9" rx="3" fill="#14206b" />
      <rect x="262" y="58" width="44" height="9" rx="3" fill="#2443c7" />
      <rect x="368" y="58" width="40" height="9" rx="3" fill="#e82830" />
      <rect x="146" y="86" width="202" height="86" rx="6" fill="#fff" />
      <path d="M156 152 C 180 140, 196 146, 214 128 S 252 112, 270 120 S 306 100, 338 96" fill="none" stroke="#2443c7" strokeWidth="2.5" />
      <rect x="358" y="86" width="80" height="86" rx="6" fill="#fff" />
      <circle cx="398" cy="129" r="26" fill="none" stroke="#e6ebf5" strokeWidth="12" />
      <circle cx="398" cy="129" r="26" fill="none" stroke="#2443c7" strokeWidth="12" strokeDasharray="90 200" transform="rotate(-90 398 129)" />
      <circle cx="398" cy="129" r="26" fill="none" stroke="#e82830" strokeWidth="12" strokeDasharray="34 200" strokeDashoffset="-90" transform="rotate(-90 398 129)" />
      <rect x="146" y="182" width="292" height="78" rx="6" fill="#fff" />
      {bars.map((height, bar) => (
        <rect key={bar} x={160 + bar * 23} y={252 - height * 0.6} width="12" height={height * 0.6} rx="2" fill={bar % 3 === 2 ? '#8ea6ec' : '#2443c7'} />
      ))}
      <path d="M20 282 H500 L486 304 Q482 310 472 310 H48 Q38 310 34 304 Z" fill="#c9ced9" />
      <rect x="226" y="282" width="68" height="8" rx="4" fill="#aeb4c2" />
    </svg>
  )
}

function AssessmentSection() {
  return (
    <section className="hx-assess">
      <div className="site-container">
        <div className="hx-assess__panel">
          <div className="hx-assess__copy">
            <p className="hx-eyebrow">Free assessment</p>
            <h2>Is Your Customer Experience Ready for What’s Next?</h2>
            <p>
              Get a personalised assessment of your CX operations and discover opportunities to improve
              efficiency, customer satisfaction and growth.
            </p>
            <AssessmentModalButton
              className="hx-btn hx-btn--primary"
              context={{ category: 'Yamurai OmniContact', title: 'CX Health Check', objective: 'Assess CX readiness and next steps', type: 'cx_health_check' }}
            >
              Get Your Free CX Health Check <span aria-hidden="true">→</span>
            </AssessmentModalButton>
          </div>

          <div className="hx-assess__media">
            <DashboardLaptop />
          </div>

          <aside className="hx-assess__card">
            <h3>What you’ll get:</h3>
            <ul>
              {assessmentItems.map((item) => (
                <li key={item}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="hx-final">
      <div className="site-container hx-final__inner">
        <div>
          <p className="hx-eyebrow">Let’s build what’s next</p>
          <h2>Ready to Scale Smarter?</h2>
          <p>
            Whether you want to elevate customer experience, streamline operations or unlock new growth, our team
            can help you find the right combination of AI, people and processes.
          </p>
        </div>
        <div className="hx-final__actions">
          <AssessmentModalButton className="hx-btn hx-btn--primary" step="meeting">
            Book a Discovery Call <span aria-hidden="true">→</span>
          </AssessmentModalButton>
          <AssessmentModalButton className="hx-btn hx-btn--outline">Request an Operations Assessment</AssessmentModalButton>
          <p className="hx-final__micro">Tell us about your challenge. We’ll explore the right next step together.</p>
        </div>
      </div>
    </section>
  )
}

export default function HomeSections() {
  return (
    <>
      <TrustedBy />
      <SolutionsSection />
      <WhySection />
      <ImpactSection />
      <TestimonialsSection />
      <AssessmentSection />
      <LatestInsights />
      <FinalCta />
    </>
  )
}
