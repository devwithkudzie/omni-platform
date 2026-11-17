'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { submitAssessment } from '@/lib/api/client'
import {
  buildHealthCheckPayload,
  calculateMarketingHealth,
  needsImprovementCta,
  normalizeHealthResult,
  pillars,
  questions,
  trackMarketingHealth,
} from '@/features/maas-health-check/data/marketingHealthCheck'

const emptyLead = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  challenge: '',
  marketingConsent: false,
}

function fullName(lead) {
  return [lead.firstName, lead.lastName].map((part) => (part || '').trim()).filter(Boolean).join(' ')
}

const RESULTS_STORAGE_KEY = 'omni.maas.healthCheck.results'

function CloseIcon() {
  return <span className="mh-check__x" aria-hidden="true">×</span>
}

function readStoredResults() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(RESULTS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeResults(payload) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage quota / private-mode failures.
  }
}

export default function MarketingHealthCheckModal({ open, onClose = () => {}, onBookConsultation }) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState('questions')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [lead, setLead] = useState(emptyLead)
  const [result, setResult] = useState(null)
  const [delivery, setDelivery] = useState('idle')
  const [status, setStatus] = useState({ submitting: false, error: '' })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return undefined

    const stored = readStoredResults()
    if (stored?.result) {
      setStep('results')
      setResult(normalizeHealthResult(stored.result))
      setLead({ ...emptyLead, ...(stored.lead || {}) })
      setDelivery(stored.delivery || 'idle')
      setAnswers(stored.answers || {})
      setQuestionIndex(0)
      setStatus({ submitting: false, error: '' })
    } else {
      setStep('questions')
      setQuestionIndex(0)
      setAnswers({})
      setLead(emptyLead)
      setResult(null)
      setDelivery('idle')
      setStatus({ submitting: false, error: '' })
      trackMarketingHealth('marketing_health_start')
    }

    function handleEscape(event) {
      if (event.key === 'Escape') onClose()
    }

    document.body.classList.add('modal-open')
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  const currentQuestion = questions[questionIndex]
  const currentPillar = pillars.find((pillar) => pillar.id === currentQuestion?.pillar)
  const progress = step === 'questions'
    ? Math.round(((questionIndex + 1) / questions.length) * 100)
    : 100

  const canContinue = useMemo(() => {
    if (step === 'questions') return Boolean(answers[currentQuestion?.id])
    if (step === 'lead') {
      return Boolean(lead.firstName.trim() && lead.lastName.trim() && lead.email.trim() && lead.company.trim())
    }
    return true
  }, [answers, currentQuestion, lead, step])

  const cta = needsImprovementCta(result)

  function selectAnswer(key) {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: key }))
    setStatus({ submitting: false, error: '' })
  }

  function updateLead(field, value) {
    setLead((current) => ({ ...current, [field]: value }))
    setStatus({ submitting: false, error: '' })
  }

  function apiErrorMessage(error) {
    return error?.error?.message
      || error?.message
      || 'We could not submit your health check. Please try again.'
  }

  async function submitLead() {
    if (!canContinue || status.submitting) return

    let localPreview
    try {
      localPreview = calculateMarketingHealth(answers)
    } catch (error) {
      setStatus({ submitting: false, error: error.message || 'Please answer all questions.' })
      return
    }

    setStatus({ submitting: true, error: '' })
    setDelivery('sending')

    try {
      const response = await submitAssessment(buildHealthCheckPayload({
        lead,
        scored: localPreview,
      }))

      const backendResult = normalizeHealthResult(response?.data?.health_check)
      if (!backendResult) {
        throw {
          error: {
            code: 'MISSING_HEALTH_CHECK',
            message: 'The server did not return scored health check results.',
          },
        }
      }

      const nextDelivery = response?.data?.email_sent || response?.data?.prospect_email_sent
        ? 'sent'
        : response?.data?.mail_error
          ? 'partial'
          : 'sent'

      setResult(backendResult)
      setStep('results')
      setDelivery(nextDelivery)
      setStatus({ submitting: false, error: '' })
      storeResults({
        result: backendResult,
        lead,
        answers,
        delivery: nextDelivery,
        savedAt: new Date().toISOString(),
      })
      trackMarketingHealth('marketing_health_complete', {
        score: backendResult.overallScore,
        status: backendResult.healthStatusKey,
      })
      trackMarketingHealth('marketing_health_lead_submit', {
        score: backendResult.overallScore,
        category: backendResult.category,
      })
    } catch (error) {
      setDelivery('failed')
      setStatus({
        submitting: false,
        error: apiErrorMessage(error),
      })
      trackMarketingHealth('marketing_health_delivery_failed')
    }
  }

  function next() {
    if (!canContinue || status.submitting) return
    if (step === 'questions') {
      if (questionIndex < questions.length - 1) {
        setQuestionIndex((current) => current + 1)
        return
      }
      trackMarketingHealth('marketing_health_questions_done')
      setStep('lead')
      return
    }
    if (step === 'lead') submitLead()
  }

  function back() {
    if (status.submitting) return
    if (step === 'lead') {
      setQuestionIndex(questions.length - 1)
      setStep('questions')
      return
    }
    if (step === 'questions' && questionIndex > 0) {
      setQuestionIndex((current) => current - 1)
    }
  }

  function bookConsultation() {
    trackMarketingHealth('marketing_health_consultation_click', {
      score: result?.overallScore,
    })
    onClose()
    if (onBookConsultation) {
      onBookConsultation({
        name: fullName(lead),
        email: lead.email,
        company: lead.company,
      })
      return
    }
    window.dispatchEvent(new CustomEvent('omni:open-discovery', {
      detail: { contact: { name: fullName(lead), email: lead.email, company: lead.company } },
    }))
  }

  function restart() {
    try {
      window.sessionStorage.removeItem(RESULTS_STORAGE_KEY)
    } catch {
      // Ignore storage failures.
    }
    setStep('questions')
    setQuestionIndex(0)
    setAnswers({})
    setLead(emptyLead)
    setResult(null)
    setDelivery('idle')
    setStatus({ submitting: false, error: '' })
    trackMarketingHealth('marketing_health_start')
  }

  if (!open || !mounted) return null

  const modal = (
    <div className="mh-check" role="dialog" aria-modal="true" aria-labelledby="mh-check-title">
      <button type="button" className="mh-check__backdrop" aria-label="Close health check" onClick={onClose} />
      <section className={`mh-check__panel${step === 'results' ? ' mh-check__panel--results' : ''}`}>
        <header className="mh-check__header">
          <div>
            <p className="mh-check__kicker">Digital Marketing Health Check</p>
            {step !== 'results' ? (
              <p className="mh-check__count">
                {step === 'questions' ? `Question ${questionIndex + 1} of ${questions.length}` : 'Almost done'}
              </p>
            ) : (
              <p className="mh-check__count">Your results</p>
            )}
          </div>
          <button type="button" className="mh-check__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        {step !== 'results' ? (
          <div className="mh-check__track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        ) : null}

        <div className="mh-check__body">
          {step === 'questions' ? (
            <>
              <p className="mh-check__pillar">{currentPillar?.label}</p>
              <h2 id="mh-check-title">{currentQuestion.prompt}</h2>
              <div className="mh-check__choices">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`mh-check__choice${answers[currentQuestion.id] === option.key ? ' is-selected' : ''}`}
                    onClick={() => selectAnswer(option.key)}
                  >
                    <span className="mh-check__choice-key">{option.key}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 'lead' ? (
            <>
              <h2 id="mh-check-title">Where should we send your results?</h2>
              <p className="mh-check__help">
                Enter your details to calculate your Marketing Health Score, weakest areas and recommended next steps.
              </p>
              <div className="mh-check__fields">
                <div className="mh-check__name-row">
                  <label>
                    <span>First name</span>
                    <input autoComplete="given-name" value={lead.firstName} onChange={(event) => updateLead('firstName', event.target.value)} required disabled={status.submitting} />
                  </label>
                  <label>
                    <span>Last name</span>
                    <input autoComplete="family-name" value={lead.lastName} onChange={(event) => updateLead('lastName', event.target.value)} required disabled={status.submitting} />
                  </label>
                </div>
                <label>
                  <span>Work email</span>
                  <input type="email" value={lead.email} onChange={(event) => updateLead('email', event.target.value)} required disabled={status.submitting} />
                </label>
                <label>
                  <span>Company name</span>
                  <input value={lead.company} onChange={(event) => updateLead('company', event.target.value)} required disabled={status.submitting} />
                </label>
                <label className="mh-check__wide">
                  <span>Biggest marketing challenge (optional)</span>
                  <textarea
                    rows="3"
                    value={lead.challenge}
                    onChange={(event) => updateLead('challenge', event.target.value)}
                    placeholder="e.g. inconsistent lead flow, unclear ROI, limited content capacity"
                    disabled={status.submitting}
                  />
                </label>
                <label className="mh-check__consent">
                  <input
                    type="checkbox"
                    checked={lead.marketingConsent}
                    onChange={(event) => updateLead('marketingConsent', event.target.checked)}
                    disabled={status.submitting}
                  />
                  <span>Keep me updated with marketing tips and OmniContact offers. Unticked by default.</span>
                </label>
                <p className="mh-check__privacy">
                  We’ll only use your details to send your results and respond to your enquiry.{' '}
                  <Link href="/privacy-policy">See our Privacy Policy</Link>.
                </p>
              </div>
            </>
          ) : null}

          {step === 'results' && result ? (
            <>
              <h2 id="mh-check-title">Your Digital Marketing Health Score</h2>
              {delivery === 'sending' ? <p className="mh-check__delivery">Calculating your score…</p> : null}
              {delivery === 'sent' ? <p className="mh-check__delivery mh-check__delivery--ok">We’ve emailed a copy to {lead.email}.</p> : null}
              {delivery === 'partial' ? (
                <p className="mh-check__delivery mh-check__delivery--warn">
                  Your score was calculated successfully. We couldn’t email a copy just now, so please keep this summary
                  open or take a screenshot.
                </p>
              ) : null}

              <div className="mh-check__scorecard">
                <div className="mh-check__score">
                  <strong>{result.overallScore}</strong>
                  <span>/{result.maxScore || 100}</span>
                </div>
                <div>
                  <p className={`mh-check__status mh-check__status--${result.healthStatusKey || 'needs_improvement'}`}>
                    {result.healthStatus || result.category}
                  </p>
                  <p className="mh-check__category">{result.category}</p>
                  <p className="mh-check__help">{result.explanation || result.categoryMessage}</p>
                </div>
              </div>

              <div className="mh-check__gauge" aria-hidden="true">
                <span style={{ width: `${Math.max(0, Math.min(100, result.overallScore))}%` }} />
              </div>

              <div className="mh-check__pillars">
                {result.pillarScores.map((pillar) => (
                  <article key={pillar.id}>
                    <div>
                      <h3>{pillar.label}</h3>
                      <p>{pillar.score}/100</p>
                    </div>
                    <div className="mh-check__bar" aria-hidden="true">
                      <span style={{ width: `${pillar.score}%` }} />
                    </div>
                  </article>
                ))}
              </div>

              {result.strengths?.length ? (
                <div className="mh-check__weakest">
                  <h3>Strengths</h3>
                  {result.strengths.map((pillar) => (
                    <article key={`strength-${pillar.id}`}>
                      <strong>{pillar.label}</strong>
                      <p>{pillar.score}/100 — keep building on this area.</p>
                    </article>
                  ))}
                </div>
              ) : null}

              {result.weakest?.length ? (
                <div className="mh-check__weakest">
                  <h3>
                    {result.healthStatusKey === 'healthy'
                      ? 'Suggested refinements'
                      : 'Areas that need improvement'}
                  </h3>
                  {result.weakest.map((pillar) => (
                    <article key={pillar.id}>
                      <strong>{pillar.label}</strong>
                      <p>{pillar.tip}</p>
                    </article>
                  ))}
                </div>
              ) : null}

              {result.recommendations?.length ? (
                <div className="mh-check__weakest">
                  <h3>Recommended next steps</h3>
                  {result.recommendations.map((tip) => (
                    <article key={tip}>
                      <p>{tip}</p>
                    </article>
                  ))}
                </div>
              ) : null}

              <div className="mh-check__cta-block">
                <p>{cta.message}</p>
                {cta.showContact ? (
                  <Link className="mh-check__primary" href="/contact" onClick={onClose}>
                    Contact Us <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
                <button type="button" className={cta.showContact ? 'mh-check__ghost' : 'mh-check__primary'} onClick={bookConsultation}>
                  Book a Free Marketing Consultation <span aria-hidden="true">→</span>
                </button>
              </div>
            </>
          ) : null}

          {status.error ? <p className="mh-check__error">{status.error}</p> : null}
        </div>

        {step !== 'results' ? (
          <footer className="mh-check__footer">
            <button
              type="button"
              className="mh-check__ghost"
              onClick={step === 'questions' && questionIndex === 0 ? onClose : back}
              disabled={status.submitting}
            >
              {step === 'questions' && questionIndex === 0 ? 'Close' : 'Back'}
            </button>
            <button type="button" className="mh-check__primary" onClick={next} disabled={!canContinue || status.submitting}>
              {status.submitting ? 'Submitting…' : step === 'lead' ? 'See my results' : 'Next'}
              {!status.submitting ? <span aria-hidden="true">→</span> : null}
            </button>
          </footer>
        ) : (
          <footer className="mh-check__footer">
            <button type="button" className="mh-check__ghost" onClick={restart}>
              Retake assessment
            </button>
            <button type="button" className="mh-check__ghost" onClick={onClose}>
              Close
            </button>
          </footer>
        )}
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}
