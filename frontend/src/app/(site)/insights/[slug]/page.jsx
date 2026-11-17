import SiteShell from '@/components/layout/SiteShell'
import InsightArticleClient from '@/features/insights/components/InsightArticleClient'

// Static export can't pre-render one file per post (posts are created after
// the build, via the CMS). Instead we pre-render a single shell at a fixed
// path, and an .htaccess rule serves that same file for every real
// /insights/<slug> URL while keeping the URL bar unchanged. The shell reads
// the real slug from the browser and fetches that post client-side — see
// InsightArticleClient. This mirrors how the /insights list page and the
// homepage's insights section already load posts.
const SHELL_SLUG = '_shell'

export async function generateStaticParams() {
  return [{ slug: SHELL_SLUG }]
}

export const dynamicParams = false

export const metadata = {
  title: 'Insights | OmniContact',
  description: 'Articles, updates, and expert views from OmniContact.',
}

export default function InsightArticleRoute() {
  return (
    <SiteShell chrome="static">
      <main>
        <InsightArticleClient shellSlug={SHELL_SLUG} />
      </main>
    </SiteShell>
  )
}
