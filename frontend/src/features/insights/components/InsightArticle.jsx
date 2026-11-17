import Link from 'next/link'
import SolutionHero from '@/features/solutions/components/SolutionHero'
import { SolutionClosingCta } from '@/features/solutions/components/SolutionSections'

const insightsCta = {
  assessmentContext: {
    category: 'OmniContact',
    title: 'Discovery Session',
    cta: 'Start assessment',
    objective: 'Continue the conversation',
  },
  assessmentGoal: 'Continue the conversation',
  cta: {
    heading: 'Put this thinking into an operating model',
    text: 'If this article maps to a live service, quality, or automation problem, we can walk through it in a 30-minute discovery session.',
  },
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
}

function estimateReadingMinutes(html) {
  if (!html) return 0
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  return words ? Math.max(1, Math.round(words / 200)) : 0
}

export default function InsightArticle({ post }) {
  const dateLabel = formatDate(post.created_at)
  const readingMinutes = estimateReadingMinutes(post.content)

  return (
    <>
      <SolutionHero
        breadcrumbs={[{ label: 'Insights' }]}
        image={post.feature_image || '/home/associates.jpg'}
        subtitle={post.excerpt || 'Articles and expert views from the OmniContact team.'}
        title={post.title}
        variant="article"
      />

      <article className="sx-band insight-article">
        <div className="site-container insight-article__container">
          <Link className="insight-back" href="/insights">
            <span aria-hidden="true">←</span> Back to Insights
          </Link>

          <header className="insight-meta">
            <p className="insight-meta__eyebrow">Insight</p>
            <div className="insight-meta__row">
              {dateLabel ? <span>{dateLabel}</span> : null}
              <span className="insight-meta__author">Admin</span>
              {readingMinutes ? <span>{readingMinutes} min read</span> : null}
            </div>
          </header>

          {post.content ? (
            <div className="insight-body" dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p className="insight-status">No content available for this post.</p>
          )}
        </div>
      </article>

      <SolutionClosingCta page={insightsCta} />
    </>
  )
}
