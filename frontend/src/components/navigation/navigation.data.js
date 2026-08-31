import { industryIcons } from '@/features/industries/data/industryIcons'

export const navMenu = [
  {
    label: 'Solutions',
    tagline: 'AI, CX, BPO, assessment services, and enterprise platforms',
    overviewHref: '/solutions/ai-technology-solutions',
    items: [
      {
        label: 'AI & Technology Solutions',
        href: '/solutions/ai-technology-solutions',
        children: [
          {
            label: 'Conversational AI & Chatbot Solutions',
            desc: 'Customer service chatbots, virtual assistants, and knowledge assistants.',
            href: '/solutions/ai-technology-solutions/conversational-ai-chatbots',
          },
          {
            label: 'Software Development',
            desc: 'Custom apps, workflow tools, portals, APIs, and integrations.',
            href: '/solutions/ai-technology-solutions/software-development',
          },
          {
            label: 'Staff Augmentation',
            desc: 'Specialist technology and AI talent for delivery teams.',
            href: '/solutions/ai-technology-solutions/staff-augmentation',
          },
          {
            label: 'Data Annotation & Labelling',
            desc: 'Human-reviewed image, text, audio, and video annotation.',
            href: '/solutions/ai-technology-solutions/data-annotation-labelling',
          },
        ],
      },
      {
        label: 'Customer Experience Solutions',
        href: '/solutions/customer-experience-solutions',
        children: [
          {
            label: 'Contact Centre Services',
            desc: 'Inbound and outbound contact centre operations.',
            href: '/solutions/customer-experience-solutions/contact-centre-services',
          },
          {
            label: 'Contact Centre Quality & Analytics',
            desc: 'Quality assurance, performance analytics, and compliance monitoring.',
            href: '/solutions/customer-experience-solutions/contact-centre-quality-analytics',
          },
          {
            label: 'Customer Support Services',
            desc: 'Customer care, help desk, complaint resolution, and technical assistance.',
            href: '/solutions/customer-experience-solutions/customer-support-services',
          },
          {
            label: 'Omnichannel Customer Engagement',
            desc: 'Live chat, WhatsApp, social, email, voice, and digital channels.',
            href: '/solutions/customer-experience-solutions/omnichannel-engagement',
          },
        ],
      },
      {
        label: 'Business Process Outsourcing',
        href: '/solutions/business-process-outsourcing',
        children: [
          {
            label: 'Back Office Processing',
            desc: 'Document processing, data entry, records administration, and verification.',
            href: '/solutions/business-process-outsourcing/back-office-processing',
          },
          {
            label: 'Healthcare Administration Support',
            desc: 'Patient administration, scheduling, records support, and operations.',
            href: '/solutions/business-process-outsourcing/healthcare-administration',
          },
          {
            label: 'Claims Processing Support',
            desc: 'Claims intake, document checks, data validation, and case support.',
            href: '/solutions/business-process-outsourcing/claims-processing',
          },
          {
            label: 'Impact Sourcing',
            desc: 'Inclusive outsourcing delivery with measurable social value.',
            href: '/solutions/business-process-outsourcing/impact-sourcing',
          },
        ],
      },
      {
        label: 'Assessment & Certification Services',
        href: '/solutions/assessment-certification-services',
        children: [
          {
            label: 'Professional Testing',
            desc: 'General certification and testing services.',
            href: '/solutions/assessment-certification-services/professional-testing',
          },
          {
            label: 'Pearson VUE Testing',
            desc: 'Vendor-specific certification exams.',
            href: '/solutions/assessment-certification-services/pearson-vue-testing',
          },
          {
            label: 'Online Proctoring',
            desc: 'Remote examination delivery.',
            href: '/solutions/assessment-certification-services/online-proctoring',
          },
          {
            label: 'Skills Assessments',
            desc: 'Recruitment and workforce evaluation.',
            href: '/solutions/assessment-certification-services/skills-assessments',
          },
        ],
      },
      {
        label: 'Enterprise Platforms',
        href: '/solutions/enterprise-platforms',
        children: [
          {
            label: 'QA Toolbox',
            desc: 'AI-powered quality assurance and performance insights.',
            href: '/solutions/enterprise-platforms/qa-toolbox',
          },
          {
            label: 'Asset Management System',
            desc: 'Enterprise asset visibility and lifecycle control.',
            href: '/solutions/enterprise-platforms/asset-management-system',
          },
          {
            label: 'Recruitment Management System',
            desc: 'End-to-end hiring workflow management.',
            href: '/solutions/enterprise-platforms/recruitment-management-system',
          },
          {
            label: 'School Management Platform',
            desc: 'Academic records, fees, communication, and administration.',
            href: '/solutions/enterprise-platforms/arams',
          },
        ],
      },
    ],
  },
  {
    label: 'Industries',
    tagline: 'Sectors our delivery teams run on',
    overviewHref: '/industries',
    items: [
      { label: 'Financial Services & Banking', desc: 'KYC, collections, servicing, and disputes.', href: '/industries/financial-services', icon: industryIcons['financial-services'] },
      { label: 'Insurance', desc: 'Claims, underwriting support, renewals, and care.', href: '/industries/insurance', icon: industryIcons.insurance },
      { label: 'Healthcare', desc: 'Member services, scheduling, eligibility, and navigation.', href: '/industries/health', icon: industryIcons.health },
      { label: 'Telecommunications', desc: 'Tiered support, retention, onboarding, and operations.', href: '/industries/technology' },
      { label: 'Technology & SaaS', desc: 'Product support, onboarding, and technical success.', href: '/industries/technology' },
      { label: 'Retail & E-commerce', desc: 'Orders, returns, loyalty, and marketplace operations.', href: '/industries/retail-ecommerce' },
      { label: 'Travel & Hospitality', desc: 'Reservations, disruption recovery, and loyalty.', href: '/industries/travel-hospitality', icon: industryIcons['travel-hospitality'] },
      { label: 'Education', desc: 'Admissions, learner support, enrolment, and operations.', href: '/industries/education' },
    ],
  },
  {
    label: 'About',
    tagline: 'Who we are and how we work',
    overviewHref: '/about',
    items: [
      {
        label: 'Company',
        href: '/about',
        children: [
          { label: 'Who We Are', desc: 'Our story, positioning, leadership, and footprint.', href: '/about/who-we-are' },
          { label: 'Vision, Mission & Values', desc: 'The principles behind how OmniContact works.', href: '/about/vision-mission-values' },
          { label: 'Community Impact', desc: 'Community partnerships and measurable social value.', href: '/about/community-impact' },
          { label: 'Project Ignite', desc: 'Digital leadership opportunities for women and girls.', href: '/about/project-ignite' },
        ],
      },
      {
        label: 'Careers & Culture',
        href: '/about/careers',
        children: [
          { label: 'Careers', desc: 'Open roles across delivery and enabling teams.', href: '/about/careers' },
          { label: 'Impact Sourcing', desc: 'Career pathways, training, and inclusive employment.', href: '/about/impact-sourcing' },
        ],
      },
    ],
  },
  {
    label: 'Insights',
    tagline: 'Thinking, updates, and expert views',
    overviewHref: '/insights',
    items: [
      { label: 'Latest Insights', desc: 'Articles and updates from the OmniContact team.', href: '/insights' },
      { label: 'Webinar Replay', desc: 'Partnership insights and customer operations conversations.', href: '/webinar-replay' },
    ],
  },
]
