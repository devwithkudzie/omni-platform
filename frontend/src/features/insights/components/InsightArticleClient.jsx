'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import InsightArticle from './InsightArticle'
import { getInsightBySlug } from '../services/insightsApi'

// Static export freezes each file's route params at build time — this file
// was built as slug="_shell", and hydration reuses that frozen value no
// matter which real /insights/<slug> URL the .htaccess rewrite served it
// for. So the real slug has to come from the live URL, not Next's params.
function readSlugFromLocation(shellSlug) {
  const match = window.location.pathname.match(/\/insights\/([^/]+)\/?$/)
  const slug = match ? decodeURIComponent(match[1]) : null
  return slug && slug !== shellSlug ? slug : null
}

export default function InsightArticleClient({ shellSlug }) {
  const [state, setState] = useState({ status: 'loading', post: null })

  useEffect(() => {
    const slug = readSlugFromLocation(shellSlug)
    if (!slug) return undefined

    let mounted = true

    getInsightBySlug(slug)
      .then((post) => {
        if (!mounted) return
        if (!post) {
          setState({ status: 'not-found', post: null })
          return
        }
        document.title = `${post.title} | OmniContact`
        setState({ status: 'ready', post })
      })
      .catch(() => {
        if (mounted) setState({ status: 'error', post: null })
      })

    return () => {
      mounted = false
    }
  }, [shellSlug])

  if (state.status === 'ready') {
    return <InsightArticle post={state.post} />
  }

  return (
    <section className="sx-band insight-article">
      <div className="site-container insight-article__container">
        <Link className="insight-back" href="/insights">
          <span aria-hidden="true">←</span> Back to Insights
        </Link>

        {state.status === 'loading' && <p className="insight-status">Loading…</p>}
        {state.status === 'not-found' && <p className="insight-status">This article couldn’t be found.</p>}
        {state.status === 'error' && <p className="insight-status insight-status--error">Unable to load this article right now.</p>}
      </div>
    </section>
  )
}
