'use client'

import Image from 'next/image'
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

const steps = [
  { id: 'info', label: 'Opportunity' },
  { id: 'profile', label: 'Business Profile' },
  { id: 'assessment', label: 'Current State' },
  { id: 'priorities', label: 'Challenges' },
  { id: 'contact', label: 'Submit' },
  { id: 'complete', label: 'Complete' },
]

const emptyMeeting = {
  bookedDate: '',
  platform: '',
  details: '',
}

const meetingPlatformOptions = ['Microsoft Teams', 'Zoom', 'Google Meet', 'Phone Call', 'WhatsApp']

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
      <button type="button" className="advisor-modal__close" onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>
    </header>
  )
}

function AdvisorStepper({ currentStep, visibleSteps = steps }) {
  const currentIndex = visibleSteps.findIndex((step) => step.id === currentStep)
  return (
    <div className="advisor-modal__stepper" aria-label="Assessment progress">
      <strong>{visibleSteps[currentIndex]?.label || 'Operational Opportunity Assessment'}</strong>
      <div className="advisor-modal__steps" style={{ '--step-count': visibleSteps.length }}>
        {visibleSteps.map((step, index) => (
          <span key={step.id} className={index <= currentIndex ? 'is-active' : ''}>{index + 1}</span>
        ))}
      </div>
      <small>{currentStep === 'results' ? 'Results ready' : `Step ${currentIndex + 1} of ${visibleSteps.length}`}</small>
    </div>
  )
}

function OptionButton({ option, selected, onClick, icon, hideIcon = false, multi = false, checkbox = false }) {
  return (
    <button
      type="button"
      className={`lead-scout__option${selected ? ' is-selected' : ''}`}
      onClick={onClick}
    >
      {!hideIcon ? <span className="lead-scout__option-icon" aria-hidden="true">{icon || option.icon || option.label.charAt(0)}</span> : null}
      <span className="lead-scout__option-copy">
        <strong>{option.label}</strong>
        {option.description ? <small>{option.description}</small> : null}
      </span>
      <span className={`lead-scout__option-state${multi ? ' lead-scout__option-state--multi' : ''}${checkbox ? ' lead-scout__option-state--checkbox' : ''}`} aria-hidden="true">
        {checkbox ? <span /> : multi ? (selected ? 'Selected' : '+') : <span />}
      </span>
    </button>
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

export default function LeadScoutAssessmentModal({ open, onClose, initialGoal = '', initialContext = null, initialStep = '' }) {
  const [step, setStep] = useState('info')
  const [profile, setProfile] = useState(emptyProfile)
  const [answers, setAnswers] = useState({})
  const [priorities, setPriorities] = useState([])
  const [status, setStatus] = useState({ submitting: false, error: '' })
  const [showMeetingForm, setShowMeetingForm] = useState(false)
  const [meeting, setMeeting] = useState(emptyMeeting)
  const [meetingStatus, setMeetingStatus] = useState({ submitting: false, error: '', success: '' })

  const assessmentQuestions = useMemo(
    () => contextualizeQuestions(getAdaptiveQuestions(profile.primaryGoal), initialContext),
    [profile.primaryGoal, initialContext],
  )
  const snapshotReport = useMemo(
    () => buildSnapshotReport(answers, profile, priorities),
    [answers, profile, priorities],
  )
  const visibleSteps = initialGoal ? steps.filter((item) => item.id !== 'info') : steps
  const activeIndex = visibleSteps.findIndex((item) => item.id === step)
  const progress = Math.round(((activeIndex + 1) / visibleSteps.length) * 100)
  const assessmentTitle = initialContext?.title || 'Operational Opportunity Assessment'
  const assessmentCategory = initialContext?.category || getOpportunityLabel(profile.primaryGoal)
  const assessmentObjective = initialContext?.objective || getOpportunityLabel(profile.primaryGoal)

  useEffect(() => {
    if (!open) return

    setAnswers({})
    setPriorities([])
    setStatus({ submitting: false, error: '' })
    setMeetingStatus({ submitting: false, error: '', success: '' })
    setMeeting(emptyMeeting)
    setShowMeetingForm(false)
    setProfile({ ...emptyProfile, primaryGoal: initialGoal || '' })
    setStep(initialStep === 'meeting' ? 'meeting' : initialGoal ? 'profile' : 'info')
  }, [open, initialGoal, initialContext, initialStep])

  if (!open) return null

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  function updateMeeting(field, value) {
    setMeeting((current) => ({ ...current, [field]: value }))
    setMeetingStatus((current) => ({ ...current, error: '', success: '' }))
  }

  function setAnswer(question, value) {
    setAnswers((current) => ({ ...current, [question.id]: value }))
  }

  function togglePriority(value) {
    setPriorities((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value)
      if (current.length >= 3) return current
      return [...current, value]
    })
  }

  function infoComplete() {
    return !!profile.primaryGoal
  }

  function profileComplete() {
    return !!profile.industry && !!profile.companySize && !!profile.country
  }

  function assessmentComplete() {
    return assessmentQuestions.every((question) => answers[question.id])
  }

  function contactComplete() {
    return !!profile.name && /\S+@\S+\.\S+/.test(profile.email)
  }

  function canContinue() {
    if (step === 'info') return infoComplete()
    if (step === 'profile') return profileComplete()
    if (step === 'assessment') return assessmentComplete()
    if (step === 'contact') return contactComplete()
    return true
  }

  async function submitBusinessAssessment() {
    if (!canContinue()) return
    setStatus({ submitting: true, error: '' })

    const responseSummary = assessmentQuestions.map((question) => {
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
      `Solution category: ${initialContext?.category || assessmentCategory}`,
      `Specific service: ${initialContext?.service || 'Category-level assessment'}`,
      `Business objective: ${assessmentObjective}`,
      `Lead source: ${initialContext?.service ? 'Service landing page assessment' : initialContext?.category ? 'Solution category assessment' : 'General opportunity assessment'}`,
      '',
      'Business Profile',
      `Industry: ${profile.industry}`,
      `Company size: ${profile.companySize}`,
      `Country: ${profile.country}`,
      `Business name: ${profile.businessName || 'Not provided'}`,
      `Newsletter opt-in: ${profile.newsletter ? 'Yes' : 'No'}`,
      '',
      'Current State Responses',
      ...responseSummary.map((item) => `${item.label}: ${item.answer} (${item.question})`),
      '',
      `Business priorities: ${priorities.length ? priorities.join(', ') : 'None selected'}`,
    ].join('\n')

    const payload = {
      name: profile.name,
      email: profile.email,
      company: profile.businessName,
      region: 'zw',
      source: initialContext?.service ? 'Service landing page assessment' : initialContext?.category ? 'Solution category assessment' : 'General opportunity assessment',
      message,
      solutionCategory: initialContext?.category || assessmentCategory,
      specificService: initialContext?.service || '',
      businessObjective: assessmentObjective,
      assessmentTitle,
      leadSource: initialContext?.service ? 'Service landing page assessment' : initialContext?.category ? 'Solution category assessment' : 'General opportunity assessment',
      profile: {
        industry: profile.industry,
        companySize: profile.companySize,
        country: profile.country,
        name: profile.name,
        email: profile.email,
        businessName: profile.businessName,
        newsletter: profile.newsletter,
      },
      responses: responseSummary,
      priorities,
      timestamp: new Date().toISOString(),
    }

    try {
      await submitAssessment(payload)
      setStatus({ submitting: false, error: '' })
      setStep('complete')
    } catch (error) {
      setStatus({
        submitting: false,
        error: error?.error?.message || error?.message || 'Submission failed. Please try again.',
      })
    }
  }

  async function submitMeetingRequest(event) {
    event.preventDefault()
    if (!profile.name || !/\S+@\S+\.\S+/.test(profile.email)) {
      setMeetingStatus({ submitting: false, error: 'Please add your name and email so we can confirm the session.', success: '' })
      return
    }

    if (!meeting.bookedDate || !meeting.platform || !meeting.details.trim()) {
      setMeetingStatus({ submitting: false, error: 'Please add a booked date, preferred platform, and meeting details.', success: '' })
      return
    }

    setMeetingStatus({ submitting: true, error: '', success: '' })
    const hasAssessmentAnswers = Object.keys(answers).length > 0
    const meetingSnapshot = hasAssessmentAnswers
      ? snapshotReport
      : {
          ooi: 'N/A',
          level: 'Session request',
          band: 'Live session requested before completing an assessment.',
          capabilities: [],
          pressureAreas: [],
          dimensionScores: [],
          recommendations: [],
        }

    const message = [
      'Live session requested from Opportunity Snapshot.',
      '',
      `Assessment: ${assessmentTitle}`,
      `Solution category: ${initialContext?.category || assessmentCategory}`,
      `Specific service: ${initialContext?.service || 'Category-level assessment'}`,
      `Business objective: ${assessmentObjective}`,
      '',
      'Respondent',
      `Name: ${profile.name}`,
      `Email: ${profile.email}`,
      `Business name: ${profile.businessName || 'Not provided'}`,
      `Industry: ${profile.industry}`,
      `Company size: ${profile.companySize}`,
      `Country: ${profile.country}`,
      '',
      'Meeting Request',
      `Booked date: ${meeting.bookedDate}`,
      `Preferred platform: ${meeting.platform}`,
      `Details: ${meeting.details.trim()}`,
      '',
      'Opportunity Snapshot',
      `OOI score: ${hasAssessmentAnswers ? snapshotReport.ooi : 'Not assessed yet'}`,
      `Band: ${hasAssessmentAnswers ? snapshotReport.band : 'Not assessed yet'}`,
      `Pressure areas: ${hasAssessmentAnswers ? snapshotReport.pressureAreas.join(', ') : 'Not assessed yet'}`,
      `Recommended capabilities: ${hasAssessmentAnswers ? snapshotReport.capabilities.join(', ') : 'Not assessed yet'}`,
      `Priorities: ${priorities.length ? priorities.join(', ') : 'None selected'}`,
    ].join('\n')

    try {
      await submitAssessment({
        name: profile.name,
        email: profile.email,
        company: profile.businessName,
        region: 'zw',
        source: 'Opportunity Snapshot live session request',
        message,
        assessmentTitle,
        solutionCategory: initialContext?.category || assessmentCategory,
        specificService: initialContext?.service || '',
        businessObjective: assessmentObjective,
        meeting,
        snapshot: meetingSnapshot,
        profile,
        priorities,
        timestamp: new Date().toISOString(),
      })
      setMeetingStatus({ submitting: false, error: '', success: 'Meeting request sent. OmniContact will confirm the session details shortly.' })
    } catch (error) {
      setMeetingStatus({
        submitting: false,
        error: error?.error?.message || error?.message || 'Meeting request failed. Please try again.',
        success: '',
      })
    }
  }

  function next() {
    if (!canContinue()) return
    if (step === 'info') return setStep('profile')
    if (step === 'profile') return setStep('assessment')
    if (step === 'assessment') return setStep('priorities')
    if (step === 'priorities') return setStep('contact')
    if (step === 'contact') return submitBusinessAssessment()
  }

  function back() {
    if (step === 'profile') return initialGoal ? onClose() : setStep('info')
    if (step === 'assessment') return setStep('profile')
    if (step === 'priorities') return setStep('assessment')
    if (step === 'contact') return setStep('priorities')
    if (step === 'complete') return setStep('contact')
    if (step === 'meeting') return initialStep === 'meeting' ? onClose() : setStep('complete')
  }

  const modal = (
    <div className="lead-scout" role="dialog" aria-modal="true" aria-labelledby="lead-scout-title">
      <div className="lead-scout__backdrop" onClick={onClose} />
      <section className={`lead-scout__modal advisor-modal${step === 'complete' || step === 'meeting' ? ' lead-scout__modal--report' : ''}`}>
        <AdvisorHeader
          title={step === 'complete' ? 'Your Opportunity Snapshot' : step === 'meeting' ? 'Schedule a Live Session' : assessmentTitle}
          subtitle={step === 'complete' ? 'A brief report generated from your assessment responses.' : step === 'meeting' ? 'Choose a date, platform, and agenda for the session.' : `${assessmentCategory} · ${assessmentObjective}`}
          titleId="lead-scout-title"
          onClose={onClose}
        />
        {step !== 'complete' && step !== 'meeting' ? <AdvisorStepper currentStep={step} visibleSteps={visibleSteps} /> : null}
        {step !== 'complete' && step !== 'meeting' ? <div className="lead-scout__progress"><span style={{ width: `${progress}%` }} /></div> : null}

        {step === 'info' ? (
          <div className="lead-scout__screen lead-scout__welcome">
            <div className="advisor-modal__intro">
              <span className="advisor-modal__intro-icon" aria-hidden="true">01</span>
              <div>
                <p className="lead-scout__eyebrow">Step 1: Opportunity</p>
                <h2>What's the biggest opportunity you're trying to unlock?</h2>
              </div>
            </div>
            <p>
              Select the goal that best describes what you're trying to achieve.
              We'll tailor the assessment to your priorities.
            </p>
            <h3>Which outcome are you hoping to achieve?</h3>
            <div className="lead-scout__option-list lead-scout__option-list--cards lead-scout__opportunity-grid">
              {businessGoalOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  selected={profile.primaryGoal === option.value}
                  onClick={() => updateProfile('primaryGoal', option.value)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 'profile' ? (
          <div className="lead-scout__screen lead-scout__contact-screen">
            <div className="advisor-modal__intro">
              <span className="advisor-modal__intro-icon" aria-hidden="true">{initialGoal ? '01' : '02'}</span>
              <div>
                <p className="lead-scout__eyebrow">Business Profile</p>
                <h2>Help us understand your operating context.</h2>
              </div>
            </div>
            <p className="lead-scout__helper">
              These shared details help OmniContact interpret your assessment by industry, scale, and location.
            </p>
            <div className="lead-scout__contact-form">
              <label className="lead-scout__field">
                <span>Industry</span>
                <select value={profile.industry} onChange={(event) => updateProfile('industry', event.target.value)}>
                  <option value="">Select industry</option>
                  {industryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="lead-scout__field">
                <span>Company Size</span>
                <select value={profile.companySize} onChange={(event) => updateProfile('companySize', event.target.value)}>
                  <option value="">Select company size</option>
                  {companySizeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="lead-scout__field">
                <span>Country</span>
                <select value={profile.country} onChange={(event) => updateProfile('country', event.target.value)}>
                  <option value="">Select country</option>
                  {countryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </div>
        ) : null}

        {step === 'assessment' ? (
          <div className="lead-scout__screen">
            <div className="advisor-modal__intro">
                <span className="advisor-modal__intro-icon" aria-hidden="true">{initialGoal ? '02' : '03'}</span>
                <div>
                <p className="lead-scout__eyebrow">{initialGoal ? `Tailored to ${assessmentCategory}` : 'Current State'}</p>
                <h2>Assess the current state of your operation.</h2>
              </div>
            </div>
            <div className="lead-scout__assessment-grid">
              {assessmentQuestions.map((question, index) => (
                <section className="lead-scout__question-block" key={question.id}>
                  <p>{question.dimensionLabel}</p>
                  <h3>{question.prompt}</h3>
                  <div className="lead-scout__option-list">
                    {question.options.map((option) => (
                      <OptionButton
                        key={option.value}
                        option={option}
                        hideIcon
                        selected={answers[question.id] === option.value}
                        onClick={() => setAnswer(question, option.value)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : null}

        {step === 'priorities' ? (
          <div className="lead-scout__screen">
            <div className="advisor-modal__intro">
              <span className="advisor-modal__intro-icon" aria-hidden="true">{initialGoal ? '03' : '04'}</span>
              <div>
                <p className="lead-scout__eyebrow">Business Challenges</p>
                <h2>Choose up to three priorities that matter most.</h2>
              </div>
            </div>
            <p className="lead-scout__helper lead-scout__helper--compact">These choices help our specialists prioritize your Opportunity Snapshot.</p>
            <div className="lead-scout__option-list lead-scout__option-list--cards lead-scout__challenge-grid">
              {priorityOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  option={option}
                  multi
                  checkbox
                  hideIcon
                  selected={priorities.includes(option.value)}
                  onClick={() => togglePriority(option.value)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 'contact' ? (
          <div className="lead-scout__screen lead-scout__contact-screen">
            <div className="advisor-modal__intro">
              <span className="advisor-modal__intro-icon" aria-hidden="true">{initialGoal ? '04' : '05'}</span>
              <div>
                <p className="lead-scout__eyebrow">Submit Assessment</p>
                <h2>Where should we send your Opportunity Snapshot?</h2>
              </div>
            </div>
            <p className="lead-scout__helper">
              Submit your assessment so OmniContact can review your responses and prepare a practical Opportunity Snapshot.
              Business name is optional.
            </p>
            <div className="lead-scout__contact-form">
              <label className="lead-scout__field">
                <span>Client Name</span>
                <input value={profile.name} onChange={(event) => updateProfile('name', event.target.value)} />
              </label>
              <label className="lead-scout__field">
                <span>Email</span>
                <input type="email" value={profile.email} onChange={(event) => updateProfile('email', event.target.value)} />
              </label>
              <label className="lead-scout__field">
                <span>Business Name <small>Optional</small></span>
                <input value={profile.businessName} onChange={(event) => updateProfile('businessName', event.target.value)} />
              </label>
              <label className="lead-scout__check">
                <input
                  type="checkbox"
                  checked={profile.newsletter}
                  onChange={(event) => updateProfile('newsletter', event.target.checked)}
                />
                <span>I would like to receive occasional OmniContact insights and newsletters.</span>
              </label>
            </div>
          </div>
        ) : null}

        {step === 'complete' ? (
          <div className="lead-scout__screen lead-scout__results">
            <div className="advisor-modal__intro">
              <span className="advisor-modal__intro-icon" aria-hidden="true">✓</span>
              <div>
                <p className="lead-scout__eyebrow">Assessment submitted</p>
                <h2>Your Opportunity Snapshot is ready.</h2>
              </div>
            </div>

            <section className="lead-scout__recommendation">
              <p>Executive summary</p>
              <div className="lead-scout__executive-summary">
                {snapshotReport.summary} Your current Opportunity Index is <strong>{snapshotReport.ooi}/100</strong>, which indicates a <strong>{snapshotReport.level}</strong> operating profile. A live session can turn this snapshot into a practical action plan for {initialContext?.service || assessmentObjective}.
              </div>
            </section>

            <div className="lead-scout__opportunities">
              {snapshotReport.recommendations.slice(0, 4).map((item) => (
                <article className="lead-scout__opportunity" key={item.id}>
                  <span>{item.priority}</span>
                  <h3>{item.title}</h3>
                  <p>{item.initiative}</p>
                </article>
              ))}
            </div>

            <section className="lead-scout__recommendation">
              <p>Recommended focus areas</p>
              <div className="lead-scout__capability-list">
                {snapshotReport.capabilities.map((capability) => <span key={capability}>{capability}</span>)}
              </div>
            </section>

            <div className="lead-scout__strategy">
              <div>
                <p className="lead-scout__eyebrow">Next best action</p>
                <h3>Schedule a live session to review the snapshot with OmniContact.</h3>
                <span>Bring your context, constraints, and current priorities. We will use this report to identify the most practical next move.</span>
              </div>
              {!showMeetingForm ? (
                <button type="button" className="lead-scout__primary" onClick={() => setStep('meeting')}>
                  Schedule Live Session
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 'meeting' ? (
          <div className="lead-scout__screen lead-scout__results">
            <div className="advisor-modal__intro">
              <span className="advisor-modal__intro-icon" aria-hidden="true">06</span>
              <div>
                <p className="lead-scout__eyebrow">Live session</p>
                <h2>Schedule a focused strategy session.</h2>
              </div>
            </div>

            <section className="lead-scout__recommendation">
              <p>Session context</p>
              <div className="lead-scout__executive-summary">
                {initialContext?.service || assessmentObjective} will be used as the starting point for the conversation.
                Share the timing, preferred platform, and what you want OmniContact to prepare for.
              </div>
            </section>

            <div className="lead-scout__strategy">
              <div>
                <p className="lead-scout__eyebrow">Booking request</p>
                <h3>Tell us when and how you want to meet.</h3>
                <span>We will confirm availability and use your notes to prepare the session.</span>
              </div>
              <form className="lead-scout__meeting-form" onSubmit={submitMeetingRequest}>
                <label className="lead-scout__field">
                  <span>Client Name</span>
                  <input value={profile.name} onChange={(event) => updateProfile('name', event.target.value)} />
                </label>
                <label className="lead-scout__field">
                  <span>Email</span>
                  <input type="email" value={profile.email} onChange={(event) => updateProfile('email', event.target.value)} />
                </label>
                <label className="lead-scout__field">
                  <span>Booked Date</span>
                  <input
                    type="datetime-local"
                    value={meeting.bookedDate}
                    onChange={(event) => updateMeeting('bookedDate', event.target.value)}
                  />
                </label>
                <label className="lead-scout__field">
                  <span>Preferred Platform</span>
                  <select value={meeting.platform} onChange={(event) => updateMeeting('platform', event.target.value)}>
                    <option value="">Select platform</option>
                    {meetingPlatformOptions.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
                  </select>
                </label>
                <label className="lead-scout__field lead-scout__field--wide">
                  <span>Details</span>
                  <textarea
                    value={meeting.details}
                    onChange={(event) => updateMeeting('details', event.target.value)}
                    placeholder="Share the preferred agenda, attendees, timezone, or any context you want the team to prepare for."
                  />
                </label>
                <div className="lead-scout__meeting-actions">
                  <button type="submit" className="lead-scout__primary" disabled={meetingStatus.submitting}>
                    {meetingStatus.submitting ? 'Sending...' : 'Submit Meeting Request'}
                  </button>
                  <button type="button" className="lead-scout__secondary" onClick={back}>Back</button>
                </div>
                {meetingStatus.error ? <div className="form-status form-status--error">{meetingStatus.error}</div> : null}
                {meetingStatus.success ? <div className="form-status form-status--success">{meetingStatus.success}</div> : null}
              </form>
            </div>
          </div>
        ) : null}

        {status.error ? <div className="form-status form-status--error">{status.error}</div> : null}

        {step !== 'complete' && step !== 'meeting' ? (
          <footer className="lead-scout__footer">
            {step !== 'info' ? <button type="button" className="lead-scout__secondary" onClick={back}>Back</button> : <span />}
            <button type="button" className="lead-scout__primary" onClick={next} disabled={!canContinue() || status.submitting}>
              {step === 'contact' ? (status.submitting ? 'Submitting...' : 'Submit Assessment') : 'Continue'}
            </button>
          </footer>
        ) : null}
      </section>
    </div>
  )

  return createPortal(modal, document.body)
}
