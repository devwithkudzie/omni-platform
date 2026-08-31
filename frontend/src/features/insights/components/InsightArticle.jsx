import Link from 'next/link'

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
}

export default function InsightArticle({ post }) {
  return (
    <>
      <section
        className="relative min-h-[clamp(390px,50vh,580px)] overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage: `linear-gradient(95deg, rgba(8,19,48,.9) 0%, rgba(8,19,48,.78) 52%, rgba(8,19,48,.42) 100%), url("${post.feature_image || '/home/professional.gif'}")`,
        }}
      >
        <div className="site-container grid min-h-[clamp(390px,50vh,580px)] items-center py-[clamp(56px,8vw,100px)]">
          <div className="max-w-[860px]">
            <p className="mb-3 font-black uppercase tracking-[.08em] text-omni-yellow">Insight</p>
            <h1 className="m-0 text-[clamp(2.1rem,4vw,4.8rem)] font-black leading-[1.05] text-white">
              {post.title}
            </h1>
            <p className="mt-5 font-bold text-white/85">{formatDate(post.created_at)} by {post.author || 'admin'}</p>
          </div>
        </div>
      </section>

      <article className="bg-white py-[clamp(54px,7vw,92px)]">
        <div className="site-container max-w-[920px]">
          <Link className="mb-8 inline-flex font-black text-omni-blue underline" href="/insights">
            Back to Insights
          </Link>
          {post.excerpt && (
            <p className="mb-8 border-l-4 border-omni-yellow pl-4 text-xl leading-[1.65] text-[#526179]">
              {post.excerpt}
            </p>
          )}
          {post.content ? (
            <div
              className="prose max-w-none text-[1.06rem] leading-[1.8] text-omni-ink"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-[#526179]">No content available for this post.</p>
          )}
        </div>
      </article>
    </>
  )
}
