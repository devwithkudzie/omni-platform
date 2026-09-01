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

export default function InsightArticle({ post }) {
  const dateLabel = formatDate(post.created_at)
  const byline = [dateLabel, post.author || 'OmniContact'].filter(Boolean).join(' · ')

  return (
    <>
      <SolutionHero
        breadcrumbs={[
          { label: 'Insights', href: '/insights' },
          { label: post.title },
        ]}
        image={post.feature_image || '/home/associates.jpg'}
        subtitle={post.excerpt || 'Articles and expert views from the OmniContact team.'}
        title={post.title}
      />

      <article className="solution-group solution-group--light">
        <div className="site-container">
          <p className="insight-byline">{byline}</p>
          <Link className="insight-back" href="/insights">
            Back to Insights <span aria-hidden="true">→</span>
          </Link>
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
