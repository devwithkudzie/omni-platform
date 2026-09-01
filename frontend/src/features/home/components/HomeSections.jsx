import Link from 'next/link'
import AssessmentModalButton from '@/components/assessment/AssessmentModalButton'
import SectionHead from '@/components/layout/SectionHead'
import HomeDiscoveryCallout from './HomeDiscoveryCallout'
import OpportunityStory from './OpportunityStory'
import IndustriesSection from './IndustriesSection'
import Marquee from 'react-fast-marquee'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080'

const section = 'py-[clamp(48px,6vw,80px)]'
const highlightFallbackImages = ['/home/contact-center.jpg', '/home/agent1.png', '/home/associates.jpg', '/home/omni-em.png']

const trustBadges = [
  {
    title: 'Certified by TopCertifier',
    desc: 'Independent certification support and assurance recognition.',
    href: 'https://www.topcertifier.com',
    image: 'https://www.topcertifier.com/badges/badge2.png',
    external: true,
  },
  {
    title: 'PCI SAQ-D Certified',
    desc: 'Payment security controls for handling sensitive customer operations.',
    image: '/trust/pci-saq-d.svg',
  },
  {
    title: 'ISO 27001:2022 Certified',
    desc: 'Information security management standards referenced in OmniContact policies.',
    href: '/privacy-policy',
    image: '/trust/iso-27001.png',
  },
  {
    title: 'UN Global Compact',
    image: '/partners/katc.jpg'
  },
  {
    title: 'Partner 1',
    image: '/partners/partner (1).jpg'
  },
  {
    title: 'Partner 2',
    image: '/partners/partner (2).png'
  },
  {
    title: 'Partner 3',
    image: '/partners/partner (3).png'
  },
  {
    title: 'Partner 4',
    image: '/partners/partner (4).png'
  },
  {
    title: 'Partner 5',
    image: '/partners/partner (5).png'
  },
  {
    title: 'Partner 6',
    image: '/partners/partner (6).png'
  },
  {
    title: 'Partner 7',
    image: '/partners/partner (7).png'
  },
  {
    title: 'Partner 8',
    image: '/partners/partner (8).png'
  },
  {
    title: 'Partner 9',
    image: '/partners/partner (9).png'
  },
  {
    title: 'Partner 10',
    image: '/partners/partner (10).png'
  },
]

async function getLatestBlogs() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/posts`, {
      next: { revalidate: 60 },
    })

    if (!response.ok) return { blogs: [], error: true }

    const payload = await response.json()
    return { blogs: Array.isArray(payload?.data?.posts) ? payload.data.posts : [], error: false }
  } catch {
    return { blogs: [], error: true }
  }
}

const fallbackInsights = [
  {
    title: 'How AI-supported teams improve customer response quality',
    category: 'AI operations',
    excerpt: 'Practical ways automation and human judgement can work together across service environments.',
    image: '/landing_pages/ai-operations.jpg',
  },
  {
    title: 'What enterprise teams should measure beyond service volume',
    category: 'Customer experience',
    excerpt: 'Operational signals that help leaders understand speed, quality, consistency, and cost-to-serve.',
    image: '/landing_pages/customer-experience.jpg',
  },
  {
    title: 'Why African delivery teams are becoming a strategic CX advantage',
    category: 'Delivery strategy',
    excerpt: 'A view on multilingual talent, resilient operations, and regional delivery depth.',
    image: '/home/associates.jpg',
  },
]

function SectionEyebrow({ children }) {
  return (
    <p className="reference-section__eyebrow">
      <span aria-hidden="true" />
      {children}
    </p>
  )
}

function LatestInsights({ blogs, error }) {
  const visiblePosts = blogs.length > 0
    ? blogs.slice(0, 3).map((blog, index) => ({
        title: blog.title,
        category: blog.status === 'published' ? 'Insight' : blog.status || 'Insight',
        excerpt: blog.excerpt,
        image: blog.feature_image || highlightFallbackImages[index % highlightFallbackImages.length],
        href: blog.slug ? `/insights/${blog.slug}` : '/insights',
      }))
    : fallbackInsights.map((post) => ({ ...post, href: '/insights' }))

  return (
    <section className="reference-section reference-section--insights">
      <div className="site-container">
        <div className="reference-section__head reference-section__head--split">
          <div>
            <SectionEyebrow>Insights</SectionEyebrow>
            <h2>Blogs & Insights</h2>
          </div>
          <Link className="reference-section__more" href="/insights">
            All insights <span aria-hidden="true">→</span>
          </Link>
        </div>

        {error && (
          <p className="reference-section__notice">Live insights are unavailable right now. Showing selected topics.</p>
        )}

        <div className="reference-insights">
          {visiblePosts.map((post) => (
            <Link className="reference-insight-card" href={post.href} key={post.title}>
              <img src={post.image} alt="" />
              <div className="reference-insight-card__meta">
                <span>{post.category}</span>
                <span>5 min read</span>
              </div>
              <h3>{post.title}</h3>
              {post.excerpt && <p>{post.excerpt}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustBadge({ badge }) {
  const image = (
    <img
      src={badge.image}
      alt={badge.title}
      className="max-h-[64px] max-w-[120px] w-auto object-contain sm:max-h-[80px] sm:max-w-[150px]"
    />
  )

  const box = (
    <div className="flex h-[92px] min-w-[140px] items-center justify-center border-r border-[#d8e3f7] px-5 transition-opacity hover:opacity-70 sm:h-[110px] sm:min-w-[180px] sm:px-8">
      {image}
    </div>
  )

  if (!badge.href) return box

  if (badge.external) {
    return (
      <a href={badge.href} target="_blank" rel="noreferrer" title={badge.title} aria-label={badge.title}>
        {box}
      </a>
    )
  }

  return (
    <Link href={badge.href} title={badge.title} aria-label={badge.title}>
      {box}
    </Link>
  )
}

function TrustSection() {
  return (
    <section className="home-light-section bg-[#f6f8fc] py-[clamp(48px,6vw,80px)]">
      <div className="site-container">
        <SectionHead
          copy="Certifications, security commitments, and impact partnerships behind our operations."
          eyebrow="Trusted Delivery"
        >
          Trust & Impact
        </SectionHead>
      </div>

      <div className="trust-marquee">
        <Marquee gradient={false} speed={40} pauseOnHover={true}>
          {trustBadges.map((badge) => (
            <TrustBadge badge={badge} key={badge.title} />
          ))}
        </Marquee>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="reference-final-cta">
      <div className="site-container reference-final-cta__inner">
        <span className="reference-final-cta__mark" aria-hidden="true">
          &gt;
        </span>
        <div className="reference-final-cta__body">
          <h2>Ready to improve service quality while controlling cost?</h2>
          <div className="reference-final-cta__actions">
            <AssessmentModalButton
              className="reference-button reference-button--primary"
              step="meeting"
              context={{
                category: 'OmniContact',
                title: 'Discovery Session',
                objective: 'Map the right OmniContact solution',
              }}
            >
              Book discovery call <span aria-hidden="true">→</span>
            </AssessmentModalButton>
            <Link className="reference-button reference-button--ghost" href="/contact">
              Contact sales <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default async function HomeSections() {
  const { blogs, error } = await getLatestBlogs()

  return (
    <>
      <TrustSection />
      <HomeDiscoveryCallout />
      <OpportunityStory />
      <IndustriesSection />
      <LatestInsights blogs={blogs} error={error} />
      <FinalCta />
    </>
  )
}
