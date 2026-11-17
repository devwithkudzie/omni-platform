// Marketing as a Service (MaaS) landing page.
// Copy source: OmniContact_MaaS_Landing_Page - Updated Copy.docx

import { zohoLeadFields } from '@/features/solutions/data/zohoLeadFields'

export const maasSeo = {
  title: 'Marketing as a Service (MaaS) | Outsourced Marketing Team | OmniContact',
  description:
    'Scale your marketing with OmniContact MaaS. Strategy, creative, digital campaigns, CRM automation and reporting in one flexible managed service.',
}

export function maasLanding(page) {
  const healthAssessment = {
    context: {
      ...(page.assessmentContext || {}),
      type: 'maas_health_check',
      title: 'Digital Marketing Health Check',
      category: 'Marketing as a Service',
      service: 'Marketing as a Service (MaaS)',
      cta: 'Check My Marketing Health',
    },
    goal: 'digital_marketing_health',
  }

  return {
    assessment: healthAssessment,
    hero: {
      breadcrumbs: [
        { label: 'Customer Experience Solutions', href: '/solutions/customer-experience-solutions' },
        { label: 'MaaS' },
      ],
      eyebrow: 'Marketing as a Service (MaaS)',
      titleLead: 'Your Marketing Team.',
      titleAccent: 'Built for Growth.',
      subtitle:
        'Get the strategy, creative talent, digital campaigns and lead management expertise you need to attract the right customers and turn marketing investment into measurable business growth.',
      benefits: [
        { icon: 'team', title: 'A dedicated team without the hiring overhead' },
        { icon: 'chart', title: 'Campaigns built to generate qualified leads' },
        { icon: 'coins', title: 'Clear reporting from first click to sales opportunity' },
      ],
      image: '/home/visuals/maas-service.png',
      imagePosition: 'center 25%',
    },
    form: {
      heading: 'Get a Free Marketing Consultation',
      intro: 'Tell us what you want to achieve. We’ll explore where your marketing can work harder and how our team can help.',
      source: 'MaaS',
      button: 'Book My Free Consultation',
      privacy: 'We’ll only use your details to respond to your enquiry. See our Privacy Policy.',
      privacyHref: '/privacy-policy',
      intents: [{ value: 'consultation', label: 'Get a Free Marketing Consultation', button: 'Book My Free Consultation' }],
      // Submits to the "MaaS Lead Gen Form" in Zoho Forms using the HTML-embed
      // formperma (from Zoho's HTML export). The iframe-embed perma rejects
      // posts from other sites with "Access Denied". Field names and option
      // values must match the Zoho form exactly.
      zoho: {
        action:
          'https://forms.zohopublic.com/emmanhereraomnic1/form/MaaSLeadGenForm1/formperma/521IeXRdMsiGifPLoqX3s0aXqudhMkzi6lARGZ8UyTM/htmlRecords/submit',
        redirect: '/thank-you-maas',
        referrer: 'MaaS landing page',
      },
      fields: zohoLeadFields({ jobTitlePlaceholder: 'e.g. Marketing Manager' }),
    },
    challenge: {
      eyebrow: 'The challenge',
      heading: 'Great Marketing Shouldn’t Be So Hard to Deliver.',
      intro:
        'Growing businesses need consistent marketing that produces results. But building the right team, managing multiple suppliers and proving what works can stretch time and budgets.',
      cards: [
        { icon: 'team', title: 'Limited in-house marketing skills' },
        { icon: 'clock', title: 'Campaigns that start and stop when teams get busy' },
        { icon: 'coins', title: 'Rising costs across agencies, tools and recruitment' },
        { icon: 'chart', title: 'Leads and marketing spend that are hard to track' },
      ],
    },
    solution: {
      eyebrow: 'The solution',
      heading: 'Marketing as a Service (MaaS)',
      body:
        'OmniContact MaaS brings your marketing strategy, content, paid media, automation and performance reporting together in one managed service. We work as an extension of your business, connecting campaigns with lead capture, CRM follow-up and the outcomes your sales team cares about.',
      image: '/landing_pages/customer-experience.jpg',
      cta: { label: 'Explore How MaaS Works', href: '#how-it-works' },
    },
    included: {
      heading: 'A Complete Marketing Team for Your Business',
      intro: 'Get everything you need to attract, engage and convert customers, all in one flexible service.',
      pillars: [
        {
          icon: 'target',
          title: 'Strategy & Planning',
          outcome: 'A clear growth plan built around your market, customers and commercial goals.',
          items: ['Marketing strategy', 'Market and competitor insights', 'Ideal customer profiles', 'Campaign roadmaps'],
        },
        {
          icon: 'pen',
          title: 'Content & Creative',
          outcome: 'A brand that looks and sounds professional everywhere.',
          items: ['Social media content', 'Graphic Design', 'Video and motion graphics', 'Website and campaign copy'],
        },
        {
          icon: 'chart',
          title: 'Digital Campaigns',
          outcome: 'Targeted campaigns designed to reach buyers and generate enquiries.',
          items: ['Social Media campaigns', 'Google Ads and PPC', 'Email campaigns', 'Search engine optimization (SEO)'],
        },
        {
          icon: 'team',
          title: 'CRM & Marketing Automation',
          outcome: 'Connect marketing activity to a structured process for capturing and nurturing leads.',
          items: ['Lead capture and routing', 'CRM integration and workflows', 'Email nurturing', 'Landing page optimisation'],
        },
        {
          icon: 'bars',
          title: 'Analytics & Optimisation',
          outcome: 'Understand what works, improve what doesn’t and make every investment count.',
          items: ['Campaign dashboards', 'Lead and conversion tracking', 'Continuous testing', 'Monthly performance reviews'],
        },
      ],
      link: {
        lead: 'Not sure where to start?',
        label: 'Take Our Free Digital Marketing Health Check',
        action: 'assessment',
      },
    },
    process: {
      eyebrow: 'How it works',
      heading: 'From First Conversation to Measurable Progress',
      steps: [
        ['Discover', 'We assess your goals, audiences, current activity and biggest growth opportunities.'],
        ['Plan', 'We agree on priorities, channels, deliverables and the measures that matter.'],
        ['Launch', 'Our specialists build and run coordinated campaigns, content and lead capture journeys.'],
        ['Optimise', 'We review leads, conversions and campaign performance, then optimise month by month.'],
      ],
      note: 'One accountable team. A clear plan. Continuous improvement.',
    },
    spotlight: {
      id: 'health-check',
      eyebrow: 'Free assessment',
      heading: 'How Healthy Is Your Digital Marketing?',
      intro: 'Answer 5 quick questions and get a personalised Marketing Health Score, your two weakest areas and practical next steps.',
      image: '/home/visuals/media-service.png',
      imagePosition: 'center 30%',
      cards: [
        {
          icon: 'target',
          title: '2-minute Health Check',
          text: 'Five focused questions across strategy, visibility, leads, content and measurement.',
          items: ['Personalised score out of 100', 'Two priority improvement areas', 'Recommendations you can act on'],
          cta: { label: 'Check My Marketing Health', action: 'assessment' },
        },
      ],
    },
    results: {
      eyebrow: 'Why OmniContact?',
      heading: 'Driving Growth for Businesses Across Africa and Beyond',
      image: '/home/visuals/africa-beyond.png',
      body:
        'Marketing works best when creative execution, customer data and sales follow-up work together. Our integrated approach helps you build demand, convert interest and see the value of your investment.',
      promises: [
        ['One Accountable Team', 'Strategy, content, campaigns and performance managed together.'],
        ['Visibility That Matters', 'Reporting focused on enquiries, qualified leads and conversion.'],
        ['Flexible by Design', 'Scale your mix of services as priorities and budgets change.'],
        ['Operational Discipline', 'Structured workflows, defined responsibilities and consistent reviews.'],
      ],
      cardText: 'Whether you are building your first marketing function or expanding an existing one, we help you move forward with confidence.',
      cta: { label: 'Book a Free Discovery Call' },
    },
    logos: {
      eyebrow: 'Who we work with',
    },
    faq: {
      eyebrow: 'Frequently asked questions',
      items: [
        [
          'What is Marketing as a Service (MaaS)?',
          'MaaS gives your business access to marketing specialists through an ongoing managed service. Instead of recruiting every role or coordinating several providers, you get a team that plans, delivers and improves your marketing activity.',
        ],
        [
          'How is MaaS different from a traditional agency?',
          'Our approach combines campaign delivery with ongoing marketing operations, CRM-connected lead management and performance reviews. We work closely with your team and focus on how marketing supports your wider growth goals.',
        ],
        [
          'What is included in a MaaS package?',
          'Depending on your needs, support can include strategy, design, content, paid advertising, SEO, email marketing, CRM workflows, lead nurturing and reporting. We agree the exact scope and deliverables before work begins.',
        ],
        [
          'How long does it take to see results?',
          'Timelines depend on your market, starting point and chosen channels. Paid campaigns may produce early enquiries, while organic search and brand-building usually take longer. We set realistic milestones and review performance regularly.',
        ],
        [
          'Which industries do you work with?',
          'We support B2B and B2C organisations across sectors including technology, professional services, education, healthcare, retail and hospitality. We tailor the channel mix and messaging to your audience.',
        ],
        [
          'Can you work with our existing marketing or sales team?',
          'Yes. We can complement your in-house team, fill specific skills gaps or manage a wider marketing programme. We also align with your sales process to improve lead handover and follow-up.',
        ],
      ],
    },
    final: {
      eyebrow: 'Let’s grow together',
      heading: 'Ready to Take Your Marketing to the Next Level?',
      body:
        'Whether you need a complete marketing team or specialist support to accelerate growth, let’s build a practical plan around your goals, budget and opportunities.',
      image: '/home/operational efficienct.jpeg',
      primary: { label: 'Book a Free Marketing Consultation' },
      secondary: { label: 'Contact Our Team', href: '/contact' },
      alt: {
        lead: 'Not ready to talk?',
        label: 'Take Our Free Digital Marketing Health Check',
        action: 'assessment',
      },
    },
  }
}
