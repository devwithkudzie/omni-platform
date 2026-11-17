import { solutionCategoryPages, solutionChildPages } from '@/features/solutions/data/solutions'

// Turns the existing solution, category and industry page data into a
// LandingPage config, so every page shares the Marketing as a Service layout.

const commitments = [
  ['Trained delivery teams', 'People who know your sector, tools and customers'],
  ['Agreed service levels', 'Targets set with you before go-live'],
  ['Weekly reporting', 'Quality, speed and outcomes you can see'],
  ['ISO 27001 certified', 'Secure, audited operations'],
]

const categoryOptions = Object.values(solutionCategoryPages).map((category) => category.title)

function consultationForm({ source, serviceOptions, defaultService }) {
  return {
    heading: 'Get a Free Consultation',
    intro: 'Tell us what you need. Our team will be in touch with a tailored recommendation.',
    source,
    button: 'Get My Free Consultation',
    intents: [{ value: 'consultation', label: 'Get a Free Consultation', button: 'Get My Free Consultation' }],
    fields: [
      { name: 'name', label: 'Full Name', required: true, placeholder: 'Your full name' },
      { name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'you@company.com' },
      { name: 'company', label: 'Company Name', required: true, placeholder: 'Your company' },
      { name: 'service', label: 'Service Interest', type: 'select', required: true, options: [...serviceOptions, 'Not sure yet'], default: defaultService },
    ],
  }
}

function toBenefits(pairs = []) {
  return pairs.slice(0, 3).map(([title, text]) => ({ title, text }))
}

function toMetrics(stats = []) {
  return stats.slice(0, 3).map(([value, label]) => ({ value, label }))
}

function assessmentOf(page) {
  return { context: page.assessmentContext, goal: page.assessmentGoal }
}

function finalSection(page) {
  return {
    eyebrow: 'Next step',
    heading: page.cta?.heading || `Ready to get started with ${page.title}?`,
    body: page.cta?.text,
    image: '/landing_pages/customer-experience.jpg',
    primary: { label: 'Get a Free Consultation' },
    secondary: { label: 'Contact Us', href: '/contact' },
    alt: { lead: 'Not ready to talk yet?', label: page.assessmentContext?.cta || 'Take the free assessment', action: 'assessment' },
  }
}

function resultsSection(heading, body, promises) {
  return {
    eyebrow: 'Why OmniContact',
    heading,
    body,
    promises,
    cardText: 'Start with a free 30-minute consultation. We’ll map your goals and recommend the right delivery model.',
    badge: '/trust/iso-27001.png',
  }
}

export function buildServiceLanding(page, { breadcrumbs, related, relatedEyebrow, relatedHeading, relatedLabel } = {}) {
  const isIndustry = Boolean(page.offerings)
  const siblings = isIndustry
    ? []
    : Object.values(solutionChildPages[page.categorySlug] || {}).filter((item) => item.slug)

  const relatedItems = related || siblings
    .filter((item) => item.slug !== page.slug)
    .slice(0, 3)
    .map((item) => ({ title: item.title, subtitle: item.subtitle, href: item.href }))

  return {
    assessment: assessmentOf(page),
    hero: {
      breadcrumbs: breadcrumbs || [
        { label: 'Solutions', href: '/solutions/ai-technology-solutions' },
        { label: page.parentTitle, href: page.parentHref },
        { label: page.title },
      ],
      eyebrow: page.parentTitle,
      titleLead: page.title,
      subtitle: page.subtitle,
      benefits: toBenefits(isIndustry ? page.intro.outcomes.map(([title, detail]) => [title, detail.charAt(0).toUpperCase() + detail.slice(1)]) : page.outcomes),
      image: page.image,
      metrics: toMetrics(page.stats),
    },
    form: consultationForm({
      source: page.title,
      serviceOptions: isIndustry ? categoryOptions : siblings.map((item) => item.title),
      defaultService: isIndustry ? '' : page.title,
    }),
    solution: {
      eyebrow: 'Overview',
      heading: page.intro.heading,
      body: page.intro.body,
      image: page.secondaryImage || page.image,
      cta: { label: 'See How It Works', href: '#how-it-works' },
    },
    included: isIndustry
      ? {
          heading: page.offerings.heading,
          intro: page.offerings.subheading,
          pillars: page.offerings.items.map(([label, title, outcome, items]) => ({ label, title, outcome, items })),
          link: { lead: 'Want to see where you stand first?', label: page.assessmentContext?.cta || 'Take the free assessment', action: 'assessment' },
        }
      : {
          heading: `What ${page.title} Covers`,
          pillars: page.focusAreas.map(([title, outcome]) => ({ title, outcome })),
          link: { lead: 'Want to see where you stand first?', label: page.assessmentContext?.cta || 'Take the free assessment', action: 'assessment' },
        },
    process: page.engagement?.length
      ? { heading: 'How We Work With Your Team', steps: page.engagement }
      : null,
    results: isIndustry
      ? resultsSection(page.trust.heading, page.trust.description, page.differentiators)
      : resultsSection('Delivery You Can Rely On', page.quote?.text, commitments),
    related: relatedItems.length
      ? { eyebrow: relatedEyebrow || 'Related services', heading: relatedHeading || 'Other ways teams work with us', label: relatedLabel || 'Related service', items: relatedItems }
      : null,
    faq: page.faqs?.length ? { items: page.faqs } : null,
    final: finalSection(page),
  }
}

export function buildCategoryLanding(page, { breadcrumbs, cardLabel = 'Service' } = {}) {
  return {
    assessment: assessmentOf(page),
    hero: {
      breadcrumbs: breadcrumbs || [
        { label: 'Solutions', href: '/solutions/ai-technology-solutions' },
        { label: page.title },
      ],
      eyebrow: page.eyebrow,
      titleLead: page.title,
      subtitle: page.subtitle,
      benefits: toBenefits(page.outcomes),
      image: page.image,
      metrics: toMetrics(page.stats),
    },
    form: consultationForm({
      source: page.title,
      serviceOptions: page.capabilities.map(([title]) => title),
      defaultService: '',
    }),
    solution: {
      eyebrow: 'Overview',
      heading: page.intro.heading,
      body: page.intro.body,
      image: page.secondaryImage || page.image,
      cta: { label: 'Explore the Services', href: '#included' },
    },
    included: {
      eyebrow: cardLabel === 'Industry' ? 'Industries we serve' : 'Services',
      heading: cardLabel === 'Industry' ? 'Sectors We Support' : `${page.title} Services`,
      pillars: page.capabilities.map(([title, outcome, href]) => ({ title, outcome, href })),
    },
    process: page.engagement?.length ? { heading: 'How We Work With Your Team', steps: page.engagement } : null,
    results: resultsSection('Delivery You Can Rely On', page.quote?.text, commitments),
    faq: page.faqs?.length ? { items: page.faqs } : null,
    final: finalSection(page),
  }
}
