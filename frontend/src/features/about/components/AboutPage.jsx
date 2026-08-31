import Link from 'next/link'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'
import ProjectIgniteLanding from './ProjectIgniteLanding'

const muted = 'text-[#526179]'

function CtaLink({ cta, className }) {
  if (cta.external) {
    return (
      <a className={className} href={cta.href} target="_blank" rel="noreferrer">
        {cta.label}
      </a>
    )
  }

  if (cta.href === '/discovery') {
    return (
      <AssessmentModalButton
        className={className}
        step="meeting"
        context={{
          category: 'OmniContact',
          title: 'Discovery Session',
          objective: 'Continue the conversation',
        }}
      >
        {cta.label}
      </AssessmentModalButton>
    )
  }

  return (
    <Link className={className} href={cta.href}>
      {cta.label}
    </Link>
  )
}

export default function AboutPage({ page }) {
  if (page.variant === 'project-ignite') {
    return <ProjectIgniteLanding page={page} />
  }

  return (
    <>
      <section
        className="relative min-h-[clamp(410px,52vh,600px)] overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(95deg, rgba(8,19,48,.9) 0%, rgba(8,19,48,.76) 48%, rgba(8,19,48,.34) 100%), url("${page.image}")`,
        }}
      >
        <div className="site-container grid min-h-[clamp(410px,52vh,600px)] items-center py-[clamp(60px,8vw,104px)]">
          <div className="max-w-[820px]">
            <p className="mb-3 font-black uppercase tracking-[.08em] text-omni-yellow">{page.eyebrow}</p>
            <h1 className="m-0 text-[clamp(2.35rem,4.7vw,5.4rem)] font-black leading-[1.03] text-white">
              {page.title}
            </h1>
            <p className="mt-5 max-w-[720px] border-l-[3px] border-white/90 pl-4 text-[clamp(1rem,.45vw+1rem,1.32rem)] leading-[1.6] text-white/90">
              {page.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-omni-soft py-[clamp(54px,7vw,92px)]">
        <div className="site-container grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <h2 className="m-0 text-[clamp(1.8rem,2vw+1rem,3rem)] font-black leading-[1.12] text-omni-blue">
              {page.intro.heading}
            </h2>
            <p className={`mt-4 max-w-[800px] text-lg leading-[1.75] ${muted}`}>{page.intro.body}</p>
          </div>
          <div className="grid gap-3">
            {page.highlights.map(([title, description]) => (
              <article className="border-l-4 border-omni-yellow bg-white p-4 shadow-[0_10px_24px_rgba(25,49,118,.08)]" key={title}>
                <h3 className="m-0 text-lg font-black text-omni-ink">{title}</h3>
                <p className={`mt-2 leading-[1.6] ${muted}`}>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-[clamp(54px,7vw,92px)]">
        <div className="site-container grid gap-5 md:grid-cols-2">
          {page.sections.map(([title, body]) => (
            <article className="rounded-lg border border-[#d8e3f7] bg-white p-6 shadow-[0_12px_30px_rgba(25,49,118,.09)]" key={title}>
              <div className="mb-4 h-1.5 w-14 rounded-full bg-omni-yellow" />
              <h2 className="m-0 text-2xl font-black text-omni-blue">{title}</h2>
              <p className={`mt-4 leading-[1.7] ${muted}`}>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-omni-blue py-[clamp(54px,7vw,92px)] text-white">
        <div className="site-container grid items-center gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <h2 className="m-0 text-[clamp(1.8rem,2vw+1rem,3rem)] font-black leading-[1.12] text-white">
              {page.cta.heading}
            </h2>
            <p className="mt-4 max-w-[760px] leading-[1.75] text-white/85">{page.cta.text}</p>
          </div>
          <div className="rounded-lg bg-white p-6 text-omni-ink shadow-[0_20px_50px_rgba(0,0,0,.18)]">
            <h3 className="m-0 text-xl font-black">Continue the conversation</h3>
            <div className="mt-5 grid gap-3">
              <CtaLink className="btn-omni w-full" cta={page.cta.primaryCta} />
              <CtaLink
                className="grid min-h-[44px] place-items-center rounded-md border-2 border-omni-blue px-4 py-2 font-black text-omni-blue"
                cta={page.cta.secondaryCta}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
