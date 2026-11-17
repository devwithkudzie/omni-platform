'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const AUTOPLAY_MS = 6000

export const testimonials = [
  {
    quote:
      'OmniContact BPO Services has supplied Edgars Stores with a USSD platform. During this time, their technical and operational support has been consistent, professional, and timeous and above all, they met our expectations.',
    title: 'Database Administrator (IT) | ICT Project Manager',
    company: 'Edgars',
  },
  {
    quote:
      'We used OmniContact to provide Helpdesk and Contact Centre services and I am extremely pleased with the quality of service they were able to provide. OmniContact BPO Services has proven to be professional, consistent, and dedicated to providing us with solutions that meet and exceed our expectations.',
    title: 'Head Customer Engagement',
    company: 'Econet Wireless (PVT) LTD',
  },
  {
    quote:
      'Our organization utilized OmniContact for both Inbound and Outbound Contact Centre services, and I must say that we were thoroughly impressed with the level of service they delivered. OmniContact BPO Services has consistently demonstrated professionalism, reliability, and a strong commitment to providing us with solutions that not only meet but exceed our expectations. Their dedication to excellence has truly set them apart in the industry.',
    title: 'Head Marketing and CX',
    company: 'Gain Cash n Carry',
  },
  {
    quote:
      'OmniContact BPO Services has supplied Steward Bank with a Call Center system for over five years. During this time, their technical and operational support has been consistent, professional, timeous and above all, they met our expectations.',
    title: 'Head: Customer Experience',
    company: 'Steward Bank',
  },
  {
    quote:
      'We have worked on several campaigns with Omni since 2020 and they have never failed us, as they have always been able to deliver, making them a reliable partner to work with. The company brought along splendid work ethic & strategies that involved targeting the right clientele through the use of well-trained telesales agents for product pitching. It is through the use of their BPO services that we have been able to transform our business model and grow our sales and profits.',
    title: 'President',
    company: 'Abstract Marketing Group Inc',
  },
  {
    quote:
      'We are a UK based company and we roped in OmniContact to assist us with the outbound calls part of our business and within 3 months of working with them our contracted agents with OmniContact grew by over 300% and at the same time we enjoyed favourable business conversions. They have beyond doubt demonstrated their ability to quickly scale up whenever we needed them to.',
    title: 'Director',
    company: 'Mortgagesmiths',
  },
  {
    quote:
      'Throughout our collaborations, OmniContact demonstrated a high level of professionalism, efficiency, and commitment to quality. Their team consistently met agreed-upon timelines and maintained excellent communication throughout the project. The data collected through their outbound call services was accurate, well-organized, and delivered in a timely manner, enabling us to make informed business decisions.',
    title: 'Research Executive',
    company: 'Topline Research Solutions',
  },
  {
    quote:
      'In our experience with them, they are quite agile, the agents perform to their best ability with an excellent productivity standard. The centre Management is well coordinated which results in less hiccups in operations, making our business sustainable. We have worked with them on two campaigns and we are in the process of working on other campaigns with them.',
    title: 'Director of Communications',
    company: 'TGG',
  },
  {
    quote:
      'Our experience with OmniContact has been nothing short of remarkable. The exam venue is outstanding, well-maintained, air-conditioned, and equipped with high-speed Wi-Fi. This has significantly contributed to a conducive exam environment for our candidates. They have gone above and beyond, particularly in assisting with SHE officers during health issues faced by students.',
    title: 'Education Manager',
    company: 'Institute of Chartered Accountants of Zimbabwe (ICAZ)',
    short: 'ICAZ',
  },
]

function monogram(label) {
  const words = label.replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words[1][0] : label.slice(0, 2)
  return letters.toUpperCase()
}

function TestimonialCard({ testimonial, index, onOpen }) {
  const label = testimonial.short ?? testimonial.company

  return (
    <button type="button" className="voice-card" onClick={() => onOpen(index)}>
      <span className="voice-card__mark" aria-hidden="true">
        “
      </span>
      <blockquote>
        <p>{testimonial.quote}</p>
      </blockquote>
      <figcaption>
        <span className="voice-card__avatar" aria-hidden="true">
          {monogram(label)}
        </span>
        <span className="voice-card__who">
          <span className="voice-card__name">{label}</span>
          <span className="voice-card__role">{testimonial.title}</span>
        </span>
      </figcaption>
    </button>
  )
}

function TestimonialModal({ testimonial, position, onClose, onNext, onPrev }) {
  useEffect(() => {
    function handleKeydown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onNext()
      if (event.key === 'ArrowLeft') onPrev()
    }

    document.body.classList.add('modal-open')
    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [onClose, onNext, onPrev])

  return (
    <div className="discovery-modal" role="dialog" aria-modal="true" aria-labelledby="testimonial-modal-name">
      <button className="discovery-modal__backdrop" type="button" aria-label="Close testimonial" onClick={onClose} />

      <button type="button" className="testimonial-modal__nav testimonial-modal__nav--prev" onClick={onPrev} aria-label="Previous testimonial">
        <span aria-hidden="true">‹</span>
      </button>

      <div className="testimonial-modal__panel">
        <button type="button" className="testimonial-modal__close" onClick={onClose} aria-label="Close testimonial">
          ×
        </button>
        <span className="testimonial-modal__mark" aria-hidden="true">
          “
        </span>
        <blockquote>
          <p>{testimonial.quote}</p>
        </blockquote>
        <figcaption>
          <span className="testimonial-modal__name" id="testimonial-modal-name">
            {testimonial.company}
          </span>
          <span className="testimonial-modal__role">{testimonial.title}</span>
        </figcaption>
        <p className="testimonial-modal__count">{position}</p>
      </div>

      <button type="button" className="testimonial-modal__nav testimonial-modal__nav--next" onClick={onNext} aria-label="Next testimonial">
        <span aria-hidden="true">›</span>
      </button>
    </div>
  )
}

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(null)
  const trackRef = useRef(null)
  const hoverRef = useRef(false)
  const focusRef = useRef(false)

  const scrollStep = useCallback((direction) => {
    const track = trackRef.current
    if (!track) return

    const cards = track.children
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth
    const atStart = track.scrollLeft <= 4
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4

    if (direction > 0 && atEnd) track.scrollTo({ left: 0, behavior: 'smooth' })
    else if (direction < 0 && atStart) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' })
    else track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (activeIndex !== null) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const timer = setInterval(() => {
      if (!hoverRef.current && !focusRef.current) scrollStep(1)
    }, AUTOPLAY_MS)

    return () => clearInterval(timer)
  }, [activeIndex, scrollStep])

  function goNext() {
    setActiveIndex((current) => (current + 1) % testimonials.length)
  }

  function goPrev() {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="hx-section hx-section--soft reference-section--testimonials">
      <div className="site-container">
        <div className="hx-testimonial-head">
          <p className="hx-eyebrow">Client Experience</p>
          <h2>Trusted by Leading Organisations</h2>
        </div>
      </div>

      <div
        className="voice-carousel"
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
        onTouchStart={() => (hoverRef.current = true)}
        onTouchEnd={() => (hoverRef.current = false)}
        onFocus={(event) => {
          if (event.target.matches(':focus-visible')) focusRef.current = true
        }}
        onBlur={() => (focusRef.current = false)}
      >
        <div className="voice-track" ref={trackRef} id="voice-track">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard testimonial={testimonial} index={index} onOpen={setActiveIndex} key={testimonial.company} />
          ))}
        </div>

        <div className="site-container voice-controls">
          <button type="button" className="voice-controls__btn" onClick={() => scrollStep(-1)} aria-label="Previous testimonials" aria-controls="voice-track">
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" className="voice-controls__btn" onClick={() => scrollStep(1)} aria-label="Next testimonials" aria-controls="voice-track">
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      {activeIndex !== null ? (
        <TestimonialModal
          testimonial={testimonials[activeIndex]}
          position={`${activeIndex + 1} / ${testimonials.length}`}
          onClose={() => setActiveIndex(null)}
          onNext={goNext}
          onPrev={goPrev}
        />
      ) : null}
    </section>
  )
}
