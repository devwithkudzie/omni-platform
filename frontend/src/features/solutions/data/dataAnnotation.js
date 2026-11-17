// AI Data Annotation landing page. The hero follows the approved
// "AI Training Data Hero Banner" design, including its compliance and
// capacity claims (SOC 2, GDPR, 100+ labellers), which OmniContact supplied.

import { zohoLeadFields } from '@/features/solutions/data/zohoLeadFields'

export const dataAnnotationSeo = {
  title: 'AI Data Annotation & Data Labelling Services | OmniContact',
  description:
    'Accurate, human-verified data annotation for AI teams. Image, video, text and multilingual labelling with built-in QA and ISO 27001 security. Request a POC.',
}

const poc = { label: 'Request a Proof of Concept', intent: 'poc_request' }

export function dataAnnotationLanding(page) {
  return {
    assessment: { context: page.assessmentContext, goal: page.assessmentGoal },
    hero: {
      breadcrumbs: [
        { label: 'AI & Digital Solutions', href: '/solutions/ai-technology-solutions' },
        { label: 'Data Annotation & Labelling' },
      ],
      eyebrow: 'Data Labelling & Data Annotation',
      titleLead: 'High-Quality Training Data.',
      titleAccent: 'Smarter AI Outcomes.',
      subtitle:
        'We provide accurate, secure and scalable data labelling and annotation services to help you build high-performing AI and machine learning models, faster and with greater confidence.',
      benefits: [
        { icon: 'target', title: 'High accuracy and quality' },
        { icon: 'clock', title: 'Scale faster' },
        { icon: 'lock', title: 'Secure and compliant' },
      ],
      image: '/landing_pages/ai-operations.jpg',
      imagePosition: 'center 25%',
      samples: [
        {
          kind: 'image',
          title: 'Image Annotation',
          image: '/home/visuals/bpo-service.png',
          boxes: [
            { label: 'Person', x: '30%', y: '18%', w: '34%', h: '78%' },
            { label: 'Headset', x: '62%', y: '30%', w: '22%', h: '30%' },
          ],
        },
        { kind: 'text', title: 'Text Annotation', tags: ['Person', 'Organisation', 'Location'] },
        {
          kind: 'video',
          title: 'Video Annotation',
          image: '/home/visuals/media-service.png',
          boxes: [
            { label: 'Camera', x: '6%', y: '20%', w: '34%', h: '62%' },
            { label: 'Screen', x: '58%', y: '30%', w: '34%', h: '40%' },
          ],
        },
      ],
      trust: [
        { icon: 'shield', label: 'Trusted by global AI and data teams' },
        { icon: 'globe', label: 'Multilingual and local expertise' },
        { icon: 'coins', label: '25–30% cost advantage' },
        { icon: 'check', label: 'ISO 27001, SOC 2, GDPR compliant' },
        { icon: 'team', label: '100+ trained labellers' },
      ],
    },
    form: {
      heading: 'Let’s Talk About Your AI Training Data Needs',
      intro: 'Tell us about your project and our team will be in touch with a tailored solution.',
      source: 'Data Annotation',
      button: 'Get a Tailored Quote',
      success: 'Thank you. Our AI data team has your request and will be in touch.',
      showIntentSelect: false,
      intents: [
        { value: 'quote_request', label: 'Get a Tailored Quote', button: 'Get a Tailored Quote' },
        { value: 'poc_request', label: 'Request a Proof of Concept', button: 'Request a Proof of Concept' },
        { value: 'project_discussion', label: 'Discuss Your Data Annotation Project', button: 'Discuss My Project' },
        { value: 'team_conversation', label: 'Speak to Our AI Data Team', button: 'Speak to the Team' },
      ],
      // Same fields as the "Data Labelling Lead Gen Form" in Zoho Forms. Until its HTML-embed
      // formperma is added as `zoho` (see maas.js), enquiries go through the site
      // backend by email.
      fields: zohoLeadFields({
        companyPlaceholder: 'Your Company Pte Ltd',
        jobTitlePlaceholder: 'e.g. ML Engineer or Head of Data',
      }),
    },
    challenge: {
      heading: 'The Data Problems Slowing Your AI Down',
      intro:
        'Your model is only as good as the data it learns from. Yet for most AI teams, getting labelled data right takes more time, money and engineering attention than it should.',
      cards: [
        {
          icon: 'check',
          title: 'Inconsistent data quality',
          problem: 'Different annotators read the same edge case differently, and your model learns the noise.',
          solution: 'We turn your guidelines into a shared playbook, calibrate annotators on it before production starts, and keep edge-case decisions in a running log.',
          benefit: 'Consistent labels across every batch, and less time debugging the data instead of the model.',
        },
        {
          icon: 'target',
          title: 'Inaccurate annotations',
          problem: 'Errors surface late, in model evaluation, after the budget is spent.',
          solution: 'Every batch goes through multi-layer review and sampling, with quality results reported alongside the delivery.',
          benefit: 'Catch problems before they reach training, and cut costly re-labelling cycles.',
        },
        {
          icon: 'bars',
          title: 'Scaling is hard',
          problem: 'A pilot of a few thousand items works; production volumes break the process.',
          solution: 'Trained, managed annotation teams scale up for production and surge volumes, without you hiring or managing people.',
          benefit: 'Move from pilot to production without stalling your roadmap or adding headcount.',
        },
        {
          icon: 'coins',
          title: 'High operational costs',
          problem: 'In-house labelling ties up expensive engineers and data scientists.',
          solution: 'A dedicated annotation team with its own supervision and QA takes the labelling work off your specialists.',
          benefit: 'A more cost-effective way to produce labelled data, with your specialists focused on high-value work.',
        },
        {
          icon: 'clock',
          title: 'Tight development timelines',
          problem: 'Labelling becomes the bottleneck between data collection and the next model release.',
          solution: 'Agreed batch schedules and turnaround targets, set during the POC and tracked through delivery.',
          benefit: 'Predictable data delivery that keeps model releases on schedule.',
        },
        {
          icon: 'lock',
          title: 'Data security concerns',
          problem: 'Sharing sensitive images, records or recordings with an outside vendor feels like a risk.',
          solution: 'ISO 27001:2022-certified operations, with access controls, confidentiality and data-handling terms agreed before any data moves.',
          benefit: 'Outsource annotation without losing control of your data or your compliance position.',
        },
      ],
      link: { lead: 'Not sure where your biggest data bottleneck is?', label: 'Speak to Our AI Data Team', intent: 'team_conversation' },
    },
    solution: {
      heading: 'A Reliable Data Annotation Partner for AI Teams',
      body:
        'We take the labelling work off your team’s plate and give back consistent, review-ready AI training data, with the quality controls, security and scale you need to trust it. You keep ownership of the guidelines; we run the people, process and QA.',
      image: '/home/industries/digital.jpg',
      cta: { label: 'See How a POC Works', href: '#how-it-works' },
    },
    included: {
      eyebrow: 'Data labelling services',
      heading: 'Annotation Services Built Around Your Model',
      intro: 'Whatever your data type, we label it to your guidelines and your quality bar, so it’s ready to train on when it arrives.',
      pillars: [
        { icon: 'image', title: 'Image annotation', outcome: 'Teach computer vision models to see what matters, with precise, consistently reviewed labels.', items: ['Bounding boxes', 'Classification'] },
        { icon: 'video', title: 'Video annotation', outcome: 'Turn hours of footage into structured training data, checked for consistency across sequences.', items: ['Object labelling', 'Classification'] },
        { icon: 'text', title: 'Text and document annotation', outcome: 'Give NLP and document AI models clean, structured data to learn from.', items: ['Intent and entity labelling', 'Quality labelling', 'Document classification'] },
        { icon: 'audio', title: 'Audio annotation and transcription', outcome: 'Human review where automation can’t be trusted to guess.', items: ['Transcription support', 'Audio review'] },
        { icon: 'globe', title: 'Multilingual data annotation', outcome: 'Build AI that works for every market you serve, with annotators who understand the context.', items: ['Multilingual text and audio'] },
        { icon: 'search', title: 'Quality assurance and data review', outcome: 'Already have labelled data? We audit it and fix the errors before they cost you a training run.', items: ['Sampling QA', 'Inter-annotator agreement', 'Defect reporting'] },
      ],
      link: { lead: 'See the quality on your own data.', label: 'Request a Quote', intent: 'quote_request' },
    },
    spotlight: {
      id: 'industries',
      eyebrow: 'Industries',
      heading: 'Built for Teams in Demanding Industries',
      intro: 'From medical imaging to match footage to road scenes, we help AI teams in high-stakes sectors build training data they can rely on.',
      cards: [
        {
          icon: 'health',
          title: 'Healthcare & Health-Tech',
          text: 'When AI supports clinical or patient-facing decisions, label accuracy and data privacy aren’t optional. Sensitive data is handled inside ISO 27001-certified operations.',
          items: ['Medical image classification and region labelling', 'Clinical document and form extraction', 'Health chatbot and triage-intent training data'],
          cta: { label: 'Discuss Your Data Annotation Project', intent: 'project_discussion' },
        },
        {
          icon: 'sports',
          title: 'Sports & Media',
          text: 'Sports and media AI runs on large volumes of fast-moving video. We label players, actions, events and on-screen content consistently across thousands of frames.',
          items: ['Player and object labelling', 'Action and event tagging', 'Content classification and moderation'],
          cta: { label: 'Discuss Your Data Annotation Project', intent: 'project_discussion' },
        },
        {
          icon: 'car',
          title: 'Automotive & Mobility',
          text: 'Perception models need precise, consistent labels across varied scenes. We annotate vehicles, pedestrians, signage and road conditions to your taxonomy.',
          items: ['Object detection labels', 'Scene and condition classification', 'Dashcam and fleet video review'],
          cta: { label: 'Discuss Your Data Annotation Project', intent: 'project_discussion' },
        },
      ],
    },
    process: {
      eyebrow: 'How to start',
      heading: 'From Sample Data to Production in Four Steps',
      intro: 'A Proof of Concept lets you test our quality, communication and turnaround on your own data before you commit to a full project.',
      steps: [
        ['Share your project', 'Tell us about your model, data type, volumes and quality requirements. Data-handling terms are agreed before any data changes hands.'],
        ['Align on guidelines', 'We review your annotation guidelines, or help you write them, and agree the taxonomy, edge-case rules and quality measures.'],
        ['Run the Proof of Concept', 'Our team annotates a sample of your data to the agreed guidelines. You get the labelled output plus a quality report.'],
        ['Scale to production', 'Once you’re happy, we size the team, agree batch schedules and move into ongoing delivery with QA on every batch.'],
      ],
      note: 'No long contract to try us. You see the quality on your data first.',
      cta: poc,
    },
    results: {
      eyebrow: 'Why OmniContact',
      heading: 'Quality You Can Measure, Data You Can Trust',
      body:
        'We run annotation the way we run enterprise operations: documented processes, trained and supervised teams, and quality you can see in every delivery.',
      promises: [
        ['Quality in every batch', 'Calibrated annotators, multi-layer review and agreement checks'],
        ['Security-focused', 'ISO 27001:2022 operations and controlled data access'],
        ['Managed, scalable teams', 'Team leads and QA reviewers sized for pilot and production'],
        ['One accountable partner', 'A named project lead and regular quality reporting'],
      ],
      cardText: 'Part of OmniContact’s enterprise BPO and AI operation, not a crowd of anonymous freelancers.',
      badge: '/trust/iso-27001.png',
      cta: poc,
    },
    logos: { eyebrow: 'Who we work with', heading: 'Trusted by Organisations Across Africa' },
    faq: {
      heading: 'Questions AI Teams Ask Us',
      items: [
        ['What does a Proof of Concept involve?', 'You share a sample of your data and your guidelines. We annotate it, run our QA process and return the labelled data with a quality report, so you can judge us on real output.'],
        ['How do you keep our data secure?', 'Our operations are ISO 27001:2022 certified. Access controls, confidentiality and data-handling terms are agreed before any data is shared or work starts.'],
        ['What if we don’t have annotation guidelines yet?', 'We can help you build them during the POC, including the label taxonomy and edge-case rules.'],
        ['How is pricing set?', 'Pricing depends on data type, task complexity, volume and quality requirements. We provide a quote after reviewing your sample.'],
        ['Can you scale after the POC?', 'Yes. Once the POC results are agreed, we size a dedicated team for production volumes and keep QA on every batch.'],
        ['Which data types do you support?', 'Image, video, text and document, and audio data, including multilingual text and audio. Tell us about your task and we’ll confirm the right approach.'],
      ],
    },
    final: {
      eyebrow: 'Request a Proof of Concept',
      heading: 'Ready to See What Better Training Data Can Do for Your Model?',
      body: 'Send us a sample, and we’ll annotate it to your guidelines and show you the quality before you commit.',
      image: '/home/contact-center.jpg',
      primary: poc,
      secondary: { label: 'Request a Quote', intent: 'quote_request' },
      alt: { lead: 'Prefer to talk first?', label: 'Speak to Our AI Data Team', intent: 'team_conversation' },
    },
  }
}
