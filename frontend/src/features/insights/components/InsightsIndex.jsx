'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import SectionHead from '@/components/layout/SectionHead'
import SolutionHero from '@/features/solutions/components/SolutionHero'
import { SolutionClosingCta } from '@/features/solutions/components/SolutionSections'
import { getInsights } from '@/features/insights/services/insightsApi'

const insightsCta = {
  assessmentContext: {
    category: 'OmniContact',
    title: 'Discovery Session',
    cta: 'Start assessment',
    objective: 'Continue the conversation',
  },
  assessmentGoal: 'Continue the conversation',
  cta: {
    heading: 'Talk with the team behind these insights',
    text: 'If an article maps to a live operations problem, we can walk through channels, SLAs, and delivery options in a 30-minute session.',
  },
}

function formatDate(value) {
  if (!value) return 'OmniContact'
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
}

export default function InsightsIndex({ posts: initialPosts = [], error: initialError = false }) {
  const [posts, setPosts] = useState(initialPosts)
  const [error, setError] = useState(initialError)
  const [loading, setLoading] = useState(!initialPosts.length && !initialError)

  useEffect(() => {
    let mounted = true

    async function loadPosts() {
      try {
        const loadedPosts = await getInsights()
        if (!mounted) return
        setPosts(loadedPosts)
        setError(false)
      } catch {
        if (!mounted) return
        setPosts([])
        setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadPosts()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <>
      <SolutionHero
        breadcrumbs={[{ label: 'Insights' }]}
        image="/home/associates.jpg"
        subtitle="Articles, updates, and expert views from OmniContact on customer operations, AI, and delivery."
        title="Insights"
      />

      <section className="solution-anchor sx-band sx-band--soft" id="articles">
        <div className="site-container">
          <SectionHead eyebrow="Latest thinking">
            Operational writing from the floor
          </SectionHead>

          {loading && (
            <p className="sx-status">Loading insights...</p>
          )}

          {!loading && error && (
            <p className="sx-status sx-status--error">Unable to load insights right now.</p>
          )}

          {!loading && !error && posts.length === 0 && (
            <p className="sx-status">No insights have been published yet. Check back soon.</p>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="hx-insights__grid">
              {posts.map((post) => (
                <Link className="hx-insight-card" href={`/insights/${post.slug}`} key={post.id || post.slug}>
                  <div className="hx-insight-card__media">
                    <img alt="" src={post.feature_image || '/home/associates.jpg'} />
                  </div>
                  <div className="hx-insight-card__body">
                    <p className="hx-insight-card__category">
                      Insight · {formatDate(post.created_at || post.scheduled_publish_at)}
                    </p>
                    <h3>{post.title}</h3>
                    {post.excerpt ? <p className="hx-insight-card__excerpt">{post.excerpt}</p> : null}
                    <span className="hx-link">
                      Read more <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SolutionClosingCta page={insightsCta} />
    </>
  )
}
