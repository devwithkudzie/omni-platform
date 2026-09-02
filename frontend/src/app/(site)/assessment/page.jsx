import SiteShell from '@/components/layout/SiteShell'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'
import { ASSESSMENT_COPY } from '@/config/assessment'

const outcomes = [
  {
    title: 'Cost to serve',
    text: 'Where operational effort, rework, or delay is driving avoidable cost.',
  },
  {
    title: 'Customer experience',
    text: 'How easily customers can get help, and where friction repeats.',
  },
  {
    title: 'Efficiency',
    text: 'Which workflows still depend on handoffs, queues, or manual work.',
  },
  {
    title: 'AI adoption',
    text: 'Whether AI is already helping, or still sitting at the planning stage.',
  },
  {
    title: 'Scale',
    text: 'How ready the operation is if demand, channels, or volume grow.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Answer a few questions',
    text: 'About three minutes. One question at a time, in plain language.',
  },
  {
    num: '02',
    title: 'See your snapshot immediately',
    text: 'Score, focus areas, and recommended next moves stay on screen.',
  },
  {
    num: '03',
    title: 'Keep a copy by email',
    text: 'We send the same snapshot to your inbox so you can share it later.',
  },
]

export const metadata = {
  title: `${ASSESSMENT_COPY.productName} | OmniContact`,
  description: ASSESSMENT_COPY.tagline,
}

export default function AssessmentLandingPage() {
  return (
    <SiteShell>
      <main>
        <section
          className="page-hero"
          style={{ '--page-hero-image': 'url("/home/operational%20efficienct.jpeg")' }}
          aria-labelledby="assessment-title"
        >
          <div className="site-container">
            <p className="page-hero__eyebrow">Free for operations leaders</p>
            <h1 id="assessment-title">{ASSESSMENT_COPY.productName}</h1>
            <p>{ASSESSMENT_COPY.tagline}</p>
            <div className="assessment-page__ctas">
              <AssessmentModalButton className="btn-prim" context={{ title: ASSESSMENT_COPY.productName }}>
                {ASSESSMENT_COPY.ctaLong} →
              </AssessmentModalButton>
            </div>
          </div>
        </section>

        <section className="page-section page-section--soft">
          <div className="site-container">
            <p className="page-hero__eyebrow">What it covers</p>
            <h2>Five operating questions. A practical snapshot.</h2>
            <div className="assessment-page__grid">
              {outcomes.map((item) => (
                <article className="assessment-page__card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="page-cta">
          <div className="site-container">
            <p className="page-hero__eyebrow">How it works</p>
            <h2>Stay on the site. Email is only the backup.</h2>
            <div className="assessment-page__grid">
              {steps.map((item) => (
                <article className="assessment-page__card" key={item.num}>
                  <span>{item.num}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <div className="assessment-page__ctas">
              <AssessmentModalButton className="btn-prim" context={{ title: ASSESSMENT_COPY.productName }}>
                {ASSESSMENT_COPY.ctaLong} →
              </AssessmentModalButton>
              <AssessmentModalButton className="btn-prim assessment-page__ghost" step="meeting">
                Book a discovery call →
              </AssessmentModalButton>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
