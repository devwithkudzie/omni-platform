// ARAMS school management landing page, following the approved mockup.
// Result figures and school testimonials are left out until OmniContact
// supplies verified ones.

import { zohoLeadFields } from '@/features/solutions/data/zohoLeadFields'

export const aramsSeo = {
  title: 'ARAMS School Management Software | OmniContact',
  description:
    'ARAMS is easy-to-use school management software for admissions, academics, fees, attendance and parent communication. Book a free demo for your school.',
}

const demo = { label: 'Book a Demo', intent: 'demo_request' }

export function aramsLanding(page) {
  return {
    assessment: { context: page.assessmentContext, goal: page.assessmentGoal },
    hero: {
      breadcrumbs: [
        { label: 'Enterprise Platforms', href: '/solutions/enterprise-platforms' },
        { label: 'ARAMS' },
      ],
      eyebrow: 'ARAMS School Management System',
      titleLead: 'Simplify School Administration.',
      titleAccent: 'Focus on Student Success.',
      subtitle:
        'ARAMS brings admissions, academics, fees, attendance, communication and reporting together in one easy-to-use platform, so you can save time, reduce manual work and run your school more efficiently.',
      benefits: [
        { icon: 'clock', title: 'Save time on admin' },
        { icon: 'team', title: 'Keep everyone connected' },
        { icon: 'bars', title: 'Make data-driven decisions' },
      ],
      image: '/home/visuals/arams-service.png',
      imagePosition: 'center 30%',
    },
    form: {
      heading: 'Request a Free ARAMS Demo',
      intro: 'Tell us a bit about your school and our team will show you how ARAMS can help.',
      source: 'ARAMS',
      button: 'Request a Demo',
      success: 'Thank you. Our ARAMS team will be in touch to arrange your demo.',
      showIntentSelect: false,
      intents: [
        { value: 'demo_request', label: 'Book a Demo', button: 'Request a Demo' },
        { value: 'info_request', label: 'Request More Information', button: 'Request Information' },
        { value: 'team_conversation', label: 'Speak to Our Team', button: 'Speak to Our Team' },
      ],
      // Same fields as the "ARAMS Lead Gen Form" in Zoho Forms. Until its HTML-embed
      // formperma is added as `zoho` (see maas.js), enquiries go through the site
      // backend by email.
      fields: zohoLeadFields({
        emailPlaceholder: 'you@school.com',
        companyPlaceholder: 'Your school or company',
        jobTitlePlaceholder: 'e.g. Principal or Bursar',
      }),
    },
    challenge: {
      eyebrow: 'Why schools choose ARAMS',
      heading: 'Less Admin. More Impact.',
      intro:
        'ARAMS helps school leaders and administrators streamline daily operations, improve communication and make data-driven decisions, all in one platform.',
      cards: [
        { icon: 'clock', title: 'Save time', text: 'Automate admissions, fees, attendance and reporting.' },
        { icon: 'team', title: 'Stay connected', text: 'Keep students, parents, teachers and staff aligned in real time.' },
        { icon: 'bars', title: 'Make better decisions', text: 'Access accurate data and reports instantly.' },
        { icon: 'shield', title: 'Built for schools in Africa', text: 'Local support, training and customisation for your needs.' },
      ],
    },
    solution: {
      eyebrow: 'A complete school management solution',
      heading: 'Everything You Need. In One Platform.',
      body:
        'From admissions to academics and communication to finance, ARAMS brings your school’s key processes together in one secure system.',
      widget: 'arams-dashboard',
      cta: { label: 'Explore All Features', href: '#features' },
    },
    features: {
      eyebrow: 'Key features',
      heading: 'Designed for the Real Needs of Schools',
      cards: [
        { icon: 'calendar', title: 'Admissions & Enrolment', text: 'Simplify the admissions process and manage student records with ease.', cta: { label: 'Learn More', intent: 'info_request' } },
        { icon: 'team', title: 'Student Information', text: 'Keep all student data in one secure, accessible system.', cta: { label: 'Learn More', intent: 'info_request' } },
        { icon: 'book', title: 'Academics & Timetabling', text: 'Manage classes, timetables, grades and academic progress.', cta: { label: 'Learn More', intent: 'info_request' } },
        { icon: 'wallet', title: 'Fees & Finance', text: 'Automate fee invoicing, payments and financial reporting.', cta: { label: 'Learn More', intent: 'info_request' } },
        { icon: 'chat', title: 'Communication', text: 'Stay connected with parents, students and staff through built-in messaging tools.', cta: { label: 'Learn More', intent: 'info_request' } },
        { icon: 'bars', title: 'Reporting & Analytics', text: 'Get real-time insights to support better decisions and school growth.', cta: { label: 'Learn More', intent: 'info_request' } },
      ],
    },
    process: {
      heading: 'Get Started in 4 Simple Steps',
      steps: [
        ['Discover', 'We understand your school’s needs and goals.'],
        ['Set Up', 'We configure ARAMS to match your processes and provide training.'],
        ['Go Live', 'Your team starts using ARAMS with our ongoing support.'],
        ['Grow', 'We help you get more value with continuous improvements.'],
      ],
    },
    results: {
      eyebrow: 'Real impact',
      heading: 'Supporting Schools Across Africa',
      body:
        'We partner with schools to streamline operations, improve communication and create better learning experiences for students.',
      image: '/home/workforce.jpeg',
      promises: [
        ['Easy for every user', 'Simple screens staff learn quickly'],
        ['Configured for you', 'Your structure, fees, reports and roles'],
        ['Secure records', 'Role-based access and audit visibility'],
        ['Local support', 'Training and help after go-live'],
      ],
      cardIcon: 'book',
      cardText: 'Trusted by schools across Africa.',
      cta: demo,
    },
    logos: false,
    faq: {
      heading: 'Got Questions? We’ve Got Answers.',
      items: [
        ['What is ARAMS?', 'ARAMS is a school management system that brings admissions, student records, academics, attendance, fees and parent communication together in one easy-to-use platform.'],
        ['Can we migrate our existing data?', 'Yes. We move your existing student, fee and academic records into ARAMS as part of implementation.'],
        ['How long does implementation take?', 'It depends on your school’s size, the modules you need and how your data is held today. We agree a clear plan and go-live date during discovery.'],
        ['Is ARAMS cloud-based and secure?', 'ARAMS uses role-based access and audit visibility, so staff only see what they need, and it’s supported by OmniContact’s ISO 27001-certified operations.'],
        ['Is ARAMS suitable for all school types?', 'ARAMS is configured around each school’s structure, roles, fee model and academic calendar, so it adapts to different kinds of schools.'],
        ['What are the costs?', 'Pricing depends on school size, modules, data migration and support needs. Book a demo and we’ll give you a clear quote for your school.'],
        ['Do you provide training and support?', 'Yes. We train your staff before go-live and provide ongoing support and improvements afterwards.'],
        ['Do you offer customisation?', 'Yes. ARAMS is set up around your classes, fees, reports, communication and permissions.'],
      ],
    },
    final: {
      tone: 'navy',
      eyebrow: 'Let’s work together',
      heading: 'Ready to Simplify Your School Operations?',
      body: 'Book a free demo and let’s show you how ARAMS can support your school.',
      image: '/home/associates.jpg',
      primary: demo,
      secondary: { label: 'Contact Us', href: '/contact' },
      alt: { lead: 'Not ready for a demo?', label: 'Take the free School Operations Assessment', action: 'assessment' },
    },
  }
}
