'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const outcomes = [
  {
    label: 'Revenue Growth',
    caption: 'From conversations to commercial growth',
    headline: 'Turn more customer interactions into growth.',
    text:
      'Strengthen acquisition, conversion and retention by improving how your business attracts, serves and understands customers.',
    image: '/home/industries/digital.jpg',
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
    image: '/home/contact-center.jpg',
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
    image: '/landing_pages/customer-experience.jpg',
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
    image: '/landing_pages/ai-operations.jpg',
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
    image: '/home/associates.jpg',
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
    image: '/home/omni-em.png',
    links: [
      ['Visualise operational performance in real time', '/solutions/enterprise-platforms/qa-toolbox'],
      ['Identify trends before they become problems', '/solutions/customer-experience-solutions/contact-centre-quality-analytics'],
      ['Turn business data into executive insight', '/solutions/enterprise-platforms'],
    ],
  },
]

export default function OpportunityStory() {
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function scrollToOutcome(index) {
    const track = trackRef.current
    const panel = track?.children[index]
    if (!track || !panel) return

    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    setActiveIndex(index)
  }

  function step(direction) {
    const nextIndex = Math.min(Math.max(activeIndex + direction, 0), outcomes.length - 1)
    scrollToOutcome(nextIndex)
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    function updateActivePanel() {
      const panels = Array.from(track.children)
      const trackCenter = track.scrollLeft + track.clientWidth / 2
      const nearestIndex = panels.reduce((nearest, panel, index) => {
        const panelCenter = panel.offsetLeft + panel.clientWidth / 2
        const distance = Math.abs(panelCenter - trackCenter)
        return distance < nearest.distance ? { index, distance } : nearest
      }, { index: 0, distance: Number.POSITIVE_INFINITY }).index

      setActiveIndex(nearestIndex)
    }

    updateActivePanel()
    track.addEventListener('scroll', updateActivePanel, { passive: true })
    window.addEventListener('resize', updateActivePanel)

    return () => {
      track.removeEventListener('scroll', updateActivePanel)
      window.removeEventListener('resize', updateActivePanel)
    }
  }, [])

  return (
    <section className="opportunity-story">
      <div className="site-container opportunity-story__inner">
        <div className="opportunity-story__head">
          <div className="opportunity-story__intro">
            <p>Where we create the greatest impact</p>
            <h2>What opportunity are you trying to unlock?</h2>
          </div>

          <div className="opportunity-story__controls" aria-label="Opportunity carousel controls">
            <div className="opportunity-story__markers" role="tablist" aria-label="Choose opportunity">
              {outcomes.map((outcome, index) => (
                <button
                  aria-label={`Show ${outcome.label}`}
                  aria-selected={activeIndex === index}
                  className="opportunity-story__marker"
                  data-active={activeIndex === index}
                  key={outcome.label}
                  onClick={() => scrollToOutcome(index)}
                  role="tab"
                  type="button"
                />
              ))}
            </div>
            <div className="opportunity-story__arrows">
              <button aria-label="Previous opportunity" disabled={activeIndex === 0} onClick={() => step(-1)} type="button">
                ←
              </button>
              <button aria-label="Next opportunity" disabled={activeIndex === outcomes.length - 1} onClick={() => step(1)} type="button">
                →
              </button>
            </div>
          </div>
        </div>

        <div className="opportunity-story__track" aria-label="Business outcomes" ref={trackRef}>
          {outcomes.map((outcome, outcomeIndex) => (
            <div className="opportunity-story__panel" key={outcome.label}>
              <div className={`opportunity-story__stage${outcomeIndex % 2 ? ' opportunity-story__stage--reverse' : ''}`}>
                <figure className="opportunity-story__media">
                  <img src={outcome.image} alt="" />
                  <figcaption>{outcome.caption}</figcaption>
                </figure>

                <article className="opportunity-story__content">
                  <div className="opportunity-story__step">
                    <span>{String(outcomeIndex + 1).padStart(2, '0')}</span>
                    <span>/ {String(outcomes.length).padStart(2, '0')}</span>
                  </div>
                  <p className="opportunity-story__label">{outcome.label}</p>
                  <h3>{outcome.headline}</h3>
                  <p className="opportunity-story__copy">{outcome.text}</p>
                  <nav className="opportunity-story__links" aria-label={`${outcome.label} related outcomes`}>
                    {outcome.links.map(([label, href], index) => (
                      <Link href={href} key={label} style={{ '--link-index': index }}>
                        <span>{label}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </nav>
                </article>
              </div>
            </div>
          ))}
        </div>

        <div className="opportunity-story__mobile-list" aria-label="Business outcomes">
          {outcomes.map((outcome, outcomeIndex) => (
            <article className="opportunity-story__mobile-item" key={outcome.label}>
              <figure>
                <img src={outcome.image} alt="" />
                <figcaption>{outcome.caption}</figcaption>
              </figure>
              <div className="opportunity-story__step">
                <span>{String(outcomeIndex + 1).padStart(2, '0')}</span>
                <span>/ {String(outcomes.length).padStart(2, '0')}</span>
              </div>
              <p className="opportunity-story__label">{outcome.label}</p>
              <h3>{outcome.headline}</h3>
              <p>{outcome.text}</p>
              <nav aria-label={`${outcome.label} related outcomes`}>
                {outcome.links.map(([label, href]) => (
                  <Link href={href} key={label}>
                    <span>{label}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </nav>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
