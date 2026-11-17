const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080'

function normalizeImage(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`
  return `${API_BASE_URL}/${url}`
}

export async function getInsights() {
  const response = await fetch(`${API_BASE_URL}/api/v1/public/posts`, { cache: 'no-store' })

  if (!response.ok) {
    throw new Error('Unable to load insights right now.')
  }

  const payload = await response.json()
  const posts = Array.isArray(payload?.data?.posts) ? payload.data.posts : []

  return posts.map((post) => ({ ...post, feature_image: normalizeImage(post.feature_image) }))
}

export async function getInsightBySlug(slug) {
  const response = await fetch(`${API_BASE_URL}/api/v1/public/posts/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  })

  if (response.status === 404) return null
  if (!response.ok) throw new Error('Unable to load this insight right now.')

  const payload = await response.json()
  const post = payload?.data?.post

  if (!post) return null

  return { ...post, feature_image: normalizeImage(post.feature_image) }
}
