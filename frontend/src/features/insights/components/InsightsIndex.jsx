'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getInsights } from '@/features/insights/services/insightsApi'

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
      <section className="bg-omni-blue text-white">
        <div className="site-container grid min-h-[clamp(380px,48vh,560px)] items-center py-[clamp(56px,8vw,100px)]">
          <div className="max-w-[820px]">
            <p className="mb-3 font-black uppercase tracking-[.08em] text-omni-yellow">Insights</p>
            <h1 className="m-0 text-[clamp(2.35rem,4.7vw,5.4rem)] font-black leading-[1.03] text-white">
              Insights
            </h1>
            <p className="mt-5 max-w-[720px] border-l-[3px] border-white/90 pl-4 text-[clamp(1rem,.45vw+1rem,1.32rem)] leading-[1.6] text-white/90">
              Articles, updates, and expert views from OmniContact.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-omni-soft py-[clamp(54px,7vw,92px)]">
        <div className="site-container">
          {loading && (
            <p className="rounded-lg bg-white p-5 text-center font-bold text-[#526179] shadow-[0_10px_24px_rgba(25,49,118,.08)]">
              Loading insights...
            </p>
          )}

          {!loading && error && (
            <p className="rounded-lg bg-white p-5 text-center font-bold text-[#b42318] shadow-[0_10px_24px_rgba(25,49,118,.08)]">
              Unable to load insights right now.
            </p>
          )}

          {!loading && !error && posts.length === 0 && (
            <p className="rounded-lg bg-white p-5 text-center text-[#526179] shadow-[0_10px_24px_rgba(25,49,118,.08)]">
              No insights have been published yet. Check back soon.
            </p>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <Link className="group block min-w-0" href={`/insights/${post.slug}`} key={post.id || post.slug}>
                  <article className="h-full overflow-hidden rounded-lg bg-white shadow-[0_12px_30px_rgba(25,49,118,.1)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_36px_rgba(25,49,118,.16)]">
                    {post.feature_image && (
                      <img className="h-[220px] w-full object-cover" src={post.feature_image} alt={post.title} />
                    )}
                    <div className="grid gap-3 p-5">
                      <span className="w-fit rounded-full bg-[#4176b9]/15 px-3 py-1 text-xs font-black uppercase tracking-[.04em] text-omni-blue">
                        Highlights
                      </span>
                      <h2 className="m-0 text-xl font-black leading-[1.25] text-omni-ink">{post.title}</h2>
                      {post.excerpt && <p className="m-0 line-clamp-3 leading-[1.65] text-[#526179]">{post.excerpt}</p>}
                      <small className="font-bold text-[#526179]">{formatDate(post.created_at || post.scheduled_publish_at)}</small>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
