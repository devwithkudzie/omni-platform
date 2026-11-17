'use client'

import Link from 'next/link'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'

const footerColumns = [
  {
    title: 'Solutions',
    links: [
      ['Marketing as a Service', '/marketing-as-a-service'],
      ['ARAMS School Management', '/arams'],
      ['Customer Experience & BPO', '/solutions/customer-experience-solutions'],
      ['AI & Digital Solutions', '/solutions/ai-technology-solutions'],
      ['Data Labelling & Annotation', '/data-annotation-labelling'],
      ['Staff Augmentation', '/staff-augmentation'],
    ],
  },
  {
    title: 'Industries',
    links: [
      ['Education', '/industries/education'],
      ['Healthcare & Health-Tech', '/industries/health'],
      ['Financial Services', '/industries/financial-services'],
      ['Technology & AI', '/industries/technology'],
      ['Retail & Ecommerce', '/industries/retail-ecommerce'],
      ['Government & Public Sector', '/solutions/business-process-outsourcing'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Us', '/about'],
      ['Our Impact', '/about/community-impact'],
      ['Careers', '/about/careers'],
      ['Contact Us', '/contact'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['Insights', '/insights'],
      ['Webinar Replay', '/webinar-replay'],
      ['Operations Assessment', '/assessment'],
      ['Privacy Policy', '/privacy-policy'],
    ],
  },
]

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://zw.linkedin.com/company/omnicontactbpo',
    icon: <path d="M6.5 9.5v8M6.5 6.5v.01M10.5 17.5v-4.5a2.5 2.5 0 0 1 5 0v4.5M10.5 9.5v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@omnicontact5089',
    icon: <path d="M9 7.5v9l7.5-4.5L9 7.5Z" fill="currentColor" />,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/omnicontactbpo/',
    icon: <path d="M13.5 19v-6h2l.4-2.5h-2.4V9c0-.7.3-1.2 1.3-1.2h1.2V5.6c-.5-.1-1.2-.1-1.9-.1-1.9 0-3.1 1.1-3.1 3.2v1.8H9V13h2v6" fill="currentColor" />,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/omnicontactbpo',
    icon: (
      <>
        <rect x="6.5" y="6.5" width="11" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="hf">
      <div className="site-container">
        <div className="hf__grid">
          <div className="hf__brand">
            <Link className="hf__logo" href="/" aria-label="Yamurai OmniContact home">
              <img src="/logo-dark.png" alt="Yamurai OmniContact" width="220" height="60" />
            </Link>
            <p className="hf__blurb">
              Yamurai OmniContact delivers AI-powered customer experience and business process
              solutions that combine intelligent technology with the human touch.
            </p>
            <p className="hf__affiliation">Powered by Econet</p>
          </div>

          <nav className="hf__links" aria-label="Footer navigation">
            {footerColumns.map((column) => (
              <section key={column.title}>
                <h2>{column.title}</h2>
                <ul>
                  {column.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                  {column.title === 'Company' ? (
                    <li>
                      <AssessmentModalButton className="hf__text-btn" step="meeting">
                        Book a Discovery Call
                      </AssessmentModalButton>
                    </li>
                  ) : null}
                </ul>
              </section>
            ))}
          </nav>

          <div className="hf__side">
            <h2 className="hf__follow">Follow Us</h2>
            <div className="hf__socials" aria-label="Social links">
              {socialLinks.map((item) => (
                <a key={item.name} href={item.href} aria-label={item.name} target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    {item.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="hf__bottom">
          <p>&copy; {new Date().getFullYear()} Yamurai OmniContact. All rights reserved.</p>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  )
}
