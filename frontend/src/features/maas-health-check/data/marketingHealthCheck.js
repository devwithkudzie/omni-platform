export const MARKETING_HEALTH_EVENT = 'omni:open-marketing-health-check'

/** Max points across the short Health Check (5 questions × 3). */
export const MAX_TOTAL_POINTS = 15
/** Max points per pillar (one question each). */
export const MAX_PILLAR_POINTS = 3

export const pillars = [
  {
    id: 'strategy',
    label: 'Strategy & Direction',
    tip: 'Agree clear goals, an audience focus and a simple monthly marketing plan that the team can follow.',
  },
  {
    id: 'visibility',
    label: 'Visibility & Reach',
    tip: 'Improve discoverability with consistent channel presence, clearer messaging and better audience targeting.',
  },
  {
    id: 'leads',
    label: 'Lead Generation & Conversion',
    tip: 'Tighten lead capture, response times and follow-up so interest turns into tracked sales opportunities.',
  },
  {
    id: 'content',
    label: 'Content & Engagement',
    tip: 'Create customer-focused content with clear calls to action, and measure what converts engagement into enquiries.',
  },
  {
    id: 'measurement',
    label: 'Measurement & Optimisation',
    tip: 'Track leads and conversions monthly, then use those numbers to improve campaigns and budget decisions.',
  },
]

// Five strongest diagnostic questions — one per marketing pillar.
export const questions = [
  {
    id: 'q1',
    pillar: 'strategy',
    prompt: 'Does your business have a clear digital marketing plan?',
    options: [
      { key: 'A', label: 'Yes, with clear goals and regular reviews', score: 3 },
      { key: 'B', label: 'We have a plan but do not always follow it', score: 2 },
      { key: 'C', label: 'We do marketing activities without a clear plan', score: 1 },
      { key: 'D', label: 'We do not currently have a marketing plan', score: 0 },
    ],
  },
  {
    id: 'q2',
    pillar: 'visibility',
    prompt: 'How easy is it for potential customers to find your business online?',
    options: [
      { key: 'A', label: 'Very easy, across relevant channels', score: 3 },
      { key: 'B', label: 'Fairly easy, but we could improve', score: 2 },
      { key: 'C', label: 'Difficult unless someone knows our name', score: 1 },
      { key: 'D', label: 'We have very little online visibility', score: 0 },
    ],
  },
  {
    id: 'q3',
    pillar: 'leads',
    prompt: 'How consistently does digital marketing generate new business enquiries?',
    options: [
      { key: 'A', label: 'Regularly, with a predictable flow', score: 3 },
      { key: 'B', label: 'Some enquiries, but results are inconsistent', score: 2 },
      { key: 'C', label: 'Very few enquiries', score: 1 },
      { key: 'D', label: 'We do not generate or track digital enquiries', score: 0 },
    ],
  },
  {
    id: 'q4',
    pillar: 'content',
    prompt: 'How well does your content speak to customer needs?',
    options: [
      { key: 'A', label: 'It clearly addresses customer problems and solutions', score: 3 },
      { key: 'B', label: 'Some content is customer-focused', score: 2 },
      { key: 'C', label: 'Most content is about our products or company', score: 1 },
      { key: 'D', label: 'We rarely create marketing content', score: 0 },
    ],
  },
  {
    id: 'q5',
    pillar: 'measurement',
    prompt: 'How well do you know which marketing activities deliver results?',
    options: [
      { key: 'A', label: 'We regularly track leads, conversions and performance', score: 3 },
      { key: 'B', label: 'We track some results but not consistently', score: 2 },
      { key: 'C', label: 'We mainly track likes, views or visits', score: 1 },
      { key: 'D', label: 'We do not measure marketing performance', score: 0 },
    ],
  },
]

export function scoreCategory(score) {
  if (score >= 80) return { label: 'Strong Foundation', message: 'Good base; optimise and scale.' }
  if (score >= 60) return { label: 'Developing', message: 'Some gaps affecting consistency.' }
  if (score >= 40) return { label: 'Needs Attention', message: 'Important gaps may limit growth.' }
  return { label: 'High Priority', message: 'A structured marketing approach is needed.' }
}

/** UX status bands aligned with backend MarketingHealthCheck::healthStatus(). */
export function healthStatus(score) {
  if (score >= 80) {
    return {
      key: 'healthy',
      label: 'Healthy',
      explanation: 'Your digital marketing foundation is in good shape. Keep refining what works and scale the channels that already convert.',
    }
  }
  if (score >= 40) {
    return {
      key: 'needs_improvement',
      label: 'Needs Improvement',
      explanation: 'Your digital marketing has room for improvement. Closing a few focused gaps should make lead flow and measurement more consistent.',
    }
  }
  return {
    key: 'poor',
    label: 'Poor',
    explanation: 'Your current digital marketing approach needs a structured reset. Prioritise a clear plan, lead capture and basic performance tracking.',
  }
}

export function calculateMarketingHealth(answers = {}) {
  const answered = questions.every((question) => answers[question.id] !== undefined && answers[question.id] !== '')
  if (!answered) {
    throw new Error('All questions must be answered before scoring.')
  }

  const responseSummary = questions.map((question) => {
    const selected = question.options.find((option) => option.key === answers[question.id])
    return {
      id: question.id,
      prompt: question.prompt,
      pillar: question.pillar,
      answerKey: selected?.key,
      answer: selected?.label,
      score: selected?.score ?? 0,
    }
  })

  const totalPoints = responseSummary.reduce((sum, item) => sum + item.score, 0)
  const overallScore = Math.round((totalPoints / MAX_TOTAL_POINTS) * 100)

  const pillarScores = pillars.map((pillar) => {
    const points = responseSummary
      .filter((item) => item.pillar === pillar.id)
      .reduce((sum, item) => sum + item.score, 0)
    return {
      id: pillar.id,
      label: pillar.label,
      tip: pillar.tip,
      points,
      score: Math.round((points / MAX_PILLAR_POINTS) * 100),
    }
  })

  const weakest = [...pillarScores].sort((a, b) => a.score - b.score || a.label.localeCompare(b.label)).slice(0, 2)
  let strengths = [...pillarScores]
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .filter((pillar) => pillar.score >= 67)
  if (!strengths.length) strengths = [...pillarScores].sort((a, b) => b.score - a.score).slice(0, 1)

  const category = scoreCategory(overallScore)
  const status = healthStatus(overallScore)

  return {
    overallScore,
    maxScore: 100,
    totalPoints,
    maxPoints: MAX_TOTAL_POINTS,
    category: category.label,
    categoryMessage: category.message,
    healthStatus: status.label,
    healthStatusKey: status.key,
    explanation: status.explanation,
    pillarScores,
    strengths,
    weakest,
    recommendations: weakest.map((pillar) => pillar.tip),
    responses: responseSummary,
  }
}

export function normalizeHealthResult(raw) {
  if (!raw || typeof raw !== 'object') return null
  const overallScore = Number(raw.overallScore)
  if (!Number.isFinite(overallScore)) return null

  const status = healthStatus(overallScore)
  return {
    overallScore,
    maxScore: Number(raw.maxScore) || 100,
    totalPoints: raw.totalPoints ?? null,
    maxPoints: Number(raw.maxPoints) || MAX_TOTAL_POINTS,
    category: raw.category || scoreCategory(overallScore).label,
    categoryMessage: raw.categoryMessage || scoreCategory(overallScore).message,
    healthStatus: raw.healthStatus || status.label,
    healthStatusKey: raw.healthStatusKey || status.key,
    explanation: raw.explanation || status.explanation,
    pillarScores: Array.isArray(raw.pillarScores) ? raw.pillarScores : [],
    strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
    weakest: Array.isArray(raw.weakest) ? raw.weakest : [],
    recommendations: Array.isArray(raw.recommendations) ? raw.recommendations : [],
  }
}

export function needsImprovementCta(result) {
  const key = result?.healthStatusKey
  if (key === 'healthy') {
    return {
      showContact: true,
      message: 'Your digital marketing looks healthy. If you want help scaling what already works, our team is ready to support you.',
    }
  }
  return {
    showContact: true,
    message: 'Your digital marketing has room for improvement. Let’s help you turn things around.',
  }
}

export function buildHealthCheckPayload({ lead, scored }) {
  return {
    firstName: lead.firstName.trim(),
    lastName: lead.lastName.trim(),
    // The backend and notification emails still use the combined name.
    name: [lead.firstName.trim(), lead.lastName.trim()].filter(Boolean).join(' '),
    email: lead.email.trim(),
    company: lead.company.trim(),
    region: 'zw',
    source: 'MaaS Digital Marketing Health Check',
    message: [
      'Digital Marketing Health Check submitted.',
      '',
      `Overall score: ${scored.overallScore}/100 (${scored.category})`,
      `Health status: ${scored.healthStatus}`,
      `Category message: ${scored.categoryMessage}`,
      '',
      'Pillar scores:',
      ...scored.pillarScores.map((pillar) => `- ${pillar.label}: ${pillar.score}/100`),
      '',
      'Weakest areas:',
      ...scored.weakest.map((pillar) => `- ${pillar.label}: ${pillar.tip}`),
      '',
      lead.challenge ? `Biggest marketing challenge: ${lead.challenge}` : 'Biggest marketing challenge: Not provided',
      `Marketing consent: ${lead.marketingConsent ? 'Yes' : 'No'}`,
      '',
      'Responses:',
      ...scored.responses.map((item) => `${item.id.toUpperCase()} (${item.answerKey}): ${item.answer}`),
    ].join('\n'),
    assessmentTitle: 'Digital Marketing Health Check',
    solutionCategory: 'Marketing as a Service',
    specificService: 'Marketing as a Service (MaaS)',
    businessObjective: 'Improve digital marketing performance',
    leadSourceTag: 'MaaS',
    marketingConsent: lead.marketingConsent,
    challenge: lead.challenge.trim(),
    snapshot: {
      ooi: scored.overallScore,
      level: scored.category,
      summary: scored.categoryMessage,
      dimensionScores: scored.pillarScores.map((pillar) => ({
        id: pillar.id,
        label: pillar.label,
        score: pillar.score,
      })),
    },
    responses: scored.responses,
    weakestAreas: scored.weakest,
    timestamp: new Date().toISOString(),
  }
}

export function trackMarketingHealth(eventName, detail = {}) {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: eventName,
    lead_source: 'MaaS',
    assessment_type: 'digital_marketing_health_check',
    ...detail,
  })

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      lead_source: 'MaaS',
      assessment_type: 'digital_marketing_health_check',
      ...detail,
    })
  }
}
