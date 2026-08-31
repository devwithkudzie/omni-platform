import Link from 'next/link'
import { navMenu } from '@/components/navigation/navigation.data'

const socialLinks = [
  ['LinkedIn', 'https://zw.linkedin.com/company/omnicontactbpo'],
  ['Facebook', 'https://www.facebook.com/omnicontactbpo/'],
  ['Instagram', 'https://www.instagram.com/omnicontactbpo'],
  ['YouTube', 'https://www.youtube.com/@omnicontact5089'],
]

const footerColumns = [
  {
    title: 'Solutions',
    links: [
      ...navMenu.find((item) => item.label === 'Solutions').items.slice(0, 4).map((item) => [item.label, item.href]),
    ],
  },
  {
    title: 'Industries',
    links: [
      ...navMenu.find((item) => item.label === 'Industries').items.slice(0, 6).map((item) => [item.label, item.href]),
    ],
  },
  {
    title: 'Company',
    links: [
      ['Insights', '/insights'],
      ['Project Ignite', '/about/project-ignite'],
      ['Careers', '/about/careers'],
      ['Contact', '/contact'],
      ['Privacy Policy', '/privacy-policy'],
      ['Schedule Discovery', '/contact'],
    ],
  },
]

export default function Footer() {
  return (
    <>
      <footer className="site-footer">
        <div className="site-container site-footer__grid">
          <section className="site-footer__brand" aria-label="OmniContact">
            <img src="/logo.png" alt="OmniContact" width="150" height="58" />
            <p>BPO, AI, digital support, and customer operations for teams that need reliable delivery at scale.</p>
            <address className="site-footer__address">
              <span>Zimbabwe Office</span>
              <a href="tel:0774222020">0774 222 020</a>
              <a href="mailto:info@omnicontact.biz">info@omnicontact.biz</a>
            </address>
            <div className="site-footer__socials" aria-label="Social links">
              {socialLinks.map(([name, href]) => (
                <a key={name} href={href} aria-label={name}>
                  {name}
                </a>
              ))}
            </div>
          </section>

          <nav className="site-footer__links" aria-label="Footer navigation">
            {footerColumns.map((column) => (
              <section className="site-footer__column" key={column.title}>
                <h2>{column.title}</h2>
                <ul>
                  {column.links.map(([label, href]) => (
                    <li key={`${label}-${href}`}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>

        </div>
        <div className="site-container site-footer__bottom">
          <span>&copy; {new Date().getFullYear()} OmniContact BPO Services. All rights reserved.</span>
          <Link href="/privacy-policy">Privacy</Link>
        </div>
      </footer>
    </>
  )
}
