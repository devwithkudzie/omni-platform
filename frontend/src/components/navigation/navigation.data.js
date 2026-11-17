import { industryIcons } from '@/features/industries/data/industryIcons'
import { solutionServicePath } from '@/features/solutions/data/solutions'

export const navMenu = [
  {
    label: 'Solutions',
    tagline: 'AI-powered CX, marketing, platforms, and delivery services',
    overviewHref: '/solutions/customer-experience-solutions',
    overviewLabel: 'Solutions Overview',
    items: [
      {
        label: 'Marketing as a Service (MaaS)',
        desc: 'Strategy, creative, digital campaigns, CRM automation and reporting in one managed team.',
        href: solutionServicePath('marketing-as-a-service'),
      },
      {
        label: 'ARAMS School Management',
        desc: 'School management system for records, fees, communication, and admin.',
        href: solutionServicePath('arams'),
      },
      {
        label: 'Customer Experience & BPO',
        desc: 'Contact centre, support, omnichannel engagement, and back-office operations.',
        href: '/solutions/customer-experience-solutions',
      },
      {
        label: 'AI & Digital Solutions',
        desc: 'Conversational AI, software development, and digital delivery.',
        href: '/solutions/ai-technology-solutions',
      },
      {
        label: 'Data Labelling & Annotation',
        desc: 'Human-reviewed image, text, audio, and video annotation.',
        href: solutionServicePath('data-annotation-labelling'),
      },
      {
        label: 'Staff Augmentation',
        desc: 'Specialist technology and AI talent for delivery teams.',
        href: solutionServicePath('staff-augmentation'),
      },
    ],
  },
  {
    label: 'Industries',
    tagline: 'Sector expertise for modern customer operations',
    overviewHref: '/industries',
    overviewLabel: 'Industries Overview',
    items: [
      { label: 'Education', desc: 'Admissions, learner support, enrolment, and operations.', href: '/industries/education', icon: industryIcons.education },
      { label: 'Healthcare & Health-Tech', desc: 'Member services, scheduling, eligibility, and navigation.', href: '/industries/health', icon: industryIcons.health },
      { label: 'Financial Services & Insurance', desc: 'KYC, collections, claims, servicing, and disputes.', href: '/industries/financial-services', icon: industryIcons['financial-services'] },
      { label: 'Technology, AI & SaaS', desc: 'Product support, onboarding, and technical success.', href: '/industries/technology', icon: industryIcons.technology },
      { label: 'Retail & E-commerce', desc: 'Orders, returns, loyalty, and marketplace operations.', href: '/industries/retail-ecommerce', icon: industryIcons['retail-ecommerce'] },
      { label: 'Telecommunications', desc: 'Tiered support, retention, onboarding, and operations.', href: '/industries/technology', icon: industryIcons.technology },
      { label: 'Government & Public Sector', desc: 'Citizen services and secure public operations.', href: '/solutions/business-process-outsourcing', icon: industryIcons.insurance },
      { label: 'Travel & Hospitality', desc: 'Reservations, disruption recovery, and loyalty.', href: '/industries/travel-hospitality', icon: industryIcons['travel-hospitality'] },
      { label: 'Media, Sports & Entertainment', desc: 'Audience engagement and campaign support.', href: '/industries', icon: industryIcons.technology },
    ],
  },
  {
    label: 'About Us',
    tagline: 'Who we are and how we work',
    overviewHref: '/about',
    items: [
      { label: 'Who We Are', desc: 'Our story, positioning, leadership, and footprint.', href: '/about/who-we-are' },
      { label: 'Why Choose Yamurai', desc: 'Human-to-Human delivery powered by AI and African expertise.', href: '/about/who-we-are' },
      { label: 'Our Impact', desc: 'Community impact, including Project Ignite for women and girls in digital.', href: '/about/community-impact' },
      { label: 'Careers & Culture', desc: 'Open roles across delivery and enabling teams.', href: '/about/careers' },
      { label: 'Virtual Site Tour', desc: 'Walk our operations floor in 360° before you visit.', href: '/site-tour' },
    ],
  },
  {
    label: 'Insights',
    tagline: 'Thinking, updates, and practical resources',
    overviewHref: '/insights',
    items: [
      { label: 'Articles & Insights', desc: 'Perspectives on AI-powered CX and digital operations.', href: '/insights' },
      { label: 'Case Studies & Success Stories', desc: 'How organisations grow with Yamurai OmniContact.', href: '/insights' },
      { label: 'Webinars & Events', desc: 'Partnership insights and customer operations conversations.', href: '/webinar-replay' },
      { label: 'Resources & Guides', desc: 'Assessments and guides, including Digital Marketing Health Check.', href: '/assessment' },
    ],
  },
]
