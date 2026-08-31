const sharedCta = {
  primaryCta: { label: 'Book Discovery', href: '/discovery' },
  secondaryCta: { label: 'Talk to Our Team', href: '/contact' },
}

const sharedStats = [
  ['24/7', 'Coverage windows'],
  ['Omnichannel', 'Voice, chat, email, WhatsApp, social'],
  ['SLA-led', 'First-response and quality targets'],
  ['ISO 27001', 'Certified operations'],
]

const sharedQuote = {
  text: 'Weekly quality scores, SLA attainment, and coaching actions land in the client operating rhythm — not a quarterly slide pack.',
  attribution: 'OmniContact reporting standard',
}

const sharedEngagement = [
  ['Discovery', 'We map volumes, channels, hours, languages, and the SLAs you already owe customers.'],
  ['Stand-up', 'Teams, scripts, tooling, and QA scorecards are live in weeks, not a six-month programme.'],
  ['Operate', 'Dedicated, shared, or surge capacity against agreed first-response and resolution targets.'],
  ['Report', 'Weekly scorecards on quality, handle time, CSAT inputs, and exceptions into your stack.'],
]

const categoryFaqs = {
  'ai-technology-solutions': [
    ['Where do you apply AI first?', 'We start with high-volume, rules-based work: FAQs, routing, knowledge lookup, and back-office capture — then keep a human in the loop for exceptions.'],
    ['Do we need to replace our current stack?', 'No. We integrate with the tools you already use and only introduce new software where it removes a real bottleneck.'],
    ['How is value measured?', 'Before go-live we agree the metrics: handle time, containment, first-response, quality scores, and cost-to-serve.'],
    ['How is pricing set?', 'Scope is set after discovery against use cases, integrations, and whether you need delivery teams, software, or both.'],
  ],
  'customer-experience-solutions': [
    ['Which channels do you cover?', 'Voice, live chat, WhatsApp, email, social, and web. Teams work in one operating model so a conversation can move channels without being restarted.'],
    ['What SLAs do you work to?', 'We take your existing first-response, resolution, and quality targets, then staff and report against them. If you do not have targets yet, we propose a starter set in discovery.'],
    ['How do we see performance?', 'Weekly scorecards covering SLA attainment, quality sampling, handle time, CSAT inputs, and exception themes, plus access to the underlying interaction data.'],
    ['How is pricing structured?', 'Dedicated, shared, or surge teams. Price is scoped against hours, channels, language mix, and SLA targets after a discovery session — not a published rate card.'],
  ],
  'business-process-outsourcing': [
    ['What work can you take on?', 'Document processing, data entry, verification, records, claims intake, healthcare administration, and other rules-based back-office workflows.'],
    ['How do you protect quality?', 'SOPs, sampling QA, exception queues, and named owners. You see throughput, error rates, and ageing work every week.'],
    ['How fast can you stand up a team?', 'A focused workflow can usually go live in weeks once volumes, rules, and system access are clear.'],
    ['How is pricing set?', 'Against volume bands, complexity, language, and the controls you need. Discovery produces the staffing and unit-cost model.'],
  ],
  'assessment-certification-services': [
    ['Do you run in-person and remote exams?', 'Yes. We support centre-based delivery, Pearson VUE programmes, and online proctoring with identity checks and incident handling.'],
    ['How is integrity protected?', 'Candidate verification, session monitoring, evidence logs, and documented escalations aligned to the exam owner’s rules.'],
    ['What does the candidate experience look like?', 'Pre-exam guidance, a live help desk during sittings, and clear incident handling so a login issue does not become a missed exam.'],
    ['How is pricing set?', 'By programme volume, invigilation model, and support hours. We scope this in a delivery review before go-live.'],
  ],
  'enterprise-platforms': [
    ['Do we buy a product or a service?', 'Both exist. Platforms can be licensed and configured, with OmniContact teams running the operating routines around them if you need that.'],
    ['Will it replace our current systems?', 'Only where that is the point. Most implementations sit alongside CRM, HR, and finance tools and exchange the data those teams already trust.'],
    ['Who owns the data?', 'You do. We configure roles, audit trails, and export paths as part of implementation.'],
    ['How is pricing set?', 'Licence, configuration, and optional managed operations are scoped after a systems assessment.'],
  ],
}

const categoryAssessmentContext = {
  'ai-technology-solutions': {
    category: 'AI & Technology Solutions',
    title: 'AI Readiness Assessment',
    cta: 'Discover My AI Readiness',
    objective: 'Introduce AI into the Business',
  },
  'customer-experience-solutions': {
    category: 'Customer Experience Solutions',
    title: 'Customer Experience Performance Assessment',
    cta: 'Evaluate My Customer Experience',
    objective: 'Improve Customer Experience',
  },
  'business-process-outsourcing': {
    category: 'Business Process Outsourcing',
    title: 'Operational Efficiency Assessment',
    cta: 'Assess My Current Operations',
    objective: 'Improve Operational Efficiency',
  },
  'assessment-certification-services': {
    category: 'Assessment & Certification Services',
    title: 'Assessment Delivery Readiness Review',
    cta: 'Evaluate My Assessment Operations',
    objective: 'Improve Workforce Performance',
  },
  'enterprise-platforms': {
    category: 'Enterprise Platforms',
    title: 'Business Systems Assessment',
    cta: 'Evaluate My Business Systems',
    objective: 'Improve Decision Making & Reporting',
  },
}

const serviceAssessmentNames = {
  'conversational-ai-chatbots': 'Customer Automation Readiness Assessment',
  'software-development': 'Digital Solution Discovery Assessment',
  'staff-augmentation': 'Technology Team Capacity Assessment',
  'data-annotation-labelling': 'AI Data Readiness Assessment',
  'contact-centre-services': 'Customer Service Performance Assessment',
  'contact-centre-quality-analytics': 'Quality Management Assessment',
  'customer-support-services': 'Customer Support Readiness Assessment',
  'omnichannel-engagement': 'Customer Engagement Assessment',
  'back-office-processing': 'Back Office Efficiency Assessment',
  'healthcare-administration': 'Healthcare Operations Assessment',
  'claims-processing': 'Claims Operations Assessment',
  'impact-sourcing': 'Workforce Impact Assessment',
  'professional-testing': 'Testing Operations Readiness Assessment',
  'pearson-vue-testing': 'Certification Delivery Assessment',
  'online-proctoring': 'Remote Assessment Readiness Assessment',
  'skills-assessments': 'Workforce Skills Assessment Review',
  'qa-toolbox': 'Quality Intelligence Assessment',
  'asset-management-system': 'Asset Visibility Assessment',
  'recruitment-management-system': 'Recruitment Operations Assessment',
  arams: 'School Operations Assessment',
}

export const solutionCategoryPages = {
  'ai-technology-solutions': {
    title: 'AI & Technology Solutions',
    subtitle: 'Practical automation, software delivery, and data services for modern customer operations.',
    eyebrow: 'Solutions',
    image: '/landing_pages/ai-operations.jpg',
    secondaryImage: '/home/omni-em.png',
    illustration: '/illustrations/ai-technology.svg',
    assessmentGoal: 'introduce_ai',
    assessmentContext: categoryAssessmentContext['ai-technology-solutions'],
    stats: [
      ['24/7', 'Coverage for live operations'],
      ['Human + AI', 'Automation with exception handling'],
      ['SLA-led', 'Speed and quality targets'],
      ['ISO 27001', 'Certified operations'],
    ],
    quote: sharedQuote,
    engagement: sharedEngagement,
    faqs: categoryFaqs['ai-technology-solutions'],
    seoDescription:
      'AI and technology solutions for conversational AI, custom software, staff augmentation, data annotation, and digital operations.',
    intro: {
      heading: 'Turn Digital Ambition Into Operational Results',
      body:
        'We apply chatbots, workflow software, and data labelling where they cut handle time or error rates. Delivery includes the team that runs the process, the integration work, and the weekly metrics that prove it is working.',
    },
    capabilities: [
      ['Conversational AI & Chatbot Solutions', 'Customer service chatbots, virtual assistants, knowledge assistants, and automated support workflows.', '/solutions/ai-technology-solutions/conversational-ai-chatbots'],
      ['Software Development', 'Custom applications, workflow tools, portals, APIs, and integrations built around real operational needs.', '/solutions/ai-technology-solutions/software-development'],
      ['Staff Augmentation', 'Specialist technology and AI talent to extend delivery teams and accelerate implementation.', '/solutions/ai-technology-solutions/staff-augmentation'],
      ['Data Annotation & Labelling', 'Human-reviewed image, text, audio, and video annotation for AI training and quality workflows.', '/solutions/ai-technology-solutions/data-annotation-labelling'],
    ],
    outcomes: [
      ['Reduce repetitive service workload', 'Move FAQ, routing, and status questions into assisted automation so agents handle exceptions.'],
      ['Improve response speed and consistency', 'Same answers, same tone, same next step — measured against first-response and containment targets.'],
      ['Integrate digital workflows with operations', 'Connect chat, CRM, and back-office tools so work does not stall in a handoff.'],
      ['Create better data for decision-making', 'Labelled interactions and exception themes feed coaching, forecasting, and product decisions.'],
    ],
    approach: [
      ['Discover', 'Identify high-value automation and technology opportunities.'],
      ['Design', 'Map workflows, integrations, operating rules, and success metrics.'],
      ['Deliver', 'Implement with trained teams, quality routines, and adoption support.'],
    ],
    cta: {
      heading: 'Find the right AI and digital opportunities',
      text: 'Share your current service and workflow challenges. We will help identify practical use cases with measurable value.',
      ...sharedCta,
    },
  },
  'customer-experience-solutions': {
    title: 'Customer Experience Solutions',
    subtitle: 'Omnichannel support, contact centre operations, quality analytics, and customer care delivery.',
    eyebrow: 'Solutions',
    image: '/landing_pages/customer-experience.jpg',
    secondaryImage: '/home/contact-center.jpg',
    illustration: '/illustrations/customer-experience.svg',
    assessmentGoal: 'improve_customer_experience',
    assessmentContext: categoryAssessmentContext['customer-experience-solutions'],
    stats: [
      ['24/7', 'Coverage windows'],
      ['6 channels', 'Voice, chat, email, WhatsApp, social, portal'],
      ['SLA-led', 'First-response and resolution targets'],
      ['ISO 27001', 'Certified operations'],
    ],
    quote: sharedQuote,
    engagement: sharedEngagement,
    faqs: categoryFaqs['customer-experience-solutions'],
    seoDescription:
      'Customer experience solutions covering contact centre services, customer support, omnichannel engagement, quality assurance, and analytics.',
    intro: {
      heading: 'Deliver Faster, More Consistent Customer Support',
      body:
        'We run inbound and outbound support across voice, live chat, WhatsApp, email, and social. Teams work to your first-response and resolution SLAs, with QA sampling, coaching, and weekly reporting into the tools you already use.',
    },
    capabilities: [
      ['Contact Centre Services', 'Inbound and outbound contact centre operations aligned to service levels and customer needs.', '/solutions/customer-experience-solutions/contact-centre-services'],
      ['Contact Centre Quality & Analytics', 'QA routines, performance analytics, compliance monitoring, and improvement reporting.', '/solutions/customer-experience-solutions/contact-centre-quality-analytics'],
      ['Customer Support Services', 'Customer care, help desk, complaint resolution, and technical assistance across channels.', '/solutions/customer-experience-solutions/customer-support-services'],
      ['Omnichannel Customer Engagement', 'Live chat, WhatsApp, social, email, voice, and digital support models.', '/solutions/customer-experience-solutions/omnichannel-engagement'],
    ],
    outcomes: [
      ['Improve first-response and resolution times', 'Staffing, routing, and scripts are built around the SLAs you already publish to customers.'],
      ['Protect service quality across channels', 'The same QA scorecard applies to voice, chat, email, and WhatsApp, with coaching on the misses.'],
      ['Reduce cost-to-serve', 'Self-service, better first-contact resolution, and right-sized teams against actual demand.'],
      ['Increase visibility into customer friction', 'Weekly themes on repeats, failures, and policy gaps — not just volume charts.'],
    ],
    approach: [
      ['Map Journeys', 'Understand support demand, channel behavior, and escalation needs.'],
      ['Operate', 'Deploy trained teams with clear service routines and QA structures.'],
      ['Optimize', 'Use analytics to improve quality, staffing, and customer outcomes.'],
    ],
    cta: {
      heading: 'Modernize your customer operations',
      text: 'Let us map your current support model and identify where service quality, speed, and cost can improve.',
      ...sharedCta,
    },
  },
  'business-process-outsourcing': {
    title: 'Business Process Outsourcing',
    subtitle: 'Scalable back-office, claims, healthcare administration, and impact sourcing delivery.',
    eyebrow: 'Solutions',
    image: '/home/associates.jpg',
    secondaryImage: '/home/agent1.png',
    illustration: '/illustrations/business-process.svg',
    assessmentGoal: 'improve_operational_efficiency',
    assessmentContext: categoryAssessmentContext['business-process-outsourcing'],
    stats: [
      ['Peak-ready', 'Capacity that flexes with volume'],
      ['SOP-led', 'Documented workflows and exception queues'],
      ['QA sampled', 'Error rates tracked weekly'],
      ['ISO 27001', 'Certified operations'],
    ],
    quote: sharedQuote,
    engagement: sharedEngagement,
    faqs: categoryFaqs['business-process-outsourcing'],
    seoDescription:
      'Business process outsourcing solutions for back-office processing, healthcare administration, claims support, and impact sourcing.',
    intro: {
      heading: 'Scale Operational Work Without Losing Control',
      body:
        'OmniContact supports high-volume, rules-based workflows with trained teams, quality controls, reporting discipline, and flexible delivery capacity.',
    },
    capabilities: [
      ['Back Office Processing', 'Document processing, data entry, records administration, verification, and workflow support.', '/solutions/business-process-outsourcing/back-office-processing'],
      ['Healthcare Administration Support', 'Patient administration, scheduling, records support, and healthcare operations assistance.', '/solutions/business-process-outsourcing/healthcare-administration'],
      ['Claims Processing Support', 'Claims intake, document checks, data validation, case support, and follow-through.', '/solutions/business-process-outsourcing/claims-processing'],
      ['Impact Sourcing', 'Inclusive outsourcing delivery that creates career pathways and measurable social value.', '/solutions/business-process-outsourcing/impact-sourcing'],
    ],
    outcomes: [
      ['Increase operational throughput', 'Trained teams process the queue to agreed daily and weekly volume bands.'],
      ['Reduce internal admin pressure', 'Your specialists stop being the overflow for records, checks, and data entry.'],
      ['Improve process quality and traceability', 'Every case has an owner, a timestamp, and a sampled QA trail.'],
      ['Scale capacity around demand peaks', 'Surge seats for enrollment, claims, or campaign spikes without a permanent headcount lift.'],
    ],
    approach: [
      ['Stabilize', 'Document workflows, service levels, controls, and handoff points.'],
      ['Transition', 'Move work into trained delivery teams with clear governance.'],
      ['Improve', 'Track throughput, quality, exceptions, and business outcomes.'],
    ],
    cta: {
      heading: 'Build a stronger outsourcing model',
      text: 'Tell us which workflows are under pressure and we will shape a practical delivery model around them.',
      ...sharedCta,
    },
  },
  'assessment-certification-services': {
    title: 'Assessment & Certification Services',
    subtitle: 'Secure testing, vendor certification exams, online proctoring, and workforce skills assessment.',
    eyebrow: 'Solutions',
    image: '/home/test-center.jpg',
    secondaryImage: '/home/industries/education.jpg',
    illustration: '/illustrations/assessment.svg',
    assessmentGoal: 'improve_workforce_performance',
    assessmentContext: categoryAssessmentContext['assessment-certification-services'],
    stats: [
      ['In-person + remote', 'Centre and online delivery'],
      ['Audit-ready', 'Evidence logs and incident trails'],
      ['Candidate desk', 'Support before, during, and after sittings'],
      ['ISO 27001', 'Certified operations'],
    ],
    quote: sharedQuote,
    engagement: sharedEngagement,
    faqs: categoryFaqs['assessment-certification-services'],
    seoDescription:
      'Assessment and certification services for professional testing, Pearson VUE exams, online proctoring, and skills assessments.',
    intro: {
      heading: 'Run Secure, Reliable Testing Programs',
      body:
        'We support certification bodies, institutions, employers, and workforce programs with structured testing operations, candidate support, proctoring, and assessment delivery.',
    },
    capabilities: [
      ['Professional Testing', 'General certification and testing services with candidate administration and secure delivery workflows.', '/solutions/assessment-certification-services/professional-testing'],
      ['Pearson VUE Testing', 'Vendor-specific certification exam delivery support for professional credential programs.', '/solutions/assessment-certification-services/pearson-vue-testing'],
      ['Online Proctoring', 'Remote examination delivery with identity checks, monitoring workflows, and incident handling.', '/solutions/assessment-certification-services/online-proctoring'],
      ['Skills Assessments', 'Recruitment and workforce evaluation support for hiring, placement, and capability measurement.', '/solutions/assessment-certification-services/skills-assessments'],
    ],
    outcomes: [
      ['Protect assessment integrity', 'Identity checks, monitoring, and documented incidents aligned to the exam owner’s rules.'],
      ['Improve candidate experience', 'A live desk for access issues so a login failure does not become a missed sitting.'],
      ['Support remote and in-person delivery', 'The same operating rhythm for centre days and online proctoring windows.'],
      ['Create audit-ready testing operations', 'Evidence packs, exception logs, and reporting your compliance team can use.'],
    ],
    approach: [
      ['Prepare', 'Align exam rules, candidate flows, support scripts, and escalation paths.'],
      ['Deliver', 'Run secure testing operations with trained administrators and proctors.'],
      ['Report', 'Provide structured evidence, incidents, and performance insight.'],
    ],
    cta: {
      heading: 'Plan your next testing program',
      text: 'Share your assessment model and delivery requirements. We will help map a secure operating approach.',
      ...sharedCta,
    },
  },
  'enterprise-platforms': {
    title: 'Enterprise Platforms',
    subtitle: 'Operational systems for QA, recruitment, asset management, analytics, and workflow visibility.',
    eyebrow: 'Solutions',
    image: '/home/omni-em.png',
    secondaryImage: '/home/associates.jpg',
    illustration: '/illustrations/enterprise-platforms.svg',
    assessmentGoal: 'improve_decision_reporting',
    assessmentContext: categoryAssessmentContext['enterprise-platforms'],
    stats: [
      ['Live ops', 'Dashboards for the work in motion'],
      ['Role-based', 'Access and audit trails by design'],
      ['Integrated', 'Sits alongside CRM, HR, and finance'],
      ['ISO 27001', 'Certified operations'],
    ],
    quote: sharedQuote,
    engagement: sharedEngagement,
    faqs: categoryFaqs['enterprise-platforms'],
    seoDescription:
      'Enterprise platform solutions including QA Toolbox, asset management, recruitment management, workflow systems, and operational analytics.',
    intro: {
      heading: 'Give Teams Better Control of Operational Work',
      body:
        'Our enterprise platforms help teams manage workflows, assets, recruitment, quality, and reporting with clearer accountability and better decision support.',
    },
    capabilities: [
      ['QA Toolbox', 'AI-powered quality assurance and performance insights for contact centre and customer operations.', '/solutions/enterprise-platforms/qa-toolbox'],
      ['Asset Management System', 'Enterprise asset visibility, lifecycle control, maintenance history, and audit reporting.', '/solutions/enterprise-platforms/asset-management-system'],
      ['Recruitment Management System', 'End-to-end hiring workflow management, candidate tracking, screening, and analytics.', '/solutions/enterprise-platforms/recruitment-management-system'],
      ['School Management & Administration Platform', 'Academic records, fee management, parent communication, teacher administration, and school reporting in one connected platform.', '/solutions/enterprise-platforms/arams'],
    ],
    outcomes: [
      ['Improve workflow visibility', 'See work in motion, owners, and ageing items without a spreadsheet chase.'],
      ['Reduce manual tracking', 'Replace side-channel trackers with one system of record.'],
      ['Strengthen governance and accountability', 'Roles, approvals, and audit history sit on the transaction, not in email.'],
      ['Support better operational decisions', 'Leaders get the same numbers the floor uses, weekly.'],
    ],
    approach: [
      ['Model', 'Define the workflow, data, user roles, and reporting needs.'],
      ['Configure', 'Shape the platform around operational routines and controls.'],
      ['Adopt', 'Support rollout, usage routines, and continuous improvement.'],
    ],
    cta: {
      heading: 'Choose the right platform path',
      text: 'Tell us what your team needs to track or improve. We will recommend the most practical platform approach.',
      ...sharedCta,
    },
  },
}

export const solutionCategorySlugs = Object.keys(solutionCategoryPages)

export function getSolutionCategoryPage(slug) {
  return solutionCategoryPages[slug] || null
}

const categoryChildIntros = {
  'ai-technology-solutions': (title) =>
    `${title} is delivered with the team that will run it, the integration into your current tools, and weekly metrics on handle time, containment, and quality.`,
  'customer-experience-solutions': (title) =>
    `${title} is run by trained OmniContact teams across voice, live chat, WhatsApp, email, and social. We work to agreed first-response and resolution SLAs, with QA sampling, coaching, and weekly scorecards into your reporting stack.`,
  'business-process-outsourcing': (title) =>
    `${title} is handled by trained teams against documented SOPs. You get daily throughput, sampled QA, exception queues, and a named owner for ageing work.`,
  'assessment-certification-services': (title) =>
    `${title} covers candidate administration, session integrity, and a live help desk during sittings, with evidence packs your compliance team can use.`,
  'enterprise-platforms': (title) =>
    `${title} is configured around the workflow you already run. Roles, audit trails, and the weekly numbers your floor and leadership both use.`,
}

function normalizeFocus(focusAreas = []) {
  return focusAreas.map((item) => (Array.isArray(item) ? item : [item, '']))
}

const child = (categorySlug, slug, title, subtitle, focusAreas) => {
  const category = solutionCategoryPages[categorySlug]

  return {
    categorySlug,
    slug,
    href: `/solutions/${categorySlug}/${slug}`,
    parentHref: `/solutions/${categorySlug}`,
    parentTitle: category.title,
    title,
    subtitle,
    eyebrow: category.eyebrow,
    image: category.image,
    secondaryImage: category.secondaryImage,
    illustration: category.illustration,
    stats: category.stats || sharedStats,
    quote: category.quote || sharedQuote,
    engagement: category.engagement || sharedEngagement,
    faqs: category.faqs || [],
    assessmentGoal: category.assessmentGoal,
    assessmentContext: {
      ...category.assessmentContext,
      service: title,
      title: serviceAssessmentNames[slug] || category.assessmentContext.title,
    },
    seoDescription: `${title} from OmniContact: ${subtitle}`,
    intro: {
      heading: `${title}, run to agreed service levels`,
      body: categoryChildIntros[categorySlug]?.(title)
        || 'Trained delivery teams, the tooling they work in, and weekly reporting against the SLAs you already owe customers.',
    },
    focusAreas: normalizeFocus(focusAreas),
    outcomes: category.outcomes,
    approach: category.approach,
    cta: {
      heading: `Ready to scope ${title}?`,
      text: 'Book a discovery session. We will map channels, SLAs, staffing, and reporting before recommending a delivery model.',
      ...sharedCta,
    },
  }
}

const aramsPage = {
  ...child(
    'enterprise-platforms',
    'arams',
    'School Management & Administration Platform',
    'Bring academics, finance, student records, communication, and administration together in one secure platform for modern schools.',
    ['Academic records and report cards', 'Fee management and reconciliation', 'Parent communication and notifications', 'Teacher administration and class management', 'School reporting, governance, and audit visibility'],
  ),
  image: '/home/industries/education.jpg',
  seoDescription:
    'School management and administration platform for academic records, fee management, parent communication, teacher administration, reporting, and governance.',
  intro: {
    heading: 'Stop Managing Your School Across Multiple Systems',
    body:
      'ARAMS helps schools centralize academics, finance, communication, records, and administration so leaders gain operational control while teachers, parents, and administrators work with greater confidence.',
  },
  outcomes: [
    'Centralize school administration',
    'Digitize academic records',
    'Improve financial visibility',
    'Reduce teacher workload',
    'Improve parent engagement',
    'Strengthen governance and compliance',
  ],
  assessmentContext: {
    ...categoryAssessmentContext['enterprise-platforms'],
    service: 'School Management & Administration Platform',
    title: 'School Operations Assessment',
    cta: 'Start Your School Operations Assessment',
    objective: 'Modernize School Administration',
  },
  cta: {
    heading: 'Modernize school administration with one connected platform',
    text: 'Start with a school operations assessment to identify where records, fees, communication, reporting, and administration can become more connected and reliable.',
    primaryCta: { label: 'Start School Operations Assessment', href: '/discovery' },
    secondaryCta: { label: 'View Platform Demo', href: '/contact' },
  },
}

export const solutionChildPages = {
  'ai-technology-solutions': {
    'conversational-ai-chatbots': child('ai-technology-solutions', 'conversational-ai-chatbots', 'Conversational AI & Chatbot Solutions', 'Customer service automation with chatbots, virtual assistants, and knowledge assistants.', [
      ['Customer service chatbot design', 'Intents, knowledge, and tone of voice for the questions your desk already answers every hour.'],
      ['Knowledge assistant workflows', 'Agents and customers get the same approved answer, with a clear path when the bot should stop.'],
      ['Escalation to human support teams', 'Full transcript, customer context, and queue rules so the agent does not start again from zero.'],
      ['Performance tuning and analytics', 'Containment, deflection, and failure themes reviewed weekly against the SLA you set.'],
    ]),
    'software-development': child('ai-technology-solutions', 'software-development', 'Software Development', 'Custom applications, workflow tools, portals, APIs, and integrations.', [
      ['Business workflow applications', 'The queue, the form, and the approval path your team currently runs in email and spreadsheets.'],
      ['Customer and staff portals', 'Status, documents, and self-service in one place, tied to the systems of record you already trust.'],
      ['API and system integrations', 'CRM, ticketing, billing, and contact-centre tools exchanging the data the floor needs.'],
      ['Maintenance and product iteration', 'A backlog, release cadence, and owners after go-live — not a handover and silence.'],
    ]),
    'staff-augmentation': child('ai-technology-solutions', 'staff-augmentation', 'Staff Augmentation', 'Specialist technology and AI talent for delivery teams.', [
      ['Technical delivery support', 'Engineers and analysts who join an active programme with a named OmniContact lead.'],
      ['AI and data operations roles', 'People who label, review, and keep models honest once the pilot is over.'],
      ['Short-term project capacity', 'A defined window, a defined output, and reporting against both.'],
      ['Managed performance and reporting', 'Attendance, output, and quality sampled the same way as our delivery teams.'],
    ]),
    'data-annotation-labelling': child('ai-technology-solutions', 'data-annotation-labelling', 'Data Annotation & Labelling', 'Human-reviewed annotation for text, image, audio, and video data.', [
      ['Text and document labelling', 'Intent, entity, and quality labels with a second-pass sample on every batch.'],
      ['Image and video annotation', 'Bounding, classification, and review against the guideline pack you sign off.'],
      ['Audio review and transcription support', 'Human review on the turns automation should not guess.'],
      ['Quality assurance sampling', 'Inter-annotator agreement and defect rates reported with the delivery, not after it.'],
    ]),
  },
  'customer-experience-solutions': {
    'contact-centre-services': child('customer-experience-solutions', 'contact-centre-services', 'Contact Centre Services', 'Inbound and outbound contact centre operations for customer-facing teams.', [
      ['Inbound customer support', 'Voice and digital inbound against first-response, abandonment, and resolution SLAs.'],
      ['Outbound service campaigns', 'Appointments, collections, and care outreach with recorded outcomes and do-not-call rules.'],
      ['Workforce scheduling support', 'Rosters built from actual arrival patterns, not a static headcount spreadsheet.'],
      ['Service-level reporting', 'Daily flash and weekly pack: SLA, AHT, occupancy, quality, and the top exception themes.'],
    ]),
    'contact-centre-quality-analytics': child('customer-experience-solutions', 'contact-centre-quality-analytics', 'Contact Centre Quality & Analytics', 'Quality assurance, performance analytics, and compliance monitoring.', [
      ['Interaction quality scoring', 'A shared scorecard across voice and digital, sampled every week against your compliance list.'],
      ['Coaching insights', 'Named misses go to team leads within the week, not a month-end average.'],
      ['Compliance checks', 'Script, disclosure, and handling rules flagged before they become an audit finding.'],
      ['Operational dashboards', 'SLA, quality, AHT, and CSAT inputs in one view your operations lead can open on Monday.'],
    ]),
    'customer-support-services': child('customer-experience-solutions', 'customer-support-services', 'Customer Support Services', 'Customer care, help desk, complaint resolution, and technical assistance.', [
      ['Help desk support', 'Tier-1 and tier-2 tickets across phone, chat, and email, with agreed first-response and resolution times.'],
      ['Complaint handling', 'Logged, owned, and closed against your policy, with a weekly ageing report.'],
      ['Technical assistance triage', 'Reproduce, classify, and escalate with the diagnostics your product team asked for.'],
      ['Customer follow-up workflows', 'Promised callbacks and case updates actually happen, and you can see when they did not.'],
    ]),
    'omnichannel-engagement': child('customer-experience-solutions', 'omnichannel-engagement', 'Omnichannel Customer Engagement', 'Connected customer support across live chat, WhatsApp, social, email, and voice.', [
      ['Digital channel support', 'Live chat, WhatsApp, social, and email in the same operating hours and SLA set as voice.'],
      ['Unified customer handoffs', 'The next agent sees the thread, not a blank ticket and a frustrated customer.'],
      ['Social and messaging operations', 'Public replies and private threads handled to the same quality scorecard as the contact centre.'],
      ['Channel performance reporting', 'Volume, first-response, and quality by channel every week, so you can see where demand is moving.'],
    ]),
  },
  'business-process-outsourcing': {
    'back-office-processing': child('business-process-outsourcing', 'back-office-processing', 'Back Office Processing', 'Document processing, data entry, records administration, and verification.', [
      ['Document capture and processing', 'Intake, classification, and completion against a daily volume band and an error-rate cap.'],
      ['Data entry and validation', 'Two-person checks on the fields that hurt if they are wrong.'],
      ['Records administration', 'Creates, updates, and closures with an audit trail your ops lead can sample.'],
      ['Exception handling and reporting', 'Anything outside the SOP sits in a named queue, not a shared inbox.'],
    ]),
    'healthcare-administration': child('business-process-outsourcing', 'healthcare-administration', 'Healthcare Administration Support', 'Patient administration, scheduling, records support, and operational assistance.', [
      ['Appointment support', 'Booking, reminder, and no-show follow-up against the clinic’s template and hours.'],
      ['Patient records administration', 'Updates, document chasing, and completeness checks before the clinician needs the file.'],
      ['Eligibility and information workflows', 'Cover checks and benefit questions handled to script, with exceptions flagged the same day.'],
      ['Back-office healthcare support', 'Referral, billing-support, and records work with access limited to the roles you approve.'],
    ]),
    'claims-processing': child('business-process-outsourcing', 'claims-processing', 'Claims Processing Support', 'Claims intake, document checks, data validation, and case support.', [
      ['Claims intake', 'Complete packs in, incomplete packs chased, with a timestamp on every chase.'],
      ['Document completeness checks', 'A checklist you sign off, sampled weekly for misses.'],
      ['Case status support', 'Customers and brokers get a real status, not a holding line.'],
      ['Workflow tracking and reporting', 'Intake-to-decision ageing, exception reasons, and volume vs plan every week.'],
    ]),
    'impact-sourcing': child('business-process-outsourcing', 'impact-sourcing', 'Impact Sourcing', 'Inclusive outsourcing delivery with measurable social value.', [
      ['Inclusive hiring pathways', 'Roles filled through training programmes with the same QA bar as every other OmniContact team.'],
      ['Talent readiness programs', 'Time-to-floor, certification, and retention reported alongside delivery KPIs.'],
      ['Managed delivery teams', 'The work is the work: SLAs, sampling, and a named delivery lead.'],
      ['Social impact reporting', 'Jobs, training completions, and progression in the same pack as operational performance.'],
    ]),
  },
  'assessment-certification-services': {
    'professional-testing': child('assessment-certification-services', 'professional-testing', 'Professional Testing', 'General certification and testing services with secure delivery workflows.', [
      ['Candidate administration', 'Eligibility, booking, and communications before the sitting starts.'],
      ['Exam-day support', 'Check-in, environment, and a desk for the problems that show up at the door.'],
      ['Secure test delivery', 'Controls aligned to the exam owner, with incident capture as it happens.'],
      ['Post-test reporting', 'Attendance, incidents, and evidence packs within the window you agree.'],
    ]),
    'pearson-vue-testing': child('assessment-certification-services', 'pearson-vue-testing', 'Pearson VUE Testing', 'Vendor-specific certification exam support for professional credentials.', [
      ['Candidate check-in support', 'ID, eligibility, and centre rules applied the same way every sitting.'],
      ['Exam environment readiness', 'Stations, connectivity, and backup paths checked before candidates arrive.'],
      ['Vendor exam administration', 'Delivery to Pearson VUE requirements, with named owners for exceptions.'],
      ['Incident handling', 'Logged, escalated, and reported in the format the vendor expects.'],
    ]),
    'online-proctoring': child('assessment-certification-services', 'online-proctoring', 'Online Proctoring', 'Remote examination delivery with identity checks and monitoring workflows.', [
      ['Identity verification', 'The checks the exam owner specified, completed before the clock starts.'],
      ['Live or recorded proctoring support', 'Monitoring, flags, and human review on the sessions that need it.'],
      ['Incident capture', 'Evidence attached to the sitting, not reconstructed afterwards.'],
      ['Candidate help desk support', 'Login, camera, and connectivity issues handled while the window is still open.'],
    ]),
    'skills-assessments': child('assessment-certification-services', 'skills-assessments', 'Skills Assessments', 'Recruitment and workforce evaluation for hiring and capability measurement.', [
      ['Role-fit assessment support', 'The battery you chose, administered and scored the same way for every candidate.'],
      ['Workforce capability checks', 'Baseline and re-test reporting your L&D or hiring lead can use.'],
      ['Candidate administration', 'Invites, reminders, access issues, and completion chase.'],
      ['Assessment reporting', 'Results, exceptions, and time-to-complete in one pack per cohort.'],
    ]),
  },
  'enterprise-platforms': {
    'qa-toolbox': child('enterprise-platforms', 'qa-toolbox', 'QA Toolbox', 'AI-powered quality assurance and performance insights for customer operations.', [
      ['Interaction review workflows', 'Sampling rules, reviewers, and calibration in one place.'],
      ['QA scorecards', 'The behaviours you actually coach, not a generic 20-line form.'],
      ['Coaching insights', 'Misses grouped by agent, team, and theme for the week’s 1:1s.'],
      ['Performance dashboards', 'Quality next to SLA and volume so you can see the trade-offs.'],
    ]),
    'asset-management-system': child('enterprise-platforms', 'asset-management-system', 'Asset Management System', 'Enterprise asset visibility and lifecycle control.', [
      ['Asset registers', 'What you own, who has it, and when it is due next.'],
      ['Allocation and transfer workflows', 'Moves, returns, and approvals with a history, not a spreadsheet tab.'],
      ['Maintenance history', 'Jobs, parts, and downtime against the asset, not a separate log.'],
      ['Audit reporting', 'Location, custodian, and value extracts your finance and risk teams can use.'],
    ]),
    'recruitment-management-system': child('enterprise-platforms', 'recruitment-management-system', 'Recruitment Management System', 'End-to-end hiring workflow management for modern teams.', [
      ['Applicant tracking', 'Every candidate in one pipeline with the stage your recruiters actually use.'],
      ['Candidate screening', 'The checks you require, in the order you require, before a hiring manager sees the file.'],
      ['Interview coordination', 'Slots, panels, and feedback captured before the next round is booked.'],
      ['Recruitment analytics', 'Time-to-fill, source, and drop-off — weekly, not at quarter end.'],
    ]),
    arams: aramsPage,
  },
}

export const solutionChildParams = Object.entries(solutionChildPages).flatMap(([category, pages]) =>
  Object.keys(pages).map((slug) => ({ category, slug })),
)

export function getSolutionChildPage(categorySlug, childSlug) {
  return solutionChildPages[categorySlug]?.[childSlug] || null
}
