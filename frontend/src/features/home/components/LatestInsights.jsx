'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getInsights } from '@/features/insights/services/insightsApi'

const highlightFallbackImages = [
  '/home/visuals/hero-2.png',
  '/home/visuals/healthcare.png',
  '/home/visuals/financial-services.png',
]

const fallbackInsights = [
  {
    title: 'AI in Customer Experience: Where Automation Meets Empathy',
    category: 'AI in Customer Experience',
    excerpt: 'Practical ways automation and human judgement can work together across service environments.',
    image: '/home/visuals/hero-2.png',
  },
  {
    title: 'AI-Enabled BPO: Scaling Service Without Scaling Overhead',
    category: 'AI-Enabled BPO',
    excerpt: 'How accurate annotation and secure delivery improve model performance and trust.',
    image: '/home/visuals/healthcare.png',
  },
  {
    title: 'The Future of Work in Digital Customer Operations',
    category: 'Future of Work',
    excerpt: 'A view on multilingual talent, flexible capacity, and operational discipline.',
    image: '/home/visuals/financial-services.png',
  },
]

export default function LatestInsights() {
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    let mounted = true

    getInsights()
      .then((posts) => {
        if (mounted) setBlogs(posts)
      })
      .catch(() => {
        if (mounted) setBlogs([])
      })

    return () => {
      mounted = false
    }
  }, [])

  const visiblePosts =
    blogs.length > 0
      ? blogs.slice(0, 3).map((blog, index) => ({
          title: blog.title,
          category: blog.status === 'published' ? 'Insight' : blog.status || 'Insight',
          excerpt: blog.excerpt,
          image: blog.feature_image || highlightFallbackImages[index % highlightFallbackImages.length],
          href: blog.slug ? `/insights/${blog.slug}` : '/insights',
        }))
      : fallbackInsights.map((post) => ({ ...post, href: '/insights' }))

  return (
    <section className="hx-section">
      <div className="site-container">
        <div className="hx-head hx-head--center hx-head--with-link">
          <p className="hx-eyebrow">Insights &amp; perspectives</p>
          <h2>Shaping the Conversation on the Future of CX</h2>
          <p className="hx-head__copy">
            Explore perspectives on AI-powered customer experience, intelligent business operations, the future of
            work and the technologies transforming how organisations serve and grow.
          </p>
          <Link className="hx-link" href="/insights">
            Explore Our Insights <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="hx-insight-grid">
          {visiblePosts.map((post) => (
            <Link className="hx-insight" href={post.href} key={post.title}>
              <div className="hx-insight__media">
                <img src={post.image} alt="" />
              </div>
              <div className="hx-insight__body">
                <span className="hx-insight__tag">{post.category}</span>
                <h3>{post.title}</h3>
                <span className="hx-link">
                  Read more <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
