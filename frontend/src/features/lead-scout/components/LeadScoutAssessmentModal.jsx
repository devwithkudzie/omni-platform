'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  businessGoalOptions,
  companySizeOptions,
  countryOptions,
  buildSnapshotReport,
  getAdaptiveQuestions,
  getOpportunityLabel,
  industryOptions,
  priorityOptions,
} from '@/features/lead-scout/data/leadScoutAssessment'
import { submitAssessment } from '@/lib/api/client'
import { ASSESSMENT_COPY } from '@/config/assessment'

const emptyProfile = {
  primaryGoal: '',
  name: '',
  email: '',
  businessName: '',
  industry: '',
  companySize: '',
  country: '',
  newsletter: false,
}

function CloseIcon() {
  return (
    <span className="omni-assess__x" aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

function contextualizeQuestions(questions, context) {
  const subject = context?.service || context?.category
  if (!subject) return questions

  return questions.map((question) => {
    if (question.id === 'cx') {
      return { ...question, prompt: `How does ${subject.toLowerCase()} currently affect customer or stakeholder experience?` }
    }
    if (question.id === 'operations') {
      return { ...question, prompt: `Where does ${subject.toLowerCase()} create the most operational pressure today?` }
    }
    if (question.id === 'ai') {
      return { ...question, prompt: `How could AI, automation, or smarter workflows improve ${subject.toLowerCase()}?` }
    }
    if (question.id === 'data') {
      return { ...question, prompt: `How clearly can leaders measure performance across ${subject.toLowerCase()}?` }
    }
    if (question.id === 'workforce') {
      return { ...question, prompt: `Which best describes the team capacity supporting ${subject.toLowerCase()}?` }
    }
    if (question.id === 'digital') {
      return { ...question, prompt: `How digital and scalable are the workflows behind ${subject.toLowerCase()}?` }
    }
    return question
  })
}

export default function LeadScoutAssessmentModal({
  open,
  onClose = () => {},
  onBookCall,
  initialGoal = '',
  initialContext = null,
}) {
  const [step, setStep] = useState('goal')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [profile, setProfile] = useState(emptyProfile)
  const [answers, setAnswers] = useState({})
  const [priorities, setPriorities] = useState([])
  const [status, setStatus] = useState({ submitting: false, error: '' })

  const questions = useMemo(
    () => contextualizeQuestions(getAdaptiveQuestions(profile.primaryGoal), initialContext),
    [profile.primaryGoal, initialContext],
  )
  const snapshot = useMemo(
    () => buildSnapshotReport(answers, profile, priorities),
    [answers, profile, priorities],
  )
  const currentQuestion = questions[questionIndex]
  const totalScreens = 4 + questions.length
  const currentScreen =
    step === 'goal'
      ? 1
      : step === 'profile'
        ? 2
        : step === 'questions'
          ? 3 + questionIndex
          : step === 'priorities'
            ? 3 + questions.length
            : totalScreens
  const progress = Math.round((currentScreen / totalScreens) * 100)
  const assessmentTitle = initialContext?.title || ASSESSMENT_COPY.productName
  const assessmentCategory = initialContext?.category || getOpportunityLabel(profile.primaryGoal)
  const assessmentObjective = initialContext?.objective || getOpportunityLabel(profile.primaryGoal)

  useEffect(() => {
    if (!open) return
    setAnswers({})
    setPriorities([])
    setStatus({ submitting: false, error: '' })
    setQuestionIndex(0)
    setProfile({ ...emptyProfile, primaryGoal: initialGoal || '' })
    setStep(initialGoal ? 'profile' : 'goal')
  }, [open, initialGoal, initialContext])

  useEffect(() => {
    if (!open) return undefined
    function handleEscape(event) {
      if (event.key === 'Escape') onClose?.()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  function canContinue() {
    if (step === 'goal') return !!profile.primaryGoal
    if (step === 'profile') return !!profile.industry && !!profile.companySize && !!profile.country
    if (step === 'questions') return !!answers[currentQuestion?.id]
    if (step === 'priorities') return true
    if (step === 'contact') return !!profile.name && /\S+@\S+\.\S+/.test(profile.email)
    return false
  }

  async function submit() {
    if (!canContinue()) return
    setStatus({ submitting: true, error: '' })

    const responseSummary = questions.map((question) => {
      const selected = question.options.find((option) => option.value === answers[question.id])
      return {
        dimension: question.dimension,
        label: question.dimensionLabel,
        question: question.prompt,
        answer: selected?.label || answers[question.id],
        score: selected?.score ?? null,
      }
    })

    const message = [
      `${assessmentTitle} submitted.`,
      '',
      `Focus: ${businessGoalOptions.find((item) => item.value === profile.primaryGoal)?.label || profile.primaryGoal}`,
      `Solution category: ${initialContext?.category || assessmentCategory}`,
      `Specific service: ${initialContext?.service || 'Category-level assessment'}`,
      `Business objective: ${assessmentObjective}`,
      `Industry: ${profile.industry}`,
      `Company size: ${profile.companySize}`,
      `Country: ${profile.country}`,
      `Business name: ${profile.businessName || 'Not provided'}`,
      `Opportunity index: ${snapshot.ooi}/100 (${snapshot.level})`,
      '',
      ...responseSummary.map((item) => `${item.label}: ${item.answer}`),
      '',
      `Priorities: ${priorities.length ? priorities.join(', ') : 'None selected'}`,
      '',
      snapshot.summary,
    ].join('\n')

    try {
      await submitAssessment({
        name: profile.name,
        email: profile.email,
        company: profile.businessName,
        region: 'zw',
        source: initialContext?.service
          ? 'Service landing page assessment'
          : initialContext?.category
            ? 'Solution category assessment'
            : 'General opportunity assessment',
        message,
        assessmentTitle,
        solutionCategory: initialContext?.category || assessmentCategory,
        specificService: initialContext?.service || '',
        businessObjective: assessmentObjective,
        profile,
        responses: responseSummary,
        snapshot,
        priorities,
        timestamp: new Date().toISOString(),
      })
      setStatus({ submitting: false, error: '' })
      setStep('done')
    } catch (error) {
      setStatus({
        submitting: false,
        error: error?.error?.message || error?.message || 'Submission failed. Please try again.',
      })
    }
  }

  function next() {
    if (!canContinue()) return
    if (step === 'goal') return setStep('profile')
    if (step === 'profile') {
      setQuestionIndex(0)
      return setStep('questions')
    }
    if (step === 'questions') {
      if (questionIndex < questions.length - 1) return setQuestionIndex((current) => current + 1)
      return setStep('priorities')
    }
    if (step === 'priorities') return setStep('contact')
    if (step === 'contact') return submit()
  }

  function back() {
    if (step === 'profile') return initialGoal ? onClose() : setStep('goal')
    if (step === 'questions') {
      if (questionIndex > 0) return setQuestionIndex((current) => current - 1)
      return setStep('profile')
    }
    if (step === 'priorities') {
      setQuestionIndex(Math.max(0, questions.length - 1))
      return setStep('questions')
    }
    if (step === 'contact') return setStep('priorities')
  }

  function togglePriority(value) {
    setPriorities((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value)
      if (current.length >= 3) return current
      return [...current, value]
    })
  }

  const heading =
    step === 'goal'
      ? 'What do you want to improve?'
      : step === 'profile'
        ? 'A little context'
        : step === 'questions'
          ? currentQuestion?.prompt
          : step === 'priorities'
            ? 'What matters most right now?'
            : step === 'contact'
              ? 'Where should we send a copy?'
              : 'Your operations snapshot'

  const helper =
    step === 'goal'
      ? 'Pick the outcome that is closest. You can refine this on the call.'
      : step === 'profile'
        ? 'This helps us read your answers in the right context.'
        : step === 'questions'
          ? currentQuestion?.dimensionLabel
          : step === 'priorities'
            ? 'Choose up to three. Skip if you are not sure.'
            : step === 'contact'
              ? 'You’ll see the snapshot here. We’ll also email a copy for later.'
              : null

  const modal = (
    <div className="omni-assess" role="dialog" aria-modal="true" aria-labelledby="omni-assess-title">
      <button type="button" className="omni-assess__backdrop" aria-label="Close assessment" onClick={onClose} />
      <section className={`omni-assess__panel${step === 'done' ? ' omni-assess__panel--report' : ''}`}>
        <header className="omni-assess__header">
          <div>
            <p className="omni-assess__kicker">{ASSESSMENT_COPY.productName}</p>
            {step !== 'done' ? (
              <p className="omni-assess__count">
                {currentScreen} of {totalScreens}
              </p>
            ) : null}
          </div>
          <button type="button" className="omni-assess__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        {step !== 'done' ? (
          <div className="omni-assess__track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        ) : null}

        <div className="omni-assess__body">
          {helper && step === 'questions' ? <p className="omni-assess__topic">{helper}</p> : null}
          <h2 id="omni-assess-title">{heading}</h2>
          {helper && step !== 'questions' ? <p className="omni-assess__help">{helper}</p> : null}

          {step === 'goal' ? (
            <div className="omni-assess__choices">
              {businessGoalOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`omni-assess__choice${profile.primaryGoal === option.value ? ' is-selected' : ''}`}
                  onClick={() => updateProfile('primaryGoal', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}

          {step === 'profile' ? (
            <div className="omni-assess__fields">
              <label>
                <span>Industry</span>
                <select value={profile.industry} onChange={(event) => updateProfile('industry', event.target.value)}>
                  <option value="">Select</option>
                  {industryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Company size</span>
                <select value={profile.companySize} onChange={(event) => updateProfile('companySize', event.target.value)}>
                  <option value="">Select</option>
                  {companySizeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Country</span>
                <select value={profile.country} onChange={(event) => updateProfile('country', event.target.value)}>
                  <option value="">Select</option>
                  {countryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {step === 'questions' && currentQuestion ? (
            <div className="omni-assess__choices">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`omni-assess__choice omni-assess__choice--answer${answers[currentQuestion.id] === option.value ? ' is-selected' : ''}`}
                  onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: option.value }))}
                >
                  <strong>{option.label}</strong>
                  {option.description ? <small>{option.description}</small> : null}
                </button>
              ))}
            </div>
          ) : null}

          {step === 'priorities' ? (
            <div className="omni-assess__choices omni-assess__choices--compact">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`omni-assess__choice${priorities.includes(option.value) ? ' is-selected' : ''}`}
                  onClick={() => togglePriority(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}

          {step === 'contact' ? (
            <div className="omni-assess__fields omni-assess__fields--contact">
              <label>
                <span>Name</span>
                <input value={profile.name} onChange={(event) => updateProfile('name', event.target.value)} autoComplete="name" />
              </label>
              <label>
                <span>Work email</span>
                <input type="email" value={profile.email} onChange={(event) => updateProfile('email', event.target.value)} autoComplete="email" />
              </label>
              <label>
                <span>Business name (optional)</span>
                <input value={profile.businessName} onChange={(event) => updateProfile('businessName', event.target.value)} autoComplete="organization" />
              </label>
            </div>
          ) : null}

          {step === 'done' ? (
            <div className="omni-assess__snapshot">
              <div className="omni-assess__score">
                <strong>{snapshot.ooi}</strong>
                <span>/100 · {snapshot.level}</span>
              </div>
              <p>{snapshot.summary}</p>
              {snapshot.pressureAreas?.length ? (
                <div className="omni-assess__chips">
                  {snapshot.pressureAreas.map((area) => (
                    <span key={area}>{area}</span>
                  ))}
                </div>
              ) : null}
              {snapshot.recommendations?.length ? (
                <div className="omni-assess__recs">
                  {snapshot.recommendations.slice(0, 4).map((item) => (
                    <article key={item.id}>
                      <span>{item.priority}</span>
                      <h3>{item.title}</h3>
                      {item.initiative ? <p>{item.initiative}</p> : null}
                    </article>
                  ))}
                </div>
              ) : null}
              <p className="omni-assess__help">A copy has also been emailed to {profile.email} for later reference.</p>
            </div>
          ) : null}

          {status.error ? <p className="omni-assess__error">{status.error}</p> : null}
        </div>

        <footer className="omni-assess__footer">
          {step === 'done' ? (
            <>
              <button type="button" className="omni-assess__btn omni-assess__btn--ghost" onClick={onClose}>
                Close
              </button>
              {onBookCall ? (
                <button type="button" className="omni-assess__btn omni-assess__btn--primary" onClick={onBookCall}>
                  Book a discovery call
                </button>
              ) : null}
            </>
          ) : (
            <>
              {step === 'goal' ? (
                <span />
              ) : (
                <button type="button" className="omni-assess__btn omni-assess__btn--ghost" onClick={back}>
                  Back
                </button>
              )}
              <button
                type="button"
                className="omni-assess__btn omni-assess__btn--primary"
                onClick={next}
                disabled={!canContinue() || status.submitting}
              >
                {step === 'contact'
                  ? status.submitting
                    ? 'Sending...'
                    : 'See my snapshot'
                  : step === 'priorities' && priorities.length === 0
                    ? 'Skip'
                    : 'Continue'}
              </button>
            </>
          )}
        </footer>
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}
