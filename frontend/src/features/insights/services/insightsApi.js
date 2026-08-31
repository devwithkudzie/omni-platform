const BLOG_API_BASE_URL = process.env.NEXT_PUBLIC_BLOG_API_BASE_URL || ''

function normalizeImage(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${BLOG_API_BASE_URL}${url}`
  return `${BLOG_API_BASE_URL}/${url}`
}

export async function getInsights() {
  const response = await fetch(`${BLOG_API_BASE_URL}/cms/api/blogs.php`, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error('Unable to load insights right now.')
  }

  const payload = await response.json()
  const posts = Array.isArray(payload) ? payload : payload?.data?.posts || []

  return Array.isArray(posts)
    ? posts.map((post) => ({ ...post, feature_image: normalizeImage(post.feature_image) }))
    : []
}

export async function getInsightBySlug(slug) {
  const response = await fetch(`${BLOG_API_BASE_URL}/cms/api/blogs.php?slug=${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  })

  if (response.status === 404) return null
  if (!response.ok) throw new Error('Unable to load this insight right now.')

  const payload = await response.json()
  const post = payload?.data?.post || payload

  if (!post) return null

  return { ...post, feature_image: normalizeImage(post.feature_image) }
}
