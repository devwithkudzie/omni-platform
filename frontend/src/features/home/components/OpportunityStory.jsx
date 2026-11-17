'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

const outcomes = [
  {
    label: 'Revenue Growth',
    caption: 'From conversations to commercial growth',
    headline: 'Turn more customer interactions into growth.',
    text:
      'Strengthen acquisition, conversion and retention by improving how your business attracts, serves and understands customers.',
    images: ['/home/visuals/maas-service.png'],
    links: [
      ['Reach and support more customers across every channel', '/solutions/customer-experience-solutions/omnichannel-engagement'],
      ['Turn customer interactions into stronger loyalty', '/solutions/customer-experience-solutions'],
      ['Use customer insights to uncover growth opportunities', '/solutions/customer-experience-solutions/contact-centre-quality-analytics'],
    ],
  },
  {
    label: 'Operational Efficiency',
    caption: 'Less friction. Better performance.',
    headline: 'Make your operations work smarter.',
    text:
      'Remove bottlenecks, simplify repetitive work and improve operational performance across your business.',
    images: ['/home/visuals/bpo-service.png'],
    links: [
      ['Move repetitive processes into reliable managed operations', '/solutions/business-process-outsourcing'],
      ['Automate high-volume workflows with confidence', '/solutions/ai-technology-solutions/software-development'],
      ['Redesign operations for speed, quality and scale', '/professional-services'],
    ],
  },
  {
    label: 'Customer Experience',
    caption: 'Every interaction shapes the relationship.',
    headline: 'Create experiences customers remember.',
    text:
      'Deliver faster, more consistent and more human customer experiences across every touchpoint.',
    images: ['/home/visuals/hero-1.png'],
    links: [
      ['Deliver responsive customer support across every channel', '/solutions/customer-experience-solutions/customer-support-services'],
      ['Improve service quality through continuous assurance', '/solutions/customer-experience-solutions/contact-centre-quality-analytics'],
      ['Discover opportunities hidden within the customer journey', '/solutions/customer-experience-solutions'],
    ],
  },
  {
    label: 'AI & Automation',
    caption: 'AI applied where it creates real value.',
    headline: 'Move from AI curiosity to measurable impact.',
    text:
      'Identify practical AI opportunities that improve service delivery, operations and decision making.',
    images: ['/home/visuals/ai-globe.png'],
    links: [
      ['Equip teams with intelligent AI assistance', '/solutions/ai-technology-solutions/conversational-ai-chatbots'],
      ['Automate repetitive customer and operational workflows', '/solutions/ai-technology-solutions/software-development'],
      ['Discover where AI delivers the greatest business value', '/solutions/ai-technology-solutions'],
    ],
  },
  {
    label: 'Workforce Excellence',
    caption: 'The right people. Ready when needed.',
    headline: 'Build a workforce ready for growth.',
    text:
      'Source, deploy and manage talent that helps your business remain agile and scalable.',
    images: ['/home/workforce.jpeg'],
    links: [
      ['Access verified professionals faster', '/solutions/ai-technology-solutions/staff-augmentation'],
      ['Deploy flexible teams that scale with demand', '/solutions/assessment-certification-services/skills-assessments'],
      ['Strengthen workforce capability and performance', '/solutions/enterprise-platforms/recruitment-management-system'],
    ],
  },
  {
    label: 'Decision Intelligence',
    caption: 'Know more. Decide faster.',
    headline: 'Turn operational information into confident decisions.',
    text:
      'Bring together customer, workforce and operational insights to help leaders act sooner.',
    images: ['/home/omni-em.jpeg'],
    links: [
      ['Visualise operational performance in real time', '/solutions/enterprise-platforms/qa-toolbox'],
      ['Identify trends before they become problems', '/solutions/customer-experience-solutions/contact-centre-quality-analytics'],
      ['Turn business data into executive insight', '/solutions/enterprise-platforms'],
    ],
  },
]

function Headline({ text }) {
  return (
    <h3>
      {text.split(/(growth)/i).map((part, index) =>
        part.toLowerCase() === 'growth' ? (
          <span className="opportunity-scene__growth" key={index}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </h3>
  )
}

export default function OpportunityStory() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const root = sectionRef.current
    if (!root) return undefined

    const scenes = Array.from(root.querySelectorAll('[data-opportunity-scene]'))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      scenes.forEach((scene) => scene.classList.add('is-in'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-in', entry.isIntersecting)
        })
      },
      { threshold: 0.42, rootMargin: '0px 0px -8% 0px' },
    )

    scenes.forEach((scene) => observer.observe(scene))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="opportunity-story" ref={sectionRef}>
      <div className="site-container opportunity-story__inner">
        <div className="opportunity-story__head">
          <div className="reference-section__head">
            <p className="reference-section__eyebrow">
              <span aria-hidden="true" />
              Where we create the greatest impact
            </p>
            <h2>What opportunity are you trying to unlock?</h2>
          </div>
        </div>
      </div>

      <div className="opportunity-story__scenes">
        {outcomes.map((outcome, index) => (
          <article
            className={`opportunity-scene${outcome.images.length > 1 ? ' opportunity-scene--pair' : ''}`}
            data-opportunity-scene=""
            data-reverse={index % 2 ? 'true' : 'false'}
            key={outcome.label}
          >
            <div className="opportunity-scene__pin">
              <div className="opportunity-scene__stage">
                <div className="opportunity-scene__media-slot" aria-hidden="true" />
                <figure className={`opportunity-scene__media${outcome.images.length > 1 ? ' opportunity-scene__media--pair' : ''}`}>
                  {outcome.images.map((src) => (
                    <img src={src} alt="" key={src} />
                  ))}
                  <figcaption>{outcome.caption}</figcaption>
                </figure>
                <div className="opportunity-scene__copy">
                  <p className="opportunity-scene__index">
                    {String(index + 1).padStart(2, '0')} / {String(outcomes.length).padStart(2, '0')}
                  </p>
                  <p className="opportunity-scene__label">{outcome.label}</p>
                  <Headline text={outcome.headline} />
                  <p className="opportunity-scene__text">{outcome.text}</p>
                  <nav className="opportunity-scene__links" aria-label={`${outcome.label} related outcomes`}>
                    {outcome.links.map(([label, href]) => (
                      <Link href={href} key={label}>
                        <span>{label}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
