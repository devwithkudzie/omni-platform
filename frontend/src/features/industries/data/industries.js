import { industryIcons } from './industryIcons'

const sharedTrust = {
  primaryCta: { label: 'Schedule a Discovery Call', href: '/discovery' },
  secondaryCta: { label: 'Talk to Our Team', href: '/contact' },
}

const industryPagesRaw = {
  education: {
    title: 'Education Services',
    subtitle: 'Secure delivery for modern assessments and learner journeys.',
    image: '/home/visuals/education.png',
    icon: industryIcons.education,
    seoDescription:
      'Secure online assessment operations, learner support, and digital academic services for schools, universities, and certification bodies.',
    intro: {
      heading: 'Reliable Academic Operations for Every Stage of Learning',
      body:
        'We help institutions run secure and scalable assessment programs, improve learner support, and modernize the operational backbone behind education delivery.',
      outcomes: [
        ['Assessment confidence', 'through stronger integrity controls and monitoring.'],
        ['Smoother learner journeys', 'with structured support before, during, and after exams.'],
        ['Operational resilience', 'for seasonal peaks, enrollment cycles, and high-stakes testing.'],
        ['Data-driven improvement', 'from candidate, invigilator, and institution analytics.'],
      ],
    },
    offerings: {
      heading: 'Core Education Capabilities',
      subheading: 'Purpose-built services for institutions, certification bodies, and online academies.',
      items: [
        ['Assessment Delivery', 'End-to-End Proctoring Operations', 'Run online and hybrid assessments with secure candidate verification and session oversight.', ['Identity and eligibility checks before exam start.', 'Live monitoring workflows with documented escalations.', 'Post-exam reporting for audit-readiness.']],
        ['Integrity', 'Academic Integrity Controls', 'Protect exam credibility with layered controls aligned to institutional policy.', ['Standardized incident capture and evidence logs.', 'Clear exception handling and review trails.', 'Configurable controls by exam type and risk profile.']],
        ['Learner Experience', 'Candidate Support Desks', 'Give students and candidates rapid support across channels during critical exam windows.', ['Multichannel support for login, access, and process queries.', 'Pre-exam readiness guidance and reminders.', 'Fast triage to reduce missed or delayed sittings.']],
        ['Technology', 'Platform and LMS Integration Support', 'Connect assessment workflows with your existing systems and reporting stack.', ['Operational alignment across LMS and exam tools.', 'Data handoff support for candidate and result workflows.', 'Improved continuity across academic terms.']],
        ['Governance', 'Compliance and Data Security Operations', 'Operate within strict security and privacy guardrails across every assessment cycle.', ['Role-based access and process accountability.', 'Consistent handling of candidate data.', 'Controls designed for institutional and regulatory scrutiny.']],
        ['Continuous Improvement', 'Assessment Analytics and Optimization', 'Use operational insight to continuously improve quality, throughput, and learner trust.', ['Trend analysis on incidents and support demand.', 'Root-cause insights for exam cycle improvements.', 'Performance dashboards for operations teams.']],
      ],
    },
    differentiators: [
      ['Fast Program Activation', 'Launch support models quickly with clear implementation checkpoints.'],
      ['Operational Visibility', 'See where learner friction or risk occurs and fix it early.'],
      ['Scalable Across Geographies', 'Support distributed candidates and multiple assessment windows confidently.'],
      ['Service-Led Delivery', 'Dedicated teams focused on reliable outcomes, not generic support scripts.'],
    ],
    trust: {
      heading: 'Built for Institutions That Cannot Compromise on Integrity',
      description:
        'From enrollment peaks to high-stakes assessments, we deliver the operational consistency your learners, faculty, and regulators expect.',
      stats: [['24/7', 'Candidate support coverage'], ['Multi-channel', 'Support across voice, chat, and email'], ['Audit-ready', 'Evidence and process traceability']],
      ctaTitle: 'Plan your next assessment cycle with confidence',
      ctaText:
        'Share your exam model and timelines. We will map a practical support structure for secure, smooth delivery.',
      ...sharedTrust,
    },
  },
  health: {
    title: 'Health Services',
    subtitle: 'Operational excellence for safer, smoother patient care journeys.',
    image: '/home/visuals/healthcare.png',
    icon: industryIcons.health,
    seoDescription:
      'Healthcare support services covering patient access, clinical administration, telehealth operations, revenue support, and compliant data handling.',
    intro: {
      heading: 'Healthcare Operations That Protect Care Quality and Capacity',
      body:
        'We support healthcare providers with reliable front-office and back-office operations so clinical teams can focus on patient outcomes while service teams maintain consistency, speed, and compliance.',
      outcomes: [
        ['Better patient access', 'with responsive scheduling and support workflows.'],
        ['Stronger care continuity', 'through reliable communication and follow-up operations.'],
        ['Reduced admin burden', 'for practice and hospital teams.'],
        ['Improved governance', 'through disciplined security and compliance processes.'],
      ],
    },
    offerings: {
      heading: 'Core Health Capabilities',
      subheading: 'Flexible support models for clinics, hospitals, and specialist practices.',
      items: [
        ['Patient Access', 'Scheduling and Access Coordination', 'Manage appointment pipelines and patient communications across channels.', ['Appointment booking, updates, and reminders.', 'Queue management support during peak demand.', 'Reduced no-shows through proactive outreach.']],
        ['Care Support', 'Patient Service Operations', 'Deliver empathetic first-line support for general patient inquiries and navigation.', ['Information support for pre-visit and post-visit questions.', 'Structured escalation to clinical teams when required.', 'Consistent service quality across touchpoints.']],
        ['Revenue Workflows', 'Administrative and Billing Support', 'Improve process discipline around documentation, billing support, and follow-through.', ['Back-office processing for routine administrative tasks.', 'Billing and documentation workflow support.', 'Faster cycle times with reduced process leakage.']],
        ['Digital Care', 'Telehealth Operations Enablement', 'Support virtual care workflows with practical operational controls.', ['Remote session readiness support.', 'Patient communication for virtual appointments.', 'Operational handoffs that reduce care delays.']],
        ['Automation', 'AI-Assisted Patient Engagement', 'Use automation to reduce repetitive admin work while improving responsiveness.', ['Automated reminders and routine inquiry handling.', 'Structured triage support for service teams.', 'Data-backed insights into service bottlenecks.']],
        ['Compliance', 'Security and Regulatory Alignment', 'Operate with controls that support privacy, governance, and accountability.', ['Role-based access and operational safeguards.', 'Process controls aligned to healthcare requirements.', 'Audit-friendly documentation and escalation trails.']],
      ],
    },
    differentiators: [
      ['Responsive Service Operations', 'Scale support quickly during surges in demand and seasonal pressure.'],
      ['Patient-Centered Experience', 'Every workflow is designed to reduce friction for patients and care teams.'],
      ['Data-Led Improvement', 'Performance insight helps improve quality and operational outcomes over time.'],
      ['Specialist Delivery Teams', 'Dedicated teams trained for healthcare service standards and communication.'],
    ],
    trust: {
      heading: 'Trusted Support for Healthcare Teams Under Pressure',
      description:
        'From frontline patient communication to back-office stability, we help your organization stay reliable, compliant, and patient-focused.',
      stats: [['24/7', 'Operational support windows'], ['Omnichannel', 'Patient communication coverage'], ['Quality-led', 'Service and compliance governance']],
      ctaTitle: 'Build a stronger health operations model',
      ctaText:
        'Book a discovery call to map your current operational pain points and identify practical improvements.',
      ...sharedTrust,
    },
  },
  'financial-services': {
    title: 'Financial Services',
    subtitle: 'Secure, compliant operations for modern financial institutions.',
    image: '/home/visuals/financial-services.png',
    icon: industryIcons['financial-services'],
    seoDescription:
      'Operational support for financial institutions across customer care, back-office processing, risk controls, compliance workflows, and performance analytics.',
    intro: {
      heading: 'Build Trust and Efficiency Across the Financial Customer Lifecycle',
      body:
        'We help banks, fintechs, and financial service providers improve customer responsiveness, strengthen operational control, and maintain governance in fast-moving environments.',
      outcomes: [
        ['Improved service consistency', 'across voice, digital, and back-office channels.'],
        ['Better risk posture', 'through disciplined operational controls.'],
        ['Faster turnaround times', 'for customer and transaction workflows.'],
        ['Regulatory readiness', 'supported by traceable process governance.'],
      ],
    },
    offerings: {
      heading: 'Core Financial Capabilities',
      subheading: 'Delivery models tailored for regulated and high-volume operations.',
      items: [
        ['Customer Operations', 'Customer Care and Resolution Teams', 'Deliver responsive support for account, transaction, and service inquiries.', ['Omnichannel support operations with quality controls.', 'Structured complaint handling and resolution management.', 'Improved retention through proactive service outreach.']],
        ['Back Office', 'Transaction and Process Operations', 'Stabilize core administrative and processing workflows behind frontline service.', ['Operational support for transaction-heavy workflows.', 'Process standardization to reduce rework and delays.', 'Service-level tracking for throughput and quality.']],
        ['Collections', 'Collections and Recovery Support', 'Improve collections outcomes with respectful, structured engagement models.', ['Customer-centric collections communication.', 'Escalation pathways for complex account scenarios.', 'Operational visibility into recovery performance.']],
        ['Risk', 'Risk Monitoring and Controls', 'Protect operations with practical controls and exception management discipline.', ['Risk indicator tracking and process alerts.', 'Control checks for critical workflow points.', 'Support for incident tracking and remediation.']],
        ['Compliance', 'Regulatory and Governance Support', 'Keep processes aligned to regulatory expectations and internal policy frameworks.', ['Audit-ready documentation practices.', 'Structured workflow evidence and quality checkpoints.', 'Support for policy updates and execution consistency.']],
        ['Performance', 'Analytics and Planning Insights', 'Use operational intelligence to improve service outcomes and decision speed.', ['Performance dashboards for leadership teams.', 'Trend insight across customer and process data.', 'Actionable recommendations for optimization.']],
      ],
    },
    differentiators: [
      ['Governance-First Delivery', 'Operational frameworks designed for high-trust financial environments.'],
      ['Scaled Responsiveness', 'Handle demand volatility without compromising service quality.'],
      ['Outcome Tracking', 'Clear metrics tied to customer experience and operational performance.'],
      ['Regional Delivery Strength', 'Support for local requirements with scalable regional execution.'],
    ],
    trust: {
      heading: 'Designed for Financial Teams That Cannot Afford Operational Drift',
      description:
        'From customer-facing support to compliance-critical workflows, we help you run stable and trusted operations at scale.',
      stats: [['24/7', 'Support availability options'], ['Multi-market', 'Delivery across regional operations'], ['KPI-led', 'Continuous performance optimization']],
      ctaTitle: 'Strengthen your financial operations model',
      ctaText:
        'Book a strategy session and we will map a delivery model aligned to your service, risk, and compliance priorities.',
      ...sharedTrust,
    },
  },
  insurance: {
    title: 'Insurance Services',
    subtitle: 'Operational precision across policy, claims, and customer trust.',
    image: '/home/industries/insurance.jpg',
    icon: industryIcons.insurance,
    seoDescription:
      'Insurance operations support for policy administration, claims handling, customer service, fraud controls, and compliance workflows.',
    intro: {
      heading: 'Modern Insurance Support for Policyholders and Operations Teams',
      body:
        'We help insurers run faster, cleaner workflows across the policy lifecycle while improving service responsiveness and maintaining disciplined controls.',
      outcomes: [
        ['Faster claims progression', 'through structured case workflows and follow-through.'],
        ['Improved policy administration', 'with consistent processing standards.'],
        ['Stronger fraud readiness', 'through practical controls and exception monitoring.'],
        ['More reliable customer support', 'across every interaction channel.'],
      ],
    },
    offerings: {
      heading: 'Core Insurance Capabilities',
      subheading: 'Specialized operational support across policy, claims, and compliance.',
      items: [
        ['Policy Lifecycle', 'Policy Administration Support', 'Keep policy workflows accurate and timely from issuance through renewal.', ['Support for endorsements, renewals, and policy updates.', 'Administrative process controls for data quality.', 'Reduced turnaround times for service requests.']],
        ['Verification', 'Eligibility and Coverage Validation', 'Improve first-time accuracy with structured verification workflows.', ['Coverage checks and policy detail validation.', 'Pre-claim documentation readiness support.', 'Cleaner handoffs to claims and service teams.']],
        ['Claims', 'Claims Intake and Coordination', 'Support claims progression with clear communication and process discipline.', ['Case intake, status handling, and workflow tracking.', 'Customer communication support across claim stages.', 'Escalation support for non-standard claim scenarios.']],
        ['Collections', 'Premium and Payment Follow-up', 'Strengthen payment outcomes through consistent, respectful engagement.', ['Structured payment reminder workflows.', 'Support for collections communication plans.', 'Operational reporting on payment performance.']],
        ['Governance', 'Compliance and Control Support', 'Maintain process consistency with audit-friendly governance practices.', ['Documentation standards for workflow evidence.', 'Policy-aligned process execution controls.', 'Support for internal and external audit readiness.']],
        ['Automation', 'AI-Assisted Workflow Optimization', 'Reduce repetitive workload and improve response speed with automation.', ['Automated reminders and routine service handling.', 'Exception triage support for operations teams.', 'Insight into process bottlenecks and delays.']],
      ],
    },
    differentiators: [
      ['Claims and Service Velocity', 'Improve responsiveness without sacrificing process quality.'],
      ['Control-Driven Operations', 'Risk-aware workflows aligned to governance and compliance requirements.'],
      ['Performance Transparency', 'Track quality, cycle time, and customer outcomes in one view.'],
      ['Customer-Focused Teams', 'Service teams trained to balance empathy with operational precision.'],
    ],
    trust: {
      heading: 'Support for Insurance Teams Balancing Growth and Governance',
      description:
        'We help you scale customer service, maintain control over core workflows, and improve reliability across every stage of the policy lifecycle.',
      stats: [['End-to-end', 'Support from policy to claims'], ['Audit-ready', 'Governed process documentation'], ['Flexible', 'Delivery models for changing demand']],
      ctaTitle: 'Reinforce your insurance operations',
      ctaText:
        'Share your policy and claims priorities. We will design a practical support model around your objectives.',
      ...sharedTrust,
    },
  },
  technology: {
    title: 'Technology, Digital and Advertising',
    subtitle: 'Execution muscle for fast-moving digital businesses.',
    image: '/home/industries/digital.jpg',
    icon: industryIcons.technology,
    seoDescription:
      'Technology and digital operations support including customer management, AI operations, data services, digital marketing support, and software delivery assistance.',
    intro: {
      heading: 'Scale Digital Execution Without Losing Quality or Speed',
      body:
        'We partner with technology and digital teams to run high-volume operations, support product and customer growth, and keep service quality strong while your business scales.',
      outcomes: [
        ['Faster execution cycles', 'for customer and product-facing operations.'],
        ['Improved service continuity', 'through resilient support structures.'],
        ['Higher data quality', 'for AI and analytics initiatives.'],
        ['Stronger go-to-market support', 'across digital channels and customer touchpoints.'],
      ],
    },
    offerings: {
      heading: 'Core Technology Capabilities',
      subheading: 'Practical operational support for digital-first and platform-led organizations.',
      items: [
        ['Transformation', 'Digital Transformation Operations', 'Translate strategy into repeatable execution across teams, systems, and workflows.', ['Process redesign support for digital operating models.', 'Cross-functional workflow orchestration.', 'Operational controls that sustain change programs.']],
        ['Automation', 'AI and Automation Enablement', 'Use AI-assisted workflows to increase responsiveness and reduce repetitive workload.', ['Automation support for routine customer operations.', 'AI-assisted response and process routing workflows.', 'Performance monitoring for automation outcomes.']],
        ['Data', 'Data Labeling and Quality Services', 'Improve model readiness with structured, quality-assured training data workflows.', ['Annotation operations for text, image, and audio data.', 'Quality control processes for labeling consistency.', 'Scalable delivery for iterative model training cycles.']],
        ['Content', 'Transcription and Content Operations', 'Convert and manage media content with accuracy and operational reliability.', ['Transcription workflows for audio and video assets.', 'Structured content processing pipelines.', 'Timely delivery aligned to production schedules.']],
        ['Product Support', 'Software and Platform Support Services', 'Support product and platform teams with dependable execution support.', ['Operational support around release and post-release activities.', 'Workflow support for issue handling and resolution loops.', 'Coordination across technical and customer-facing teams.']],
        ['Growth', 'Digital Marketing and Customer Operations', 'Support growth initiatives with structured campaign and customer management operations.', ['Customer engagement support across digital channels.', 'Operational assistance for campaign execution workflows.', 'Service-level tracking aligned to growth targets.']],
      ],
    },
    differentiators: [
      ['Scale with Control', 'Expand delivery capacity without introducing operational instability.'],
      ['Workflow Integration', 'Support models that align with your existing systems and processes.'],
      ['Performance Visibility', 'Track the metrics that matter for product, service, and growth outcomes.'],
      ['Execution-Focused Teams', 'Delivery teams that operate as a practical extension of your business.'],
    ],
    trust: {
      heading: 'Built for Technology Companies That Move Fast',
      description:
        'From data operations to customer engagement, we provide stable execution layers that help your teams focus on innovation and growth.',
      stats: [['Always-on', 'Support models for dynamic operations'], ['Cross-functional', 'Coordination across product and service teams'], ['Outcome-driven', 'Delivery tied to measurable business impact']],
      ctaTitle: 'Scale your digital operations with confidence',
      ctaText:
        'Book a discovery session and we will map a service model tailored to your platform, workflow, and growth goals.',
      ...sharedTrust,
    },
  },
  'retail-ecommerce': {
    title: 'Retail and E-commerce',
    subtitle: 'Responsive customer operations for orders, returns, loyalty, and digital commerce growth.',
    image: '/home/contact-center.jpg',
    icon: industryIcons['retail-ecommerce'],
    seoDescription:
      'Retail and e-commerce support services for customer care, order management, returns, marketplace operations, loyalty programs, and customer experience analytics.',
    intro: {
      heading: 'Keep Commerce Moving Across Every Customer Touchpoint',
      body:
        'We help retailers and e-commerce brands handle high-volume customer interactions, order workflows, returns, and loyalty support with the speed and consistency modern shoppers expect.',
      outcomes: [
        ['Faster customer response', 'across voice, chat, email, WhatsApp, and social channels.'],
        ['Smoother order journeys', 'with structured support for updates, exceptions, and escalations.'],
        ['Stronger retention', 'through loyalty support, service recovery, and proactive engagement.'],
        ['Better operational visibility', 'into recurring issues, demand peaks, and customer friction.'],
      ],
    },
    offerings: {
      heading: 'Core Retail and E-commerce Capabilities',
      subheading: 'Flexible support for stores, online marketplaces, direct-to-consumer brands, and growing commerce teams.',
      items: [
        ['Customer Care', 'Omnichannel Shopper Support', 'Deliver fast, consistent support across the channels customers already use.', ['Voice, email, live chat, WhatsApp, and social support.', 'Clear escalation paths for complex service issues.', 'Quality routines that protect brand tone and consistency.']],
        ['Orders', 'Order Management Support', 'Help customers track, amend, and resolve order issues with less friction.', ['Order status updates and delivery coordination.', 'Exception handling for delays, cancellations, and changes.', 'Operational follow-through across fulfilment touchpoints.']],
        ['Returns', 'Returns and Refund Coordination', 'Make returns easier for customers while keeping process control for the business.', ['Returns eligibility checks and customer guidance.', 'Refund status handling and case tracking.', 'Reduced rework through consistent documentation.']],
        ['Marketplace', 'Marketplace Operations Support', 'Support product, seller, and customer workflows across commerce platforms.', ['Listing and product information support.', 'Seller or vendor query handling.', 'Issue tracking for marketplace service operations.']],
        ['Loyalty', 'Loyalty and Retention Programs', 'Strengthen repeat purchases with reliable loyalty support and service recovery.', ['Loyalty account and points support.', 'Promotion and campaign query handling.', 'Proactive follow-up after service issues.']],
        ['Insights', 'Customer Experience Analytics', 'Use customer interaction data to identify friction and improve commerce performance.', ['Trend reporting on customer issues and demand peaks.', 'Root-cause insight for returns, delays, and complaints.', 'Performance dashboards for service and operations teams.']],
      ],
    },
    differentiators: [
      ['Peak-Ready Capacity', 'Scale support around campaigns, holidays, launches, and seasonal spikes.'],
      ['Brand-Aligned Service', 'Customer interactions stay consistent with your tone, policies, and experience standards.'],
      ['Operational Discipline', 'Structured workflows reduce errors across orders, returns, and service recovery.'],
      ['Actionable Commerce Insight', 'Reporting helps teams improve conversion, retention, and cost-to-serve.'],
    ],
    trust: {
      heading: 'Built for Retail Teams That Need Speed and Consistency',
      description:
        'From online orders to after-sales care, we help commerce teams deliver reliable customer support while protecting margins and customer trust.',
      stats: [['Omnichannel', 'Support across digital and voice channels'], ['Peak-ready', 'Flexible capacity for demand spikes'], ['Insight-led', 'CX reporting for operational improvement']],
      ctaTitle: 'Improve your retail customer operations',
      ctaText:
        'Book a discovery call and we will map where support, returns, loyalty, and automation can improve your customer journey.',
      ...sharedTrust,
    },
  },
  'travel-hospitality': {
    title: 'Travel and Hospitality',
    subtitle: 'Consistent guest support from booking to post-stay loyalty.',
    image: '/home/industries/hospitality.jpg',
    icon: industryIcons['travel-hospitality'],
    seoDescription:
      'Travel and hospitality support services across multilingual customer care, reservations operations, loyalty administration, and digital guest engagement.',
    intro: {
      heading: 'Deliver Better Guest Journeys Across Every Touchpoint',
      body:
        'We help travel and hospitality brands run reliable support operations that improve booking confidence, reduce service friction, and increase repeat engagement.',
      outcomes: [
        ['Stronger booking confidence', 'through responsive pre-trip and reservation support.'],
        ['Higher guest satisfaction', 'with fast, empathetic service delivery.'],
        ['Smoother operations', 'across reservation, inquiry, and follow-up workflows.'],
        ['Better loyalty performance', 'through structured post-stay engagement.'],
      ],
    },
    offerings: {
      heading: 'Core Travel and Hospitality Capabilities',
      subheading: 'Guest-centric operations designed for pace, consistency, and global service quality.',
      items: [
        ['Global Service', 'Multilingual Guest Support Teams', 'Serve international travelers with language-ready support operations.', ['Multilingual support for reservations and service requests.', 'Culturally aware communication across channels.', 'Better guest confidence before and during travel.']],
        ['Reservations', 'Booking and Reservation Operations', 'Handle booking workflows with consistency and attention to detail.', ['Reservation creation, updates, and confirmation support.', 'Operational handling for itinerary and stay changes.', 'Reduced booking friction and service errors.']],
        ['Service Desk', 'Inquiry and Issue Resolution', 'Support guests quickly across common and complex travel queries.', ['Structured handling of service and trip-related questions.', 'Escalation pathways for urgent or sensitive requests.', 'Consistent response quality at high volumes.']],
        ['Care', 'Customer Service Experience Operations', 'Keep service warm, reliable, and aligned to your brand standards.', ['Guest communication with service quality guardrails.', 'Coverage models for peak and off-peak demand.', 'Delivery support that protects brand perception.']],
        ['Retention', 'Post-Stay Follow-up and Recovery', 'Strengthen guest relationships after travel with structured follow-up workflows.', ['Feedback capture and service recovery coordination.', 'Post-stay communication programs for repeat engagement.', 'Operational tracking of satisfaction trends.']],
        ['Loyalty', 'Loyalty Program Operations', 'Support loyalty programs that drive repeat business and member value.', ['Program administration and member support workflows.', 'Resolution support for points and benefits inquiries.', 'Improved retention through reliable loyalty operations.']],
      ],
    },
    differentiators: [
      ['Fast Service Recovery', 'Respond quickly when guest experience issues need immediate action.'],
      ['Global Guest Readiness', 'Support teams aligned to international traveler needs and expectations.'],
      ['Smart Workflow Automation', 'Use automation to reduce repetitive tasks and improve service speed.'],
      ['Guest Experience Insights', 'Operational reporting that helps improve satisfaction and loyalty outcomes.'],
    ],
    trust: {
      heading: 'Reliable Support for Experience-Driven Travel Brands',
      description:
        'We help your teams maintain high guest standards while managing operational complexity across bookings, service, and loyalty.',
      stats: [['24/7', 'Guest support operating models'], ['Multilingual', 'Coverage for global audiences'], ['Journey-focused', 'Support from booking to post-stay']],
      ctaTitle: 'Strengthen your guest operations',
      ctaText:
        'Book a discovery call and we will map a practical delivery model for your travel or hospitality brand.',
      ...sharedTrust,
    },
  },
}

const industryEngagement = [
  ['Discover', 'We map volumes, channels, seasons, and the service standards your sector already owes customers.'],
  ['Stand-up', 'Teams, scripts, tooling, and quality routines go live against your operating calendar — not a generic template.'],
  ['Operate', 'Dedicated, shared, or surge capacity with sector-trained teams and named owners for exceptions.'],
  ['Report', 'Weekly scorecards on quality, SLAs, and the friction themes that actually move your operation.'],
]

const industryFaqs = [
  ['Do your teams know this sector?', 'Yes. Delivery is scoped around the workflows, language, and controls that sector actually runs — claims, exams, guest recovery, patient access, and so on — not a generic script pack.'],
  ['How do you start?', 'A discovery session maps volumes, systems, hours, and the SLAs you already publish. We then propose a stand-up plan with staffing, quality, and reporting.'],
  ['Will you work in our systems?', 'Yes. We operate in the tools you already use wherever that is the right path, and only introduce new software where it removes a real bottleneck.'],
  ['How is pricing set?', 'Against hours, channels, language mix, and the controls you need. Discovery produces the model — not a published rate card.'],
]

const industrySecondaryImages = {
  education: '/home/test-center.jpg',
  health: '/home/contact-center.jpg',
  'financial-services': '/home/industries/insurance.jpg',
  insurance: '/home/industries/banking.jpg',
  technology: '/home/omni-em.jpeg',
  'retail-ecommerce': '/home/associates.jpg',
  'travel-hospitality': '/home/contact-center.jpg',
}

const industryIllustrations = {
  education: '/illustrations/assessment.svg',
  health: '/illustrations/customer-experience.svg',
  'financial-services': '/illustrations/business-process.svg',
  insurance: '/illustrations/business-process.svg',
  technology: '/illustrations/ai-technology.svg',
  'retail-ecommerce': '/illustrations/customer-experience.svg',
  'travel-hospitality': '/illustrations/customer-experience.svg',
}

export const industryPages = Object.fromEntries(
  Object.entries(industryPagesRaw).map(([slug, page]) => [
    slug,
    {
      ...page,
      slug,
      href: `/industries/${slug}`,
      parentTitle: 'Industries',
      parentHref: '/industries',
      categorySlug: 'industries',
      secondaryImage: industrySecondaryImages[slug] || page.image,
      illustration: industryIllustrations[slug],
      assessmentGoal: 'improve_customer_experience',
      assessmentContext: {
        category: 'Industry',
        title: `${page.title} Discovery Session`,
        cta: 'Start discovery',
        objective: page.trust.ctaTitle,
        industry: page.title,
      },
      quote: {
        text: page.trust.description,
        attribution: `${page.title} operations`,
      },
      engagement: industryEngagement,
      faqs: industryFaqs,
      stats: page.trust.stats,
      focusAreas: page.offerings.items.map(([, title, description]) => [title, description]),
      outcomes: page.intro.outcomes.map(([title, detail]) => [
        title,
        detail.charAt(0).toUpperCase() + detail.slice(1),
      ]),
      cta: {
        heading: page.trust.ctaTitle,
        text: page.trust.ctaText,
        ...sharedTrust,
      },
    },
  ]),
)

export const industryIndexPage = {
  title: 'Industries',
  subtitle: 'Operational support for sectors where responsiveness, trust, and scale matter.',
  image: '/home/industries/banking.jpg',
  secondaryImage: '/home/industries/hospitality.jpg',
  illustration: '/illustrations/customer-experience.svg',
  assessmentGoal: 'improve_customer_experience',
  assessmentContext: {
    category: 'Industry',
    title: 'Industry Operations Discovery',
    cta: 'Start discovery',
    objective: 'Map the right industry operating model',
  },
  quote: {
    text: 'Delivery teams adapt customer support, administration, quality routines, and reporting around the realities of each sector — not a generic playbook.',
    attribution: 'OmniContact industry operations',
  },
  engagement: industryEngagement,
  faqs: industryFaqs,
  stats: [
    ['24/7', 'Coverage models by sector'],
    ['Regulated + high-volume', 'Financial, health, insurance, education'],
    ['Peak-ready', 'Seasonal and campaign capacity'],
    ['ISO 27001', 'Certified operations'],
  ],
  intro: {
    heading: 'Industry-aware operations, not generic support',
    body:
      'OmniContact supports organizations across regulated, service-heavy, and fast-moving industries with customer operations, back-office delivery, AI enablement, and performance discipline.',
  },
  capabilities: Object.values(industryPages).map((item) => [item.title, item.subtitle, item.href]),
  outcomes: [
    ['Improve service consistency', 'The same quality scorecard and SLA rhythm across the channels your customers already use.'],
    ['Protect compliance and control', 'Role-based access, evidence trails, and exception queues built for regulated work.'],
    ['Scale without losing the floor', 'Dedicated, shared, or surge capacity against actual arrival patterns — not a static headcount.'],
    ['See what is actually happening', 'Weekly themes on repeats, failures, and policy gaps — not just volume charts.'],
  ],
  cta: {
    heading: 'Map the right operating model for your sector',
    text: 'Share the journeys, volumes, and controls that matter in your industry. We will shape a practical delivery model around them.',
    ...sharedTrust,
  },
}

export const industrySlugs = Object.keys(industryPages)

export function getIndustryPage(slug) {
  return industryPages[slug] || null
}
