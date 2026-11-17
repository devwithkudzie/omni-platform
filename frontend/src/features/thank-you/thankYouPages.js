// Post-submission pages that each Zoho form redirects to. Each has its own URL
// so conversions can be tracked per form.

export const thankYouPages = {
  maas: {
    path: '/thank-you-maas',
    form: 'MaaS Lead Gen Form',
    eyebrow: 'Marketing as a Service (MaaS)',
    title: 'Thank You. Your Marketing Consultation Request Is In.',
    lede:
      'Our marketing team will review your goals and be in touch to arrange your free consultation. In the meantime, here’s what happens next.',
    steps: [
      ['We review your request', 'Our team looks at your business, goals and the support you told us you need.'],
      ['We get in touch', 'A marketing specialist contacts you to arrange a time that suits you.'],
      ['Your free consultation', 'We discuss your challenges and recommend the right MaaS approach for your business.'],
    ],
    primary: { label: 'Back to Marketing as a Service', href: '/marketing-as-a-service' },
    secondary: { label: 'Take the Digital Marketing Health Check', href: '/assessment' },
  },
  arams: {
    path: '/thank-you-arams',
    form: 'ARAMS Demo Request',
    eyebrow: 'ARAMS School Management',
    title: 'Thank You. Your ARAMS Demo Request Is In.',
    lede:
      'Our ARAMS team will be in touch to arrange your free, personalised demo. Here’s what to expect.',
    steps: [
      ['We review your school’s details', 'We look at your school size, role and the areas you want to improve.'],
      ['We arrange your demo', 'A member of our team contacts you to agree a convenient time.'],
      ['See ARAMS in action', 'We walk you through the workflows most relevant to your school and answer your questions.'],
    ],
    primary: { label: 'Back to ARAMS', href: '/arams' },
    secondary: { label: 'Explore the School Operations Assessment', href: '/assessment' },
  },
  ai: {
    path: '/thank-you-ai',
    form: 'AI Data Labelling Enquiry',
    eyebrow: 'Data Labelling & Data Annotation',
    title: 'Thank You. Your AI Training Data Enquiry Is In.',
    lede:
      'Our AI data team will review your project and be in touch with a tailored solution. Here’s what happens next.',
    steps: [
      ['We review your project', 'We look at your data type, volumes and quality requirements.'],
      ['We get in touch', 'Our AI data team contacts you to discuss your guidelines and timelines.'],
      ['Your tailored proposal', 'We recommend the right approach, which can start with a Proof of Concept on a sample of your data.'],
    ],
    primary: { label: 'Back to Data Labelling & Annotation', href: '/data-annotation-labelling' },
    secondary: { label: 'Read Our Insights', href: '/insights' },
  },
}

export function thankYouMetadata(key) {
  const page = thankYouPages[key]
  return {
    title: `Thank You | ${page.eyebrow}`,
    description: page.lede,
    alternates: { canonical: page.path },
    robots: { index: false, follow: false },
  }
}
