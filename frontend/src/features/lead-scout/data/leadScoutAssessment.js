import countries from 'world-countries'

export const businessGoalOptions = [
  { label: 'Grow Revenue', value: 'grow_revenue', shortLabel: 'Grow Revenue', icon: 'REV' },
  { label: 'Improve Customer Experience', value: 'improve_customer_experience', shortLabel: 'Improve Customer Experience', icon: 'CX' },
  { label: 'Improve Operational Efficiency', value: 'improve_operational_efficiency', shortLabel: 'Improve Operational Efficiency', icon: 'OPS' },
  { label: 'Reduce Operating Costs', value: 'reduce_operating_costs', shortLabel: 'Reduce Operating Costs', icon: 'COST' },
  { label: 'Introduce AI into the Business', value: 'introduce_ai', shortLabel: 'Introduce AI into the Business', icon: 'AI' },
  { label: 'Improve Decision Making & Reporting', value: 'improve_decision_reporting', shortLabel: 'Improve Decision Making & Reporting', icon: 'BI' },
  { label: 'Improve Workforce Performance', value: 'improve_workforce_performance', shortLabel: 'Improve Workforce Performance', icon: 'TEAM' },
  { label: 'Scale Operations', value: 'scale_operations', shortLabel: 'Scale Operations', icon: 'SCALE' },
  { label: 'Modernize Business Processes', value: 'modernize_business_processes', shortLabel: 'Modernize Business Processes', icon: 'FLOW' },
  { label: "I'm not sure", value: 'unsure', shortLabel: "I'm not sure", icon: '?' },
]

export const priorityOptions = [
  { label: 'Reduce costs', value: 'reduce_costs', dimensions: ['operations', 'digital'] },
  { label: 'Improve service quality', value: 'service_quality', dimensions: ['cx', 'workforce'] },
  { label: 'Increase productivity', value: 'productivity', dimensions: ['operations', 'ai'] },
  { label: 'Better customer experience', value: 'customer_experience', dimensions: ['cx'] },
  { label: 'AI adoption', value: 'ai_adoption', dimensions: ['ai'] },
  { label: 'Automation', value: 'automation', dimensions: ['digital', 'ai'] },
  { label: 'Business Intelligence', value: 'business_intelligence', dimensions: ['data'] },
  { label: 'Recruitment', value: 'recruitment', dimensions: ['workforce'] },
  { label: 'Customer Support', value: 'customer_support', dimensions: ['cx', 'operations'] },
  { label: 'Compliance', value: 'compliance', dimensions: ['data', 'digital'] },
  { label: 'Scalability', value: 'scalability', dimensions: ['operations', 'workforce'] },
]

export const dimensionWeights = {
  cx: 0.2,
  operations: 0.2,
  ai: 0.2,
  workforce: 0.15,
  data: 0.15,
  digital: 0.1,
}

export const snapshotQuestions = [
  {
    id: 'cx',
    dimension: 'cx',
    dimensionLabel: 'Customer Experience',
    type: 'single',
    prompt: 'How easy is it for customers to interact with your organization?',
    options: [
      { label: 'Excellent', value: 'excellent', score: 100, description: 'Frictionless, consistent access across channels' },
      { label: 'Good', value: 'good', score: 80, description: 'Generally easy, with a few gaps' },
      { label: 'Needs Improvement', value: 'needs_improvement', score: 60, description: 'Customers experience some avoidable friction' },
      { label: 'Poor', value: 'poor', score: 40, description: 'Access and response times are inconsistent' },
      { label: 'Not Sure', value: 'not_sure', score: 50, description: 'Customer effort is not measured clearly' },
    ],
  },
  {
    id: 'operations',
    dimension: 'operations',
    dimensionLabel: 'Operational Efficiency',
    type: 'single',
    prompt: 'Where do delays occur most often?',
    options: [
      { label: 'Customer Support', value: 'customer_support', score: 60, service: 'Contact Centre Services', description: 'Response queues or service handoffs' },
      { label: 'Sales', value: 'sales', score: 60, service: 'Customer Experience Solutions', description: 'Lead routing, quoting, or follow-up' },
      { label: 'Recruitment', value: 'recruitment', score: 60, service: 'OmniForce Workforce Solutions', description: 'Hiring speed or specialist sourcing' },
      { label: 'Internal Processes', value: 'internal_processes', score: 40, service: 'Business Process Outsourcing', description: 'Manual work or fragmented workflows' },
      { label: 'Reporting', value: 'reporting', score: 40, service: 'Business Intelligence & Analytics', description: 'Slow insight and leadership visibility' },
      { label: 'Approvals', value: 'approvals', score: 40, service: 'Digital Transformation Services', description: 'Decision bottlenecks and handoffs' },
      { label: 'Unsure', value: 'unsure', score: 50, service: 'Managed Services', description: 'The constraint is not yet clearly visible' },
    ],
  },
  {
    id: 'ai',
    dimension: 'ai',
    dimensionLabel: 'AI Readiness',
    type: 'single',
    prompt: 'How is AI currently used?',
    options: [
      { label: 'Across multiple departments', value: 'multiple_departments', score: 100, description: 'AI is part of day-to-day operations' },
      { label: 'Several teams', value: 'several_teams', score: 80, description: 'AI is adopted in meaningful pockets' },
      { label: 'One pilot', value: 'one_pilot', score: 60, description: 'Early experiments are underway' },
      { label: 'Planning', value: 'planning', score: 40, description: 'Use cases are being explored' },
      { label: 'Not using AI', value: 'not_using', score: 20, description: 'AI is not yet active in operations' },
    ],
  },
  {
    id: 'data',
    dimension: 'data',
    dimensionLabel: 'Data Intelligence',
    type: 'single',
    prompt: 'How do leaders make operational decisions?',
    options: [
      { label: 'Real-time dashboards', value: 'real_time', score: 100, description: 'Leaders have current operational visibility' },
      { label: 'Weekly dashboards', value: 'weekly', score: 80, description: 'Reporting is frequent and structured' },
      { label: 'Monthly reports', value: 'monthly', score: 60, description: 'Insight exists, but may lag decisions' },
      { label: 'Mostly spreadsheets', value: 'spreadsheets', score: 40, description: 'Reporting is manual or fragmented' },
      { label: 'Limited visibility', value: 'limited', score: 20, description: 'Decisions rely on incomplete information' },
    ],
  },
  {
    id: 'workforce',
    dimension: 'workforce',
    dimensionLabel: 'Workforce Readiness',
    type: 'single',
    prompt: 'Which best describes your workforce?',
    options: [
      { label: 'Fully staffed', value: 'fully_staffed', score: 100, description: 'Capacity is aligned to demand' },
      { label: 'Occasional shortages', value: 'occasional_shortages', score: 80, description: 'Shortfalls happen but are manageable' },
      { label: 'Frequent recruitment', value: 'frequent_recruitment', score: 60, description: 'Hiring needs are recurring' },
      { label: 'High turnover', value: 'high_turnover', score: 40, description: 'Retention affects continuity' },
      { label: 'Need specialist skills', value: 'specialist_skills', score: 60, description: 'Capabilities are needed in focused areas' },
    ],
  },
  {
    id: 'digital',
    dimension: 'digital',
    dimensionLabel: 'Digital Maturity',
    type: 'single',
    prompt: 'How digital are your core business processes?',
    options: [
      { label: 'Highly automated', value: 'highly_automated', score: 100, description: 'Core processes are system-led' },
      { label: 'Mostly digital', value: 'mostly_digital', score: 80, description: 'Most workflows are digitized' },
      { label: 'Mixed', value: 'mixed', score: 60, description: 'Digital and manual workflows coexist' },
      { label: 'Mostly manual', value: 'mostly_manual', score: 40, description: 'Manual work remains common' },
      { label: 'Paper-based', value: 'paper_based', score: 20, description: 'Digitization is still early' },
    ],
  },
]

const adaptivePromptMap = {
  grow_revenue: {
    cx: 'How easy is it for new and existing customers to engage with your business?',
    operations: 'Where do you think growth opportunities are most often slowed down?',
    ai: 'How is AI currently used to support sales, service, or growth activity?',
    data: 'How confident are you in your sales pipeline, conversion, and performance reporting?',
    workforce: 'Which best describes the teams supporting growth today?',
    digital: 'How digital are the processes that support customer acquisition and delivery?',
  },
  reduce_operating_costs: {
    cx: 'How much service friction creates avoidable follow-up or rework?',
    operations: 'Which area consumes the most time, budget, or operational effort?',
    ai: 'How is AI currently used to reduce repetitive work?',
    data: 'How clearly can leaders see cost, productivity, and performance trends?',
    workforce: 'Which best describes workforce capacity and utilization today?',
    digital: 'How many core processes still depend on manual work?',
  },
  improve_customer_experience: {
    cx: 'How quickly and consistently do customers receive support?',
    operations: 'Where do customer-facing delays occur most often?',
    ai: 'How is AI currently used to support faster customer interactions?',
    data: 'How clearly do leaders see service quality and customer experience performance?',
    workforce: 'Which best describes your customer-facing workforce today?',
    digital: 'How digital are the processes behind your customer experience?',
  },
  introduce_ai: {
    cx: 'Where could smarter support improve the customer experience most?',
    operations: 'Where would automation remove the most operational friction?',
    ai: 'How is AI currently used across the organization?',
    data: 'How ready is your reporting environment to support AI-assisted decisions?',
    workforce: 'Which best describes team readiness for AI-enabled ways of working?',
    digital: 'How digital are the processes AI would need to connect into?',
  },
  improve_decision_reporting: {
    cx: 'How clearly can you see what customers experience across channels?',
    operations: 'Where does limited visibility slow decisions most often?',
    ai: 'How is AI currently used to surface insights or automate analysis?',
    data: 'How do leaders make operational decisions today?',
    workforce: 'How clearly can you see workforce capacity, productivity, and performance?',
    digital: 'How connected are the systems that produce operational data?',
  },
  improve_workforce_performance: {
    cx: 'How much does workforce performance affect customer experience today?',
    operations: 'Where do staffing or handoff delays occur most often?',
    ai: 'How is AI currently used to support teams and reduce repetitive work?',
    data: 'How clearly can leaders see team performance and productivity?',
    workforce: 'Which best describes your workforce today?',
    digital: 'How digital are the tools your teams use to deliver work?',
  },
  scale_operations: {
    cx: 'How easy would it be for customers to reach you if demand increased?',
    operations: 'Where would scaling create the most operational pressure?',
    ai: 'How is AI currently used to absorb growing work volumes?',
    data: 'How confidently can leaders monitor performance as operations scale?',
    workforce: 'Which best describes workforce scalability today?',
    digital: 'How scalable are your core operating processes?',
  },
  modernize_business_processes: {
    cx: 'How much do current processes affect customer ease and responsiveness?',
    operations: 'Which process area creates the most avoidable delay?',
    ai: 'How is AI currently used in process improvement or automation?',
    data: 'How well do reports show where processes need improvement?',
    workforce: 'Which best describes how teams work within current processes?',
    digital: 'How digital are your core business processes?',
  },
  improve_operational_efficiency: {
    cx: 'How much does operational friction affect customer interactions?',
    operations: 'Where do delays occur most often?',
    ai: 'How is AI currently used to improve operational efficiency?',
    data: 'How do leaders make operational decisions?',
    workforce: 'Which best describes workforce capacity and performance?',
    digital: 'How digital are your core business processes?',
  },
}

export function getOpportunityLabel(value) {
  return businessGoalOptions.find((option) => option.value === value)?.shortLabel || 'your selected opportunity'
}

export function getAdaptiveQuestions(opportunity) {
  const promptSet = adaptivePromptMap[opportunity] || {}
  return snapshotQuestions.map((question) => ({
    ...question,
    prompt: promptSet[question.id] || question.prompt,
  }))
}

export const companySizeOptions = ['1-10', '11-50', '51-200', '201-1000', '1000+']

export const countryOptions = countries
  .map((country) => country.name.common)
  .sort((a, b) => a.localeCompare(b))

export const industryOptions = [
  'Financial Services & Banking',
  'Insurance',
  'Healthcare',
  'Telecommunications',
  'Technology & SaaS',
  'Retail & E-commerce',
  'Travel & Hospitality',
  'Education',
  'Other',
]

export const solutionFamilies = [
  {
    label: 'AI & Technology Solutions',
    value: 'ai_technology_solutions',
    href: '/solutions/ai-technology-solutions',
    services: [
      'Conversational AI & Chatbot Solutions',
      'Software Development',
      'Staff Augmentation',
      'Data Annotation & Labelling',
    ],
    problems: [
      'We want to automate repetitive work',
      'We need a chatbot or virtual assistant',
      'We need a custom system, portal, or integration',
      'We need specialist technology talent',
      'We need data labelling or annotation support',
    ],
  },
  {
    label: 'Customer Experience Solutions',
    value: 'customer_experience_solutions',
    href: '/solutions/customer-experience-solutions',
    services: [
      'Contact Centre Services',
      'Contact Centre Quality & Analytics',
      'Customer Support Services',
      'Omnichannel Customer Engagement',
    ],
    problems: [
      'We need outsourced agents',
      'We have high call or message volumes',
      'We need better response times',
      'We need omnichannel support',
      'We need stronger QA and performance analytics',
    ],
  },
  {
    label: 'Business Process Outsourcing',
    value: 'business_process_outsourcing',
    href: '/solutions/business-process-outsourcing',
    services: [
      'Back Office Processing',
      'Healthcare Administration Support',
      'Claims Processing Support',
      'Impact Sourcing',
    ],
    problems: [
      'Manual admin work is slowing teams down',
      'We need document, data, or records processing',
      'We need healthcare administration support',
      'We need claims intake or processing support',
      'We want an outsourcing model with social impact',
    ],
  },
  {
    label: 'Assessment & Certification Services',
    value: 'assessment_certification_services',
    href: '/solutions/assessment-certification-services',
    services: [
      'Professional Testing',
      'Pearson VUE Testing',
      'Online Proctoring',
      'Skills Assessments',
    ],
    problems: [
      'We need secure exam hosting',
      'We need professional certification support',
      'We need online proctoring',
      'We need candidate administration',
      'We need skills assessment support',
    ],
  },
  {
    label: 'Enterprise Platforms',
    value: 'enterprise_platforms',
    href: '/solutions/enterprise-platforms',
    services: [
      'QA Toolbox',
      'Asset Management System',
      'Recruitment Management System',
      'ARAMS (School Management)',
    ],
    problems: [
      'We need better QA visibility',
      'We need operational dashboards',
      'We need to manage assets better',
      'We need a recruitment management workflow',
      'We need to centralize school administration',
      'We need stronger governance and tracking',
    ],
  },
  {
    label: 'Not sure yet',
    value: 'not_sure',
    href: '/solutions',
    services: ['Help me choose'],
    problems: [
      'We know there is an operational challenge but need guidance',
      'We are comparing outsourcing and technology options',
      'We want OmniContact to recommend the right path',
    ],
  },
]

export const departmentOptions = [
  'Customer Service',
  'Operations',
  'HR',
  'IT',
  'Sales / Marketing',
  'Finance',
  'Executive Leadership',
  'Training / Education',
  'Other',
]

export const timelineOptions = ['Immediately', 'Within 30 days', 'Within 3 months', 'Later / just exploring']

export const followUpOptions = ['Email', 'Phone call', 'Microsoft Teams', 'WhatsApp', 'Discovery call', 'Not sure yet']

export const preferredTimeOptions = ['Morning', 'Afternoon', 'Any time', 'Specific date/time']

export function getOptionLabel(question, value) {
  if (!question) return value
  const values = Array.isArray(value) ? value : [value]
  return question.options.filter((option) => values.includes(option.value)).map((option) => option.label)
}

export const recommendationConfig = {
  data: {
    title: 'Improve reporting and decision intelligence',
    capability: 'Business Intelligence & Analytics',
    outcomes: ['Faster leadership decisions', 'Better operational visibility', 'Improved accountability'],
    initiative: 'Establish executive dashboards and a practical operating rhythm for performance reviews.',
  },
  ai: {
    title: 'Introduce AI into repetitive customer and operational interactions',
    capability: 'AI Solutions',
    outcomes: ['Reduced support workload', 'Faster response times', 'Better customer satisfaction'],
    initiative: 'Identify high-volume use cases for AI assistance, automation, and guided agent support.',
  },
  workforce: {
    title: 'Strengthen workforce planning and specialist capacity',
    capability: 'OmniForce Workforce Solutions',
    outcomes: ['Faster hiring', 'Better staffing flexibility', 'Improved continuity during demand spikes'],
    initiative: 'Create a flexible workforce model aligned to demand, skill needs, and service levels.',
  },
  cx: {
    title: 'Improve customer response times and service consistency',
    capability: 'Customer Experience Solutions',
    outcomes: ['Higher satisfaction', 'Reduced churn risk', 'Stronger service reputation'],
    initiative: 'Review customer contact channels, service levels, and escalation workflows.',
  },
  digital: {
    title: 'Automate repetitive manual processes',
    capability: 'Digital Transformation Services',
    outcomes: ['Lower operating costs', 'Fewer manual errors', 'Faster turnaround'],
    initiative: 'Prioritize workflow digitization where manual effort slows delivery or creates rework.',
  },
  operations: {
    title: 'Reduce delays in operational handoffs',
    capability: 'Business Process Outsourcing',
    outcomes: ['Faster resolution', 'Improved throughput', 'More predictable service delivery'],
    initiative: 'Map the highest-friction workflow and redesign ownership, handoffs, and processing support.',
  },
}

export function getScoreBand(score) {
  if (score >= 85) return 'High-performing organization. Focus on optimization and innovation.'
  if (score >= 70) return 'Strong operational foundation with several high-impact opportunities.'
  if (score >= 55) return 'Moderate maturity. Improvements could significantly enhance performance.'
  if (score >= 40) return 'Significant improvement opportunities are affecting efficiency and customer experience.'
  return 'Transformation recommended. Significant opportunities exist to modernize operations and improve resilience.'
}

function priorityRank(dimension, priorities = []) {
  const matchIndex = priorities.findIndex((priority) => {
    const option = priorityOptions.find((item) => item.value === priority)
    return option?.dimensions?.includes(dimension)
  })
  return matchIndex === -1 ? 99 : matchIndex
}

export function buildSnapshotReport(answers = {}, profile = {}, priorities = []) {
  const dimensionScores = snapshotQuestions.map((question) => {
    const selected = question.options.find((option) => option.value === answers[question.id])
    const score = selected?.score ?? 50
    return {
      id: question.dimension,
      label: question.dimensionLabel,
      score,
      weight: dimensionWeights[question.dimension],
      answer: selected?.label || 'Not answered',
      selected,
    }
  })

  const ooi = Math.round(
    dimensionScores.reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0),
  )

  const rankedDimensions = [...dimensionScores].sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score
    return priorityRank(a.id, priorities) - priorityRank(b.id, priorities)
  })

  const recommendations = rankedDimensions
    .map((dimension) => {
      const config = recommendationConfig[dimension.id]
      const title =
        dimension.id === 'operations' && dimension.selected?.label
          ? `Reduce delays in ${dimension.selected.label.toLowerCase()}`
          : config.title
      return {
        ...config,
        id: dimension.id,
        score: dimension.score,
        dimension: dimension.label,
        title,
        priority: dimension.score < 60 ? 'High Opportunity' : dimension.score < 75 ? 'Medium Opportunity' : 'Optimization Opportunity',
      }
    })
    .slice(0, 4)

  const capabilities = [...new Set(recommendations.map((item) => item.capability))]
  const weakest = rankedDimensions.slice(0, 2).map((item) => item.label)
  const goal = profile.primaryGoal || answers.goal || 'your selected business goal'

  return {
    ooi,
    efficiencyScore: ooi,
    level: ooi >= 70 ? 'Strong' : ooi >= 55 ? 'Moderate' : ooi >= 40 ? 'Opportunity-Rich' : 'Transformation Recommended',
    band: getScoreBand(ooi),
    dimensionScores,
    recommendations,
    capabilities,
    opportunityServices: capabilities,
    pressureAreas: weakest,
    summary: `Your organization is positioned to advance ${goal.toLowerCase()} by focusing on ${weakest.join(' and ')}. These areas offer practical opportunities to improve speed, customer experience, service quality, and resilience.`,
    tags: capabilities.map((capability) => capability.toLowerCase().replaceAll(' ', '_').replaceAll('&', 'and')),
  }
}
