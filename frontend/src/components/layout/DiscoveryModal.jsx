'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import {
  companySizeOptions,
  departmentOptions,
  followUpOptions,
  industryOptions,
  preferredTimeOptions,
  solutionFamilies,
  timelineOptions,
} from '@/features/lead-scout/data/leadScoutAssessment'
import { submitContact } from '@/lib/api/client'

const emptyContact = {
  name: '',
  email: '',
  company: '',
  phone: '',
  website: '',
}

const emptyAnswers = {
  family: '',
  service: '',
  problem: '',
  department: '',
  industry: '',
  companySize: '',
  country: '',
  timeline: '',
  followUp: '',
  preferredTime: '',
  notes: '',
}

function CloseIcon() {
  return (
    <span className="advisor-modal__x" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

function AdvisorHeader({ title, subtitle, titleId, onClose }) {
  return (
    <header className="advisor-modal__header">
      <div className="advisor-modal__brand" aria-label="OmniContact">
        <Image src="/logo.png" alt="OmniContact" width={170} height={66} priority />
      </div>
      <div className="advisor-modal__identity">
        <span>
          <strong id={titleId}>{title}</strong>
          <small>{subtitle}</small>
        </span>
      </div>
      <button type="button" className="advisor-modal__close" onClick={onClose} aria-label="Close Solution Fit modal">
        <CloseIcon />
      </button>
    </header>
  )
}

function AdvisorStepper({ label, current, total, estimate }) {
  return (
    <div className="advisor-modal__stepper" aria-label={label}>
      <strong>{label}</strong>
      <div className="advisor-modal__steps">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={index + 1 <= current ? 'is-active' : ''}>{index + 1}</span>
        ))}
      </div>
      <small>{estimate}</small>
    </div>
  )
}

export default function DiscoveryModal({ open, onClose, initialContact = {} }) {
  const [step, setStep] = useState(0)
  const [contact, setContact] = useState({ ...emptyContact, ...initialContact })
  const [answers, setAnswers] = useState(emptyAnswers)
  const [status, setStatus] = useState({ submitting: false, error: '', success: '' })

  const selectedFamily = useMemo(
    () => solutionFamilies.find((family) => family.value === answers.family),
    [answers.family],
  )
  const progress = Math.round(((step + 1) / 6) * 100)

  useEffect(() => {
    if (!open) return undefined

    setContact((current) => ({ ...current, ...initialContact }))

    function handleEscape(event) {
      if (event.key === 'Escape') onClose()
    }

    document.body.classList.add('modal-open')
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose, initialContact])

  if (!open) return null

  function updateAnswer(field, value) {
    setStatus({ submitting: false, error: '', success: '' })
    setAnswers((current) => {
      const next = { ...current, [field]: value }
      if (field === 'family') {
        next.service = ''
        next.problem = ''
      }
      return next
    })
  }

  function updateContact(field, value) {
    setStatus({ submitting: false, error: '', success: '' })
    setContact((current) => ({ ...current, [field]: value }))
  }

  function canContinue() {
    if (step === 0) return !!answers.family
    if (step === 1) return !!answers.service
    if (step === 2) return !!answers.problem && !!answers.department
    if (step === 3) return !!answers.industry && !!answers.companySize && !!answers.country && !!answers.timeline
    if (step === 4) return !!contact.name && !!contact.email && !!contact.company
    if (step === 5) return !!answers.followUp && !!answers.preferredTime
    return false
  }

  function next() {
    if (step < 5) setStep((current) => current + 1)
  }

  function back() {
    if (step > 0) setStep((current) => current - 1)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canContinue()) return
    setStatus({ submitting: true, error: '', success: '' })

    const message = [
      'Solution Fit qualification submission.',
      '',
      `Primary Service Family: ${selectedFamily?.label || answers.family}`,
      `Specific Service: ${answers.service}`,
      `Problem: ${answers.problem}`,
      `Department: ${answers.department}`,
      `Industry: ${answers.industry}`,
      `Company Size: ${answers.companySize}`,
      `Country: ${answers.country}`,
      `Timeline: ${answers.timeline}`,
      `Preferred Follow-Up: ${answers.followUp}`,
      `Preferred Time: ${answers.preferredTime}`,
      `Phone: ${contact.phone || 'Not provided'}`,
      `Website: ${contact.website || 'Not provided'}`,
      '',
      `Additional Notes: ${answers.notes || 'None'}`,
    ].join('\n')

    try {
      await submitContact({
        name: contact.name,
        email: contact.email,
        company: contact.company,
        region: 'zw',
        source: 'Solution Fit qualification',
        message,
      })
      setStatus({
        submitting: false,
        success: 'Thank you. Your Solution Fit request has been sent.',
        error: '',
      })
      setAnswers(emptyAnswers)
      setContact(emptyContact)
      setStep(0)
    } catch (error) {
      setStatus({
        submitting: false,
        error: error?.error?.message || error?.message || 'Submission failed. Please try again.',
        success: '',
      })
    }
  }

  return (
    <div className="discovery-modal" role="dialog" aria-modal="true" aria-labelledby="discovery-modal-title">
      <button className="discovery-modal__backdrop" type="button" aria-label="Close Solution Fit modal" onClick={onClose} />
      <form className="discovery-modal__panel advisor-modal" onSubmit={handleSubmit}>
        <AdvisorHeader
          title="Solutions Advisor"
          subtitle="I’ll ask a few questions to understand your business and recommend the right solution."
          titleId="discovery-modal-title"
          onClose={onClose}
        />
        <AdvisorStepper
          label={`Question ${step + 1} of 6`}
          current={step + 1}
          total={6}
          estimate="About 3 minutes remaining"
        />
        <div className="lead-scout__progress"><span style={{ width: `${progress}%` }} /></div>

        <div className="discovery-modal__body">
          {step === 0 ? (
            <section className="discovery-modal__step">
              <div className="advisor-modal__intro">
                <span className="advisor-modal__intro-icon" aria-hidden="true">1</span>
                <div>
                  <p className="lead-scout__eyebrow">Help us recommend the best solution</p>
                  <span>This helps us understand the type of support you need.</span>
                </div>
              </div>
              <h3>What type of support are you looking for?</h3>
              <div className="lead-scout__option-list lead-scout__option-list--cards">
                {solutionFamilies.map((family) => (
                  <button key={family.value} type="button" className={`lead-scout__option${answers.family === family.value ? ' is-selected' : ''}`} onClick={() => updateAnswer('family', family.value)}>
                    <span className="lead-scout__option-icon" aria-hidden="true">{family.label.charAt(0)}</span>
                    <span>
                      <strong>{family.label}</strong>
                      <small>{family.services.slice(0, 2).join(' / ')}</small>
                    </span>
                    <span>{answers.family === family.value ? 'Selected' : '+'}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 1 && selectedFamily ? (
            <section className="discovery-modal__step">
              <div className="advisor-modal__intro">
                <span className="advisor-modal__intro-icon" aria-hidden="true">2</span>
                <div>
                  <p className="lead-scout__eyebrow">Narrow the service area</p>
                  <span>This points the enquiry to the most relevant delivery team.</span>
                </div>
              </div>
              <h3>Which specific area best matches your need?</h3>
              <div className="lead-scout__option-list lead-scout__option-list--cards">
                {selectedFamily.services.map((service) => (
                  <button key={service} type="button" className={`lead-scout__option${answers.service === service ? ' is-selected' : ''}`} onClick={() => updateAnswer('service', service)}>
                    <span className="lead-scout__option-icon" aria-hidden="true">{service.charAt(0)}</span>
                    <span><strong>{service}</strong></span>
                    <span>{answers.service === service ? 'Selected' : '+'}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 2 && selectedFamily ? (
            <section className="discovery-modal__step">
              <div className="advisor-modal__intro">
                <span className="advisor-modal__intro-icon" aria-hidden="true">3</span>
                <div>
                  <p className="lead-scout__eyebrow">Understand the challenge</p>
                  <span>This helps qualify the business problem behind the enquiry.</span>
                </div>
              </div>
              <h3>What problem are you trying to solve?</h3>
              <div className="lead-scout__option-list lead-scout__option-list--cards">
                {selectedFamily.problems.map((problem) => (
                  <button key={problem} type="button" className={`lead-scout__option${answers.problem === problem ? ' is-selected' : ''}`} onClick={() => updateAnswer('problem', problem)}>
                    <span className="lead-scout__option-icon" aria-hidden="true">{problem.charAt(0)}</span>
                    <span><strong>{problem}</strong></span>
                    <span>{answers.problem === problem ? 'Selected' : '+'}</span>
                  </button>
                ))}
              </div>
              <label className="lead-scout__field">
                <span>Which department owns this need?</span>
                <select value={answers.department} onChange={(event) => updateAnswer('department', event.target.value)} required>
                  <option value="">Select department</option>
                  {departmentOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="discovery-modal__step discovery-modal__grid">
              <div className="advisor-modal__intro discovery-modal__wide">
                <span className="advisor-modal__intro-icon" aria-hidden="true">4</span>
                <div>
                  <p className="lead-scout__eyebrow">Organisation context</p>
                  <span>This helps us match scale, industry, and urgency.</span>
                </div>
              </div>
              <h3>Tell us about the organisation.</h3>
              <label className="lead-scout__field">
                <span>Industry</span>
                <select value={answers.industry} onChange={(event) => updateAnswer('industry', event.target.value)} required>
                  <option value="">Select industry</option>
                  {industryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="lead-scout__field">
                <span>Company size</span>
                <select value={answers.companySize} onChange={(event) => updateAnswer('companySize', event.target.value)} required>
                  <option value="">Select company size</option>
                  {companySizeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="lead-scout__field">
                <span>Country</span>
                <input value={answers.country} onChange={(event) => updateAnswer('country', event.target.value)} placeholder="e.g. Zimbabwe" required />
              </label>
              <label className="lead-scout__field">
                <span>How urgent is this?</span>
                <select value={answers.timeline} onChange={(event) => updateAnswer('timeline', event.target.value)} required>
                  <option value="">Select timeline</option>
                  {timelineOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="discovery-modal__step discovery-modal__grid">
              <div className="advisor-modal__intro discovery-modal__wide">
                <span className="advisor-modal__intro-icon" aria-hidden="true">5</span>
                <div>
                  <p className="lead-scout__eyebrow">Contact details</p>
                  <span>We’ll use this only to respond to your enquiry.</span>
                </div>
              </div>
              <h3>Your contact details</h3>
              <label className="lead-scout__field"><span>Name</span><input value={contact.name} onChange={(event) => updateContact('name', event.target.value)} required /></label>
              <label className="lead-scout__field"><span>Business email</span><input type="email" value={contact.email} onChange={(event) => updateContact('email', event.target.value)} required /></label>
              <label className="lead-scout__field"><span>Company</span><input value={contact.company} onChange={(event) => updateContact('company', event.target.value)} required /></label>
              <label className="lead-scout__field"><span>Phone</span><input value={contact.phone} onChange={(event) => updateContact('phone', event.target.value)} /></label>
              <label className="lead-scout__field discovery-modal__wide"><span>Website</span><input value={contact.website} onChange={(event) => updateContact('website', event.target.value)} placeholder="Optional" /></label>
            </section>
          ) : null}

          {step === 5 ? (
            <section className="discovery-modal__step discovery-modal__grid">
              <div className="advisor-modal__intro discovery-modal__wide">
                <span className="advisor-modal__intro-icon" aria-hidden="true">6</span>
                <div>
                  <p className="lead-scout__eyebrow">Preferred follow-up</p>
                  <span>Choose how the OmniContact team should continue the conversation.</span>
                </div>
              </div>
              <h3>How would you like us to follow up?</h3>
              <label className="lead-scout__field">
                <span>Preferred communication</span>
                <select value={answers.followUp} onChange={(event) => updateAnswer('followUp', event.target.value)} required>
                  <option value="">Select option</option>
                  {followUpOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="lead-scout__field">
                <span>Preferred time</span>
                <select value={answers.preferredTime} onChange={(event) => updateAnswer('preferredTime', event.target.value)} required>
                  <option value="">Select option</option>
                  {preferredTimeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="lead-scout__field discovery-modal__wide">
                <span>Additional notes</span>
                <textarea value={answers.notes} onChange={(event) => updateAnswer('notes', event.target.value)} rows="4" placeholder="Optional context for the OmniContact team" />
              </label>
              <p className="consent discovery-modal__wide">
                By submitting this form, you consent to OmniContact processing your personal data solely to respond to your inquiry. You may withdraw consent at any time.
              </p>
            </section>
          ) : null}

          {status.error ? <div className="form-status form-status--error">{status.error}</div> : null}
          {status.success ? <div className="form-status form-status--success">{status.success}</div> : null}
        </div>

        <footer className="lead-scout__footer">
          <button type="button" className="lead-scout__secondary" onClick={step === 0 ? onClose : back}>
            {step === 0 ? 'Close' : 'Back'}
          </button>
          {step < 5 ? (
            <button type="button" className="lead-scout__primary" onClick={next} disabled={!canContinue()}>Next</button>
          ) : (
            <button type="submit" className="lead-scout__primary" disabled={!canContinue() || status.submitting}>
              {status.submitting ? 'Submitting...' : 'Submit Solution Fit'}
            </button>
          )}
        </footer>
      </form>
    </div>
  )
}
