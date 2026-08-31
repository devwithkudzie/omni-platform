import { notFound } from 'next/navigation'
import SiteShell from '@/components/layout/SiteShell'
import InsightArticle from '@/features/insights/components/InsightArticle'
import { getInsightBySlug } from '@/features/insights/services/insightsApi'

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  try {
    const post = await getInsightBySlug(resolvedParams.slug)
    if (!post) return {}

    return {
      title: `${post.title} | OmniContact`,
      description: post.excerpt || 'OmniContact insight.',
    }
  } catch {
    return {}
  }
}

export default async function InsightArticleRoute({ params }) {
  const resolvedParams = await params
  let post

  try {
    post = await getInsightBySlug(resolvedParams.slug)
  } catch {
    post = null
  }

  if (!post) notFound()

  return (
    <SiteShell>
      <main>
        <InsightArticle post={post} />
      </main>
    </SiteShell>
  )
}
