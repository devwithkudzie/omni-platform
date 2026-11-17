import SiteShell from '@/components/layout/SiteShell'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'
import SectionHead from '@/components/layout/SectionHead'
import SolutionHero from '@/features/solutions/components/SolutionHero'
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
        <SolutionHero
          eyebrow="Free for operations leaders"
          image="/home/operational efficienct.jpeg"
          subtitle={ASSESSMENT_COPY.tagline}
          title={ASSESSMENT_COPY.productName}
        >
          <AssessmentModalButton className="hx-btn hx-btn--primary" context={{ title: ASSESSMENT_COPY.productName }}>
            {ASSESSMENT_COPY.ctaLong} <span aria-hidden="true">→</span>
          </AssessmentModalButton>
          <AssessmentModalButton className="hx-btn hx-btn--outline" step="meeting">
            Book a Discovery Call
          </AssessmentModalButton>
        </SolutionHero>

        <section className="sx-band sx-band--soft">
          <div className="site-container">
            <SectionHead eyebrow="What it covers">Five operating questions. A practical snapshot.</SectionHead>
            <div className="sx-cards sx-cards--five">
              {outcomes.map((item) => (
                <article className="sx-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sx-band">
          <div className="site-container">
            <SectionHead eyebrow="How it works">Stay on the site. Email is only the backup.</SectionHead>
            <ol className="sx-path__rail sx-path__rail--three">
              {steps.map((item) => (
                <li className="sx-path__step" key={item.num}>
                  <span className="sx-path__node" aria-hidden="true">{item.num}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sx-banner">
          <div className="site-container sx-banner__inner">
            <div>
              <h2>Ready to see where your operation stands?</h2>
              <p>About three minutes. Your snapshot appears on screen straight away.</p>
            </div>
            <AssessmentModalButton className="hx-btn hx-btn--primary" context={{ title: ASSESSMENT_COPY.productName }}>
              {ASSESSMENT_COPY.ctaLong} <span aria-hidden="true">→</span>
            </AssessmentModalButton>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
