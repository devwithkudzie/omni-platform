'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'
import AramsPlatformTour, { AramsDashboardMockup } from '@/features/solutions/components/AramsPlatformTour'
import { zohoContactFields } from '@/features/solutions/data/zohoLeadFields'
import { submitContact } from '@/lib/api/client'
import { iconCycle, LandingIcon } from './icons'

// One landing-page layout for every solution, category and industry page.
// Each page passes a config (see buildLanding.js and the custom configs);
// every section except the hero and final CTA is optional.

// Interactive pieces a config can name (configs stay plain data so server
// components can pass them through).
const widgets = {
  'arams-dashboard': AramsDashboardMockup,
  'arams-tour': AramsPlatformTour,
}

function Widget({ name }) {
  const Component = widgets[name]
  return Component ? <Component /> : null
}

const defaultLogos = [
  '/partners/partner (1).jpg',
  '/partners/partner (2).png',
  '/partners/partner (3).png',
  '/partners/partner (4).png',
  '/partners/partner (5).png',
  '/partners/partner (6).png',
]

function scrollToForm(setIntent, intent) {
  if (intent && setIntent) setIntent(intent)
  const form = document.getElementById('enquire')
  form?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  form?.querySelector('input')?.focus({ preventScroll: true })
}

function Cta({ cta, assessment, setIntent, className = 'hx-btn hx-btn--primary', arrow = true }) {
  if (!cta) return null
  const content = <>{cta.label} {arrow ? <span aria-hidden="true">→</span> : null}</>

  if (cta.action === 'assessment') {
    return (
      <AssessmentModalButton className={className} context={assessment?.context} goal={assessment?.goal}>
        {content}
      </AssessmentModalButton>
    )
  }

  if (cta.href) {
    return cta.href.startsWith('#') ? (
      <a className={className} href={cta.href}>{content}</a>
    ) : (
      <Link className={className} href={cta.href}>{content}</Link>
    )
  }

  return (
    <button className={className} type="button" onClick={() => scrollToForm(setIntent, cta.intent)}>
      {content}
    </button>
  )
}

function TextCta({ link, assessment, setIntent }) {
  if (!link) return null
  return (
    <p className="sx-textcta">
      {link.lead}{' '}
      <Cta assessment={assessment} className="hx-link" cta={link} setIntent={setIntent} />
    </p>
  )
}

function Field({ field, value, onChange, disabled }) {
  const label = (
    <span>
      {field.label} {field.required ? <em aria-hidden="true">*</em> : null}
    </span>
  )

  if (field.type === 'select') {
    return (
      <label className={field.wide ? 'ms-form__wide' : undefined}>
        {label}
        <select name={field.name} value={value} onChange={onChange} required={field.required} disabled={disabled}>
          {field.placeholder ? <option value="">{field.placeholder}</option> : null}
          {field.options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    )
  }

  if (field.type === 'textarea') {
    return (
      <label className="ms-form__wide">
        {label}
        <textarea name={field.name} rows="2" value={value} onChange={onChange} placeholder={field.placeholder} required={field.required} disabled={disabled} />
      </label>
    )
  }

  return (
    <label className={field.wide ? 'ms-form__wide' : undefined}>
      {label}
      <input
        type={field.type || 'text'}
        name={field.name}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
      />
    </label>
  )
}

// Short fields sit two to a row; an unpaired one takes the full row.
function layoutFields(fields) {
  const halves = fields.filter((field) => field.type !== 'textarea' && !field.wide)
  const lastHalf = halves.length % 2 ? halves.at(-1) : null
  return fields.map((field) => (field === lastHalf ? { ...field, wide: true } : field))
}

function emptyValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, field.default || '']))
}

function EnquiryForm({ form, intent, setIntent }) {
  const [values, setValues] = useState(() => emptyValues(form.fields))
  const [status, setStatus] = useState({ submitting: false, error: '', success: '' })
  const activeIntent = form.intents?.find((item) => item.value === intent) || form.intents?.[0]
  const [zohoSending, setZohoSending] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState('')

  useEffect(() => {
    if (form.zoho?.redirect) setRedirectUrl(new URL(form.zoho.redirect, window.location.origin).href)
  }, [form.zoho])

  function update(event) {
    const { name, value } = event.target
    setStatus({ submitting: false, error: '', success: '' })
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    // Zoho forms post natively so the record lands in Zoho and Zoho redirects
    // to the thank-you page. Fields must stay enabled until the browser has
    // serialised them, so only the button text changes.
    if (form.zoho) {
      setZohoSending(true)
      return
    }

    event.preventDefault()
    setStatus({ submitting: true, error: '', success: '' })

    // Forms using the Zoho field names keep the contact details in Zoho's fields.
    const z = zohoContactFields
    const name = values.name ?? [values[z.firstName], values[z.lastName]].map((part) => (part || '').trim()).filter(Boolean).join(' ')
    const email = values.email ?? values[z.email]
    const company = values.company ?? values[z.company]
    const contactKeys = ['name', 'email', 'company', z.email, z.company]
    const details = form.fields
      .filter((field) => !contactKeys.includes(field.name))
      .map((field) => `${field.label}: ${values[field.name] || 'Not provided'}`)

    try {
      await submitContact({
        name,
        email,
        company,
        region: 'zw',
        source: `${form.source} – ${activeIntent?.value || 'consultation'}`,
        message: [`${form.source} enquiry: ${activeIntent?.label || form.button}`, '', ...details].join('\n'),
      })
      setValues(emptyValues(form.fields))
      setStatus({ submitting: false, error: '', success: form.success || 'Thank you. Our team will be in touch shortly.' })
    } catch (error) {
      setStatus({
        submitting: false,
        error: error?.error?.message || error?.message || 'Submission failed. Please try again.',
        success: '',
      })
    }
  }

  return (
    <form
      className="ms-form"
      id="enquire"
      onSubmit={handleSubmit}
      {...(form.zoho
        ? { action: form.zoho.action, method: 'POST', encType: 'multipart/form-data', acceptCharset: 'UTF-8' }
        : {})}
    >
      {form.zoho ? (
        <>
          <input type="hidden" name="zf_referrer_name" value={form.zoho.referrer || ''} />
          <input type="hidden" name="zf_redirect_url" value={redirectUrl} />
          <input type="hidden" name="zc_gad" value="" />
        </>
      ) : null}
      <h2>{form.heading}</h2>
      {form.intro ? <p className="ms-form__intro">{form.intro}</p> : null}

      {form.intents?.length > 1 && form.showIntentSelect !== false ? (
        <label className="ms-form__wide">
          <span>What would you like? <em aria-hidden="true">*</em></span>
          <select value={activeIntent.value} onChange={(event) => setIntent(event.target.value)} disabled={status.submitting}>
            {form.intents.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      ) : null}

      {layoutFields(form.fields).map((field) => (
        <Field disabled={status.submitting} field={field} key={field.name} onChange={update} value={values[field.name]} />
      ))}

      {status.error ? <div className="sx-form__status sx-form__status--error">{status.error}</div> : null}
      {status.success ? <div className="sx-form__status sx-form__status--success">{status.success}</div> : null}

      <button className="hx-btn hx-btn--primary ms-form__submit" type="submit" disabled={status.submitting}>
        {status.submitting || zohoSending ? 'Sending…' : <>{activeIntent?.button || form.button} <span aria-hidden="true">→</span></>}
      </button>
      <p className="ms-form__privacy">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="10.5" width="12" height="9" rx="2" fill="currentColor" />
          <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        We respect your privacy. Your information will only be used to respond to your enquiry.
      </p>
    </form>
  )
}

function Head({ eyebrow, heading, intro, light }) {
  return (
    <>
      {eyebrow ? <p className={`ms-eyebrow${light ? ' ms-eyebrow--light' : ''}`}>{eyebrow}</p> : null}
      {heading ? <h2>{heading}</h2> : null}
      {intro ? <p className="ms-section__intro">{intro}</p> : null}
    </>
  )
}

function gridColumns(count) {
  if (count >= 6) return 3
  return Math.max(1, Math.min(count, 5))
}

export default function LandingPage({ config }) {
  const { hero, form, challenge, solution, included, features, spotlight, extra, process, results, logos, related, faq, final, assessment } = config
  const [intent, setIntent] = useState(form.intents?.[0]?.value)
  const [openFaq, setOpenFaq] = useState(0)
  const ctaProps = { assessment, setIntent }
  const detailedChallenges = challenge?.cards.some((card) => card.solution)

  return (
    <div className="ms">
      <section className={`ms-hero${hero.image ? '' : ' ms-hero--plain'}`}>
        <div className="site-container ms-hero__grid">
          <div className="ms-hero__copy">
            {hero.breadcrumbs?.length ? (
              <nav aria-label="Breadcrumb" className="sx-breadcrumbs">
                <Link href="/">Home</Link>
                {hero.breadcrumbs.map((crumb, index) => {
                  const last = index === hero.breadcrumbs.length - 1
                  return (
                    <span key={`${crumb.label}-${index}`}>
                      <span aria-hidden="true" className="sx-breadcrumbs__sep">/</span>
                      {last || !crumb.href ? <span aria-current={last ? 'page' : undefined}>{crumb.label}</span> : <Link href={crumb.href}>{crumb.label}</Link>}
                    </span>
                  )
                })}
              </nav>
            ) : null}
            {hero.eyebrow ? <p className="ms-eyebrow">{hero.eyebrow}</p> : null}
            <h1>
              {hero.titleLead}
              {hero.titleAccent ? <> <span>{hero.titleAccent}</span></> : null}
            </h1>
            {hero.subtitle ? <p className="ms-hero__lede">{hero.subtitle}</p> : null}
            {hero.benefits?.length ? (
              <ul className="ms-hero__strip">
                {hero.benefits.map((item, index) => (
                  <li key={item.title}>
                    <LandingIcon name={item.icon || iconCycle[index % iconCycle.length]} tone="plain" />
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {hero.image ? (
            <div className="ms-hero__bg" aria-hidden="true">
              <img src={hero.image} alt="" style={hero.imagePosition ? { objectPosition: hero.imagePosition } : undefined} />
            </div>
          ) : null}

          {hero.samples?.length ? (
            <div className="ms-hero__samples" aria-hidden="true">
              {hero.samples.map((sample) => (
                <figure className={`ms-sample ms-sample--${sample.kind}`} key={sample.title}>
                  <figcaption>{sample.title}</figcaption>
                  {sample.kind === 'text' ? (
                    <div className="ms-sample__tags">
                      {sample.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                  ) : (
                    <div className="ms-sample__media">
                      <img src={sample.image} alt="" />
                      {sample.boxes?.map((box) => (
                        <span className="ms-sample__box" key={box.label} style={{ left: box.x, top: box.y, width: box.w, height: box.h }}>
                          <em>{box.label}</em>
                        </span>
                      ))}
                    </div>
                  )}
                </figure>
              ))}
            </div>
          ) : null}

          <EnquiryForm form={form} intent={intent} setIntent={setIntent} />
        </div>
      </section>

      {hero.trust?.length ? (
        <section className="ms-truststrip" aria-label="Why teams choose us">
          <ul className="site-container">
            {hero.trust.map((item, index) => (
              <li key={item.label}>
                <LandingIcon name={item.icon || iconCycle[index % iconCycle.length]} tone="plain" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {challenge ? (
        <section className="ms-challenge" id="challenges">
          <div className={`site-container${detailedChallenges ? '' : ' ms-challenge__grid'}`}>
            <div className={detailedChallenges ? 'ms-challenge__head' : undefined}>
              <p className="ms-eyebrow">{challenge.eyebrow || 'The challenge'}</p>
              <h2>{challenge.heading}</h2>
              {challenge.intro ? <p>{challenge.intro}</p> : null}
            </div>
            {detailedChallenges ? (
              <div className="ms-details">
                {challenge.cards.map((card, index) => (
                  <article className="ms-detail" key={card.title}>
                    <div className="ms-detail__problem">
                      <LandingIcon name={card.icon || iconCycle[index % iconCycle.length]} />
                      <h3>{card.title}</h3>
                      {card.problem ? <p>{card.problem}</p> : null}
                    </div>
                    <div className="ms-detail__answer">
                      <p className="sx-label">{challenge.solutionLabel || 'How we solve it'}</p>
                      <p>{card.solution}</p>
                      {card.benefit ? (
                        <p className="ms-detail__benefit">
                          <span className="hx-check" aria-hidden="true">
                            <svg viewBox="0 0 24 24"><path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </span>
                          <span>{card.benefit}</span>
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <ul className="ms-challenge__cards" style={{ '--cols': Math.min(challenge.cards.length, 4) }}>
                {challenge.cards.map((card, index) => (
                  <li key={card.title}>
                    <LandingIcon name={card.icon || iconCycle[index % iconCycle.length]} />
                    <span>{card.title}</span>
                    {card.text ? <small>{card.text}</small> : null}
                  </li>
                ))}
              </ul>
            )}
            <TextCta link={challenge.link} {...ctaProps} />
          </div>
        </section>
      ) : null}

      {solution ? (
        <section className="ms-solution">
          {solution.image || solution.widget ? (
            <div className={`ms-solution__media${solution.widget ? ' ms-solution__media--node' : ''}`} aria-hidden="true">
              {solution.widget ? <Widget name={solution.widget} /> : <img src={solution.image} alt="" />}
            </div>
          ) : null}
          <div className="site-container">
            <div className="ms-solution__copy">
              <p className="ms-eyebrow">{solution.eyebrow || 'The solution'}</p>
              <h2>{solution.heading}</h2>
              <p>{solution.body}</p>
              <Cta className="hx-btn ms-btn--navy" cta={solution.cta} {...ctaProps} />
            </div>
          </div>
        </section>
      ) : null}

      {included ? (
        <section className="ms-section" id={included.id || 'included'}>
          <div className="site-container">
            <Head eyebrow={included.eyebrow || 'What’s included'} heading={included.heading} intro={included.intro} />
            <div className="ms-pillars" style={{ '--cols': gridColumns(included.pillars.length) }}>
              {included.pillars.map((pillar, index) => {
                const body = (
                  <>
                    <LandingIcon name={pillar.icon || iconCycle[index % iconCycle.length]} />
                    {pillar.label ? <p className="sx-label ms-pillar__label">{pillar.label}</p> : null}
                    <h3>{pillar.title}</h3>
                    {pillar.outcome ? <p>{pillar.outcome}</p> : null}
                    {pillar.items?.length ? (
                      <ul>
                        {pillar.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    ) : null}
                    {pillar.href ? <span className="hx-link ms-pillar__link">Find out more <span aria-hidden="true">→</span></span> : null}
                  </>
                )
                return pillar.href ? (
                  <Link className="ms-pillar ms-pillar--link" href={pillar.href} key={pillar.title}>{body}</Link>
                ) : (
                  <article className="ms-pillar" key={pillar.title}>{body}</article>
                )
              })}
            </div>
            <TextCta link={included.link} {...ctaProps} />
          </div>
        </section>
      ) : null}

      {features ? (
        <section className="ms-section ms-section--tight" id={features.id || 'features'}>
          <div className="site-container">
            <Head eyebrow={features.eyebrow} heading={features.heading} intro={features.intro} />
            <div className="ms-features">
              {features.cards.map((card, index) => (
                <article className="ms-feature" key={card.title}>
                  <LandingIcon name={card.icon || iconCycle[index % iconCycle.length]} tone="plain" />
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                    {card.cta ? <Cta className="hx-link ms-feature__cta" cta={card.cta} {...ctaProps} /> : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {spotlight && spotlight.cards.length === 1 ? (
        <section className="ms-hc-callout" id={spotlight.id || 'spotlight'}>
          {spotlight.image ? (
            <div className="ms-hc-callout__media" aria-hidden="true">
              <img
                src={spotlight.image}
                alt=""
                style={spotlight.imagePosition ? { objectPosition: spotlight.imagePosition } : undefined}
              />
            </div>
          ) : null}
          <div className="site-container">
            <div className={`ms-hc-callout__copy${spotlight.image ? '' : ' ms-hc-callout__copy--center'}`}>
              {spotlight.eyebrow ? <p className="ms-eyebrow">{spotlight.eyebrow}</p> : null}
              <h2>{spotlight.heading || spotlight.cards[0].title}</h2>
              {(spotlight.intro || spotlight.cards[0].text) ? (
                <p>{spotlight.intro || spotlight.cards[0].text}</p>
              ) : null}
              {spotlight.cards[0].items?.length ? (
                <ul className="sx-checklist ms-hc-callout__list">
                  {spotlight.cards[0].items.map((item) => (
                    <li key={item}>
                      <span className="hx-check" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {spotlight.cards[0].cta ? (
                <div className="ms-hc-callout__actions">
                  <Cta
                    className={spotlight.cards[0].cta.action === 'assessment' ? 'hx-btn hx-btn--primary' : 'hx-btn ms-btn--navy'}
                    cta={spotlight.cards[0].cta}
                    {...ctaProps}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : spotlight ? (
        <section className="ms-section ms-section--soft" id={spotlight.id || 'spotlight'}>
          <div className="site-container">
            <Head eyebrow={spotlight.eyebrow} heading={spotlight.heading} intro={spotlight.intro} />
            <div
              className="ms-spotlight"
              style={{ '--cols': gridColumns(spotlight.cards.length) }}
            >
              {spotlight.cards.map((card, index) => (
                <article className="ms-spotlight__card" key={card.title}>
                  <LandingIcon name={card.icon || iconCycle[index % iconCycle.length]} tone="blue" />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  {card.items?.length ? (
                    <ul className="sx-checklist">
                      {card.items.map((item) => (
                        <li key={item}>
                          <span className="hx-check" aria-hidden="true">
                            <svg viewBox="0 0 24 24"><path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {card.cta ? (
                    <Cta
                      className={card.cta.action === 'assessment' ? 'hx-btn hx-btn--primary ms-spotlight__cta' : 'hx-link ms-spotlight__cta'}
                      cta={card.cta}
                      {...ctaProps}
                    />
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {extra ? <Widget name={extra} /> : null}

      {process ? (
        <section className="ms-section ms-section--tight solution-anchor" id="how-it-works">
          <div className="site-container">
            <Head eyebrow={process.eyebrow || 'How it works'} heading={process.heading} intro={process.intro} />
            <ol className="ms-steps">
              {process.steps.map(([title, text], index) => (
                <li key={title}>
                  <span className="ms-steps__num">{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            {process.note ? <p className="ms-steps__note">{process.note}</p> : null}
            {process.cta ? <div className="ms-steps__cta"><Cta cta={process.cta} {...ctaProps} /></div> : null}
          </div>
        </section>
      ) : null}

      {results ? (
        <section className={`ms-results${results.image ? ' ms-results--photo' : ''}`}>
          {results.image ? (
            <div className="ms-results__photo" aria-hidden="true">
              <img src={results.image} alt="" />
            </div>
          ) : null}
          <div className="site-container ms-results__grid">
            <div>
              <p className="ms-eyebrow ms-eyebrow--light">{results.eyebrow || 'Real results'}</p>
              <h2>{results.heading}</h2>
              {results.body ? <p>{results.body}</p> : null}
              {results.promises?.length ? (
                <dl className="ms-results__promises" style={{ '--cols': Math.min(results.promises.length, 4) }}>
                  {results.promises.map(([title, text]) => (
                    <div key={title}>
                      <dt>{title}</dt>
                      <dd>{text}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
            <aside className="ms-results__card">
              <LandingIcon name={results.cardIcon || 'team'} tone="light" />
              <p>{results.cardText}</p>
              {results.badge ? <img className="ms-results__badge" src={results.badge} alt="ISO 27001 certified" /> : null}
              <Cta cta={results.cta || { label: 'Get a Free Consultation' }} {...ctaProps} />
            </aside>
          </div>
        </section>
      ) : null}

      {logos !== false ? (
        <section className="ms-section ms-section--tight">
          <div className="site-container">
            <Head eyebrow={logos?.eyebrow || 'Who we work with'} heading={logos?.heading || 'Trusted by Growing Businesses'} />
            <div className="ms-logos">
              {(logos?.images || defaultLogos).map((logo) => <img alt="OmniContact client" key={logo} src={logo} />)}
            </div>
          </div>
        </section>
      ) : null}

      {related?.items?.length ? (
        <section className="ms-section ms-section--tight">
          <div className="site-container">
            <Head eyebrow={related.eyebrow} heading={related.heading} />
            <div className="sx-related__grid ms-related">
              {related.items.map((item) => (
                <Link className="sx-card sx-card--link" href={item.href} key={item.href}>
                  <p className="sx-label">{related.label}</p>
                  <h3>{item.title}</h3>
                  {item.subtitle ? <p>{item.subtitle}</p> : null}
                  <span className="hx-link">View page <span aria-hidden="true">→</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {faq?.items?.length ? (
        <section className="ms-section ms-section--soft solution-anchor" id="faq">
          <div className="site-container">
            <Head eyebrow={faq.eyebrow || 'Frequently asked questions'} heading={faq.heading || 'Got Questions? We’ve Got Answers.'} />
            <div className="ms-faq">
              {faq.items.map(([question, answer], index) => {
                const open = openFaq === index
                return (
                  <article className={`sx-faq__item${open ? ' is-open' : ''}`} key={question}>
                    <button aria-expanded={open} className="sx-faq__question" onClick={() => setOpenFaq(open ? -1 : index)} type="button">
                      <h3>{question}</h3>
                      <span aria-hidden="true" className="sx-faq__icon" />
                    </button>
                    {open ? <p className="sx-faq__answer">{answer}</p> : null}
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className={`ms-final${final.tone === 'navy' ? ' ms-final--navy' : ''}`}>
        {final.image ? (
          <div className="ms-final__media" aria-hidden="true">
            <img src={final.image} alt="" />
          </div>
        ) : null}
        <div className="site-container">
          <div className={`ms-final__copy${final.image ? '' : ' ms-final__copy--center'}`}>
            <p className="ms-eyebrow">{final.eyebrow || 'Let’s grow together'}</p>
            <h2>{final.heading}</h2>
            {final.body ? <p>{final.body}</p> : null}
            <div className="ms-final__actions">
              <Cta className={final.tone === 'navy' ? 'hx-btn ms-btn--white' : 'hx-btn ms-btn--navy'} cta={final.primary} {...ctaProps} />
              <Cta arrow={false} className="hx-btn hx-btn--outline" cta={final.secondary} {...ctaProps} />
            </div>
            {final.alt ? (
              <p className="ms-final__alt">
                {final.alt.lead}{' '}
                <Cta className="hx-link" cta={final.alt} {...ctaProps} />
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
