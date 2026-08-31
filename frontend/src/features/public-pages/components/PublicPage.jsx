'use client'

import { useState } from 'react'
import { submitContact } from '@/lib/api/client'

function getLandingImage(page) {
  const key = `${page.eyebrow} ${page.title}`.toLowerCase()

  if (key.includes('industry')) return '/home/industries/banking.jpg'
  if (key.includes('ai') || key.includes('digital')) return '/landing_pages/ai-operations.jpg'
  if (key.includes('bpo') || key.includes('outsourcing')) return '/home/associates.jpg'
  if (key.includes('assessment') || key.includes('test')) return '/home/test-center.jpg'
  if (key.includes('impact') || key.includes('community')) return '/about/community.jpg'
  if (key.includes('recruitment') || key.includes('professional')) return '/home/professional.gif'
  if (key.includes('asset') || key.includes('platform')) return '/home/omni-em.png'
  if (key.includes('contact') || key.includes('discovery')) return '/home/contact-center.jpg'

  return '/home/contact-center.jpg'
}

function ContactForm({ type = 'contact' }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [status, setStatus] = useState({ submitting: false, error: '', success: '' })

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ submitting: true, error: '', success: '' })

    try {
      await submitContact({
        ...form,
        region: 'zw',
        source: type === 'discovery' ? 'Discovery page' : 'Contact page',
      })
      setForm({ name: '', email: '', company: '', message: '' })
      setStatus({
        submitting: false,
        success: 'Thank you! Your message has been sent.',
        error: '',
      })
    } catch (error) {
      setStatus({
        submitting: false,
        error: error?.error?.message || error?.message || 'Submission failed. Please try again.',
        success: '',
      })
    }
  }

  return (
    <form className="public-form contact-form" onSubmit={handleSubmit}>
      <label>
        <span>Full Name:</span>
        <input name="name" placeholder="Enter full name" value={form.name} onChange={handleChange} required disabled={status.submitting} />
      </label>
      <label>
        <span>Email Address:</span>
        <input type="email" name="email" placeholder="Enter email address" value={form.email} onChange={handleChange} required disabled={status.submitting} />
      </label>
      <label>
        <span>Company:</span>
        <input name="company" placeholder="Enter company name" value={form.company} onChange={handleChange} disabled={status.submitting} />
      </label>
      <label className="public-form__wide">
        <span>Message:</span>
        <textarea name="message" rows="4" placeholder="Enter message" value={form.message} onChange={handleChange} required disabled={status.submitting} />
      </label>
      <p className="public-form__wide consent">
        By submitting this form, you consent to OmniContact processing your personal data solely to respond to your inquiry. You may withdraw consent at any time.
      </p>
      {status.error ? <div className="public-form__wide form-status form-status--error">{status.error}</div> : null}
      {status.success ? <div className="public-form__wide form-status form-status--success">{status.success}</div> : null}
      <button className="btn-prim" type="submit" disabled={status.submitting}>
        {status.submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}

function PolicySections({ page }) {
  return (
    <section className="page-section page-section--policy">
      <article className="site-container privacy-policy" aria-labelledby="privacy-policy-heading">
        <header className="privacy-policy__header">
          <p className="section-kicker">Effective date: {page.effectiveDate}</p>
          <h2 id="privacy-policy-heading">{page.title}</h2>
          <p>{page.intro}</p>
        </header>

        <div className="privacy-policy__sections">
          {page.policySections.map((section) => (
            <section className="privacy-policy__section" key={section.title}>
              <h3>{section.title}</h3>
              {section.body?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list?.length ? (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </section>
  )
}

export default function PublicPage({ page }) {
  const image = page.image || getLandingImage(page)
  const hasPolicySections = Boolean(page.policySections?.length)

  function openBookingSession() {
    window.dispatchEvent(new CustomEvent('omni:open-assessment', {
      detail: {
        step: 'meeting',
        context: {
          category: 'OmniContact',
          title: 'Discovery Session',
          objective: 'Map the right OmniContact solution',
        },
      },
    }))
  }

  return (
    <>
      <section className="page-hero" style={{ '--page-hero-image': `url("${image}")` }}>
        <div className="site-container">
          <p className="page-hero__eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
      </section>

      {hasPolicySections ? (
        <PolicySections page={page} />
      ) : (
        <section className="page-intro">
          <div className="site-container page-intro__grid">
            <div>
              <h2>{page.title}</h2>
              <p>{page.intro}</p>
            </div>
            <div className="page-intro__media">
              <figure className="page-image-panel">
                <img src={image} alt="" />
              </figure>
              {page.bullets?.length ? (
                <ul className="page-bullets">
                  {page.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {page.form ? (
        <section className="page-section">
          <div className="site-container">
            <ContactForm type={page.form} />
          </div>
        </section>
      ) : null}

      {!hasPolicySections && page.sections?.length ? (
        <section className="page-section page-section--soft">
          <div className="site-container page-feature-grid">
            <figure className="page-image-panel page-image-panel--tall">
              <img src={image} alt="" />
            </figure>
            <div className="page-card-grid">
              {page.sections.map((section) => (
                <article className="page-card" key={section.title}>
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!hasPolicySections ? (
        <section className="page-cta">
          <div className="site-container page-cta__inner">
            <div>
              <p className="section-kicker">Next step</p>
              <h2>Let’s map the right OmniContact solution for your team.</h2>
            </div>
            <button className="btn-omni" type="button" onClick={openBookingSession}>Book discovery</button>
          </div>
        </section>
      ) : null}
    </>
  )
}
